import { Server, Socket } from 'socket.io';
import { Room } from '@shared/types';
import { PersistenceService } from '../../services/PersistenceService';
import { LoggerService } from '../../services/LoggerService';

export const registerAdminHandlers = (io: Server, socket: Socket, rooms: Map<string, Room>) => {
  const getRoomList = () => {
    return Array.from(rooms.values()).map(r => ({
      id: r.id,
      status: r.status,
      playersCount: r.players.length,
      players: r.players.map(p => ({ name: p.name, online: p.online })),
      host: r.hostPlayerId,
      isPaused: r.isPaused
    }));
  };

  socket.on('admin_get_rooms', () => {
    socket.emit('admin_rooms_list', getRoomList());
  });

  socket.on('admin_destroy_room', async ({ roomId }) => {
    if (rooms.has(roomId)) {
      rooms.delete(roomId);
      await PersistenceService.saveRooms(rooms);
      LoggerService.info('ADMIN', `Room ${roomId} destroyed via Admin Console`);
      socket.emit('admin_rooms_list', getRoomList());
    }
  });
};
