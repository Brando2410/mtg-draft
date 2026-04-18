import { useState, useEffect, useRef } from 'react';
import { Home, Users, Package, Loader2, ArrowRight, Minus, Plus, Database, Edit3 } from 'lucide-react';
import { useDraftStore } from '../../store/useDraftStore';

interface SealedSetupProps {
  onBack: () => void;
  onCreateRoom: (setupData: any) => void;
}

export const SealedSetup = ({ onBack, onCreateRoom }: SealedSetupProps) => {
  const { wallpaperList, fetchAssets } = useDraftStore();
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>('');
  
  const [playerCount, setPlayerCount] = useState(8);
  const [hostName, setHostName] = useState(localStorage.getItem('mtg_player_name') || 'Giocatore');

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      if (wallpaperList.length === 0) {
        await fetchAssets();
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (wallpaperList.length > 0 && !wallpaper) {
      const randomWallpaper = wallpaperList[Math.floor(Math.random() * wallpaperList.length)];
      const wpUrl = `/wallpapers/${randomWallpaper}`;
      setWallpaper(wpUrl);
      
      const img = new Image();
      img.src = wpUrl;
      img.onload = () => setIsLoaded(true);
    }
  }, [wallpaperList, wallpaper]);

  const handleCreate = () => {
    if (!hostName.trim()) return;
    setLoading(true);
    localStorage.setItem('mtg_player_name', hostName.trim());
    onCreateRoom({
      cubeId: 'sos',
      cubeName: 'Strixhaven',
      playerCount,
      timer: null,
      packsPerPlayer: 6,
      cardsPerPack: 14,
      anonymousMode: false,
      randomPacks: false,
      isSealed: true,
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
          <Icon className="w-4 h-4 text-purple-400" /> {label}
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
    <div className="full-h w-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-6 lg:p-12 relative text-slate-200">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'} bg-slate-950 z-[4]`} />
        {wallpaper && (
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'} z-[2]`}
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950 z-[3]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-10 lg:gap-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-4 bg-slate-900 border border-white/5 rounded-2xl shadow-2xl transition-all hover:bg-slate-800 active:scale-95 group">
              <Home className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </button>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-left">
              <h1 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Setup <span className="text-purple-500">Sealed</span></h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Expansion Event</p>
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
              className="flex items-center justify-between gap-4 bg-white/5 px-6 py-4 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all cursor-text focus-within:border-purple-500 focus-within:bg-purple-500/5 group"
            >
              <input 
                ref={nameInputRef}
                value={hostName} 
                onChange={(e) => setHostName(e.target.value)} 
                className="bg-transparent border-none text-2xl lg:text-4xl font-black italic text-purple-400 outline-none flex-1 placeholder:text-slate-800 uppercase tracking-tighter" 
                placeholder="Nome Host" 
              />
              <Edit3 className="w-6 h-6 text-purple-500/50 group-hover:text-purple-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Stepper label="Giocatori" value={playerCount} min={2} onSub={() => setPlayerCount(p => Math.max(2, p-1))} onAdd={() => setPlayerCount(p => Math.min(16, p+1))} icon={Users} />
            
            {/* STATIC SET SELECTION */}
            <div className="bg-purple-600 border border-purple-400 p-6 rounded-[2.5rem] shadow-2xl shadow-purple-600/20 flex flex-col justify-center items-center gap-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-purple-200 uppercase tracking-widest leading-none">
                <Database className="w-4 h-4" /> Espansione
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-white italic tracking-tight text-center uppercase">STRIXHAVEN (SOS)</h3>
              <p className="text-[10px] font-bold text-purple-200 uppercase tracking-[0.2em]">6 Play Boosters per player</p>
            </div>
          </div>

          {/* RULES INFO BOX */}
          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-3xl flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
               <Package className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
            <div className="space-y-1">
               <h4 className="text-xs font-black text-white uppercase tracking-widest leading-none">Sistemi regolamentari</h4>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
                  Le bustine sono generate seguendo il contenuto dei Play Booster ufficiali: <span className="text-slate-300">14 carte a bustina</span> con distribuzione statistica per rarità.
               </p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !hostName.trim()}
            className={`group relative w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xl italic flex items-center justify-center gap-4 transition-all active:scale-95 overflow-hidden ${
              loading || !hostName.trim()
              ? 'bg-slate-800 text-slate-700 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-2xl shadow-purple-600/40'
            }`}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Genera Pool <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-300" />
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
