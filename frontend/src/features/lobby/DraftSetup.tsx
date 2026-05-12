import { useState, useRef } from 'react';
import { Home, Users, Package, Loader2, ArrowRight, Minus, Plus, Settings2, Edit3 } from 'lucide-react';
import { PageLayout } from '../../components/shared/PageLayout';

interface DraftSetupProps {
  onBack: () => void;
  onCreateRoom: (setupData: any) => void;
  isSealed: boolean;
}

export const DraftSetup = ({ onBack, onCreateRoom, isSealed }: DraftSetupProps) => {
  const [loading, setLoading] = useState(false);
  const [playerCount, setPlayerCount] = useState(8);
  const [packsPerPlayer, setPacksPerPlayer] = useState(3);
  const [cardsPerPack, setCardsPerPack] = useState(15);
  const [timerSeconds, setTimerSeconds] = useState(40);
  const [hostName, setHostName] = useState(localStorage.getItem('mtg_player_name') || 'Giocatore');

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!hostName.trim()) return;
    setLoading(true);
    localStorage.setItem('mtg_player_name', hostName.trim());
    onCreateRoom({
      cubeId: 'sos',
      cubeName: 'Strixhaven',
      playerCount,
      timerSeconds,
      packsPerPlayer,
      cardsPerPack,
      anonymousMode: false,
      randomPacks: false,
      isSealed,
      hostName: hostName.trim()
    });
  };

  const focusNameInput = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  };

  const Stepper = ({ label, value, onSub, onAdd, icon: Icon, min = 1 }: any) => {
    const isMin = value <= min;
    return (
      <div className="bg-slate-900/40 border border-white/5 p-4 rounded-3xl flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
          <Icon className="w-4 h-4 text-indigo-400" /> {label}
        </div>
        <div className="flex items-center justify-between w-full px-4">
          <button 
            onClick={onSub} 
            disabled={isMin}
            className={`p-2 transition-all active:scale-90 ${isMin ? 'text-slate-800 cursor-not-allowed opacity-30' : 'hover:text-white text-slate-500 hover:bg-white/5 rounded-xl'}`}
          >
            <Minus className="w-6 h-6" />
          </button>
          <span className="text-3xl font-black text-white italic tabular-nums leading-none">{value}</span>
          <button 
            onClick={onAdd} 
            className="p-2 hover:text-white text-slate-500 transition-all active:scale-90 hover:bg-white/5 rounded-xl"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <PageLayout variant="indigo" className="flex items-center justify-center p-6 lg:p-12">
      <div className="relative z-10 w-full max-w-4xl flex flex-col gap-10 lg:gap-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-4 bg-slate-900 border border-white/5 rounded-2xl shadow-2xl transition-all hover:bg-slate-800 active:scale-95 group">
              <Home className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </button>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-left">
              <h1 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Setup <span className="text-indigo-500">Draft</span></h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Cubo Strixhaven (SOS)</p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col gap-6">
          
          {/* HOST BOX */}
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block">Identità Host</span>
            <div 
              onClick={focusNameInput}
              className="flex items-center justify-between gap-4 bg-white/5 px-6 py-4 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-text focus-within:border-indigo-500 focus-within:bg-indigo-500/5 group"
            >
              <input 
                ref={nameInputRef}
                value={hostName} 
                onChange={(e) => setHostName(e.target.value)} 
                className="bg-transparent border-none text-2xl lg:text-4xl font-black italic text-indigo-400 outline-none flex-1 placeholder:text-slate-800 uppercase tracking-tighter" 
                placeholder="Nome Host" 
              />
              <Edit3 className="w-6 h-6 text-indigo-500/50 group-hover:text-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stepper label="Giocatori" value={playerCount} min={2} onSub={() => setPlayerCount(p => Math.max(2, p-1))} onAdd={() => setPlayerCount(p => Math.min(16, p+1))} icon={Users} />
            <Stepper label="Buste" value={packsPerPlayer} min={1} onSub={() => setPacksPerPlayer(p => Math.max(1, p-1))} onAdd={() => setPacksPerPlayer(p => Math.min(6, p+1))} icon={Package} />
            <Stepper label="Carte" value={cardsPerPack} min={1} onSub={() => setCardsPerPack(p => Math.max(1, p-1))} onAdd={() => setCardsPerPack(p => Math.min(30, p+1))} icon={Settings2} />
            <Stepper label="Timer (s)" value={timerSeconds} min={0} onSub={() => setTimerSeconds(p => Math.max(0, p-5))} onAdd={() => setTimerSeconds(p => Math.min(120, p+5))} icon={Settings2} />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !hostName.trim()}
            className={`group relative w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xl italic flex items-center justify-center gap-4 transition-all active:scale-95 overflow-hidden ${
              loading || !hostName.trim()
              ? 'bg-slate-800 text-slate-700 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/40'
            }`}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Apri Lobby <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-300" />
              </>
            )}
          </button>
        </div>
      </div>
    </PageLayout>
  );
};
