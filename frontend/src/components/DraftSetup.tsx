import { useState, useEffect } from 'react';
import { Home, Layers, Users, Clock, Package, Zap, ChevronRight, Loader2, Database, AlertCircle, Plus, Minus, ShieldQuestion } from 'lucide-react';
import { INITIAL_WALLPAPER } from './MainMenu';

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
  const [cubes, setCubes] = useState<SavedCube[]>([]);
  const [loadingCubes, setLoadingCubes] = useState(true);
  
  // Form State
  const [selectedCubeId, setSelectedCubeId] = useState<string>('');
  const [playerCount, setPlayerCount] = useState(8);
  const [timer, setTimer] = useState<number | null>(60);
  const [packsPerPlayer, setPacksPerPlayer] = useState(3);
  const [cardsPerPack, setCardsPerPack] = useState(15);
  const [rarityBalance, setRarityBalance] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [hostName, setHostName] = useState(localStorage.getItem('mtg_player_name') || '');

  useEffect(() => {
    const fetchCubes = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/cubes');
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

  const selectedCube = cubes.find(c => c.id === selectedCubeId);
  const totalNeeded = playerCount * packsPerPlayer * cardsPerPack;
  const hasEnoughCards = selectedCube ? selectedCube.cardCount >= totalNeeded : true;

  const handleCreate = () => {
    if (!selectedCubeId || !hostName.trim() || !hasEnoughCards) return;
    
    localStorage.setItem('mtg_player_name', hostName.trim());
    
    onCreateRoom({
      cubeId: selectedCubeId,
      cubeName: selectedCube?.name,
      playerCount,
      timer,
      packsPerPlayer,
      cardsPerPack,
      rarityBalance,
      anonymousMode
    });
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
      
      {/* Sfondo Custom Sincronizzato con Menu */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 animate-slow-zoom"
          style={{ backgroundImage: `url(${INITIAL_WALLPAPER})` }}
        />
        {/* Overlay Dark per contrasto */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[1]" />
        
        {/* Luci ambientali aggiuntive */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-[2]">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[160px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[160px]" />
        </div>
      </div>

      <div className="relative w-full max-w-[1000px] mx-auto space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 z-10">
      
      {/* HEADER - Più compatto */}
      <div className="flex items-center gap-4 py-3 border-b border-white/5">
        <button 
          onClick={onBack}
          className="p-3 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-2xl border border-white/5 transition-all shadow-xl group active:scale-95"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic opacity-80 leading-none">
            Setup <span className="text-indigo-500">Draft</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] ml-1 mt-0.5">Configura la tua draft</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        
        {/* LEFT: Cube Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Database className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Scegli il Cube</h3>
          </div>

          {loadingCubes ? (
            <div className="flex-1 p-8 bg-slate-900/30 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
               <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-3" />
            </div>
          ) : cubes.length === 0 ? (
            <div className="flex-1 p-8 bg-slate-900/30 rounded-3xl border border-red-500/20 text-center">
               <p className="text-slate-400 text-xs font-bold mb-3">Nessun cubo disponibile.</p>
               <button onClick={onBack} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest underline decoration-2">Menu</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[30vh] lg:max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
              {cubes.map(cube => (
                <button
                  key={cube.id}
                  onClick={() => setSelectedCubeId(cube.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedCubeId === cube.id ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-600/20' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4 h-4 ${selectedCubeId === cube.id ? 'text-white' : 'text-slate-500'}`} />
                    <div>
                      <div className={`text-xs font-black uppercase tracking-tight ${selectedCubeId === cube.id ? 'text-white' : 'text-slate-200'}`}>{cube.name}</div>
                      <div className={`text-[8px] font-bold uppercase tracking-widest ${selectedCubeId === cube.id ? 'text-indigo-200' : 'text-slate-500'}`}>{cube.cardCount} Carte</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Card Summary Logic */}
          {selectedCube && (
            <div className={`p-4 rounded-3xl border transition-all flex items-center gap-4 ${hasEnoughCards ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5'}`}>
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasEnoughCards ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 animate-pulse'}`}>
                  {hasEnoughCards ? <Package className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
               </div>
               <div>
                  <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${hasEnoughCards ? 'text-emerald-500' : 'text-red-500'}`}>
                    {hasEnoughCards ? 'Sufficienti' : 'CARTE INSUFFICIENTI'}
                  </div>
                  <div className="text-lg font-black text-white tracking-tighter italic leading-none mt-0.5">
                    {selectedCube.cardCount} <span className="text-slate-600 text-xs">/ {totalNeeded}</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* RIGHT: Game Rules */}
        <div className="flex flex-col gap-4 lg:gap-5 bg-slate-900/30 p-5 lg:p-6 rounded-[2rem] border border-white/5 overflow-hidden">
          
          <div className="flex flex-col gap-4 lg:gap-5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Regole Draft</h3>
                        {/* Players Range */}
            <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-white/5 ring-1 ring-white/5">
                <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Users className="w-4 h-4 text-indigo-500" /> Numero Giocatori
                </div>
                <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                    <button 
                       onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                       className="text-slate-500 hover:text-white transition-colors active:scale-90"
                       type="button"
                    >
                       <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-lg font-black text-white italic tracking-tighter w-6 text-center">{playerCount}</span>
                    <button 
                       onClick={() => setPlayerCount(Math.min(16, playerCount + 1))}
                       className="text-slate-500 hover:text-white transition-colors active:scale-90"
                       type="button"
                    >
                       <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Host Name Input */}
            <div className="space-y-2">
               <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                 <Users className="w-3.5 h-3.5 text-indigo-500" /> Il Tuo Nome
               </div>
               <input 
                 type="text"
                 placeholder="Esempio: Nicol Bolas"
                 value={hostName}
                 onChange={(e) => setHostName(e.target.value)}
                 className="w-full bg-slate-950 border border-white/5 text-white p-3.5 rounded-xl outline-none focus:border-indigo-500/40 transition-colors font-bold text-xs shadow-inner"
               />
            </div>

            {/* Packs & Cards Inputs */}
            <div className="grid grid-cols-1 gap-3">
               <div className="flex items-center justify-between bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Package className="w-3.5 h-3.5 text-indigo-500" /> Buste / Player
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                    <button 
                       onClick={() => setPacksPerPlayer(Math.max(1, packsPerPlayer - 1))}
                       className="text-slate-500 hover:text-white transition-colors active:scale-90"
                       type="button"
                    >
                       <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-black text-white italic tracking-tighter w-5 text-center">{packsPerPlayer}</span>
                    <button 
                       onClick={() => setPacksPerPlayer(Math.min(10, packsPerPlayer + 1))}
                       className="text-slate-500 hover:text-white transition-colors active:scale-90"
                       type="button"
                    >
                       <Plus className="w-3 h-3" />
                    </button>
                  </div>
               </div>

               <div className="flex items-center justify-between bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Carte / Busta
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                    <button 
                       onClick={() => setCardsPerPack(Math.max(1, cardsPerPack - 1))}
                       className="text-slate-500 hover:text-white transition-colors active:scale-90"
                       type="button"
                    >
                       <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-black text-white italic tracking-tighter w-5 text-center">{cardsPerPack}</span>
                    <button 
                       onClick={() => setCardsPerPack(Math.min(100, cardsPerPack + 1))}
                       className="text-slate-500 hover:text-white transition-colors active:scale-90"
                       type="button"
                    >
                       <Plus className="w-3 h-3" />
                    </button>
                  </div>
               </div>
            </div>

            {/* Timer Picker (CUSTOMIZABLE) */}
            <div className="flex flex-col gap-2 bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
               <div className="flex justify-between items-center px-1">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" /> Tempo Pick (sec)
                  </div>
                  <button 
                    onClick={() => setTimer(timer === null ? 60 : null)}
                    className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest transition-colors ${timer === null ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
                  >
                    {timer === null ? 'Off' : 'Disabilita'}
                  </button>
               </div>
               {timer !== null && (
                 <div className="flex items-center justify-between bg-slate-900 px-4 py-2 rounded-lg border border-white/5 shadow-inner mt-1">
                    <button 
                       onClick={() => setTimer(Math.max(5, (timer || 60) - 5))}
                       className="text-slate-500 hover:text-white transition-colors active:scale-90"
                       type="button"
                    >
                       <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-black text-white italic tracking-tighter w-12 text-center">{timer}s</span>
                    <button 
                       onClick={() => setTimer(Math.min(300, (timer || 60) + 5))}
                       className="text-slate-500 hover:text-white transition-colors active:scale-90"
                       type="button"
                    >
                       <Plus className="w-3.5 h-3.5" />
                    </button>
                 </div>
               )}
            </div>

            {/* Rarity Balance Toggle */}
            <button 
              onClick={() => setRarityBalance(!rarityBalance)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${rarityBalance ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>
                    <Zap className="w-4 h-4" />
                 </div>
                 <div className="text-left">
                    <div className="text-[11px] font-black text-white uppercase tracking-tight">Bilancia Rarità</div>
                 </div>
              </div>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${rarityBalance ? 'bg-amber-500' : 'bg-slate-700'}`}>
                 <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${rarityBalance ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </button>

            {/* Anonymous Mode Toggle */}
            <button 
              onClick={() => setAnonymousMode(!anonymousMode)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${anonymousMode ? 'bg-indigo-500/20 text-indigo-500' : 'bg-slate-800 text-slate-600'}`}>
                    <ShieldQuestion className="w-4 h-4" />
                 </div>
                 <div className="text-left">
                    <div className="text-[11px] font-black text-white uppercase tracking-tight italic">Nascondi Identità</div>
                    <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Avatar casuali e nomi nascosti</div>
                 </div>
              </div>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${anonymousMode ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-slate-700'}`}>
                 <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${anonymousMode ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>

          <button 
            disabled={!selectedCubeId || !hostName.trim() || !hasEnoughCards}
            onClick={handleCreate}
            className={`w-full py-4 lg:py-4.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl lg:rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] lg:text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-auto ${
              !selectedCubeId || !hostName.trim() || !hasEnoughCards ? 'shadow-none' : 'shadow-xl shadow-indigo-600/20'
            }`}
          >
            Crea Lobby <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
