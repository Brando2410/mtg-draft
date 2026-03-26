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
import { X } from 'lucide-react';
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
    closeRoom,
    addBot
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



  return (
    <div 
      className="relative min-h-[100dvh] bg-slate-950 font-sans selection:bg-indigo-500/30 overflow-x-hidden text-slate-100"
    >
      

      
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
            onAddBot={addBot}
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

    </div>
  );
}

export default App;
