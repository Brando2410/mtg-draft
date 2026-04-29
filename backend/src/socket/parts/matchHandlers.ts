import { GameState, PlayerId, Zone } from '@shared/engine_types';
import { Room } from '@shared/types';
import { Server, Socket } from 'socket.io';
import { BotLogic } from '../../bots/BotLogic';
import { GameEngine } from '../../engine/GameEngine';
import { ActionProcessor } from '../../engine/modules/actions/ActionProcessor';
import { GameSetupProcessor } from '../../engine/modules/core/GameSetupProcessor';
import { DraftService } from '../../services/DraftService';
import { LoggerService } from '../../services/LoggerService';
import { PersistenceService } from '../../services/PersistenceService';
import { SealedService } from '../../services/SealedService';
import * as jsonpatch from 'fast-json-patch';


export const registerMatchHandlers = (io: Server, socket: Socket, rooms: Map<string, Room>) => {

  const withMatch = (roomId: string, playerId: string, callback: (engine: GameEngine, room: Room, matchIndex?: number) => void) => {
    try {
      const room = rooms.get(roomId);
      if (!room) return;

      let gameState: GameState | undefined;
      let matchIndex: number | undefined;

      if (room.status === 'tournament' && room.matches) {
        matchIndex = room.matches.findIndex(m => m.players.includes(playerId));
        if (matchIndex === -1) return;
        gameState = room.matches[matchIndex].engineState;
      } else {
        gameState = room.gameState;
      }

      if (!gameState) {
        LoggerService.warn('MATCH', `No GameState found for room ${roomId}`, { roomId, status: room.status });
        return;
      }

      const playerIds = gameState.players ? Object.keys(gameState.players) : room.players.map(p => p.playerId as PlayerId);
      const playerNames: Record<string, string> = {};
      room.players.forEach(p => playerNames[p.playerId] = p.name);

      const engine = new GameEngine(playerIds as any, {}, playerNames);
      engine.setState(gameState);

      // Take a snapshot for delta calculation
      const previousRoomSnapshot = JSON.parse(JSON.stringify(room));

      // Execute the action (most engine actions are synchronous)
      callback(engine, room, matchIndex);

      const newState = engine.getState();
      
      // CR 704: Handle losing/winning conditions automatically
      const players = Object.values(newState.players);
      const lostPlayer = players.find(p => p.hasLost);
      
      if (lostPlayer && room.status === 'tournament' && matchIndex !== undefined) {
        const match = room.matches![matchIndex];
        if (match.status === 'active') {
          const winnerId = match.players.find(id => id !== lostPlayer.id);
          if (winnerId) {
            match.wins[winnerId] = (match.wins[winnerId] || 0) + 1;
            match.status = 'completed';
            LoggerService.info('MATCH', `Match ${matchIndex} resolved. Winner: ${winnerId}`);
          }
        }
      }

      if (matchIndex !== undefined) {
        room.matches![matchIndex].engineState = newState;
      } else {
        room.gameState = newState;
      }

      // 4. DELTA SYNC: Calculate and emit patch instead of full state
      const patch = jsonpatch.compare(previousRoomSnapshot, room);
      
      if (patch.length > 0) {
        // We only send the patch to save bandwidth
        io.to(roomId).emit('room_patch', patch);
      } else {
        // Fallback for cases where no delta was detected but update was requested
        io.to(roomId).emit('room_update', room);
      }
      
      PersistenceService.saveRooms(rooms).catch(e => LoggerService.error('SAVE', `Save failed: ${e.message}`));
    } catch (err: any) {
      LoggerService.error('SOCKET', `Error in withMatch: ${err.message}`, { roomId, playerId });
      if (err.stack) {
        console.error('Stack trace:', err.stack);
      }
    }
  };

  socket.on('ready_with_deck', async ({ roomId, playerId, deck }: { roomId: string, playerId: string, deck: any }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.find(p => p.playerId === playerId);
    if (player) {
      (player as any).deck = deck;
      (player as any).isReady = true;

      const allReady = room.players.length >= (room.rules.playerCount || 2) && 
                       room.players.every(p => (p as any).isReady || p.isBot);

      if (allReady && !room.isNormalMatch) {
        startTournamentMatches(io, room);
      } else {
        io.to(roomId).emit('room_update', room);
      }
      await PersistenceService.saveRooms(rooms);
    }
  });

  const startTournamentMatches = (io: Server, room: Room) => {
    LoggerService.info('TOURNAMENT', `Starting matches for room ${room.id}`);

    const players = room.players.filter(p => !p.isBot);
    const matches: any[] = [];

    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        const p1 = players[i];
        const p2 = players[i + 1];

        const playerIds = [p1.playerId, p2.playerId] as any;
        const decksByPlayer = {
          [p1.playerId]: (p1 as any).deck,
          [p2.playerId]: (p2 as any).deck
        };
        const playerNames = {
          [p1.playerId]: p1.name,
          [p2.playerId]: p2.name
        };
        const engine = new GameEngine(playerIds, decksByPlayer, playerNames);
        engine.startGame();

        matches.push({
          players: [p1.playerId, p2.playerId],
          wins: { [p1.playerId]: 0, [p2.playerId]: 0 },
          status: 'active',
          engineState: engine.getState()
        });
      }
    }

    room.matches = matches;
    room.status = 'tournament';

    io.to(room.id).emit('room_update', room);
    io.to(room.id).emit('match_started', room);
  };

  socket.on('start_draft', async ({ roomId, deck }: { roomId: string, deck?: any }) => {
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
      const decksByPlayer: Record<string, any[]> = {};
      const playerNames: Record<string, string> = {};
      const playerAvatars: Record<string, string> = {};

      for (const p of room.players) {
        const pDeck = (p as any).deck || finalDeck;
        let cards = [];
        if (Array.isArray(pDeck)) {
          cards = pDeck;
        } else {
          cards = pDeck?.mainEntry || pDeck?.cards || [];
        }
        decksByPlayer[p.playerId] = cards;
        playerNames[p.playerId] = p.name;
        playerAvatars[p.playerId] = (p as any).avatar || 'ajani.png';
      }

      const engine = new GameEngine(playerIds, decksByPlayer, playerNames, playerAvatars);
      engine.startGame();
      room.status = 'active';
      room.gameState = engine.getState();
    } else if (room.rules.isSealed) {
      SealedService.startSealed(room);
    } else {
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
      (p as any).deck = undefined;
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
    const decksByPlayer: Record<string, any[]> = {};
    const playerNames: Record<string, string> = {};
    const playerAvatars: Record<string, string> = {};

    const defaultDeck = await PersistenceService.getDeck('m21_test_deck.json');

    for (const p of room.players) {
      const pDeck = (p as any).deck || defaultDeck;
      let cards = [];
      if (Array.isArray(pDeck)) {
        cards = pDeck;
      } else {
        cards = pDeck?.mainEntry || pDeck?.cards || [];
      }
      decksByPlayer[p.playerId] = cards;
      playerNames[p.playerId] = p.name;
      playerAvatars[p.playerId] = (p as any).avatar || 'ajani.png';
    }

    const engine = new GameEngine(playerIds, decksByPlayer, playerNames, playerAvatars);
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
        ActionProcessor.moveCard(state, card, Zone.Hand, playerId, (m: string) => state.logs.push(`>> [DEBUG] ${m}`));
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
