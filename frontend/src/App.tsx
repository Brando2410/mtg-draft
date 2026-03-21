import { useState, useEffect } from 'react';
import { DraftPoolBuilder } from './components/DraftPoolBuilder';
import { DraftPackView } from './components/DraftPackView';
import { CubeCollection } from './components/CubeCollection';
import { MainMenu } from './components/MainMenu';
import { DraftSetup } from './components/DraftSetup';
import { JoinRoom } from './components/JoinRoom';
import { DraftLobby } from './components/DraftLobby';
import { AdminPanel } from './components/AdminPanel';
import { DraftHistory } from './components/DraftHistory';
import { X, RotateCw } from 'lucide-react';
import { useDraftStore } from './store/useDraftStore';

function App() {
  const { 
    room, 
    activeView, 
    joinError, 
    isJoining, 
    playerId,
    setActiveView, 
    setJoinError,
    initSocketListeners,
    cleanupSocketListeners,
    joinRoom,
    createRoom,
    startDraft,
    kickPlayer,
    changeAvatar,
    closeRoom
  } = useDraftStore();

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [skipRestore, setSkipRestore] = useState(false);

  useEffect(() => {
    initSocketListeners();
    return () => cleanupSocketListeners();
  }, [initSocketListeners, cleanupSocketListeners]);

  const handleSelectCubeFromCollection = (cubeData: any) => {
    localStorage.setItem('mtg_draft_cube', JSON.stringify(cubeData));
    setSkipRestore(true);
    setActiveView('builder');
  };

  // Funzione per richiedere il lock dell'orientamento al primo click (limitazione browser)
  const handleFirstClick = () => {
    const orientation = screen.orientation as any;
    if (window.innerWidth < 1024 && orientation && orientation.lock) {
      orientation.lock('landscape').catch(() => {});
    }
  };

  return (
    <div 
      onClick={handleFirstClick}
      className="relative min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 overflow-x-hidden text-slate-100"
    >
      
      {/* OVERLAY ROTAZIONE DISPOSITIVO (Solo Mobile Portrait) */}
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-10 text-center lg:hidden portrait:flex landscape:hidden">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-32 h-32 bg-slate-900 rounded-[2rem] border border-white/10 flex items-center justify-center shadow-2xl">
            <RotateCw className="w-16 h-16 text-indigo-500 animate-spin-slow" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Ruota il Dispositivo</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed max-w-[250px]">
          L'arena di Draft richiede la modalità <span className="text-indigo-400">Orizzontale</span> per una visualizzazione ottimale.
        </p>
        
        {/* Rappresentazione visiva telefono che ruota */}
        <div className="mt-12 flex items-center gap-4 opacity-30">
          <div className="w-8 h-14 border-2 border-white/20 rounded-lg relative">
            <div className="absolute top-1 left-1.2 -translate-x-1/2 w-4 h-0.5 bg-white/20 rounded-full" />
          </div>
          <div className="text-white">→</div>
          <div className="h-8 w-14 border-2 border-indigo-500/50 rounded-lg relative">
             <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500/50 rounded-full" />
          </div>
        </div>
      </div>
      
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
              setSkipRestore(false);
              if (view === 'draft_join') {
                const savedRoomId = localStorage.getItem('mtg_room_id');
                const savedPlayerName = localStorage.getItem('mtg_player_name');
                if (savedRoomId && savedPlayerName) {
                   joinRoom(savedRoomId, savedPlayerName);
                   return;
                }
              }
              setActiveView(view as any);
            }} 
          />
        )}

        {activeView === 'builder' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <DraftPoolBuilder skipRestore={skipRestore} onBack={() => setActiveView('menu')} />
          </div>
        )}

        {activeView === 'draft_setup' && (
          <DraftSetup 
            onBack={() => setActiveView('menu')} 
            onCreateRoom={createRoom}
          />
        )}

        {activeView === 'draft_join' && (
          <JoinRoom 
            onBack={() => setActiveView('menu')} 
            onJoin={joinRoom}
            error={joinError}
            loading={isJoining}
          />
        )}

        {activeView === 'draft_lobby' && room && (
          <DraftLobby 
            roomCode={room.id}
            players={room.players}
            rules={room.rules}
            isHost={room.hostPlayerId === playerId}
            onStart={startDraft}
            onClose={closeRoom}
            onKick={kickPlayer}
            onChangeAvatar={changeAvatar}
          />
        )}

        {activeView === 'drafting' && room && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <DraftPackView
               room={room}
               playerId={playerId}
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
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;
