import { useState, useEffect } from 'react';
import { Home, Key, ArrowRight, Loader2, AlertCircle, ClipboardPaste } from 'lucide-react';
import { useDraftStore } from '../store/useDraftStore';

interface JoinRoomProps {
  onBack: () => void;
  onJoin: (roomCode: string, playerName: string) => void;
  error?: string | null;
  loading?: boolean;
}

export const JoinRoom = ({ onBack, onJoin, error, loading }: JoinRoomProps) => {
  const { wallpaperList, fetchAssets } = useDraftStore();
  const [code, setCode] = useState('');
  const [name, setName] = useState(localStorage.getItem('mtg_player_name') || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>('');

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

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6 && name.trim()) {
      localStorage.setItem('mtg_player_name', name);
      onJoin(code.toUpperCase(), name);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toUpperCase().substring(0, 6);
      if (cleaned) {
        setCode(cleaned);
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="fixed inset-0 min-h-[100dvh] z-[110] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      
      {/* Sfondo Custom Sincronizzato con Menu */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'} bg-slate-950 z-[4]`} />
        {wallpaper && (
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 scale-105 animate-slow-zoom ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}`}
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}
        {/* Overlay Dark per contrasto */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[1]" />
        
        {/* Luci ambientali aggiuntive */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-[2]">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[160px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[160px]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-sm max-lg:landscape:max-w-none flex flex-col items-center max-lg:landscape:items-start justify-center max-lg:landscape:justify-start p-6 max-lg:landscape:p-8 lg:p-0 gap-8 max-lg:landscape:gap-4 animate-in zoom-in-95 slide-in-from-bottom-6 duration-700 h-full overflow-hidden">
        
        {/* Header - Horizontal in Landscape to save height */}
        <div className="text-center max-lg:landscape:text-left flex flex-col max-lg:landscape:flex-row items-center max-lg:landscape:items-center gap-4 max-lg:landscape:gap-3 shrink-0 max-lg:landscape:mb-2">
           <div className="inline-flex w-16 h-16 max-lg:landscape:w-9 max-lg:landscape:h-9 bg-emerald-500/10 rounded-[2rem] max-lg:landscape:rounded-lg border border-emerald-500/20 items-center justify-center text-emerald-500 mb-2 max-lg:landscape:mb-0 shrink-0">
              <Key className="w-8 h-8 max-lg:landscape:w-4 max-lg:landscape:h-4" />
           </div>
           <div className="space-y-1 max-lg:landscape:space-y-0 text-center max-lg:landscape:text-left">
              <h2 className="text-4xl max-lg:landscape:text-xl lg:text-4xl font-black text-white uppercase tracking-tighter italic whitespace-nowrap leading-none">Partecipa <span className="text-emerald-500">Draft</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] max-lg:landscape:hidden lg:block">Inserisci il codice della stanza</p>
           </div>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="w-full space-y-4 lg:space-y-4 max-lg:landscape:space-y-3">
           
           <div className="space-y-1.5 max-lg:landscape:space-y-1 max-lg:landscape:max-w-xs">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 max-lg:landscape:ml-0 italic">1. Il Tuo Nome</label>
             <input 
               type="text" 
               maxLength={15}
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Es: Chandra"
               className="w-full bg-slate-900 border-2 border-white/5 text-white px-6 py-4 max-lg:landscape:py-2.5 lg:py-4 rounded-2xl outline-none focus:border-emerald-500/50 transition-all font-bold placeholder:text-slate-700 text-sm"
               required
             />
           </div>

           <div className="space-y-1.5 max-lg:landscape:space-y-1 max-lg:landscape:max-w-sm">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 max-lg:landscape:ml-0 italic">2. Codice Stanza</label>
             <div className="relative group/code">
               <input 
                 type="text" 
                 maxLength={6}
                 value={code}
                 onChange={(e) => setCode(e.target.value.toUpperCase())}
                 placeholder="ABC-123"
                 className="w-full bg-slate-900 border-2 border-white/5 text-white text-center text-2xl tracking-[0.3em] px-6 py-5 max-lg:landscape:py-2.5 lg:py-5 rounded-2xl outline-none focus:border-emerald-500/50 transition-all font-black placeholder:text-slate-700 uppercase pr-16"
                 required
               />
               <button
                 type="button"
                 onClick={handlePaste}
                 className="absolute right-3 top-1/2 -translate-y-1/2 p-3 max-lg:landscape:p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 active:scale-90 shadow-xl"
                 title="Incolla dagli appunti"
               >
                 <ClipboardPaste className="w-5 h-5 max-lg:landscape:w-4 max-lg:landscape:h-4" />
               </button>
             </div>
           </div>

           {error && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in shake duration-500 max-lg:landscape:max-w-md max-lg:landscape:p-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight">{error}</p>
             </div>
           )}

           <div className="pt-2 max-lg:landscape:pt-0 flex gap-3 max-lg:landscape:max-w-md">
              <button 
                type="button"
                onClick={onBack}
                className="p-5 max-lg:landscape:p-3.5 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-2xl border border-white/5 transition-all shadow-xl group active:scale-95 flex items-center justify-center shrink-0"
              >
                <Home className="w-6 h-6 max-lg:landscape:w-5 max-lg:landscape:h-5 group-hover:scale-110 transition-transform" />
              </button>
              
              <button 
                type="submit"
                disabled={loading || code.length < 6 || !name.trim()}
                className={`flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] max-lg:landscape:text-[9px] flex items-center justify-center gap-3 transition-all active:scale-95 group whitespace-nowrap ${
                  loading || code.length < 6 || !name.trim() ? 'shadow-none' : 'shadow-xl shadow-emerald-600/20'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entra nella Stanza <ArrowRight className="w-4 h-4 max-lg:landscape:hidden group-hover:translate-x-1 transition-transform" /></>}
              </button>
           </div>
        </form>

      </div>

    </div>
  );
};
