import { GameState, PlayerId, Zone } from '@shared/engine_types';
import { Room, Card } from '@shared/types';
import * as jsonpatch from 'fast-json-patch';
import { Server, Socket } from 'socket.io';
import { BotLogic } from '../../bots/BotLogic';
import { GameEngine } from '../../engine/GameEngine';
import { ActionProcessor } from '../../engine/modules/actions/ActionProcessor';
import { GameSetupProcessor } from '../../engine/modules/core/GameSetupProcessor';
import { DraftService } from '../../services/DraftService';
import { LoggerService } from '../../services/LoggerService';
import { PersistenceService } from '../../services/PersistenceService';
import { AssetService } from '../../services/AssetService';
import { SealedService } from '../../services/SealedService';


const roomLocks = new Map<string, Promise<any>>();

export const registerMatchHandlers = (io: Server, socket: Socket, rooms: Map<string, Room>) => {

  const authorizePlayer = (room: Room, playerId: string, actionName: string): boolean => {
    const playerRecord = room.players.find(p => p.playerId === playerId);
    if (!playerRecord || playerRecord.id !== socket.id) {
      LoggerService.warn('SECURITY', `Unauthorized ${actionName} attempt by socket ${socket.id} claiming to be player ${playerId}`);
      return false;
    }
    return true;
  };

  const withMatch = async (roomId: string, playerId: string, callback: (engine: GameEngine, room: Room, matchIndex?: number) => void) => {
    // Serialization lock to prevent race conditions on shared room state
    const currentLock = roomLocks.get(roomId) || Promise.resolve();
    const nextLock = currentLock.then(async () => {
      try {
        const room = rooms.get(roomId);
        if (!room) return;
        if (!authorizePlayer(room, playerId, 'match action')) return;

        let gameState: GameState | undefined;
        let matchIndex: number | undefined;

        if (room.status === 'tournament' && room.matches) {
          matchIndex = room.matches.findIndex(m => m.players.includes(playerId) && m.status !== 'completed');
          if (matchIndex === -1) return;
          const match = room.matches[matchIndex];
          if (match.status === 'pending') return;
          gameState = match.engineState;
        } else {
          gameState = room.gameState;
        }

        if (!gameState) return;

        const playerIds = gameState.players ? Object.keys(gameState.players) : room.players.map(p => p.playerId as PlayerId);
        const playerNames: Record<string, string> = {};
        const playerAvatars: Record<string, string> = {};
        const bots: Record<string, boolean> = {};
        room.players.forEach(p => {
          playerNames[p.playerId] = p.name;
          playerAvatars[p.playerId] = p.avatar || 'ajani.png';
          bots[p.playerId] = !!p.isBot;
        });

        const engine = new GameEngine(playerIds, {}, playerNames, playerAvatars, bots);
        engine.setState(gameState);

        const previousRoomSnapshot = JSON.parse(JSON.stringify(room));
        
        if (gameState.pendingAction) {
          LoggerService.info('MATCH', `[LOCK-TRACE] ${playerId} entering withMatch. Current PendingAction: ${gameState.pendingAction.type} for ${gameState.pendingAction.playerId}`);
        }

        callback(engine, room, matchIndex);

        const newState = engine.getState();
        if (newState.pendingAction) {
          LoggerService.info('MATCH', `[LOCK-TRACE] ${playerId} exiting withMatch. New PendingAction: ${newState.pendingAction.type} for ${newState.pendingAction.playerId}`);
        }
        const players = Object.values(newState.players);
        const lostPlayer = players.find(p => p.hasLost);

        if (lostPlayer && matchIndex !== undefined && room.matches?.[matchIndex]) {
          const match = room.matches![matchIndex];
          const lostId = (lostPlayer.playerId || lostPlayer.id || '').toString();
          if (match.status === 'active' || match.status === 'pending') {
            const winnerId = match.players.find(id => id.toString() !== lostId);
            if (winnerId) {
              match.wins[winnerId] = (match.wins[winnerId] || 0) + 1;
              if (match.wins[winnerId] >= 2) {
                match.status = 'completed';
                if (room.status === 'tournament') {
                   advanceTournament(room);
                }
              } else {
                match.status = 'pending';
                match.joinedPlayers = [];
                match.restartRequestedBy = undefined;
              }
            }
          }
        } else if (lostPlayer && room.gameState) {
          const lostId = (lostPlayer.playerId || lostPlayer.id || '').toString();
          const winnerId = Object.keys(newState.players).find(id => id.toString() !== lostId);
          newState.status = 'completed';
          newState.winner = winnerId;
          room.status = 'completed';
        }

        if (matchIndex !== undefined) {
          room.matches![matchIndex].engineState = newState;
        } else {
          room.gameState = newState;
        }

        const patch = jsonpatch.compare(previousRoomSnapshot, room);
        if (patch.length > 0) {
          io.to(roomId).emit('room_patch', patch);
        } else {
          io.to(roomId).emit('room_update', room);
        }
      } catch (err: any) {
        LoggerService.error('SOCKET', `Error in withMatch: ${err.message}`, { roomId, playerId });
      }
    }).catch(err => {
      console.error('Fatal Lock Error:', err);
    });

    roomLocks.set(roomId, nextLock);
    return nextLock;
  };


  socket.on('ready_with_deck', async ({ roomId, playerId, deck }: { roomId: string, playerId: string, deck: Card[] }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.find(p => p.playerId === playerId);
    if (player) {
      player.deck = deck as Card[];
      player.isReady = true;

      // Ensure all bots have a deck too (simple random 40-card deck from pool)
      room.players.forEach(p => {
        if (p.isBot && (!p.deck || (Array.isArray(p.deck) && p.deck.length === 0))) {
          const pool = p.pool || [];
          // Pick 40 random cards (or all if less than 40)
          p.deck = [...pool].sort(() => Math.random() - 0.5).slice(0, 40);
          p.isReady = true;
        }
      });

      const allReady = room.players.every(p => p.isReady);

      if (allReady && !room.isNormalMatch) {
        startTournamentMatches(io, room);
      } else {
        io.to(roomId).emit('room_update', room);
      }
      await PersistenceService.saveRooms(rooms);
    }
  });

  socket.on('join_tournament_match', async ({ roomId, playerId, matchIndex }: { roomId: string, playerId: string, matchIndex: number }) => {
    const room = rooms.get(roomId);
    if (!room || !room.matches || !room.matches[matchIndex]) return;

    const match = room.matches[matchIndex];
    if (match.status !== 'pending') return;

    if (!match.joinedPlayers) match.joinedPlayers = [];
    if (!match.joinedPlayers.includes(playerId)) {
      match.joinedPlayers.push(playerId);
      LoggerService.info('TOURNAMENT', `Player ${playerId} joined match ${matchIndex}`);
    }

    // Auto-join bots
    const otherPlayerId = match.players.find(id => id !== playerId);
    if (otherPlayerId) {
      const otherPlayer = room.players.find(p => p.playerId === otherPlayerId);
      if (otherPlayer?.isBot && !match.joinedPlayers.includes(otherPlayerId)) {
        match.joinedPlayers.push(otherPlayerId);
        LoggerService.info('TOURNAMENT', `Bot ${otherPlayerId} automatically joined match ${matchIndex}`);
      }
    }

    // Start match if both are present
    if (match.joinedPlayers.length === 2) {
      const updatedMatch = createMatch(room, match.players[0], match.players[1]);
      if (updatedMatch) {
        room.matches[matchIndex] = {
           ...updatedMatch,
           wins: match.wins 
        };
        LoggerService.info('TOURNAMENT', `Match ${matchIndex} is now ACTIVE`);
      }
    }

    io.to(roomId).emit('room_update', room);
    await PersistenceService.saveRooms(rooms);
  });

  socket.on('spectate_tournament_match', async ({ roomId, playerId, matchIndex }: { roomId: string, playerId: string, matchIndex: number }) => {
    const room = rooms.get(roomId);
    if (!room || !room.matches || !room.matches[matchIndex]) return;

    const match = room.matches[matchIndex];
    
    // If the match is pending and both players are bots, a human spectating it should trigger its start
    if (match.status === 'pending') {
      const p1 = room.players.find(p => p.playerId === match.players[0]);
      const p2 = room.players.find(p => p.playerId === match.players[1]);

      if (p1?.isBot && p2?.isBot) {
        LoggerService.info('TOURNAMENT', `Starting bot-vs-bot match ${matchIndex} via spectator ${playerId}`);
        const updatedMatch = createMatch(room, match.players[0], match.players[1]);
        if (updatedMatch) {
          room.matches[matchIndex] = {
            ...updatedMatch,
            wins: match.wins
          };
          io.to(roomId).emit('room_update', room);
          await PersistenceService.saveRooms(rooms);
        }
      }
    }
  });

  socket.on('request_match_restart', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const match = room.matches?.find(m => m.players.includes(playerId) && m.status === 'active');
    if (match) {
      // Tournament match restart
      const opponentId = match.players.find(id => id !== playerId);
      const opponent = room.players.find(p => p.playerId === opponentId);
      
      if (opponent?.isBot) {
        const nextGameMatch = createMatch(room, match.players[0], match.players[1]);
        if (nextGameMatch) {
          match.engineState = nextGameMatch.engineState;
          match.restartRequestedBy = undefined;
          io.to(roomId).emit('room_update', room);
          await PersistenceService.saveRooms(rooms);
        }
      } else {
        match.restartRequestedBy = playerId;
        io.to(roomId).emit('room_update', room);
      }
    } else if (room.gameState) {
      // Normal match restart
      const opponent = room.players.find(p => p.playerId !== playerId);
      if (opponent?.isBot) {
        const p1 = room.players[0];
        const p2 = room.players[1];
        const nextGameMatch = createMatch(room, p1.playerId, p2.playerId);
        if (nextGameMatch) {
          room.gameState = nextGameMatch.engineState;
          room.restartRequestedBy = undefined;
          io.to(roomId).emit('room_update', room);
          await PersistenceService.saveRooms(rooms);
        }
      } else {
        room.restartRequestedBy = playerId;
        io.to(roomId).emit('room_update', room);
      }
    }
  });

  socket.on('accept_match_restart', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const match = room.matches?.find(m => m.players.includes(playerId) && m.status === 'active');
    if (match && match.restartRequestedBy && match.restartRequestedBy !== playerId) {
      const nextGameMatch = createMatch(room, match.players[0], match.players[1]);
      if (nextGameMatch) {
        match.engineState = nextGameMatch.engineState;
        match.restartRequestedBy = undefined;
        io.to(roomId).emit('room_update', room);
        await PersistenceService.saveRooms(rooms);
      }
    } else if (room.gameState && room.restartRequestedBy && room.restartRequestedBy !== playerId) {
      const playerIds = Object.keys(room.gameState.players);
      const nextGameMatch = createMatch(room, playerIds[0], playerIds[1]);
      if (nextGameMatch) {
        room.gameState = nextGameMatch.engineState;
        room.restartRequestedBy = undefined;
        io.to(roomId).emit('room_update', room);
        await PersistenceService.saveRooms(rooms);
      }
    }
  });

  socket.on('update_watching_match', async ({ roomId, playerId, matchIndex }: { roomId: string, playerId: string, matchIndex: number | null }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (!authorizePlayer(room, playerId, 'update_watching')) return;

    const playerIndex = room.players.findIndex(p => p.playerId === playerId);
    if (playerIndex !== -1) {
      room.players[playerIndex].watchingMatchIndex = matchIndex === null ? undefined : matchIndex;
      
      // Emit a tiny patch instead of the whole room
      const patch = [
        { 
          op: 'replace', 
          path: `/players/${playerIndex}/watchingMatchIndex`, 
          value: matchIndex === null ? null : matchIndex 
        }
      ];
      io.to(roomId).emit('room_patch', patch);
    }
  });

  socket.on('decline_match_restart', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const match = room.matches?.find(m => m.players.includes(playerId) && m.status === 'active');
    if (match) {
      match.restartRequestedBy = undefined;
      io.to(roomId).emit('room_update', room);
    } else if (room.gameState && room.restartRequestedBy) {
      room.restartRequestedBy = undefined;
      io.to(roomId).emit('room_update', room);
    }
  });

  const createMatch = (room: Room, player1Id: string, player2Id: string) => {
    const p1 = room.players.find(p => p.playerId === player1Id);
    const p2 = room.players.find(p => p.playerId === player2Id);
    if (!p1 || !p2) return null;

    const playerIds = [p1.playerId, p2.playerId];
    const decksByPlayer: Record<string, Card[]> = {
      [p1.playerId]: p1.deck ? (Array.isArray(p1.deck) ? p1.deck : (p1.deck.mainEntry || p1.deck.cards || [])) : [],
      [p2.playerId]: p2.deck ? (Array.isArray(p2.deck) ? p2.deck : (p2.deck.mainEntry || p2.deck.cards || [])) : []
    };
    const playerNames = { [p1.playerId]: p1.name, [p2.playerId]: p2.name };
    const playerAvatars = { [p1.playerId]: p1.avatar || 'ajani.png', [p2.playerId]: p2.avatar || 'ajani.png' };
    const bots = { [p1.playerId]: !!p1.isBot, [p2.playerId]: !!p2.isBot };
    
    const engine = new GameEngine(playerIds, decksByPlayer, playerNames, playerAvatars, bots);
    engine.startGame();

    return {
      players: [p1.playerId, p2.playerId],
      wins: { [p1.playerId]: 0, [p2.playerId]: 0 },
      status: 'active' as const,
      engineState: engine.getState(),
      joinedPlayers: [p1.playerId, p2.playerId]
    };
  };

  const getWinner = (match: any) => {
    const p1 = match.players[0];
    const p2 = match.players[1];
    return (match.wins[p1] || 0) > (match.wins[p2] || 0) ? p1 : p2;
  };

  const getLoser = (match: any) => {
    const p1 = match.players[0];
    const p2 = match.players[1];
    return (match.wins[p1] || 0) > (match.wins[p2] || 0) ? p2 : p1;
  };

  const resolveBotMatches = (room: Room) => {
    if (!room.matches) return false;
    
    let resolvedAny = false;
    room.matches.forEach((match, idx) => {
      if (match.status !== 'pending') return;
      
      const p1 = room.players.find(p => p.playerId === match.players[0]);
      const p2 = room.players.find(p => p.playerId === match.players[1]);
      
      if (!p1 || !p2) return;

      // Rule: Bot vs Bot = Random Winner
      if (p1.isBot && p2.isBot) {
        const winnerId = Math.random() > 0.5 ? p1.playerId : p2.playerId;
        match.wins = { [p1.playerId]: 0, [p2.playerId]: 0 };
        match.wins[winnerId] = 2; // Bo3 winner
        match.status = 'completed';
        LoggerService.info('TOURNAMENT', `Match ${idx} (Bot vs Bot) auto-resolved. Winner: ${winnerId}`);
        resolvedAny = true;
      }
      // Rule: Human vs Bot = Human Always Wins (since bots can't play)
      else if (p1.isBot || p2.isBot) {
        const human = p1.isBot ? p2 : p1;
        match.wins = { [p1.playerId]: 0, [p2.playerId]: 0 };
        match.wins[human.playerId] = 2; // Bo3 winner
        match.status = 'completed';
        LoggerService.info('TOURNAMENT', `Match ${idx} (Human vs Bot) auto-resolved. Winner: ${human.name} (Human)`);
        resolvedAny = true;
      }
    });

    if (resolvedAny) {
      advanceTournament(room);
      return true;
    }
    return false;
  };

  const advanceTournament = (room: Room) => {
    const matches = room.matches || [];
    const playerCount = room.rules.playerCount || 8;

    LoggerService.info('TOURNAMENT', `Checking advancement for room ${room.id}. Current matches: ${matches.length}`);

    let roundAdvanced = false;

    if (playerCount === 8) {
      // Round 1 -> Round 2 (Semis + Consolation Semis)
      if (matches.length === 4 && matches.every(m => m.status === 'completed')) {
        const w0 = getWinner(matches[0]);
        const w1 = getWinner(matches[1]);
        const w2 = getWinner(matches[2]);
        const w3 = getWinner(matches[3]);

        const l0 = getLoser(matches[0]);
        const l1 = getLoser(matches[1]);
        const l2 = getLoser(matches[2]);
        const l3 = getLoser(matches[3]);
        
        // Winners Bracket (Semis)
        matches.push({ players: [w0, w1], wins: { [w0]: 0, [w1]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 4
        matches.push({ players: [w2, w3], wins: { [w2]: 0, [w3]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 5
        
        // Losers Bracket (Consolation Semis)
        matches.push({ players: [l0, l1], wins: { [l0]: 0, [l1]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 6
        matches.push({ players: [l2, l3], wins: { [l2]: 0, [l3]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 7
        
        LoggerService.info('TOURNAMENT', `Advanced to Semi-Finals & Consolation Semis`);
        roundAdvanced = true;
      }
      // Round 2 -> Round 3 (Finals, 3rd, 5th, 7th place)
      else if (matches.length === 8 && matches.slice(4).every(m => m.status === 'completed')) {
        const w4 = getWinner(matches[4]);
        const w5 = getWinner(matches[5]);
        const l4 = getLoser(matches[4]);
        const l5 = getLoser(matches[5]);

        const w6 = getWinner(matches[6]);
        const w7 = getWinner(matches[7]);
        const l6 = getLoser(matches[6]);
        const l7 = getLoser(matches[7]);

        // 1st & 2nd Place
        matches.push({ players: [w4, w5], wins: { [w4]: 0, [w5]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 8
        // 3rd & 4th Place
        matches.push({ players: [l4, l5], wins: { [l4]: 0, [l5]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 9
        // 5th & 6th Place
        matches.push({ players: [w6, w7], wins: { [w6]: 0, [w7]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 10
        // 7th & 8th Place
        matches.push({ players: [l6, l7], wins: { [l6]: 0, [l7]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 11
        
        LoggerService.info('TOURNAMENT', `Advanced to All Finals (1st-8th)`);
        roundAdvanced = true;
      }
      else if (matches.length === 12 && matches.slice(8).every(m => m.status === 'completed')) {
        room.status = 'completed';
        LoggerService.info('TOURNAMENT', `Tournament fully completed!`);
      }
    } else if (playerCount === 4) {
      if (matches.length === 2 && matches.every(m => m.status === 'completed')) {
        const w0 = getWinner(matches[0]);
        const w1 = getWinner(matches[1]);
        const l0 = getLoser(matches[0]);
        const l1 = getLoser(matches[1]);

        // 1st Place Match
        matches.push({ players: [w0, w1], wins: { [w0]: 0, [w1]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 2
        // 3rd Place Match
        matches.push({ players: [l0, l1], wins: { [l0]: 0, [l1]: 0 }, status: 'pending' as const, joinedPlayers: [] }); // 3

        LoggerService.info('TOURNAMENT', `Advanced to Final & 3rd Place`);
        roundAdvanced = true;
      } else if (matches.length === 4 && matches.slice(2).every(m => m.status === 'completed')) {
        room.status = 'completed';
      }
    }

    if (roundAdvanced) {
      resolveBotMatches(room);
    }
  };

  const startTournamentMatches = (io: Server, room: Room) => {
    LoggerService.info('TOURNAMENT', `Starting matches for room ${room.id}`);

    const players = [...room.players].sort(() => Math.random() - 0.5);
    const matches: any[] = [];

    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        matches.push({
          players: [players[i].playerId, players[i + 1].playerId],
          wins: { [players[i].playerId]: 0, [players[i + 1].playerId]: 0 },
          status: 'pending' as const,
          joinedPlayers: []
        });
      }
    }

    room.matches = matches;
    room.status = 'tournament';

    resolveBotMatches(room);

    io.to(room.id).emit('room_update', room);
    io.to(room.id).emit('match_started', room);
  };

  socket.on('start_draft', async ({ roomId, deck }: { roomId: string, deck?: Card[] }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const isHost = room.host === socket.id || room.hostPlayerId === socket.data.playerId;
    if (!isHost) return;

    if (room.isNormalMatch) {
      let finalDeck = deck;
      if (!finalDeck) {
        finalDeck = await PersistenceService.getDeck('m21_test_deck.json');
      }

      const playerIds = room.players.map(p => p.playerId as PlayerId);
      const decksByPlayer: Record<string, Card[]> = {};
      const playerNames: Record<string, string> = {};
      const playerAvatars: Record<string, string> = {};
      const bots: Record<string, boolean> = {};

      for (const p of room.players) {
        const pDeck = p.deck || finalDeck;
        let cards = [];
        if (Array.isArray(pDeck)) {
          cards = pDeck;
        } else {
          cards = pDeck?.mainEntry || pDeck?.cards || [];
        }
        decksByPlayer[p.playerId] = cards;
        playerNames[p.playerId] = p.name;
        playerAvatars[p.playerId] = p.avatar || 'ajani.png';
        bots[p.playerId] = !!p.isBot;
      }

      const engine = new GameEngine(playerIds, decksByPlayer, playerNames, playerAvatars, bots);
      engine.startGame();
      room.status = 'active';
      room.gameState = engine.getState();
    } else if (room.rules.isSealed) {
      // Auto-fill with bots if missing players
      const required = room.rules.playerCount || 8;
      if (room.players.length < required) {
        const avatars = await AssetService.listAvatars();
        while (room.players.length < required) {
          const botIndex = room.players.filter(p => p.isBot).length + 1;
          const botId = `bot-${Math.random().toString(36).substring(2, 7)}`;
          room.players.push({
            id: botId,
            playerId: botId,
            name: `Bot_${botIndex}`,
            avatar: avatars[Math.floor(Math.random() * avatars.length)] || 'ajani.png',
            online: true,
            isBot: true,
            lastSeen: Date.now(),
            pool: []
          });
        }
      }
      SealedService.startSealed(room);
    } else {
      // Auto-fill with bots if missing players
      const required = room.rules.playerCount || 8;
      if (room.players.length < required) {
        const avatars = await AssetService.listAvatars();
        while (room.players.length < required) {
          const botIndex = room.players.filter(p => p.isBot).length + 1;
          const botId = `bot-${Math.random().toString(36).substring(2, 7)}`;
          room.players.push({
            id: botId,
            playerId: botId,
            name: `Bot_${botIndex}`,
            avatar: avatars[Math.floor(Math.random() * avatars.length)] || 'ajani.png',
            online: true,
            isBot: true,
            lastSeen: Date.now(),
            pool: []
          });
        }
      }
      DraftService.startDraft(room);
      BotLogic.triggerBotPicks(rooms, roomId);
    }
    LoggerService.info('DRAFT', `${room.isNormalMatch ? 'Normal Match' : 'Draft'} started in room: ${roomId}`, { roomId, status: room.status });
    io.to(roomId).emit('draft_started', room);
    await PersistenceService.saveRooms(rooms);
  });

  socket.on('pass_priority', async ({ roomId, playerId }: { roomId: string, playerId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.passPriority(playerId);
    });
  });

  socket.on('concede', async ({ roomId, playerId }: { roomId: string, playerId: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (!authorizePlayer(room, playerId, 'concede')) return;

    LoggerService.info('MATCH', `ATOMIC CONCEDE START: Player ${playerId} in room ${roomId}`);
    
    // Find the match this player is currently in
    const matchIndex = room.matches?.findIndex(m => m.players.includes(playerId) && m.status !== 'completed');
    
    if (matchIndex !== undefined && matchIndex !== -1) {
      const match = room.matches![matchIndex];
      LoggerService.info('MATCH', `Processing concede for Tournament Match ${matchIndex}.`);

      // 1. Update engine state if it exists
      if (match.engineState) {
          const enginePlayer = match.engineState.players[playerId];
          if (enginePlayer) {
              enginePlayer.hasLost = true;
              match.engineState.status = 'completed';
              match.engineState.winner = match.players.find(id => id !== playerId);
          }
      }
      
      // 2. Update match score and status
      const winnerId = match.players.find(id => id !== playerId);
      if (winnerId) {
          match.wins[winnerId] = (match.wins[winnerId] || 0) + 1;
          if (match.wins[winnerId] >= 2) {
              match.status = 'completed';
              if (room.status === 'tournament') {
                  advanceTournament(room);
              }
          } else {
              match.status = 'pending';
              match.joinedPlayers = [];
              match.restartRequestedBy = undefined;
          }
      }
    } else if (room.gameState) {
      // Normal match concede
      LoggerService.info('MATCH', `Processing concede for Normal Match.`);
      const enginePlayer = room.gameState.players[playerId];
      if (enginePlayer) {
          enginePlayer.hasLost = true;
          room.gameState.status = 'completed';
          room.gameState.winner = Object.keys(room.gameState.players).find(id => id !== playerId);
          room.status = 'completed';
      }
    } else {
      LoggerService.warn('MATCH', `Concede failed: No active match or gameState found for player ${playerId}`);
      return;
    }
    
    // 3. Emit FULL room update to ensure all clients sync correctly
    io.to(roomId).emit('room_update', room);
    await PersistenceService.saveRooms(rooms);
  });

  socket.on('toggle_pass_turn', async ({ roomId, playerId }: { roomId: string, playerId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.togglePassTurn(playerId);
    });
  });

  socket.on('play_card', async ({ roomId, playerId, cardInstanceId, targets = [] }: { roomId: string, playerId: string, cardInstanceId: string, targets: string[] }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.playCard({ playerId, cardId: cardInstanceId, targets });
    });
  });

  socket.on('shuffle_library', async ({ roomId, playerId }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.shuffleLibrary(playerId);
    });
  });

  socket.on('tap_permanent', async ({ roomId, playerId, cardId }: { roomId: string, playerId: string, cardId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      try {
        engine.interactWithPermanent(playerId, cardId);
      } catch (e) {
        LoggerService.error('ENGINE', `Error in tap_permanent: ${e}`);
      }
    });
  });

  socket.on('activate_ability', async ({ roomId, playerId, cardId, abilityIndex, targets = [] }: { roomId: string, playerId: string, cardId: string, abilityIndex: number, targets: string[] }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.activateAbility({ playerId, cardId, abilityIndex, targets });
    });
  });

  socket.on('toggle_full_control', async ({ roomId, playerId }: { roomId: string, playerId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      const state = engine.getState();
      const player = state.players[playerId];
      if (player) {
        player.fullControl = !player.fullControl;
        LoggerService.info('SOCKET', `Full control toggled for ${player.name}: ${player.fullControl}`);
      }
    });
  });

  socket.on('toggle_auto_order', async ({ roomId, playerId }: { roomId: string, playerId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      const state = engine.getState();
      const player = state.players[playerId];
      if (player) {
        player.autoOrderTriggers = !player.autoOrderTriggers;
      }
    });
  });

  socket.on('toggle_stop', async ({ roomId, playerId, step }: { roomId: string, playerId: string, step: string }) => {
    withMatch(roomId, playerId, (engine) => {
      const state = engine.getState();
      const player = state.players[playerId];
      if (player) {
        if (!player.stops) player.stops = {};
        player.stops[step] = !player.stops[step];
      }
    });
  });

  socket.on('discard_card', async ({ roomId, playerId, cardId }: { roomId: string, playerId: string, cardId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.discardCard(playerId, cardId);
    });
  });

  socket.on('resolve_choice', async ({ roomId, playerId, choiceIndex }: { roomId: string, playerId: string, choiceIndex: any }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.resolveChoice(playerId, choiceIndex);
    });
  });

  socket.on('resolve_target', async ({ roomId, playerId, targetId }: { roomId: string, playerId: string, targetId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      const state = engine.getState();
      if (state.pendingAction?.type === 'TARGETING') {
        engine.resolveTargeting(playerId, targetId);
      } else if (state.pendingAction?.type === 'DECLARE_ATTACKERS') {
        engine.interactWithPermanent(playerId, targetId);
      }
    });
  });

  socket.on('resolve_combat_ordering', async ({ roomId, playerId, order }: { roomId: string, playerId: string, order: string[] }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.resolveCombatOrdering(playerId, order);
    });
  });

  socket.on('clear_attackers', async ({ roomId, playerId }: { roomId: string, playerId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.clearAttackers(playerId);
    });
  });

  socket.on('clear_blockers', async ({ roomId, playerId }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.clearBlockers(playerId);
    });
  });

  socket.on('back_to_lobby', async ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const isHost = room.host === socket.id || room.hostPlayerId === socket.data.playerId;
    if (!isHost) return;

    room.status = 'waiting';
    room.gameState = undefined;
    room.players.forEach(p => {
      p.deck = undefined;
    });

    LoggerService.info('DRAFT', `Room ${roomId} returned to lobby by host.`);
    io.to(roomId).emit('draft_update', room);
    await PersistenceService.saveRooms(rooms);
  });

  /* --- DEBUG COMMANDS --- */

  socket.on('debug_swap_hand', async ({ roomId, playerId }: { roomId: string, playerId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      const state = engine.getState();
      const pState = state.players[playerId];
      if (!pState) return;

      const handSize = pState.hand.length;
      pState.library.push(...pState.hand);
      pState.hand = [];
      engine.shuffleLibrary(playerId);

      for (let i = 0; i < Math.max(7, handSize); i++) {
        engine.drawCard(playerId);
      }
    });
  });

  socket.on('debug_reset_game', async ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerIds = room.players.map(p => p.playerId as PlayerId);
    const decksByPlayer: Record<string, Card[]> = {};
    const playerNames: Record<string, string> = {};
    const playerAvatars: Record<string, string> = {};
    const bots: Record<string, boolean> = {};

    const defaultDeck = await PersistenceService.getDeck('m21_test_deck.json');

    for (const p of room.players) {
      const pDeck = p.deck || defaultDeck;
      let cards: Card[] = [];
      if (Array.isArray(pDeck)) {
        cards = pDeck;
      } else {
        cards = pDeck?.mainEntry || pDeck?.cards || [];
      }
      decksByPlayer[p.playerId] = cards;
      playerNames[p.playerId] = p.name;
      playerAvatars[p.playerId] = p.avatar || 'ajani.png';
      bots[p.playerId] = !!p.isBot;
    }

    const engine = new GameEngine(playerIds, decksByPlayer, playerNames, playerAvatars, bots);
    engine.startGame();

    room.gameState = engine.getState();
    room.gameState.logs.push(">> [DEBUG] GAME RESET BY ADMIN");

    io.to(roomId).emit('room_update', room);
    await PersistenceService.saveRooms(rooms);
  });

  socket.on('debug_add_life', async ({ roomId, playerId, amount }: { roomId: string, playerId: string, amount: number }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.gainLife(playerId, amount);
    });
  });

  socket.on('debug_move_card_from_library', async ({ roomId, playerId, cardId }: { roomId: string, playerId: string, cardId: string }) => {
    withMatch(roomId, playerId, (engine) => {
      const state = engine.getState();
      const pState = state.players[playerId];
      if (!pState) return;

      const card = pState.library.find(c => c.id === cardId);
      if (card) {
        state.logs.push(`>> [DEBUG] Moved ${card.definition.name} from library to hand.`);
        ActionProcessor.moveCard(state, card, Zone.Hand, playerId);
      }
    });
  });

  socket.on('debug_add_card', async ({ roomId, playerId, cardName }: { roomId: string, playerId: string, cardName: string }) => {
    withMatch(roomId, playerId, async (engine) => {
      const state = engine.getState();
      const pState = state.players[playerId];
      if (!pState) return;

      const allCards = await PersistenceService.getDeck('all.json');
      const cardRef = allCards?.cards?.find((c: any) => c.name.toLowerCase() === cardName.toLowerCase());

      if (cardRef) {
        const card = GameSetupProcessor.createGameObject(playerId, cardRef, pState.hand.length + pState.library.length + 999);
        card.zone = Zone.Hand;
        pState.hand.push(card);
        state.logs.push(`>> [DEBUG] Added ${cardRef.name} to ${pState.name}'s hand.`);
      }
    });
  });

  socket.on('debug_draw_card', async ({ roomId, playerId }) => {
    withMatch(roomId, playerId, (engine) => {
      engine.drawCard(playerId);
    });
  });

  socket.on('toggle_mana_cheat', async ({ roomId, playerId }) => {
    withMatch(roomId, playerId, (engine) => {
      const state = engine.getState();
      const player = state.players[playerId];
      if (player) {
        player.manaCheat = !player.manaCheat;
      }
    });
  });

  socket.on('save_checkpoint', async ({ roomId, playerId }) => {
    withMatch(roomId, playerId, (engine, room) => {
      if (room.hostPlayerId !== playerId) return;
      room.checkpoint = JSON.parse(JSON.stringify(engine.getState()));
      LoggerService.info('DEBUG', `Checkpoint saved for room ${roomId}`);
    });
  });

  socket.on('load_checkpoint', async ({ roomId, playerId }) => {
    withMatch(roomId, playerId, (engine, room, matchIndex) => {
      if (room.hostPlayerId !== playerId) return;
      const restoredState = JSON.parse(JSON.stringify(room.checkpoint));
      if (restoredState) {
        restoredState.logs.push(">> [DEBUG] GAME RESTORED FROM CHECKPOINT");
        engine.setState(restoredState);
        LoggerService.info('DEBUG', `Checkpoint restored for room ${roomId}`);
      }
    });
  });


};
