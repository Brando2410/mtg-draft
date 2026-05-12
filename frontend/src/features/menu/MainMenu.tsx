
import { Play, Library, Users, Bug, History as HistoryIcon, Settings } from 'lucide-react';
import { PageLayout } from '../../components/shared/PageLayout';

interface MainMenuProps {
  onSelect: (view: 'builder' | 'draft_setup' | 'draft_join' | 'collection' | 'history') => void;
  onShowAdmin?: () => void;
  onShowAssets?: () => void;
}

export const MainMenu = ({ onSelect, onShowAdmin, onShowAssets }: MainMenuProps) => {
  return (
    <PageLayout variant="default" className="flex flex-col items-center justify-center selection:bg-indigo-500/30 overflow-hidden">

      {/* Content Container - Always Centered & Stacked */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full max-h-[100dvh] p-[clamp(1rem,5vw,3rem)] gap-[clamp(2rem,6vh,4rem)]">

        {/* Logo / Title Section */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-10 duration-1000 shrink-0">
          <h1 className="text-[clamp(3.5rem,15vw,11rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 tracking-tighter uppercase italic leading-[0.8] select-none drop-shadow-2xl">
            MTG<br />
            <span className="text-indigo-500 drop-shadow-[0_0_30px_rgba(79,70,229,0.5)]">DRAFT</span>
          </h1>
          <div className="h-[clamp(4px,0.8vw,8px)] w-[clamp(6rem,20vw,12rem)] mx-auto bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-[clamp(1.5rem,4vw,3rem)] opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
        </div>

        {/* Menu Options - Fluid sizing based on width to prevent overflow */}
        <div className="flex flex-col gap-[clamp(0.75rem,2.5vw,1.25rem)] w-full max-w-[clamp(18rem,85vw,500px)] animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">

          <button
            onClick={() => onSelect('draft_setup')}
            className="group relative flex items-center justify-between p-[clamp(1.25rem,4vw,2.25rem)] bg-slate-900/60 backdrop-blur-xl hover:bg-indigo-600 border border-white/10 hover:border-indigo-400 rounded-[clamp(1rem,4vw,2.5rem)] transition-all duration-500 shadow-3xl hover:shadow-indigo-600/40 hover:-translate-y-2 active:scale-95 overflow-hidden"
          >
            <div className="flex items-center gap-[clamp(1rem,4vw,2.5rem)]">
              <div className="w-[clamp(3rem,12vw,5rem)] h-[clamp(3rem,12vw,5rem)] rounded-[clamp(0.75rem,2.5vw,1.25rem)] bg-indigo-500/20 group-hover:bg-white/20 flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shrink-0">
                <Play className="w-[45%] h-[45%] text-indigo-400 group-hover:text-white fill-current" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[clamp(1.5rem,6vw,3.5rem)] font-black text-white uppercase tracking-tighter leading-tight italic">Play</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('draft_join')}
            className="group relative flex items-center justify-between p-[clamp(1.25rem,4vw,2.25rem)] bg-slate-900/60 backdrop-blur-xl hover:bg-emerald-600 border border-white/10 hover:border-emerald-400 rounded-[clamp(1rem,4vw,2.5rem)] transition-all duration-500 shadow-3xl hover:shadow-emerald-600/40 hover:-translate-y-2 active:scale-95 overflow-hidden"
          >
            <div className="flex items-center gap-[clamp(1rem,4vw,2.5rem)]">
              <div className="w-[clamp(3rem,12vw,5rem)] h-[clamp(3rem,12vw,5rem)] rounded-[clamp(0.75rem,2.5vw,1.25rem)] bg-emerald-500/20 group-hover:bg-white/20 flex items-center justify-center transition-all duration-500 group-hover:-rotate-6 shrink-0">
                <Users className="w-[45%] h-[45%] text-emerald-400 group-hover:text-white" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[clamp(1.5rem,6vw,3.5rem)] font-black text-white uppercase tracking-tighter leading-tight italic">Join</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('collection')}
            className="group relative flex items-center justify-between p-[clamp(1.25rem,4vw,2.25rem)] bg-slate-900/60 backdrop-blur-xl hover:bg-violet-600 border border-white/10 hover:border-violet-400 rounded-[clamp(1rem,4vw,2.5rem)] transition-all duration-500 shadow-3xl hover:shadow-violet-600/40 hover:-translate-y-2 active:scale-95 overflow-hidden"
          >
            <div className="flex items-center gap-[clamp(1rem,4vw,2.5rem)]">
              <div className="w-[clamp(3rem,12vw,5rem)] h-[clamp(3rem,12vw,5rem)] rounded-[clamp(0.75rem,2.5vw,1.25rem)] bg-violet-500/20 group-hover:bg-white/20 flex items-center justify-center transition-all duration-500 group-hover:rotate-3 shrink-0">
                <Library className="w-[45%] h-[45%] text-violet-400 group-hover:text-white" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[clamp(1.5rem,6vw,3.5rem)] font-black text-white uppercase tracking-tighter leading-tight italic">Collection</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('history')}
            className="group relative flex items-center justify-between p-[clamp(1.25rem,4vw,2.25rem)] bg-slate-900/60 backdrop-blur-xl hover:bg-amber-600 border border-white/10 hover:border-amber-400 rounded-[clamp(1rem,4vw,2.5rem)] transition-all duration-500 shadow-3xl hover:shadow-amber-600/40 hover:-translate-y-2 active:scale-95 overflow-hidden"
          >
            <div className="flex items-center gap-[clamp(1rem,4vw,2.5rem)]">
              <div className="w-[clamp(3rem,12vw,5rem)] h-[clamp(3rem,12vw,5rem)] rounded-[clamp(0.75rem,2.5vw,1.25rem)] bg-amber-500/20 group-hover:bg-white/20 flex items-center justify-center transition-all duration-500 group-hover:-rotate-3 shrink-0">
                <HistoryIcon className="w-[45%] h-[45%] text-amber-400 group-hover:text-white" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[clamp(1.5rem,6vw,3.5rem)] font-black text-white uppercase tracking-tighter leading-tight italic">History</span>
              </div>
            </div>
          </button>

        </div>
      </div>


      {/* Debug & Assets Buttons - Now fully fluid and responsive */}
      <div className="fixed bottom-[clamp(1rem,3vh,2rem)] right-[clamp(1rem,4vw,2.5rem)] z-[150] flex items-center gap-[clamp(0.5rem,1.5vw,1rem)]">
        {onShowAssets && (
          <button
            onClick={onShowAssets}
            className="group flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(0.75rem,2vw,1.25rem)] py-[clamp(0.5rem,1.5vh,1rem)] bg-slate-900/80 backdrop-blur-lg hover:bg-emerald-600 border border-white/10 hover:border-emerald-400 rounded-[clamp(0.75rem,2vw,1.25rem)] transition-all duration-300 shadow-2xl hover:shadow-emerald-600/40 hover:scale-110 active:scale-95"
            title="Gestione Asset"
          >
            <Settings className="w-[clamp(1rem,3vw,1.5rem)] h-[clamp(1rem,3vw,1.5rem)] text-emerald-400 group-hover:text-white group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-[clamp(9px,1.5vw,11px)] font-black text-white uppercase tracking-widest hidden sm:inline-block">Asset</span>
          </button>
        )}

        {onShowAdmin && (
          <button
            onClick={onShowAdmin}
            className="group flex items-center gap-[clamp(0.5rem,1.5vw,1rem)] px-[clamp(0.75rem,2vw,1.25rem)] py-[clamp(0.5rem,1.5vh,1rem)] bg-slate-900/80 backdrop-blur-lg hover:bg-indigo-600 border border-white/10 hover:border-indigo-400 rounded-[clamp(0.75rem,2vw,1.25rem)] transition-all duration-300 shadow-2xl hover:shadow-indigo-600/40 hover:scale-110 active:scale-95"
            title="Console di Debug"
          >
            <Bug className="w-[clamp(1rem,3vw,1.5rem)] h-[clamp(1rem,3vw,1.5rem)] text-indigo-400 group-hover:text-white group-hover:animate-bounce" />
            <span className="text-[clamp(9px,1.5vw,11px)] font-black text-white uppercase tracking-widest hidden sm:inline-block">Debug</span>
          </button>
        )}
      </div>
    </PageLayout>
  );
};
