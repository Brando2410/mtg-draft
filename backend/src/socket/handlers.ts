import { Server, Socket } from 'socket.io';
import { Room, Player, Rules } from '@shared/types';
import { DraftService } from '../services/DraftService';
import { PersistenceService } from '../services/PersistenceService';
import { LoggerService } from '../services/LoggerService';

const AVATARS = [
  'ajani.png', 'alena_halana.png', 'angrath.png', 'aragorn.png', 'ashiok.png',
  'astarion.png', 'atraxa.png', 'aurelia.png', 'basri.png', 'baylen.png',
  'beckett.png', 'borborygmos.png', 'braids.png', 'chandra.png', 'cruelclaw.png',
  'davriel.png', 'dina.png', 'domri.png', 'dovin.png', 'elesh_norn.png'
];

export class SocketHandlers {
  static register(io: Server, socket: Socket, rooms: Map<string, Room>) {
    LoggerService.info('SOCKET', `New connection: ${socket.id}`, { socketId: socket.id });

    socket.on('create_room', async (data: any) => {
      const { cubeId, hostName, playerId } = data;
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      const rules: Rules = data.rules || {
        playerCount: Number(data.playerCount || 8),
        packsPerPlayer: Number(data.packsPerPlayer || 3),
        cardsPerPack: Number(data.cardsPerPack || 15),
        timer: data.timer === null ? null : Number(data.timer),
        rarityBalance: data.rarityBalance === true || data.rules?.rarityBalance === true,
        anonymousMode: data.anonymousMode === true || data.rules?.anonymousMode === true,
        cubeName: 'MTG Cube'
      };

      const cubeData = await PersistenceService.getCube(cubeId);
      const newRoom: Room = {
        id: roomId,
        host: socket.id,
        hostPlayerId: playerId,
        players: [{ 
          id: socket.id, 
          playerId, 
          name: hostName, 
          avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)], 
          online: true, 
          lastSeen: Date.now(),
          pool: [] 
        }],
        status: 'waiting',
        isPaused: false,
        cube: cubeData || { name: "Cubo Sconosciuto", cards: [] },
        rules: { ...rules, cubeName: cubeData?.name || "MTG Cube" }
      };
      
      rooms.set(roomId, newRoom);
      socket.join(roomId);
      await PersistenceService.saveRooms(rooms);
      LoggerService.info('SOCKET', `Room created: ${roomId}`, { roomId, hostName, playerId });
      socket.emit('room_created', newRoom);
    });

    socket.on('join_room', async ({ roomId, playerName, playerId }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error_join', 'Stanza non trovata.');
        return;
      }

      const existingPlayer = room.players.find((p: Player) => p.playerId === playerId);
      if (existingPlayer) {
        existingPlayer.id = socket.id;
        existingPlayer.online = true;
        existingPlayer.lastSeen = Date.now();
        if (room.hostPlayerId === playerId) room.host = socket.id;
        
        socket.join(roomId);
        LoggerService.info('SOCKET', `Player re-joined: ${existingPlayer.name}`, { roomId, playerId });
        socket.emit('joined_successfully', room);
        io.to(roomId).emit('room_update', room);
        await PersistenceService.saveRooms(rooms);
        return;
      }
      
      if (room.status !== 'waiting') {
        socket.emit('error_join', 'Draft già iniziata.');
        return;
      }

      if (room.players.length >= room.rules.playerCount) {
        socket.emit('error_join', 'Stanza piena.');
        return;
      }
      
      room.players.push({ 
        id: socket.id, 
        playerId, 
        name: playerName, 
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)], 
        online: true, 
        lastSeen: Date.now(),
        pool: [] 
      });
      
      socket.join(roomId);
      LoggerService.info('SOCKET', `Player joined: ${playerName}`, { roomId, playerId });
      socket.emit('joined_successfully', room);
      io.to(roomId).emit('room_update', room);
      await PersistenceService.saveRooms(rooms);
    });

    socket.on('start_draft', async ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.host !== socket.id) return;
      
      DraftService.startDraft(room);
      LoggerService.info('DRAFT', `Draft started in room: ${roomId}`, { roomId });
      io.to(roomId).emit('draft_started', room);
      await PersistenceService.saveRooms(rooms);
    });

    socket.on('pick_card', async ({ roomId, playerId, cardId }) => {
      LoggerService.debug('DRAFT', `Pick attempt: player ${playerId} picking card ${cardId}`, { roomId, playerId, cardId });
      if (DraftService.performPick(rooms, roomId, playerId, cardId)) {
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

    socket.on('change_avatar', async ({ roomId, playerId, avatar }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find((p: Player) => p.playerId === playerId);
      if (player) {
         player.avatar = avatar;
         io.to(roomId).emit('room_update', room);
         await PersistenceService.saveRooms(rooms);
      }
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

    socket.on('disconnect', async () => {
      for (const [roomId, room] of rooms.entries()) {
        const player = room.players.find((p: Player) => p.id === socket.id);
        if (player) {
          player.online = false;
          player.lastSeen = Date.now();
          
          if (room.status === 'drafting' && !room.isPaused && room.draftState) {
             room.isPaused = true;
             room.draftState.isPaused = true;
             const now = Date.now();
             room.draftState.playerTimersRemaining = {};
             Object.entries(room.draftState.playerTimers).forEach(([pid, end]) => {
                if (end) room.draftState!.playerTimersRemaining![pid] = Math.max(0, end - now);
             });
             room.draftState.playerTimers = {};
             LoggerService.info('DRAFT', `Draft auto-paused due to player disconnect: ${player.name}`, { roomId, playerId: player.playerId });
             io.to(roomId).emit('draft_update', room);
          }
          
          io.to(roomId).emit('room_update', room);
          await PersistenceService.saveRooms(rooms);
          break;
        }
      }
    });

    // Admin commands
    socket.on('admin_get_rooms', () => {
      const roomList = Array.from(rooms.values()).map(r => ({
         id: r.id,
         status: r.status,
         playersCount: r.players.length,
         players: r.players.map(p => ({ name: p.name, online: p.online })),
         host: r.hostPlayerId,
         isPaused: r.isPaused
      }));
      socket.emit('admin_rooms_list', roomList);
    });
  }
}
