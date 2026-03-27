import { Swords, Layers, Home, ArrowRight } from 'lucide-react';

interface GameModeSelectionProps {
  onBack: () => void;
  onSelectMode: (mode: 'draft' | 'normal') => void;
}

export const GameModeSelection = ({ onBack, onSelectMode }: GameModeSelectionProps) => {
  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 space-y-8 sm:space-y-16 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto max-h-screen custom-scrollbar">
      
      {/* HEADER */}
      <div className="text-center space-y-2 sm:space-y-4 shrink-0">
        <h2 className="text-3xl sm:text-7xl font-black text-white italic uppercase tracking-tighter">
          Scegli <span className="text-indigo-500">Modalità</span>
        </h2>
        <div className="h-1 w-12 sm:w-24 mx-auto bg-indigo-500/50 rounded-full" />
      </div>

      {/* MODES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full max-lg:landscape:grid-cols-2">
        
        {/* DRAFT MODE */}
        <button 
          onClick={() => onSelectMode('draft')}
          className="group relative flex flex-col items-start p-6 sm:p-10 bg-slate-900/40 border border-white/5 rounded-3xl sm:rounded-[3rem] hover:bg-indigo-600/10 hover:border-indigo-400/30 transition-all duration-500 text-left overflow-hidden shadow-2xl max-lg:landscape:p-5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          
          <div className="relative space-y-4 sm:space-y-8 w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-white group-hover:text-indigo-600 transition-all duration-500 rotate-3 group-hover:rotate-0">
              <Layers className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            
            <div className="space-y-1 sm:space-y-3">
              <h3 className="text-xl sm:text-3xl font-black text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">Draft Session</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                Draft classico con bustine.
              </p>
            </div>

            <div className="flex items-center gap-2 text-indigo-400 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] pt-2 sm:pt-4 group-hover:translate-x-2 transition-transform">
              Configura <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
        </button>

        {/* NORMAL MODE (CONSTRUCTED) */}
        <button 
          onClick={() => onSelectMode('normal')}
          className="group relative flex flex-col items-start p-6 sm:p-10 bg-slate-900/40 border border-white/5 rounded-3xl sm:rounded-[3rem] hover:bg-emerald-600/10 hover:border-emerald-400/30 transition-all duration-500 text-left overflow-hidden shadow-2xl max-lg:landscape:p-5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          
          <div className="relative space-y-4 sm:space-y-8 w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-400 group-hover:bg-white group-hover:text-emerald-600 transition-all duration-500 -rotate-3 group-hover:rotate-0">
              <Swords className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            
            <div className="space-y-1 sm:space-y-3">
              <h3 className="text-xl sm:text-3xl font-black text-white uppercase italic tracking-tight group-hover:text-emerald-400 transition-colors">Partita Rapida</h3>
              <p className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                Scontro 1v1 con i tuoi mazzi.
              </p>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] pt-2 sm:pt-4 group-hover:translate-x-2 transition-transform">
              Inizia Sfida <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </div>
        </button>

      </div>

      {/* FOOTER */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 border border-white/5 rounded-xl sm:rounded-2xl text-slate-500 font-black uppercase text-[9px] sm:text-[10px] tracking-widest hover:bg-slate-800 hover:text-white transition-all shadow-xl active:scale-95 shrink-0"
      >
        <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Torna al Menu
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};
