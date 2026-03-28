import { Server, Socket } from 'socket.io';
import { Room, PlayerId } from '@shared/types';
import { DraftService } from '../../services/DraftService';
import { BotLogic } from '../../bots/BotLogic';
import { PersistenceService } from '../../services/PersistenceService';
import { LoggerService } from '../../services/LoggerService';
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
    if (!room || room.host !== socket.id) return;

    if (room.isNormalMatch) {
       const host = room.players.find(p => p.playerId === room.hostPlayerId);
       if (host && deck) (host as any).deck = deck;

       const playerIds = room.players.map(p => p.playerId as PlayerId);
       const decksByPlayer: Record<string, any[]> = {};
       const playerNames: Record<string, string> = {};
       room.players.forEach(p => {
          decksByPlayer[p.playerId] = (p as any).deck?.mainEntry || (p as any).deck?.cards || [];
          playerNames[p.playerId] = p.name;
       });

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
        engine.tapForMana(playerId, cardId);
        room.gameState = engine.getState();
        io.to(roomId).emit('draft_update', room);
        await PersistenceService.saveRooms(rooms);
     } catch (error) {
        console.warn(`[SOCKET] Tap permanent error:`, error);
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
};
