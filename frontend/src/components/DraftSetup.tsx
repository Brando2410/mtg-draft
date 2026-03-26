import { useState, useEffect, useRef } from 'react';
import { Home, Layers, Users, Clock, Package, Loader2, ShieldAlert, ArrowRight, Minus, Plus, Database, Shuffle, Edit3, ChevronDown } from 'lucide-react';
import { useDraftStore } from '../store/useDraftStore';
import { motion } from 'framer-motion';

interface SavedCube {
  id: string;
  name: string;
  cardCount: number;
}

interface DraftSetupProps {
  onBack: () => void;
  onCreateRoom: (setupData: any) => void;
}

export const DraftSetup = ({ onBack, onCreateRoom }: DraftSetupProps) => {
  const { wallpaperList, fetchAssets } = useDraftStore();
  const [cubes, setCubes] = useState<SavedCube[]>([]);
  const [loadingCubes, setLoadingCubes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>('');
  
  const [selectedCubeId, setSelectedCubeId] = useState<string>('');
  const [playerCount, setPlayerCount] = useState(8);
  const [timer, setTimer] = useState(60);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [packsPerPlayer, setPacksPerPlayer] = useState(3);
  const [cardsPerPack, setCardsPerPack] = useState(15);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [randomPacks, setRandomPacks] = useState(false);
  const [hostName, setHostName] = useState(localStorage.getItem('mtg_player_name') || 'Giocatore');

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      if (wallpaperList.length === 0) {
        await fetchAssets();
      }
    };
    init();

    const fetchCubes = async () => {
      try {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:4000' : 'https://vibrant-warmth-production-7fe3.up.railway.app');
        const res = await fetch(`${API_URL}/api/cubes`);
        const data = await res.json();
        setCubes(data || []);
        if (data && data.length > 0) setSelectedCubeId(data[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCubes(false);
      }
    };
    fetchCubes();
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

  const selectedCube = cubes.find(c => c.id === selectedCubeId);
  const totalNeeded = playerCount * packsPerPlayer * cardsPerPack;
  const hasEnoughCards = selectedCube ? selectedCube.cardCount >= totalNeeded : true;

  const handleCreate = () => {
    if (!selectedCubeId || !hostName.trim() || !hasEnoughCards) return;
    setLoading(true);
    localStorage.setItem('mtg_player_name', hostName.trim());
    onCreateRoom({
      cubeId: selectedCubeId,
      cubeName: selectedCube?.name,
      playerCount,
      timer: timerEnabled ? timer : null,
      packsPerPlayer,
      cardsPerPack,
      anonymousMode,
      randomPacks,
      hostName: hostName.trim()
    });
  };

  const focusNameInput = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  };

  const Stepper = ({ label, value, onSub, onAdd, icon: Icon, suffix = "", min = 1, desc }: any) => {
    const isMin = value <= min;
    return (
      <div className="setup-item setup-item-portrait setup-item-lg compact:p-2 compact:gap-1">
        <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap
                        portrait:text-[10px] lg:text-[11px]">
          <Icon className="w-2.5 h-2.5 portrait:w-3.5 portrait:h-3.5 lg:w-4 lg:h-4 text-indigo-400" /> {label}
        </div>
        <div className="flex items-center justify-between lg:px-2">
          <button 
            onClick={onSub} 
            disabled={isMin}
            className={`p-0.5 transition-colors active:scale-90 portrait:p-1.5 ${isMin ? 'text-slate-800 cursor-not-allowed opacity-30 shadow-none' : 'hover:text-white text-slate-500'}`}
          >
            <Minus className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-6 lg:h-6" />
          </button>
          <div className="text-center">
             <span className="text-sm font-black text-white italic tabular-nums leading-none 
                              portrait:text-xl lg:text-3xl compact:text-base">{value}{suffix}</span>
             {desc && <p className="text-[6px] font-bold text-slate-600 uppercase mt-1 hidden portrait:block lg:block lg:text-[8px] lg:mt-1 compact:hidden">{desc}</p>}
          </div>
          <button onClick={onAdd} className="p-0.5 hover:text-white text-slate-500 transition-colors active:scale-90 portrait:p-1.5"><Plus className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-6 lg:h-6" /></button>
        </div>
      </div>
    );
  };

  const Toggle = ({ active, onClick, icon: Icon, label, desc }: any) => (
    <button onClick={onClick} className={`setup-item setup-item-portrait setup-item-lg compact:py-1.5 compact:px-2.5 compact:gap-1.5
      ${active ? 'setup-item-active' : ''}
    `}>
       <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap
                      portrait:text-[10px] lg:text-[11px]">
          <Icon className={`w-2.5 h-2.5 portrait:w-3.5 portrait:h-3.5 lg:w-4 lg:h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} /> {label}
       </div>
       <div className="flex items-center justify-between w-full">
          <div className="text-left">
             <span className={`text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-tight ${active ? 'text-indigo-400' : 'text-slate-200'}`}>
                {active ? 'Attivo' : 'No'}
             </span>
             {desc && <p className="text-[6px] font-bold text-slate-500 uppercase tracking-widest hidden portrait:block lg:block lg:text-[8px] lg:mt-0.5 compact:hidden">{desc}</p>}
          </div>
          <div className={`w-10 h-5 lg:w-14 lg:h-7 rounded-full p-1 transition-colors flex items-center ${active ? 'bg-indigo-600' : 'bg-slate-800'}`}>
             <motion.div 
               animate={{ x: active ? 22 : 0 }} 
               transition={{ type: "spring", stiffness: 500, damping: 30 }}
               className="w-3 h-3 portrait:w-3.5 portrait:h-3.5 lg:w-5 lg:h-5 rounded-full bg-white shadow-lg" 
             />
          </div>
       </div>
    </button>
  );

  return (
    <div className="full-h w-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-start p-2 portrait:p-6 lg:p-12 relative text-slate-200 selection:bg-indigo-500/30">
      
      {/* Background Essential - SYNCED WITH MAIN MENU */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Loader Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-[250ms] ${isLoaded ? 'opacity-0' : 'opacity-100'} bg-slate-950 z-[4]`} />
        
        {/* Main Image */}
        {wallpaper && (
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[250ms] ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'} z-[2]`}
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}
        
        {/* Pro Overlay Stack */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950 z-[3]" />
        
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent z-[3]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] h-full flex flex-col gap-2 portrait:gap-3 lg:gap-14 animate-in fade-in duration-500 overflow-hidden lg:justify-center">
        
        {/* HEADER */}
        <div className="flex flex-col portrait:flex-col lg:flex-row lg:items-center portrait:items-start justify-between px-1 shrink-0 lg:gap-10 portrait:gap-4 compact:flex-row compact:items-center">
          
          <div className="flex items-center gap-3 portrait:gap-6 lg:gap-10">
             <button onClick={onBack} className="p-2 portrait:p-3.5 lg:p-4 bg-slate-900 border border-white/10 rounded-lg portrait:rounded-2xl lg:rounded-3xl shadow-2xl transition-all hover:bg-slate-800"><Home className="w-4 h-4 portrait:w-6 portrait:h-6 lg:w-7 lg:h-7" /></button>
             <div>
                <h1 className="text-sm portrait:text-2xl lg:text-5xl font-black text-white uppercase italic tracking-tighther leading-none">Setup <span className="text-indigo-500">Draft</span></h1>
                <p className="text-[7px] portrait:text-[10px] lg:text-sm font-bold text-slate-500 uppercase mt-1 max-lg:landscape:hidden">Session Configuration</p>
             </div>
          </div>

          {/* CUBE DROPDOWN (MOBILE LANDSCAPE / PORTRAIT / COMPACT) */}
          <div className="hidden portrait:flex compact:flex flex-col items-start gap-1 flex-1 max-w-[200px] portrait:max-w-none mx-4 portrait:mx-0 portrait:w-full">
             <div className="flex items-center gap-1.5 px-1">
               <Database className="w-3 h-3 text-indigo-400" />
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Seleziona Cubo</span>
               <span className={`text-[8px] font-black italic ml-auto ${hasEnoughCards ? 'text-emerald-400' : 'text-red-400'}`}>{selectedCube?.cardCount}/{totalNeeded}</span>
             </div>
             <div className="relative w-full">
               <select 
                 value={selectedCubeId} 
                 onChange={(e) => setSelectedCubeId(e.target.value)}
                 className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-black uppercase tracking-tight text-indigo-400 outline-none appearance-none cursor-pointer hover:bg-slate-900"
               >
                 {cubes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
             </div>
          </div>

          <div className="flex flex-col items-start portrait:w-full lg:w-auto">
             <span className="text-[7px] portrait:text-[10px] lg:text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5 mr-2 compact:mb-0.5 portrait:mb-1">Host Identity</span>
             <div 
               onClick={focusNameInput}
               className="group relative flex items-center justify-between gap-2 bg-slate-900/40 hover:bg-slate-900/60 lg:hover:bg-indigo-500/5 px-2 portrait:px-4 py-1.5 portrait:py-2.5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-text focus-within:border-indigo-500 focus-within:bg-indigo-500/5 shadow-2xl compact:py-1 portrait:w-full max-w-[400px]"
             >
                <input 
                  ref={nameInputRef}
                  value={hostName} 
                  onChange={(e) => setHostName(e.target.value)} 
                  className="bg-transparent border-none text-left text-sm portrait:text-xl lg:text-3xl font-black italic text-indigo-400 outline-none w-24 portrait:flex-1 lg:w-80 placeholder:text-slate-800 uppercase tracking-tighter pr-2" 
                  placeholder="Nome Host" 
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); focusNameInput(); }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors group/icon"
                >
                   <Edit3 className="w-2.5 h-2.5 portrait:w-4 portrait:h-4 lg:w-5 lg:h-5 text-indigo-400 group-hover/icon:scale-110 transition-all shrink-0" />
                </button>
             </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-16 compact:flex-col compact:justify-center overflow-hidden">
           
           {/* SIDEBAR CUBE SELECTION (DESKTOP ONLY) */}
           <div className="flex flex-col gap-1.5 portrait:hidden lg:w-1/4 shrink-0 lg:gap-8 compact:hidden">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 lg:gap-4">
                    <Database className="w-3 h-3 portrait:w-4 portrait:h-4 lg:w-6 lg:h-6 text-indigo-400" />
                    <span className="text-[8px] portrait:text-[11px] lg:text-lg font-black text-slate-300 uppercase tracking-[0.4em]">Seleziona Cubo</span>
                 </div>
                 <span className={`text-[7px] portrait:text-[11px] lg:text-sm font-black uppercase ${hasEnoughCards ? 'text-emerald-500/50' : 'text-red-500'}`}>{selectedCube?.cardCount || 0}/{totalNeeded}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1.5 portrait:space-y-4 lg:space-y-6">
                 {loadingCubes ? (
                   Array(3).fill(0).map((_, i) => <div key={i} className="h-10 portrait:h-14 lg:h-20 bg-white/5 rounded-xl animate-pulse" />)
                 ) : cubes.map(cube => (
                   <button
                     key={cube.id}
                     onClick={() => setSelectedCubeId(cube.id)}
                     className={`w-full py-1.5 portrait:py-4 lg:py-6 px-3 portrait:px-5 lg:px-8 rounded-lg portrait:rounded-2xl lg:rounded-3xl border transition-all text-[8px] portrait:text-sm lg:text-xl font-black uppercase tracking-tight text-left flex items-center justify-between group ${
                       selectedCubeId === cube.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-600/30' : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'
                     }`}
                   >
                     <span className="truncate mr-2 leading-none">{cube.name}</span>
                     <span className={`text-[7px] portrait:text-[10px] lg:text-sm font-black shrink-0 ${selectedCubeId === cube.id ? 'text-indigo-200' : 'text-slate-600'}`}>{cube.cardCount}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* PARAMETERS GRID */}
           <div className="flex-1 flex flex-col gap-2 portrait:gap-2 lg:gap-8 justify-center lg:justify-start lg:overflow-visible overflow-y-auto custom-scrollbar compact:px-2 compact:w-full">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 portrait:gap-4 lg:gap-6 min-h-0 compact:gap-3 compact:max-w-[700px] compact:mx-auto compact:w-full">
                 <Stepper label="Giocatori" value={playerCount} min={2} onSub={() => setPlayerCount(p => Math.max(2, p-1))} onAdd={() => setPlayerCount(p => Math.min(16, p+1))} icon={Users} />
                 
                 {/* COMBINED TIMER CONTROL */}
                 <div className={`setup-item setup-item-portrait setup-item-lg compact:p-2 compact:gap-1 shadow-2xl transition-all duration-300 ${timerEnabled ? 'setup-item-active' : 'opacity-60 grayscale-[0.5]'}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap portrait:text-[10px] lg:text-[11px]">
                        <Clock className={`w-2.5 h-2.5 portrait:w-3.5 portrait:h-3.5 lg:w-4 lg:h-4 ${timerEnabled ? 'text-indigo-400' : 'text-slate-400'}`} /> Timer
                      </div>
                      
                      <div 
                        onClick={() => setTimerEnabled(!timerEnabled)}
                        className={`w-8 h-4 lg:w-14 lg:h-7 rounded-full p-1 transition-colors flex items-center cursor-pointer ${timerEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                         <motion.div 
                           animate={{ x: timerEnabled ? 22 : 0 }} 
                           transition={{ type: "spring", stiffness: 500, damping: 30 }}
                           className="w-3 h-3 portrait:w-3.5 portrait:h-3.5 lg:w-5 lg:h-5 rounded-full bg-white shadow-lg" 
                         />
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full lg:px-2 min-h-[30px] portrait:min-h-[50px] lg:min-h-[70px]">
                      {timerEnabled ? (
                        <>
                          <button 
                            onClick={() => setTimer(t => Math.max(10, t - 5))} 
                            className="p-1 hover:text-white text-slate-500 transition-all active:scale-90"
                          >
                            <Minus className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-6 lg:h-6" />
                          </button>
                          <div className="text-center">
                             <span className="text-sm font-black text-white italic tabular-nums leading-none portrait:text-xl lg:text-3xl compact:text-base">{timer}s</span>
                          </div>
                          <button 
                            onClick={() => setTimer(t => Math.min(180, t + 5))} 
                            className="p-1 hover:text-white text-slate-500 transition-all active:scale-90"
                          >
                            <Plus className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-6 lg:h-6" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                           <span className="text-[10px] portrait:text-sm lg:text-xl font-black text-slate-600 uppercase italic tracking-widest opacity-40">Disattivato</span>
                        </div>
                      )}
                    </div>
                 </div>

                 <Stepper label="Buste" value={packsPerPlayer} min={1} onSub={() => setPacksPerPlayer(p => Math.max(1, p-1))} onAdd={() => setPacksPerPlayer(p => Math.min(10, p+1))} icon={Package}  />
                 <Stepper label="Carte per busta" value={cardsPerPack} min={5} onSub={() => setCardsPerPack(p => Math.max(5, p-1))} onAdd={() => setCardsPerPack(p => Math.min(25, p+1))} icon={Layers}  />
                 <Toggle active={anonymousMode} onClick={() => setAnonymousMode(!anonymousMode)} icon={ShieldAlert} label="Anonimo" desc="Opponents Hidden" />
                 <Toggle active={randomPacks} onClick={() => setRandomPacks(!randomPacks)} icon={Shuffle} label="Casuali" desc="Random Contents" />
              </div>
           </div>
        </div>

        {/* FOOTER CTA */}
        <div className="shrink-0 pt-2 border-t border-white/5 portrait:pt-6 lg:pt-8 compact:pt-1">
           <button
              onClick={handleCreate}
              disabled={loading || !hasEnoughCards || !selectedCubeId}
              className={`w-full py-3.5 portrait:py-6 lg:py-5 rounded-xl portrait:rounded-3xl lg:rounded-2xl font-black uppercase tracking-[0.2em] portrait:tracking-[0.4em] lg:tracking-[0.4em] text-[10px] portrait:text-base lg:text-lg italic flex items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden compact:py-2.5 ${
                loading || !hasEnoughCards || !selectedCubeId
                ? 'bg-slate-800 text-slate-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/40'
              }`}
           >
              {loading ? <Loader2 className="w-5 h-5 animate-spin max-lg:landscape:w-4 landscape:h-4" /> : (
                <>
                   Crea Lobby <ArrowRight className="w-5 h-5 portrait:w-7 portrait:h-7 lg:w-6 lg:h-6 group-hover:translate-x-3 transition-transform duration-300 max-lg:landscape:w-4 landscape:h-4" />
                </>
              )}
           </button>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        input::placeholder { color: #1e293b; }
        select option { background: #020617; color: #818cf8; font-family: inherit; font-weight: 900; text-transform: uppercase; }
      `}</style>
    </div>
  );
};
