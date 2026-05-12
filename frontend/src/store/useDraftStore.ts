import { create } from 'zustand';
import { socket } from '../services/socket';
import type { Room } from '@shared/types';
import { logger } from '../services/clientLogger';
import { applyPatch } from 'fast-json-patch';

export interface DraftState {
  // State
  rooms: Record<string, Room>;
  room: Room | null; // Currently focused room
  playerId: string;
  activeView: 'menu' | 'builder' | 'draft_setup' | 'draft_join' | 'draft_lobby' | 'drafting' | 'collection' | 'history' | 'deck_builder' | 'draft_config' | 'sealed_config';
  joinError: string | null;
  isJoining: boolean;
  selectedDeck: any | null;

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
  leaveRoom: (roomId?: string) => void;
  kickPlayer: (playerIdToKick: string) => void;
  changeAvatar: (avatar: string) => void;
  closeRoom: () => void;
  resetMatch: () => void;
  backToLobby: () => void;
  addBot: () => void;
  selectDeck: (deck: any) => void;
  setSelectedDeck: (deck: any | null) => void;

  // Asset Management
  avatarList: string[];
  wallpaperList: string[];
  fetchAssets: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || ''; // In produzione usiamo percorsi relativi

// Get or generate persistent player ID
let currentId = localStorage.getItem('mtg_persistent_id');
if (!currentId) {
  currentId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  localStorage.setItem('mtg_persistent_id', currentId);
}
export const PLAYER_ID = currentId;

export const useDraftStore = create<DraftState>((set, get) => ({
  rooms: {},
  room: null,
  playerId: PLAYER_ID,
  activeView: 'menu',
  joinError: null,
  isJoining: false,

  setRoom: (room) => set({ room }),
  setActiveView: (activeView) => set({ activeView }),
  setJoinError: (joinError) => set({ joinError }),
  selectedDeck: null,
  setSelectedDeck: (selectedDeck) => set({ selectedDeck }),
  setIsJoining: (isJoining) => set({ isJoining }),

  initSocketListeners: () => {
    get().cleanupSocketListeners();

    socket.on('connect', () => {
      logger.info('Socket connected, attempting re-join...');
      const savedRoomId = localStorage.getItem('mtg_room_id');
      const savedPlayerName = localStorage.getItem('mtg_player_name') || 'Giocatore';
      if (savedRoomId) {
        socket.emit('join_room', { 
          roomId: savedRoomId, 
          playerName: savedPlayerName, 
          playerId: PLAYER_ID 
        });
      }
    });

    socket.on('room_created', (newRoom: Room) => {
      logger.info('Room created successfully', { roomId: newRoom.id });
      set((state) => ({ 
        rooms: { ...state.rooms, [newRoom.id]: newRoom },
        room: newRoom, 
        activeView: 'draft_lobby',
        isJoining: false 
      }));
      localStorage.setItem('mtg_room_id', newRoom.id);
    });

    socket.on('joined_successfully', (room: Room) => {
      logger.info('Joined room successfully', { roomId: room.id, status: room.status });
      const isInGame = ['drafting', 'deckbuilding', 'active', 'tournament'].includes(room.status);
      
      set((state) => ({ 
        rooms: { ...state.rooms, [room.id]: room },
        room: room, 
        activeView: isInGame ? 'drafting' : 'draft_lobby',
        isJoining: false,
        joinError: null
      }));
      localStorage.setItem('mtg_room_id', room.id);
      
      if (room.status === 'completed') {
        localStorage.removeItem('mtg_room_id');
        set({ activeView: 'history' });
      }
    });

    socket.on('room_update', (room: Room) => {
      set((state) => ({ 
        rooms: { ...state.rooms, [room.id]: room },
        // Update focused room if it's the same one
        room: state.room?.id === room.id ? room : state.room
      }));
    });
    
    socket.on('room_patch', (patch: any) => {
      // For patches, we need to know which room it's for. 
      // Assuming patches are for the current focused room or we need a roomId in the patch?
      // Usually patches are emitted to the room channel.
      const currentRoom = get().room;
      if (!currentRoom) return;
      
      try {
        const result = applyPatch(currentRoom, patch, false, false);
        const updatedRoom = result.newDocument as Room;
        set((state) => ({ 
          rooms: { ...state.rooms, [updatedRoom.id]: updatedRoom },
          room: state.room?.id === updatedRoom.id ? updatedRoom : state.room
        }));
      } catch (err) {
        logger.error('PATCH', 'Failed to apply room patch', { err, patch });
      }
    });

    socket.on('draft_started', (room: Room) => {
      logger.info('Draft started!', { roomId: room.id });
      set((state) => ({ 
        rooms: { ...state.rooms, [room.id]: room },
        room: state.room?.id === room.id ? room : state.room,
        activeView: state.room?.id === room.id ? 'drafting' : state.activeView
      }));
    });

    socket.on('draft_update', (room: Room) => {
      if (!room) return;
      set((state) => ({ 
        rooms: { ...state.rooms, [room.id]: room },
        room: state.room?.id === room.id ? room : state.room
      }));
    });

    socket.on('kick_player', ({ roomId, playerId }: { roomId: string, playerId: string }) => {
      if (playerId === PLAYER_ID) {
        get().leaveRoom(roomId);
        set({ joinError: 'Sei stato rimosso dalla stanza.' });
      }
    });

    socket.on('room_destroyed', ({ roomId }: { roomId: string }) => {
      logger.info('Room has been destroyed by the host', { roomId });
      // Remove from map
      set((state) => {
        const newRooms = { ...state.rooms };
        delete newRooms[roomId];
        return { 
          rooms: newRooms,
          room: state.room?.id === roomId ? null : state.room,
          activeView: state.room?.id === roomId ? 'menu' : state.activeView
        };
      });
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
      const savedPlayerName = localStorage.getItem('mtg_player_name') || 'Giocatore';
      if (savedRoomId) {
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
    socket.off('room_patch');
    socket.off('draft_started');
    socket.off('draft_update');
    socket.off('kick_player');
    socket.off('room_destroyed');
    socket.off('error_join');
    socket.off('change_avatar');
    socket.off('match_started');
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
    
    // Assicuriamo persistenza del nome anche per l'host
    const nameToSave = setupData.hostName || localStorage.getItem('mtg_player_name') || 'Giocatore';
    localStorage.setItem('mtg_player_name', nameToSave);
    
    socket.emit('create_room', { ...setupData, playerId: PLAYER_ID, hostName: nameToSave });
  },

  startDraft: () => {
    const { room, selectedDeck } = get();
    if (room) {
      logger.info('Requesting draft start', { roomId: room.id });
      socket.emit('start_draft', { roomId: room.id, deck: selectedDeck });
    }
  },

  selectDeck: (deck) => {
    const { room } = get();
    if (room) {
      socket.emit('ready_with_deck', { roomId: room.id, playerId: PLAYER_ID, deck });
      set({ selectedDeck: deck });
    }
  },

  leaveRoom: (targetRoomId?: string) => {
    const { room, rooms, playerId } = get();
    const idToLeave = targetRoomId || room?.id;
    if (!idToLeave) return;

    socket.emit('leave_room', { roomId: idToLeave, playerId });
    
    // Se stavamo lasciando l'unica stanza salvata nel localStorage, puliamo
    if (localStorage.getItem('mtg_room_id') === idToLeave) {
      localStorage.removeItem('mtg_room_id');
    }

    set((state) => {
      const newRooms = { ...state.rooms };
      delete newRooms[idToLeave];
      const isLeavingFocused = state.room?.id === idToLeave;
      
      return { 
        rooms: newRooms, 
        room: isLeavingFocused ? null : state.room,
        activeView: isLeavingFocused ? 'menu' : state.activeView
      };
    });
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
  },

  resetMatch: () => {
    const { room } = get();
    if (room) socket.emit('debug_reset_game', { roomId: room.id });
  },

  backToLobby: () => {
    const { room } = get();
    if (room) socket.emit('back_to_lobby', { roomId: room.id });
  },

  addBot: () => {
    const { room } = get();
    if (room) socket.emit('add_bot', { roomId: room.id });
  },

  avatarList: [],
  wallpaperList: [],
  fetchAssets: async () => {
    try {
      const [avatars, wallpapers] = await Promise.all([
        fetch(`${API_BASE}/api/assets/avatars`).then(res => res.json()),
        fetch(`${API_BASE}/api/assets/wallpapers`).then(res => res.json())
      ]);
      set({ 
        avatarList: Array.isArray(avatars) ? avatars : [], 
        wallpaperList: Array.isArray(wallpapers) ? wallpapers : [] 
      });
    } catch (err) {
      console.error('Errore durante il caricamento degli asset:', err);
    }
  }
}));
