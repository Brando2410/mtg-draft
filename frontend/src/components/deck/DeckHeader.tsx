import React from 'react';
import { Split, Activity, Clock } from 'lucide-react';

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
    <div className="h-14 sm:h-16 flex flex-row items-center justify-between px-2 sm:px-6 bg-slate-900 border-b border-white/5 shadow-2xl z-20 gap-2 sm:gap-4 overflow-hidden">
      {/* Sinistra: Titolo e Stato */}
      <div className="flex flex-col items-start leading-none shrink-0 min-w-0">
        <h2 className="text-[10px] sm:text-xl font-black text-white uppercase tracking-tighter leading-none truncate">
          Revisiona {timeLeft === null && <span className="text-indigo-500 ml-1">Mazzo</span>}
        </h2>
        {isPaused && (
          <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[7px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Pausa</span>
          </div>
        )}
      </div>

      {/* Centro/Destra: Gruppo Unificato di Controlli */}
      <div className="flex items-center gap-1.5 sm:gap-4 flex-1 justify-end min-w-0">
        
        {/* Gruppo Azioni Deck */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={onToggleSeparate}
            className={`flex items-center justify-center p-2 sm:px-4 sm:py-2 rounded-lg transition-all border shrink-0 ${
              separateByType ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-500 border-slate-700/50 hover:text-white'
            }`}
            title={separateByType ? 'Stack Cards' : 'Separate Cards'}
          >
            <Split className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button 
            onClick={onOpenStats}
            className="flex items-center gap-1 px-1.5 sm:px-4 py-1.5 sm:py-2 bg-slate-950/40 hover:bg-slate-800 text-indigo-400 hover:text-white rounded-lg border border-white/5 transition-all shrink-0"
          >
            <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest">Stats</span>
          </button>
        </div>

        {/* Timer */}
        {timeLeft !== null && timeLeft !== undefined && (
          <div className="flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 bg-slate-950/60 rounded-lg border border-white/5 shrink-0">
            <Clock className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
            <span className={`text-[10px] sm:text-lg font-black tabular-nums tracking-tighter ${timeLeft <= 10 ? 'text-red-500' : 'text-white/90'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}

        {/* Gruppo Gestione Sessione */}
        <div className="flex items-center gap-1.5">
          {isPaused && isHost && (
            <button 
              onClick={onTogglePause}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[7px] sm:text-[9px] font-black uppercase rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-500/20 shrink-0"
            >
              Riprendi
            </button>
          )}
          <button 
            onClick={onClose} 
            className="px-2 sm:px-8 py-1.5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[7px] sm:text-[10px] tracking-widest rounded-lg transition-all shadow-xl active:scale-95 border border-indigo-400/20 shrink-0"
          >
            <span className="sm:hidden">{timeLeft === null ? 'Home' : 'Chiudi'}</span>
            <span className="hidden sm:inline">{timeLeft === null ? 'Torna alla Home' : 'Chiudi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
