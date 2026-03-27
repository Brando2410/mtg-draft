import { Server, Socket } from 'socket.io';
import { Room } from '@shared/types';
import { LoggerService } from '../services/LoggerService';
import { registerRoomHandlers } from './parts/roomHandlers';
import { registerDraftHandlers } from './parts/draftHandlers';
import { registerMatchHandlers } from './parts/matchHandlers';
import { registerPlayerHandlers } from './parts/playerHandlers';
import { registerAdminHandlers } from './parts/adminHandlers';

export class SocketHandlers {
  static register(io: Server, socket: Socket, rooms: Map<string, Room>) {
    LoggerService.info('SOCKET', `New connection: ${socket.id}`, { socketId: socket.id });

    // Registra i vari moduli di gestione socket
    registerRoomHandlers(io, socket, rooms);
    registerDraftHandlers(io, socket, rooms);
    registerMatchHandlers(io, socket, rooms);
    registerPlayerHandlers(io, socket, rooms);
    registerAdminHandlers(io, socket, rooms);
  }
}
