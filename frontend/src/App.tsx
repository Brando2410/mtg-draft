import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AdminPanel } from './features/admin/AdminPanel';
import { AssetManager } from './features/admin/AssetManager';
import { X } from 'lucide-react';
import { useDraftStore } from './store/useDraftStore';
import { AppRouter } from './routes/AppRouter';
import { useSocketInit } from './hooks/useSocketInit';

function App() {
  const { 
    activeView, 
    joinError, 
    setJoinError,
  } = useDraftStore();

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [skipRestore, setSkipRestore] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<any>(null);
  const [_, setIsSealedMode] = useState(false);
  const [spectatedMatchIndex, setSpectatedMatchIndex] = useState<number | null>(null);

  // Custom Hooks for Side Effects
  useSocketInit();

  return (
    <div className="relative min-h-[100dvh] bg-slate-950 font-sans selection:bg-indigo-500/30 overflow-x-hidden text-slate-100">
      
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

      {/* Sfondo Astratto Ambientale */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/40 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[160px] mix-blend-screen" />
      </div>

      <main className="relative z-10 w-full">
        <AppRouter 
          setIsAdminOpen={setIsAdminOpen}
          setIsAssetOpen={setIsAssetOpen}
          skipRestore={skipRestore}
          setSkipRestore={setSkipRestore}
          selectedDeck={selectedDeck}
          setSelectedDeck={setSelectedDeck}
          setIsSealedMode={setIsSealedMode}
          spectatedMatchIndex={spectatedMatchIndex}
          setSpectatedMatchIndex={setSpectatedMatchIndex}
        />
      </main>

      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}

      <AnimatePresence>
        {isAssetOpen && (
          <AssetManager onClose={() => setIsAssetOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
