import { Player, Room, Rules } from '@shared/types';
import { Server, Socket } from 'socket.io';
import { AssetService } from '../../services/AssetService';
import { LoggerService } from '../../services/LoggerService';
import { PersistenceService } from '../../services/PersistenceService';

export const registerRoomHandlers = (io: Server, socket: Socket, rooms: Map<string, Room>) => {
  socket.on('create_room', async (data: any) => {
    LoggerService.info('SOCKET', 'Create room received data', data);
    const { cubeId, hostName, playerId } = data;
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const rules: Rules = {
      playerCount: Number(data.rules?.playerCount ?? data.playerCount ?? 8),
      packsPerPlayer: Number(data.rules?.packsPerPlayer ?? data.packsPerPlayer ?? 3),
      cardsPerPack: Number(data.rules?.cardsPerPack ?? data.cardsPerPack ?? 15),
      timer: (function () {
        const t = data.rules?.timer !== undefined ? data.rules?.timer : (data.timer !== undefined ? data.timer : data.timerSeconds);
        if (t === null || t === undefined) return null;
        const n = Number(t);
        return isNaN(n) ? null : n;
      })(),
      rarityBalance: data.rules?.rarityBalance === true || data.rarityBalance === true,
      anonymousMode: data.rules?.anonymousMode === true || data.anonymousMode === true,
      fillBots: data.rules?.fillBots === true || data.fillBots === true,
      isSealed: data.rules?.isSealed === true || data.isSealed === true,
      isNormalMatch: data.rules?.isNormalMatch === true || data.isNormalMatch === true,
      cubeName: data.rules?.cubeName || data.cubeName || 'MTG Cube'
    };

    const cubeData = cubeId ? await PersistenceService.getCube(cubeId) : null;
    const avatars = await AssetService.listAvatars();
    const newRoom: Room = {
      id: roomId,
      host: socket.id,
      hostPlayerId: playerId,
      players: [{
        id: socket.id,
        playerId,
        name: hostName,
        avatar: avatars[Math.floor(Math.random() * avatars.length)] || 'default.png',
        online: true,
        lastSeen: Date.now(),
        pool: []
      }],
      status: 'waiting',
      isPaused: false,
      isNormalMatch: data.isNormalMatch === true || data.rules?.isNormalMatch === true,
      cube: cubeData || { name: (data.isNormalMatch || data.rules?.isNormalMatch) ? "Partita Normale" : "Cubo Sconosciuto", cards: [] },
      rules: { ...rules, cubeName: cubeData?.name || ((data.isNormalMatch || data.rules?.isNormalMatch) ? "Partita Normale" : "MTG Cube") }
    };

    rooms.set(roomId, newRoom);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = playerId;

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
      socket.data.roomId = roomId;
      socket.data.playerId = playerId;

      LoggerService.info('SOCKET', `Player re-joined: ${existingPlayer.name}`, { roomId, playerId });
      socket.emit('joined_successfully', room);
      io.to(roomId).emit('room_update', room);
      await PersistenceService.saveRooms(rooms);
      return;
    }

    if (room.status !== 'waiting') {
      const msg = room.isNormalMatch ? 'Match già iniziato.' : 'Draft già iniziata.';
      LoggerService.warn('ROOM', `Join rejected for ${roomId}: status is ${room.status}`, { roomId, status: room.status, isNormalMatch: room.isNormalMatch });
      socket.emit('error_join', msg);
      return;
    }

    if (room.players.length >= room.rules.playerCount) {
      socket.emit('error_join', 'Stanza piena.');
      return;
    }

    const avatars = await AssetService.listAvatars();
    room.players.push({
      id: socket.id,
      playerId,
      name: playerName,
      avatar: avatars[Math.floor(Math.random() * avatars.length)] || 'default.png',
      online: true,
      lastSeen: Date.now(),
      pool: []
    });

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.playerId = playerId;

    LoggerService.info('SOCKET', `Player joined: ${playerName}`, { roomId, playerId });
    socket.emit('joined_successfully', room);
    io.to(roomId).emit('room_update', room);
    await PersistenceService.saveRooms(rooms);
  });

  socket.on('add_bot', async ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.host !== socket.id) return;
    if (room.players.length >= room.rules.playerCount) return;

    const botIndex = room.players.filter(p => p.isBot).length + 1;
    const botId = `bot-${Math.random().toString(36).substring(2, 7)}`;
    
    const avatars = await AssetService.listAvatars();
    room.players.push({
      id: botId,
      playerId: botId,
      name: `Bot_${botIndex}`,
      avatar: avatars[Math.floor(Math.random() * avatars.length)] || 'default.png',
      online: true,
      isBot: true,
      lastSeen: Date.now(),
      pool: []
    });

    LoggerService.info('DRAFT', `Bot added to lobby: Bot_${botIndex}`, { roomId, botId });
    io.to(roomId).emit('room_update', room);
    await PersistenceService.saveRooms(rooms);
  });

  socket.on('kick_player', async ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || room.host !== socket.id) return;

    const playerIndex = room.players.findIndex(p => p.playerId === playerId);
    if (playerIndex !== -1) {
      const player = room.players[playerIndex];
      LoggerService.info('SOCKET', `Kicking player/bot: ${player.name}`, { roomId, playerId });
      
      room.players.splice(playerIndex, 1);
      
      if (!player.isBot) {
        io.to(player.id).emit('kick_player', { playerId });
      }
      
      io.to(roomId).emit('room_update', room);
      await PersistenceService.saveRooms(rooms);
    }
  });

  socket.on('destroy_room', async ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.host !== socket.id) return;

    LoggerService.info('SOCKET', `Room destroyed by host: ${roomId}`, { roomId });
    io.to(roomId).emit('room_destroyed');

    rooms.delete(roomId);
    await PersistenceService.saveRooms(rooms);
  });

  socket.on('disconnect', async () => {
    const { roomId, playerId } = socket.data;
    if (!roomId || !playerId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p: Player) => p.playerId === playerId);
    if (player && player.id === socket.id) {
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
    }
  });
};
