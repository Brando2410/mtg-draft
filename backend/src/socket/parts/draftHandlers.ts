import { Server, Socket } from 'socket.io';
import { Room } from '@shared/types';
import { DraftService } from '../../services/DraftService';
import { BotLogic } from '../../bots/BotLogic';
import { PersistenceService } from '../../services/PersistenceService';
import { LoggerService } from '../../services/LoggerService';

export const registerDraftHandlers = (io: Server, socket: Socket, rooms: Map<string, Room>) => {
  socket.on('pick_card', async ({ roomId, playerId, cardId }) => {
    LoggerService.debug('DRAFT', `Pick attempt: player ${playerId} picking card ${cardId}`, { roomId, playerId, cardId });
    if (DraftService.performPick(rooms, roomId, playerId, cardId)) {
      BotLogic.triggerBotPicks(rooms, roomId);
      const room = rooms.get(roomId);
      io.to(roomId).emit('draft_update', room);
      await PersistenceService.saveRooms(rooms);
    }
  });

  socket.on('select_card', ({ roomId, playerId, cardId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.draftState || room.status !== 'drafting') return;
    room.draftState.selections[playerId] = cardId;
  });

  socket.on('toggle_pause', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'drafting' || room.hostPlayerId !== playerId || !room.draftState) return;

    room.isPaused = !room.isPaused;
    room.draftState.isPaused = room.isPaused;

    const now = Date.now();
    if (room.isPaused) {
      room.draftState.playerTimersRemaining = {};
      Object.entries(room.draftState.playerTimers).forEach(([pid, end]) => {
        if (end) room.draftState!.playerTimersRemaining![pid] = Math.max(0, end - now);
      });
      room.draftState.playerTimers = {};
    } else {
      if (room.draftState.playerTimersRemaining) {
        Object.entries(room.draftState.playerTimersRemaining).forEach(([pid, remain]) => {
          room.draftState!.playerTimers[pid] = now + (remain as number);
        });
      }
      room.draftState.playerTimersRemaining = undefined;
    }

    io.to(roomId).emit('draft_update', room);
    await PersistenceService.saveRooms(rooms);
  });
};
