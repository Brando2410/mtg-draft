import { create } from 'zustand';
import { socket } from '../services/socket';
import type { Room } from '@shared/types';
import { logger } from '../services/clientLogger';

interface DraftState {
  // State
  room: Room | null;
  playerId: string;
  activeView: 'menu' | 'builder' | 'draft_setup' | 'draft_join' | 'draft_lobby' | 'drafting' | 'collection' | 'history';
  joinError: string | null;
  isJoining: boolean;

  // Actions
  setRoom: (room: Room | null) => void;
  setActiveView: (view: DraftState['activeView']) => void;
  setJoinError: (error: string | null) => void;
  setIsJoining: (isJoining: boolean) => void;
  
  // Socket Actions
  initSocketListeners: () => void;
  cleanupSocketListeners: () => void;
  joinRoom: (roomId: string, playerName: string) => void;
  createRoom: (setupData: any) => void;
  startDraft: () => void;
  leaveRoom: () => void;
  kickPlayer: (playerIdToKick: string) => void;
  changeAvatar: (avatar: string) => void;
  closeRoom: () => void;
}

// Get or generate persistent player ID
let currentId = localStorage.getItem('mtg_persistent_id');
if (!currentId) {
  currentId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  localStorage.setItem('mtg_persistent_id', currentId);
}
export const PLAYER_ID = currentId;

export const useDraftStore = create<DraftState>((set, get) => ({
  room: null,
  playerId: PLAYER_ID,
  activeView: 'menu',
  joinError: null,
  isJoining: false,

  setRoom: (room) => set({ room }),
  setActiveView: (activeView) => set({ activeView }),
  setJoinError: (joinError) => set({ joinError }),
  setIsJoining: (isJoining) => set({ isJoining }),

  initSocketListeners: () => {
    socket.on('connect', () => {
      logger.info('Socket connected, attempting re-join...');
      const savedRoomId = localStorage.getItem('mtg_room_id');
      const savedPlayerName = localStorage.getItem('mtg_player_name');
      if (savedRoomId && savedPlayerName) {
        socket.emit('join_room', { 
          roomId: savedRoomId, 
          playerName: savedPlayerName, 
          playerId: PLAYER_ID 
        });
      }
    });

    socket.on('room_created', (newRoom: Room) => {
      logger.info('Room created successfully', { roomId: newRoom.id });
      set({ 
        room: newRoom, 
        activeView: 'draft_lobby',
        isJoining: false 
      });
      localStorage.setItem('mtg_room_id', newRoom.id);
    });

    socket.on('joined_successfully', (room: Room) => {
      logger.info('Joined room successfully', { roomId: room.id, status: room.status });
      set({ 
        room, 
        activeView: room.status === 'drafting' ? 'drafting' : 'draft_lobby',
        isJoining: false,
        joinError: null
      });
      localStorage.setItem('mtg_room_id', room.id);
      
      if (room.status === 'completed') {
        localStorage.removeItem('mtg_room_id');
        set({ activeView: 'history' });
      }
    });

    socket.on('room_update', (room: Room) => {
      set({ room });
    });

    socket.on('draft_started', (room: Room) => {
      logger.info('Draft started!', { roomId: room.id });
      set({ room, activeView: 'drafting' });
    });

    socket.on('draft_update', (room: Room) => {
      if (!room) return;
      set({ room });
      if (room.status === 'drafting' || room.status === 'completed') {
        set({ activeView: 'drafting' });
      }
      if (room.status === 'completed') {
        localStorage.removeItem('mtg_room_id');
      }
    });

    socket.on('kick_player', ({ playerId }: { playerId: string }) => {
      if (playerId === PLAYER_ID) {
        get().leaveRoom();
        set({ joinError: 'Sei stato rimosso dalla stanza.' });
      }
    });

    socket.on('room_destroyed', () => {
      logger.info('Room has been destroyed by the host');
      get().leaveRoom();
      set({ joinError: 'La stanza è stata chiusa dall\'host.' });
    });

    socket.on('error_join', (message: string) => {
      logger.warn('Join error', { message });
      set({ joinError: message, isJoining: false });
      if (message === 'Stanza non trovata.') {
        localStorage.removeItem('mtg_room_id');
      }
    });

    // Handle initial connection if already connected
    if (socket.connected) {
      const savedRoomId = localStorage.getItem('mtg_room_id');
      const savedPlayerName = localStorage.getItem('mtg_player_name');
      if (savedRoomId && savedPlayerName) {
        socket.emit('join_room', { 
          roomId: savedRoomId, 
          playerName: savedPlayerName, 
          playerId: PLAYER_ID 
        });
      }
    }
  },

  cleanupSocketListeners: () => {
    socket.off('connect');
    socket.off('room_created');
    socket.off('joined_successfully');
    socket.off('room_update');
    socket.off('draft_started');
    socket.off('draft_update');
    socket.off('kick_player');
    socket.off('room_destroyed');
    socket.off('error_join');
  },

  joinRoom: (roomId, playerName) => {
    logger.info('Attempting to join room', { roomId, playerName });
    set({ isJoining: true, joinError: null });
    localStorage.setItem('mtg_player_name', playerName);
    socket.emit('join_room', { roomId, playerName, playerId: PLAYER_ID });
  },

  createRoom: (setupData) => {
    logger.info('Attempting to create room', { setupData });
    set({ isJoining: true });
    socket.emit('create_room', { ...setupData, playerId: PLAYER_ID, hostName: setupData.hostName || localStorage.getItem('mtg_player_name') });
  },

  startDraft: () => {
    const { room } = get();
    if (room) {
      logger.info('Requesting draft start', { roomId: room.id });
      socket.emit('start_draft', { roomId: room.id });
    }
  },

  leaveRoom: () => {
    localStorage.removeItem('mtg_room_id');
    set({ room: null, activeView: 'menu' });
  },

  kickPlayer: (playerIdToKick) => {
    const { room } = get();
    if (room) socket.emit('kick_player', { roomId: room.id, playerId: playerIdToKick });
  },

  changeAvatar: (avatar) => {
    const { room } = get();
    if (room) socket.emit('change_avatar', { roomId: room.id, playerId: PLAYER_ID, avatar });
  },

  closeRoom: () => {
    const { room } = get();
    if (room) {
      socket.emit('destroy_room', { roomId: room.id });
      get().leaveRoom();
    }
  }
}));
