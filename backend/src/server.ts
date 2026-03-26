import http from 'http';
import { Server, Socket } from 'socket.io';
import app from './app';
import { SocketHandlers } from './socket/handlers';
import { PersistenceService } from './services/PersistenceService';
import { DraftService } from './services/DraftService';
import { BotLogic } from './bots/BotLogic';
import { LoggerService } from './services/LoggerService';
import { Room, Player, Card } from '@shared/types';

const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: '*',
      methods: ['GET', 'POST']
   },
   maxHttpBufferSize: 1e7 // Support large cube/draft data
});

const PORT = process.env.PORT || 4000;

async function start() {
   PersistenceService.init();
   const rooms = await PersistenceService.loadRooms();

   io.on('connection', (socket: Socket) => {
      SocketHandlers.register(io, socket, rooms);
   });

   // Timer di pulizia per giocatori disconnessi (5 minuti) e Auto-Pick di sistema
   setInterval(async () => {
      const now = Date.now();
      let changed = false;

      for (const [roomId, room] of rooms.entries()) {
         // 1. Pulizia Istanze Inattive
         const playersToRemove = room.players.filter((p: Player) => !p.online && (now - p.lastSeen > 5 * 60 * 1000));
         if (playersToRemove.length > 0) {
            room.players = room.players.filter((p: Player) => p.online || (now - p.lastSeen <= 5 * 60 * 1000));
            if (room.players.length === 0 || (room.hostPlayerId && !room.players.find((p: Player) => p.playerId === room.hostPlayerId))) {
               rooms.delete(roomId);
               LoggerService.info('SERVER', `Room cleanup: ${roomId} removed for inactivity`, { roomId });
               changed = true;
               continue;
            }
            changed = true;
         }

         room.serverTime = now;
         if (room.status === 'drafting' && !room.isPaused && room.draftState) {
            room.players.forEach((player: Player) => {
               const timerEnd = room.draftState!.playerTimers[player.playerId];
               if (timerEnd && now >= (timerEnd + 1000)) {
                  const pIdx = room.players.findIndex((p: Player) => p.playerId === player.playerId);
                  const queue = room.draftState!.queues && room.draftState!.queues[pIdx];
                  const currentPack = queue && queue[0];

                  if (currentPack && currentPack.length > 0) {
                     const playerSelections = room.draftState!.selections || {};
                     const selectedId = playerSelections[player.playerId];
                     let bestCard = null;

                     if (selectedId) {
                        bestCard = currentPack.find((c: Card) => String(c.id).trim() === String(selectedId).trim());
                     }

                     if (!bestCard) {
                        bestCard = BotLogic.evaluatePack(currentPack, player);
                        LoggerService.info('DRAFT', `Timer expired for ${player.name}: fallback to automated pick`, { roomId, playerId: player.playerId, cardName: bestCard.name });
                     }

                     const success = DraftService.performPick(rooms, roomId, player.playerId, bestCard.id);
                     if (success) {
                        BotLogic.triggerBotPicks(rooms, roomId);
                        changed = true;
                        io.to(roomId).emit('draft_update', room);
                     }
                  }
               }
            });
         }
      }
      if (changed) await PersistenceService.saveRooms(rooms);
   }, 1000);

   server.listen(PORT, () => {
      LoggerService.info('SERVER', '─────────────────────────────────────────────');
      LoggerService.info('SERVER', `Backend Realtime listening on port ${PORT}`);
      LoggerService.info('SERVER', `Socket.io Hub Proxy Active (TypeScript)`);
      LoggerService.info('SERVER', '─────────────────────────────────────────────');
   });
}

start().catch(err => {
   LoggerService.error('SERVER', 'Failed to start server', err);
});
