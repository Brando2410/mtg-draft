import { Server, Socket } from 'socket.io';
import { Room } from '@shared/types';
import { PlayerId, Zone } from '@shared/engine_types';
import { DraftService } from '../../services/DraftService';
import { BotLogic } from '../../bots/BotLogic';
import { PersistenceService } from '../../services/PersistenceService';
import { LoggerService } from '../../services/LoggerService';
import { oracle } from '../../engine/OracleLogicMap';
import { GameEngine } from '../../engine/GameEngine';

export const registerMatchHandlers = (io: Server, socket: Socket, rooms: Map<string, Room>) => {
  socket.on('ready_with_deck', async ({ roomId, playerId, deck }) => {
    console.log(`[DIAGNOSTIC] Incoming deck for ${playerId}. First card:`, JSON.stringify(deck?.cards?.[0] || deck?.[0] || deck?.mainEntry?.[0], null, 2));
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.find(p => p.playerId === playerId);
    if (player) {
      (player as any).deck = deck;
      io.to(roomId).emit('room_update', room);
      await PersistenceService.saveRooms(rooms);
    }
  });

  socket.on('start_draft', async ({ roomId, deck }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // Use persistent ID for authorization
    const isHost = room.host === socket.id || room.hostPlayerId === socket.data.playerId;
    if (!isHost) return;

    if (room.isNormalMatch) {
       // Load default deck if missing
       let finalDeck = deck;
       if (!finalDeck) {
         finalDeck = await PersistenceService.getDeck('m21_test_deck.json');
       }

       const playerIds = room.players.map(p => p.playerId as PlayerId);
       const decksByPlayer: Record<string, any[]> = {};
       const playerNames: Record<string, string> = {};

       for (const p of room.players) {
          const pDeck = (p as any).deck || finalDeck;
          decksByPlayer[p.playerId] = pDeck?.mainEntry || pDeck?.cards || [];
          playerNames[p.playerId] = p.name;
       }

       const engine = new GameEngine(playerIds, decksByPlayer, playerNames);
       engine.startGame();
       room.status = 'drafting';
       room.gameState = engine.getState();
    } else {
       DraftService.startDraft(room);
       BotLogic.triggerBotPicks(rooms, roomId);
    }
    LoggerService.info('DRAFT', `${room.isNormalMatch ? 'Normal Match' : 'Draft'} started in room: ${roomId}`, { roomId });
    io.to(roomId).emit('draft_started', room);
    await PersistenceService.saveRooms(rooms);
  });

  socket.on('pass_priority', async ({ roomId, playerId }) => {
     const room = rooms.get(roomId);
     if (!room || !room.gameState) return;
     
     const playerIds = room.players.map(p => p.playerId as PlayerId);
     const playerNames: Record<string, string> = {};
     room.players.forEach(p => playerNames[p.playerId] = p.name);

     const engine = new GameEngine(playerIds, {}, playerNames);
     engine.setState(room.gameState);

     try {
        engine.passPriority(playerId);
        room.gameState = engine.getState();
        io.to(roomId).emit('draft_update', room);
        await PersistenceService.saveRooms(rooms);
     } catch (error) {
        console.warn(`[SOCKET] Pass priority error:`, error);
     }
  });

  socket.on('play_card', async ({ roomId, playerId, cardInstanceId, targets = [] }) => {
     const room = rooms.get(roomId);
     if (!room || !room.gameState) return;
     
     const playerIds = room.players.map(p => p.playerId as PlayerId);
     const playerNames: Record<string, string> = {};
     room.players.forEach(p => playerNames[p.playerId] = p.name);

     const engine = new GameEngine(playerIds, {}, playerNames);
     engine.setState(room.gameState);

     try {
        engine.playCard(playerId, cardInstanceId, targets);
        room.gameState = engine.getState();
        io.to(roomId).emit('draft_update', room);
        await PersistenceService.saveRooms(rooms);
     } catch (error) {
        console.warn(`[SOCKET] Play card error:`, error);
     }
  });

  socket.on('debug_swap_hand', async ({ roomId, playerId }) => {
     const room = rooms.get(roomId);
     if (!room || !room.gameState) return;

     const playerIds = room.players.map(p => p.playerId as PlayerId);
     const engine = new GameEngine(playerIds);
     engine.setState(room.gameState);

     try {
        const state = engine.getState();
        const pState = state.players[playerId];
        if (!pState) return;
        
        const handSize = pState.hand.length;
        // Move hand to library
        pState.library.push(...pState.hand);
        pState.hand = [];
        
        // Shuffle before drawing to avoid getting the same cards back (LIFO)
        engine.shuffleLibrary(playerId);

        // Draw new ones
        for (let i = 0; i < Math.max(7, handSize); i++) {
           (engine as any).drawCard(playerId);
        }

        room.gameState = engine.getState();
        io.to(roomId).emit('draft_update', room);
        await PersistenceService.saveRooms(rooms);
     } catch (error) {
        console.warn(`[SOCKET] Debug swap hand error:`, error);
     }
  });

  socket.on('shuffle_library', async ({ roomId, playerId }) => {
     const room = rooms.get(roomId);
     if (!room || !room.gameState) return;

     const playerIds = room.players.map(p => p.playerId as PlayerId);
     const playerNames: Record<string, string> = {};
     room.players.forEach(p => playerNames[p.playerId] = p.name);

     const engine = new GameEngine(playerIds, {}, playerNames);
     engine.setState(room.gameState);

     try {
        engine.shuffleLibrary(playerId);
        room.gameState = engine.getState();
        io.to(roomId).emit('draft_update', room);
        await PersistenceService.saveRooms(rooms);
     } catch (error) {
        console.warn(`[SOCKET] Shuffle library error:`, error);
     }
  });

  socket.on('tap_permanent', async ({ roomId, playerId, cardId }) => {
     const room = rooms.get(roomId);
     if (!room || !room.gameState) return;

     const playerIds = room.players.map(p => p.playerId as PlayerId);
     const playerNames: Record<string, string> = {};
     room.players.forEach(p => playerNames[p.playerId] = p.name);

     const engine = new GameEngine(playerIds, {}, playerNames);
     engine.setState(room.gameState);

     try {
        engine.interactWithPermanent(playerId, cardId);
        room.gameState = engine.getState();
        io.to(roomId).emit('draft_update', room);
        await PersistenceService.saveRooms(rooms);
     } catch (error) {
        console.warn(`[SOCKET] Interaction error:`, error);
     }
  });

  socket.on('activate_ability', async ({ roomId, playerId, cardId, abilityIndex, targets = [] }) => {
     const room = rooms.get(roomId);
     if (!room || !room.gameState) return;

     const playerIds = room.players.map(p => p.playerId as PlayerId);
     const playerNames: Record<string, string> = {};
     room.players.forEach(p => playerNames[p.playerId] = p.name);

     const engine = new GameEngine(playerIds, {}, playerNames);
     engine.setState(room.gameState);

     try {
        engine.activateAbility(playerId, cardId, abilityIndex, targets);
        room.gameState = engine.getState();
        io.to(roomId).emit('draft_update', room);
        await PersistenceService.saveRooms(rooms);
     } catch (error) {
        console.warn(`[SOCKET] Activate ability error:`, error);
     }
  });

  socket.on('toggle_full_control', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const player = room.gameState.players[playerId];
    if (player) {
      player.fullControl = !player.fullControl;
      io.to(roomId).emit('draft_update', room);
      console.log(`[Socket] Full control toggled for ${player.name}: ${player.fullControl}`);
      await PersistenceService.saveRooms(rooms);
    }
  });

  socket.on('discard_card', async ({ roomId, playerId, cardId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const playerIds = room.players.map(p => p.playerId as PlayerId);
    const engine = new GameEngine(playerIds);
    engine.setState(room.gameState);

    try {
      engine.discardCard(playerId, cardId);
      room.gameState = engine.getState();
      io.to(roomId).emit('draft_update', room);
      await PersistenceService.saveRooms(rooms);
    } catch (error) {
      console.warn(`[SOCKET] Discard error:`, error);
    }
  });

  socket.on('resolve_choice', async ({ roomId, playerId, choiceIndex }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const playerIds = room.players.map(p => p.playerId as PlayerId);
    const playerNames: Record<string, string> = {};
    room.players.forEach(p => playerNames[p.playerId] = p.name);

    const engine = new GameEngine(playerIds, {}, playerNames);
    engine.setState(room.gameState);

    try {
      engine.resolveChoice(playerId, choiceIndex);
      room.gameState = engine.getState();
      io.to(roomId).emit('draft_update', room);
      await PersistenceService.saveRooms(rooms);
    } catch (error) {
      console.warn(`[SOCKET] Resolve choice error:`, error);
    }
  });

  socket.on('resolve_target', async ({ roomId, playerId, targetId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const playerIds = room.players.map(p => p.playerId as PlayerId);
    const playerNames: Record<string, string> = {};
    room.players.forEach(p => playerNames[p.playerId] = p.name);

    const engine = new GameEngine(playerIds, {}, playerNames);
    engine.setState(room.gameState);

    try {
      // Rule 601.2c: The player announces his or her activation of an ability and chooses targets
      if (room.gameState.pendingAction?.type === 'TARGETING') {
          // Unified targeting resolution (Spells or Abilities)
          engine.resolveTargeting(playerId, targetId);
      } else if (room.gameState.pendingAction?.type === 'DECLARE_ATTACKERS') {
          // In combat, selecting a target re-targets the attacker
          engine.interactWithPermanent(playerId, targetId);
      }
      
      room.gameState = engine.getState();
      io.to(roomId).emit('draft_update', room);
      await PersistenceService.saveRooms(rooms);
    } catch (error) {
      console.warn(`[SOCKET] Resolve target error:`, error);
    }
  });
  socket.on('resolve_combat_ordering', async ({ roomId, playerId, order }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const playerIds = room.players.map(p => p.playerId as PlayerId);
    const playerNames: Record<string, string> = {};
    room.players.forEach(p => playerNames[p.playerId] = p.name);

    const engine = new GameEngine(playerIds, {}, playerNames);
    engine.setState(room.gameState);

    try {
      engine.resolveCombatOrdering(playerId, order);
      room.gameState = engine.getState();
      io.to(roomId).emit('draft_update', room);
      await PersistenceService.saveRooms(rooms);
    } catch (error) {
      console.warn(`[SOCKET] Resolve ordering error:`, error);
    }
  });

  /* --- DEBUG COMMANDS --- */

  socket.on('debug_reset_game', async ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerIds = room.players.map(p => p.playerId as PlayerId);
    const decksByPlayer: Record<string, any[]> = {};
    const playerNames: Record<string, string> = {};

    const defaultDeck = await PersistenceService.getDeck('m21_test_deck.json');

    for (const p of room.players) {
        const pDeck = (p as any).deck || defaultDeck;
        decksByPlayer[p.playerId] = pDeck?.mainEntry || pDeck?.cards || [];
        playerNames[p.playerId] = p.name;
    }

    const engine = new GameEngine(playerIds, decksByPlayer, playerNames);
    engine.startGame();
    
    room.gameState = engine.getState();
    room.gameState.logs.push(">> [DEBUG] GAME RESET BY ADMIN");
    
    io.to(roomId).emit('draft_update', room);
    await PersistenceService.saveRooms(rooms);
    console.log(`[DEBUG] Room ${roomId} has been reset.`);
  });

  socket.on('debug_add_life', async ({ roomId, playerId, amount }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const playerIds = room.players.map(p => p.playerId as PlayerId);
    const engine = new GameEngine(playerIds);
    engine.setState(room.gameState);

    try {
      engine.gainLife(playerId, amount);
      room.gameState = engine.getState();
      io.to(roomId).emit('draft_update', room);
      await PersistenceService.saveRooms(rooms);
    } catch (error) {
      console.warn(`[SOCKET] Debug life error:`, error);
    }
  });

  socket.on('debug_draw_card', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const playerIds = room.players.map(p => p.playerId as PlayerId);
    const engine = new GameEngine(playerIds);
    engine.setState(room.gameState);

    try {
      engine.drawCard(playerId);
      room.gameState = engine.getState();
      io.to(roomId).emit('draft_update', room);
      await PersistenceService.saveRooms(rooms);
    } catch (error) {
      console.warn(`[SOCKET] Debug draw error:`, error);
    }
  });

  socket.on('toggle_mana_cheat', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;
    const player = room.gameState.players[playerId];
    if (player) {
      player.manaCheat = !player.manaCheat;
      io.to(roomId).emit('draft_update', room);
    }
  });

  socket.on('save_checkpoint', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostPlayerId !== playerId) return;
    room.checkpoint = JSON.parse(JSON.stringify(room.gameState));
    io.to(roomId).emit('draft_update', room);
    console.log(`[DEBUG] Checkpoint saved for room ${roomId}`);
  });

  socket.on('load_checkpoint', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostPlayerId !== playerId) return;
    const restoredState = JSON.parse(JSON.stringify(room.checkpoint));
    if (restoredState) {
        restoredState.logs.push(">> [DEBUG] GAME RESTORED FROM CHECKPOINT");
        room.gameState = restoredState;
        io.to(roomId).emit('draft_update', room);
        console.log(`[DEBUG] Checkpoint restored for room ${roomId}`);
    }
  });

  socket.on('debug_add_card', async ({ roomId, playerId, cardName }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameState) return;

    const logic = oracle.getCard(cardName);
    if (!logic) {
        console.warn(`[DEBUG] Card logic not found for: ${cardName}`);
        return;
    }

    const player = room.gameState.players[playerId];
    if (!player) return;

    const instanceId = `debug_${cardName}_${Date.now()}`;
    const newCard: any = {
        id: instanceId,
        ownerId: playerId,
        controllerId: playerId,
        zone: Zone.Hand,
        definition: {
            name: cardName,
            manaCost: logic.manaCost || "{0}",
            types: logic.types || [],
            oracleText: logic.oracleText || "",
            image_url: logic.image_url || `https://cards.scryfall.io/normal/front/d/e/debug.jpg`,
            ...logic
        },
        counters: {},
        damageMarked: 0,
        isTapped: false,
        summoningSickness: false,
        keywords: logic.keywords || []
    };

    player.hand.push(newCard);
    room.gameState.logs.push(`>> [DEBUG] Added ${cardName} to ${player.name}'s hand.`);
    io.to(roomId).emit('draft_update', room);
    await PersistenceService.saveRooms(rooms);
  });
};


