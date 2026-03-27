import { Server, Socket } from 'socket.io';
import { Room } from '@shared/types';
import { PersistenceService } from '../../services/PersistenceService';

export const registerPlayerHandlers = (io: Server, socket: Socket, rooms: Map<string, Room>) => {
  socket.on('change_avatar', async ({ roomId, playerId, avatar }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p: any) => p.playerId === playerId);
    if (player) {
      player.avatar = avatar;
      io.to(roomId).emit('room_update', room);
      await PersistenceService.saveRooms(rooms);
    }
  });
};
