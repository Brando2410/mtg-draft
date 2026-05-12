
import { Swords, Layers, Home, Package } from 'lucide-react';

interface GameModeSelectionProps {
  onBack: () => void;
  onSelectMode: (mode: 'draft' | 'normal' | 'sealed') => void;
}

export const GameModeSelection = ({ onBack, onSelectMode }: GameModeSelectionProps) => {
  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-[90vh] flex flex-col items-center justify-center p-[clamp(1rem,5vw,3rem)] space-y-[clamp(2rem,8vh,6rem)] animate-in fade-in zoom-in-95 duration-700 overflow-y-auto max-h-screen custom-scrollbar selection:bg-indigo-500/30">

      {/* HEADER */}
      <div className="text-center space-y-[clamp(0.5rem,2vw,1rem)] shrink-0">
        <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-black text-white italic uppercase tracking-tighter leading-none">
          Select a <span className="text-indigo-500 drop-shadow-[0_0_20px_rgba(79,70,229,0.3)]">Game Mode</span>
        </h2>
        <div className="h-[clamp(4px,0.5vw,6px)] w-[clamp(4rem,10vw,8rem)] mx-auto bg-indigo-500/50 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
      </div>

      {/* MODES GRID - Using a fluid grid that maintains proportions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(1rem,3vw,2.5rem)] w-full">

        {/* DRAFT MODE */}
        <button
          onClick={() => onSelectMode('draft')}
          className="group relative flex flex-col items-start p-[clamp(1.5rem,4vw,3rem)] bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[clamp(1.5rem,4vw,3rem)] hover:bg-indigo-600 border-b-4 hover:border-b-indigo-400 transition-all duration-500 text-left overflow-hidden shadow-2xl active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-[clamp(8rem,20vw,12rem)] h-[clamp(8rem,20vw,12rem)] bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

          <div className="relative space-y-[clamp(1rem,3vh,2.5rem)] w-full">
            <div className="w-[clamp(3.5rem,10vw,5rem)] h-[clamp(3.5rem,10vw,5rem)] bg-indigo-500/20 rounded-[clamp(0.75rem,2vw,1.5rem)] flex items-center justify-center text-indigo-400 group-hover:bg-white group-hover:text-indigo-600 transition-all duration-500 rotate-3 group-hover:rotate-0 shadow-lg">
              <Layers className="w-[50%] h-[50%]" />
            </div>

            <div className="space-y-[clamp(0.25rem,1vh,0.75rem)]">
              <h3 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black text-indigo-400 uppercase italic tracking-tight leading-tight group-hover:text-white transition-colors">Draft Event</h3>
            </div>

          </div>
        </button>

        {/* SEALED MODE */}
        <button
          onClick={() => onSelectMode('sealed')}
          className="group relative flex flex-col items-start p-[clamp(1.5rem,4vw,3rem)] bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[clamp(1.5rem,4vw,3rem)] hover:bg-violet-600 border-b-4 hover:border-b-violet-400 transition-all duration-500 text-left overflow-hidden shadow-2xl active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-[clamp(8rem,20vw,12rem)] h-[clamp(8rem,20vw,12rem)] bg-violet-500/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

          <div className="relative space-y-[clamp(1rem,3vh,2.5rem)] w-full">
            <div className="w-[clamp(3.5rem,10vw,5rem)] h-[clamp(3.5rem,10vw,5rem)] bg-violet-500/20 rounded-[clamp(0.75rem,2vw,1.5rem)] flex items-center justify-center text-violet-400 group-hover:bg-white group-hover:text-violet-600 transition-all duration-500 -rotate-3 group-hover:rotate-0 shadow-lg">
              <Package className="w-[50%] h-[50%]" />
            </div>

            <div className="space-y-[clamp(0.25rem,1vh,0.75rem)]">
              <h3 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black text-violet-400 uppercase italic tracking-tight leading-tight group-hover:text-white transition-colors">Sealed Event</h3>
            </div>
          </div>
        </button>

        {/* NORMAL MODE (CONSTRUCTED) */}
        <button
          onClick={() => onSelectMode('normal')}
          className="group relative flex flex-col items-start p-[clamp(1.5rem,4vw,3rem)] bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[clamp(1.5rem,4vw,3rem)] hover:bg-emerald-600 border-b-4 hover:border-b-emerald-400 transition-all duration-500 text-left overflow-hidden shadow-2xl active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-[clamp(8rem,20vw,12rem)] h-[clamp(8rem,20vw,12rem)] bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

          <div className="relative space-y-[clamp(1rem,3vh,2.5rem)] w-full">
            <div className="w-[clamp(3.5rem,10vw,5rem)] h-[clamp(3.5rem,10vw,5rem)] bg-emerald-500/20 rounded-[clamp(0.75rem,2vw,1.5rem)] flex items-center justify-center text-emerald-400 group-hover:bg-white group-hover:text-emerald-600 transition-all duration-500 rotate-6 group-hover:rotate-0 shadow-lg">
              <Swords className="w-[50%] h-[50%]" />
            </div>

            <div className="space-y-[clamp(0.25rem,1vh,0.75rem)]">
              <h3 className="text-[clamp(1.5rem,4vw,2.5rem)] font-black text-emerald-400 uppercase italic tracking-tight leading-tight group-hover:text-white transition-colors">Quick Match</h3>
            </div>
          </div>
        </button>

      </div>

      {/* FOOTER - Fluid Scaling */}
      <button
        onClick={onBack}
        className="group flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(0.75rem,2vh,1.25rem)] bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-indigo-400 rounded-[clamp(1rem,2vw,1.5rem)] text-slate-500 font-black uppercase text-[clamp(9px,1.2vw,11px)] tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-2xl active:scale-95 shrink-0"
      >
        <Home className="w-[clamp(14px,1.8vw,20px)] h-[clamp(14px,1.8vw,20px)] group-hover:rotate-[-12deg] transition-transform" />
        Back to Menu
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};
