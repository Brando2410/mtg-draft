import { useState, useEffect } from 'react';
import { Play, PlusSquare, Library, Users, Bug, History as HistoryIcon } from 'lucide-react';

interface MainMenuProps {
  onSelect: (view: 'builder' | 'draft_setup' | 'draft_join' | 'collection' | 'history') => void;
  onShowAdmin?: () => void;
}

// Selezioniamo il wallpaper una sola volta all'esterno del componente 
// per evitare ricalcoli durante i re-render o StrictMode.
const randomIdx = Math.floor(Math.random() * 10) + 1;
export const INITIAL_WALLPAPER = `/wallpapers/${randomIdx}.jpg`;

export const MainMenu = ({ onSelect, onShowAdmin }: MainMenuProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Preload dell'unica immagine scelta all'avvio
    const img = new Image();
    img.src = INITIAL_WALLPAPER;
    img.onload = () => setIsLoaded(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans text-slate-100">
      
      {/* Sfondo: Nero solido finché non carica, poi l'immagine scelta */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'} bg-slate-950 z-[4]`} />
        
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} z-[2]`}
          style={{ backgroundImage: `url(${INITIAL_WALLPAPER})` }}
        />
        {/* Overlay per Leggibilità */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950 z-[1]" />
        
        {/* Effetto Glow Ambientale */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent z-[2]" />
      </div>

      {/* Logo / Title Section */}
      <div className="relative z-10 mb-20 text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
     
        <h1 className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 tracking-tighter uppercase italic leading-none">
          MTG<br/>Draft
        </h1>
        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-6 opacity-50" />
      </div>

      {/* Menu Options */}
      <div className="relative z-10 flex flex-col gap-4 w-full max-w-sm px-6 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
        
        <button 
          onClick={() => onSelect('draft_setup')}
          className="group relative flex items-center justify-between p-6 bg-slate-900/80 hover:bg-indigo-600 border border-white/5 hover:border-indigo-400 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-indigo-600/40 hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <Play className="w-6 h-6 text-indigo-400 group-hover:text-white fill-current" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xl font-black text-white uppercase tracking-tighter">Nuova Draft</span>
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-200 uppercase tracking-widest">Crea una nuova stanza</span>
            </div>
          </div>
        </button>

        <button 
          onClick={() => onSelect('draft_join')}
          className="group relative flex items-center justify-between p-6 bg-slate-900/80 hover:bg-emerald-600 border border-white/5 hover:border-emerald-400 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <Users className="w-6 h-6 text-emerald-400 group-hover:text-white" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xl font-black text-white uppercase tracking-tighter">Partecipa</span>
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-200 uppercase tracking-widest">Unisciti con codice</span>
            </div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <button 
            onClick={() => onSelect('builder')}
            className="group flex flex-col items-center justify-center p-6 bg-slate-900/80 hover:bg-purple-600 border border-white/5 hover:border-purple-400 rounded-2xl transition-all duration-300 shadow-xl"
          >
            <PlusSquare className="w-8 h-8 text-purple-400 group-hover:text-white mb-2" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Nuovo Cube</span>
          </button>

          <button 
            onClick={() => onSelect('collection')}
            className="group flex flex-col items-center justify-center p-6 bg-slate-900/80 hover:bg-slate-800 border border-white/5 hover:border-slate-600 rounded-2xl transition-all duration-300 shadow-xl"
          >
            <Library className="w-8 h-8 text-slate-400 group-hover:text-white mb-2" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Collezione</span>
          </button>
        </div>

        <button 
          onClick={() => onSelect('history')}
          className="group relative flex items-center justify-between p-6 bg-slate-900/80 hover:bg-amber-600 border border-white/5 hover:border-amber-400 rounded-2xl transition-all duration-300 shadow-2xl mt-0"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <HistoryIcon className="w-6 h-6 text-amber-400 group-hover:text-white" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xl font-black text-white uppercase tracking-tighter">Storico</span>
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-amber-200 uppercase tracking-widest">Le tue draft passate</span>
            </div>
          </div>
        </button>

      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          <div className="flex items-center gap-4">
             <span>© 2026 Pixel Heart Studios</span>
             {onShowAdmin && (
               <button 
                  onClick={onShowAdmin}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all hover:text-white group flex items-center gap-2"
                  title="Debug Console"
               >
                  <Bug className="w-3 h-3 group-hover:animate-bounce" />
                  <span className="hidden group-hover:inline opacity-0 group-hover:opacity-100 transition-opacity">Debug</span>
               </button>
             )}
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
      </div>

    </div>
  );
};
