import React from 'react';
import { Split, Activity, Clock, PauseCircle } from 'lucide-react';

interface DeckHeaderProps {
  isPaused: boolean;
  separateByType: boolean;
  onToggleSeparate: () => void;
  onOpenStats: () => void;
  timeLeft: number | null | undefined;
  isHost: boolean;
  onTogglePause?: () => void;
  onClose: () => void;
  formatTime: (seconds: number) => string;
}

export const DeckHeader: React.FC<DeckHeaderProps> = ({
  isPaused,
  separateByType,
  onToggleSeparate,
  onOpenStats,
  timeLeft,
  isHost,
  onTogglePause,
  onClose,
  formatTime
}) => {
  return (
    <div className="h-auto sm:h-16 flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-0 bg-slate-900 border-b border-white/5 shadow-2xl z-20 gap-2">
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tighter leading-none">Revisiona</h2>
          {isPaused && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-pulse">
              <PauseCircle className="w-2.5 h-2.5 text-amber-500" />
              <span className="text-[7px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Pausa</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleSeparate}
            className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[7px] sm:text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
              separateByType ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-500 border-slate-700/50 hover:text-white'
            }`}
          >
            <Split className="w-3 h-3" />
            <span>{separateByType ? 'Separa' : 'Stack'}</span>
          </button>
          
          <button 
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-950/40 hover:bg-slate-800 text-indigo-400 hover:text-white rounded-lg border border-white/5 transition-all shadow-inner group shrink-0"
          >
            <Activity className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest">Stats</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-6 border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
        {timeLeft !== null && timeLeft !== undefined && (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 rounded-xl border border-white/5 shadow-inner">
            <Clock className={`w-3 h-3 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
            <span className={`text-sm sm:text-lg font-black tabular-nums tracking-tighter ${timeLeft <= 10 ? 'text-red-500 font-black' : 'text-white/90'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 grow sm:grow-0 justify-end">
          {isPaused && isHost && (
            <button 
              onClick={onTogglePause}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[7px] sm:text-[9px] font-black uppercase rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-500/20"
            >
              Riprendi
            </button>
          )}
          <button 
            onClick={onClose} 
            className="px-5 sm:px-8 py-1.5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[8px] sm:text-[10px] tracking-widest rounded-lg transition-all shadow-xl active:scale-95 border border-indigo-400/20"
          >
            {timeLeft === null ? 'Torna alla Home' : 'Chiudi'}
          </button>
        </div>
      </div>
    </div>
  );
};
