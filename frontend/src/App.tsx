import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { DraftPoolBuilder } from './components/DraftPoolBuilder';
import { DraftPackView } from './components/DraftPackView';
import { CubeCollection } from './components/CubeCollection';
import { MainMenu } from './components/MainMenu';
import { DraftSetup } from './components/DraftSetup';
import { JoinRoom } from './components/JoinRoom';
import { DraftLobby } from './components/DraftLobby';
import { AdminPanel } from './components/AdminPanel';
import { DraftHistory } from './components/DraftHistory';
import { X } from 'lucide-react';

// Istanza socket globale
// Istanza socket globale
const socket = io('http://localhost:4000');

// Genera o recupera ID persistente UNICO
let currentId = localStorage.getItem('mtg_persistent_id');
if (!currentId) {
  currentId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  localStorage.setItem('mtg_persistent_id', currentId);
}
export const PLAYER_ID = currentId;
console.log('🆔 [APP] Player ID Attivo:', PLAYER_ID);

function App() {
  const [activeView, setActiveView] = useState<'menu' | 'builder' | 'draft_setup' | 'draft_join' | 'draft_lobby' | 'drafting' | 'collection' | 'history'>('menu');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Room State
  const [room, setRoom] = useState<any>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const attemptRejoin = () => {
       const savedRoomId = localStorage.getItem('mtg_room_id');
       const savedPlayerName = localStorage.getItem('mtg_player_name');
       
       if (savedRoomId && savedPlayerName) {
          console.log(`🚀 Inizio Re-join automatico [Stanza: ${savedRoomId}, ID: ${PLAYER_ID}]`);
          socket.emit('join_room', { 
            roomId: savedRoomId, 
            playerName: savedPlayerName, 
            playerId: PLAYER_ID 
          });
       } else {
          console.log('ℹ️ Nessuna sessione precedente da ripristinare.', { savedRoomId, savedPlayerName });
       }
    };

    socket.on('connect', () => {
      console.log('✅ Socket connesso ID:', socket.id);
      attemptRejoin();
    });

    socket.on('connect_error', (err) => console.error('❌ Socket Error:', err));

    socket.on('room_created', (newRoom) => {
      console.log('🏠 Room Creata:', newRoom);
      setRoom(newRoom);
      localStorage.setItem('mtg_room_id', newRoom.id);
      setActiveView('draft_lobby');
    });

    socket.on('joined_successfully', (joinedRoom) => {
      console.log('🤝 Join Success:', joinedRoom);
      setRoom(joinedRoom);
      localStorage.setItem('mtg_room_id', joinedRoom.id);
      setIsJoining(false);
      
      // Controllo di stato: se la stanza è già in "drafting" o "completed", catapultiamo il giocatore direttamente là!
      if (joinedRoom.status === 'completed') {
        localStorage.removeItem('mtg_room_id'); // Clear room ID if draft is completed
        setActiveView('history'); // Redirect to history or menu if draft is completed
      } else {
        setActiveView(joinedRoom.status === 'drafting' ? 'drafting' : 'draft_lobby');
      }
    });

    socket.on('room_update', (updatedRoom) => {
      console.log('📢 Room Update:', updatedRoom);
      setRoom(updatedRoom);
    });

    socket.on('error_join', (msg) => {
      console.log('❌ Errore dal server:', msg);
      setJoinError(msg);
      setIsJoining(false);
      if (msg === 'Stanza non trovata.') {
        localStorage.removeItem('mtg_room_id');
      }
    });

    socket.on('draft_started', (finalRoom) => {
      setRoom(finalRoom);
      setActiveView('drafting');
    });

    // FONDAMENTALE: Ascoltatore per ogni singolo pick avvenuto durante la partita
    socket.on('draft_update', (updatedRoom) => {
      if (!updatedRoom) return; // FIX: Evita crash se il server invia null dopo la cancellazione
      
      setRoom(updatedRoom);
      if (updatedRoom.status === 'drafting') {
        setActiveView('drafting');
      } else if (updatedRoom.status === 'completed') {
        localStorage.removeItem('mtg_room_id'); // Clear room ID if draft is completed
        setActiveView('drafting'); // Mantiene la view Drafting che poi mostrerà la modale "Completato"
      }
    });

    // --- ESECUZIONE RE-JOIN (Solo dopo che tutti i listener sono pronti) ---
    if (socket.connected) {
       attemptRejoin();
    }

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('room_created');
      socket.off('joined_successfully');
      socket.off('room_update');
      socket.off('error_join');
      socket.off('draft_started');
      socket.off('draft_update');
    };
  }, []);

  const handleSelectCubeFromCollection = (cubeData: any) => {
    localStorage.setItem('mtg_draft_cube', JSON.stringify(cubeData));
    setActiveView('builder');
  };

  const handleCreateRoom = (setupData: any) => {
    const hostName = localStorage.getItem('mtg_player_name') || 'Host';
    const playerId = localStorage.getItem('mtg_persistent_id');
    socket.emit('create_room', { ...setupData, hostName, playerId });
  };

  const handleJoinRoom = (roomCode: string, playerName: string) => {
    setJoinError(null);
    setIsJoining(true);
    localStorage.setItem('mtg_player_name', playerName);
    const playerId = localStorage.getItem('mtg_persistent_id');
    socket.emit('join_room', { roomId: roomCode, playerName, playerId });
  };

  const handleKickPlayer = (playerIdToKick: string) => {
    if (room) {
      console.log('👢 [FRONTEND] Invio comando kick per player:', playerIdToKick);
      socket.emit('kick_player', { roomId: room.id, playerId: playerIdToKick });
    }
  };

  const handleChangeAvatar = (avatar: string) => {
    if (room && room.id) {
      console.log(`[FRONTEND] 🎭 Richiedo cambio avatar: Room=${room.id}, Player=${PLAYER_ID}, Icon=${avatar}`);
      socket.emit('change_avatar', { roomId: room.id, playerId: PLAYER_ID, avatar });
    } else {
      console.log('⚠️ Impossibile cambiare avatar: Stanza non trovata nello stato locale.');
    }
  };

  const handleStartDraft = () => {
    if (room) socket.emit('start_draft', { roomId: room.id });
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem('mtg_room_id');
    setRoom(null);
    setActiveView('menu');
  };

  const handleCloseRoom = () => {
    if (room) {
      socket.emit('destroy_room', { roomId: room.id });
      handleLeaveRoom();
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 overflow-x-hidden text-slate-100">
      
      {/* NOTIFICA ERRORE GLOBALE */}
      {joinError && activeView === 'menu' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl shadow-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest">{joinError}</span>
            <button onClick={() => setJoinError(null)} className="text-red-400 hover:text-red-200 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Sfondo Astratto Ambientale (Sempre visibile) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/40 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[160px] mix-blend-screen" />
      </div>

      <main className="relative z-10 w-full">
        
        {activeView === 'menu' && (
          <MainMenu 
            onShowAdmin={() => setIsAdminOpen(true)}
            onSelect={(view) => {
              if (view === 'draft_join') {
                const savedRoomId = localStorage.getItem('mtg_room_id');
                const savedPlayerName = localStorage.getItem('mtg_player_name');
                if (savedRoomId && savedPlayerName) {
                  console.log('🔄 Re-join automatico da menu...');
                  socket.emit('join_room', { 
                    roomId: savedRoomId, 
                    playerName: savedPlayerName, 
                    playerId: PLAYER_ID 
                  });
                  return; // Non cambiare vista, aspettiamo il join
                }
              }
              setActiveView(view as any);
            }} 
          />
        )}

        {activeView === 'builder' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <DraftPoolBuilder onBack={() => setActiveView('menu')} />
          </div>
        )}

        {activeView === 'draft_setup' && (
          <DraftSetup 
            onBack={() => setActiveView('menu')} 
            onCreateRoom={handleCreateRoom}
          />
        )}

        {activeView === 'draft_join' && (
          <JoinRoom 
            onBack={() => setActiveView('menu')} 
            onJoin={handleJoinRoom}
            error={joinError}
            loading={isJoining}
          />
        )}

        {activeView === 'draft_lobby' && room && (
          <DraftLobby 
            roomCode={room.id}
            players={room.players}
            rules={room.rules}
            isHost={room.hostPlayerId === localStorage.getItem('mtg_persistent_id')}
            onStart={handleStartDraft}
            onClose={handleCloseRoom}
            onKick={handleKickPlayer}
            onChangeAvatar={handleChangeAvatar}
          />
        )}

        {activeView === 'drafting' && room && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <DraftPackView
               socket={socket}
               room={room}
               playerId={PLAYER_ID}
               onBack={() => setActiveView('menu')}
            />
          </div>
        )}

        {activeView === 'collection' && (
          <div className="animate-in fade-in zoom-in-95 duration-700">
             <CubeCollection
                onBack={() => setActiveView('menu')}
                onSelectCube={handleSelectCubeFromCollection}
             />
          </div>
        )}

        {activeView === 'history' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
             <DraftHistory
                onBack={() => setActiveView('menu')}
             />
          </div>
        )}

      </main>

      {isAdminOpen && (
        <AdminPanel socket={socket} onClose={() => setIsAdminOpen(false)} />
      )}
    </div>
  );
}

export default App;
