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
      {/* Content Container */}
      {/* Content Container */}
      <div className="relative z-10 flex flex-col max-lg:landscape:flex-row lg:flex-col items-center justify-center w-full h-full max-h-screen p-4 sm:p-10 max-lg:landscape:gap-12 lg:gap-0">
        
        {/* Logo / Title Section */}
        <div className="text-center mb-10 sm:mb-20 max-lg:landscape:mb-0 lg:mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 shrink-0">
          <h1 className="text-5xl sm:text-9xl max-lg:landscape:text-6xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 tracking-tighter uppercase italic leading-none">
            MTG<br/>Draft
          </h1>
          <div className="h-1 w-20 sm:w-32 mx-auto bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-4 sm:mt-6 opacity-50" />
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-sm px-6 max-lg:landscape:max-w-xl max-lg:landscape:grid max-lg:landscape:grid-cols-2 lg:flex lg:flex-col lg:max-w-sm animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300 overflow-y-auto max-lg:landscape:overflow-visible lg:overflow-visible pr-1 custom-scrollbar">
          
          <button 
            onClick={() => onSelect('draft_setup')}
            className="group relative flex items-center justify-between p-4 sm:p-6 bg-slate-900/80 hover:bg-indigo-600 border border-white/5 hover:border-indigo-400 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-indigo-600/40 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 group-hover:text-white fill-current" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter leading-tight">Nuova Draft</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 group-hover:text-indigo-200 uppercase tracking-widest hidden sm:block">Crea una stanza</span>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onSelect('draft_join')}
            className="group relative flex items-center justify-between p-4 sm:p-6 bg-slate-900/80 hover:bg-emerald-600 border border-white/5 hover:border-emerald-400 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 group-hover:text-white" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter leading-tight">Partecipa</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 group-hover:text-emerald-200 uppercase tracking-widest hidden sm:block">Unisciti ora</span>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-0 landscape:mt-0 lg:mt-0 landscape:col-span-2 lg:col-span-1">
            <button 
              onClick={() => onSelect('builder')}
              className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/80 hover:bg-purple-600 border border-white/5 hover:border-purple-400 rounded-2xl transition-all duration-300 shadow-xl gap-2"
            >
              <PlusSquare className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 group-hover:text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Nuovo Cube</span>
            </button>

            <button 
              onClick={() => onSelect('collection')}
              className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/80 hover:bg-slate-800 border border-white/5 hover:border-slate-600 rounded-2xl transition-all duration-300 shadow-xl gap-2"
            >
              <Library className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 group-hover:text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Collezione</span>
            </button>
          </div>

          <button 
            onClick={() => onSelect('history')}
            className="group relative flex items-center justify-between p-4 sm:p-6 bg-slate-900/80 hover:bg-amber-600 border border-white/5 hover:border-amber-400 rounded-2xl transition-all duration-300 shadow-2xl col-span-1 landscape:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:text-white" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter leading-tight">Storico</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 group-hover:text-amber-200 uppercase tracking-widest hidden sm:block">Draft Passate</span>
              </div>
            </div>
          </button>

        </div>
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
