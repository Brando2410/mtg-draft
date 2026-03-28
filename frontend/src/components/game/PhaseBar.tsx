import { Phase, type PendingAction } from '@shared/engine_types';
import { ChevronRight, X, Play } from 'lucide-react';

interface PhaseBarProps {
  currentPhase: Phase;
  currentStep: string;
  turnNumber: number;
  hasPriority: boolean;
  pendingAction?: PendingAction;
  onPassPriority: () => void;
  onBack: () => void;
}

export const PhaseBar = ({ currentPhase, currentStep, turnNumber, hasPriority, pendingAction, onPassPriority, onBack }: PhaseBarProps) => {
  
  const getActionLabel = (action: PendingAction) => {
    switch(action.type) {
      case 'DECLARE_ATTACKERS': return 'DICHIARA ATTACCANTI';
      case 'DECLARE_BLOCKERS': return 'DICHIARA BLOCCANTI';
      case 'DISCARD': return 'SCARTA CARTE';
      case 'TARGETING': return 'SCEGLI BERSAGLIO';
      default: return 'AZIONE OBBLIGATORIA';
    }
  };

  const isAlertStatus = !!pendingAction;
  return (
    <div className="h-12 bg-slate-900/80 border-b border-white/5 backdrop-blur-md flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${
            isAlertStatus ? 'bg-red-500/20 border-red-500/40' : 
            hasPriority ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800/10 border-white/5'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isAlertStatus ? 'bg-red-500 animate-ping' :
              hasPriority ? 'bg-indigo-500 animate-pulse' : 'bg-slate-600'
            }`} />
            <span className={`text-[10px] font-black uppercase tracking-tighter ${
              isAlertStatus ? 'text-red-400' :
              hasPriority ? 'text-indigo-400' : 'text-slate-500'
            }`}>
               {pendingAction ? getActionLabel(pendingAction) : hasPriority ? 'Tua Priorità' : 'Attesa Avversario'}
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Turno</span>
            <span className="text-sm font-black text-indigo-400 italic">#{turnNumber}</span>
          </div>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
          <span className="text-[11px] font-black text-white uppercase tracking-widest">{currentStep}</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentPhase === Phase.Beginning ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500'}`}>
            Inizio 
          </span>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentPhase === Phase.PreCombatMain ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500'}`}>
            Main 1 {currentPhase === Phase.PreCombatMain && <span className="text-[8px] opacity-60 ml-1">({currentStep})</span>}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentPhase === Phase.Combat ? 'bg-red-500/20 text-red-400' : 'text-slate-500'}`}>
            Combat
          </span>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentPhase === Phase.PostCombatMain ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500'}`}>
            Main 2
          </span>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentPhase === Phase.Ending ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500'}`}>
            Fine
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onPassPriority}
          className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-tighter transition-all flex items-center gap-2 ${hasPriority ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] animate-pulse' : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'}`}
        >
          {hasPriority ? <Play className="w-3 h-3 fill-current" /> : null}
          {hasPriority ? 'Passa Fase' : 'Attesa...'}
        </button>
        <div className="h-4 w-px bg-white/10" />
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
