import { Pause, Play, Orbit, Clock, Library, Layers } from 'lucide-react';
import type { Room, Player } from '@shared/types';

interface DraftHeaderProps {
  room: Room;
  playerId: string;
  timeLeft: number | null;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenTable: () => void;
  onOpenReview: () => void;
  currentPlayer?: Player;
  queuedCount: number;
}

export const DraftHeader = ({
  room,
  playerId,
  timeLeft,
  isPaused,
  onTogglePause,
  onOpenTable,
  onOpenReview,
  currentPlayer,
  queuedCount
}: DraftHeaderProps) => {
  const isHost = room.hostPlayerId === playerId;
  const packNumber = room.draftState?.round || 1;
  const cardsPerPack = room.rules.cardsPerPack || 15;
  const currentPick = ((currentPlayer?.pool?.length || 0) % cardsPerPack) + 1;

  const isUrgent = timeLeft !== null && timeLeft <= 10 && !isPaused;
  const redBgOpacity = isUrgent ? 0.2 + (0.8 * (1 - (timeLeft / 10))) : 0;
  const isTickingRed = isUrgent && timeLeft % 2 !== 0;

  return (
    <header className="relative portrait:fixed portrait:top-0 portrait:left-0 portrait:right-0 z-[100] bg-slate-900/80 backdrop-blur-xl border-b border-white/5 
                       px-2 py-1.5 portrait:px-6 portrait:py-4 lg:px-10 lg:py-6 shrink-0
                       max-lg:landscape:h-[75px] max-lg:landscape:flex max-lg:landscape:items-center">
      
      <div className="flex items-center justify-between w-full gap-2 portrait:gap-4 lg:gap-8">
        
        {/* Sinistra: Info Sessione */}
        <div className="flex items-center gap-2 portrait:gap-4 lg:gap-8 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-baseline lg:gap-3 max-lg:landscape:hidden">
            <h1 className="text-[10px] portrait:text-sm lg:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
              Pack <span className="text-indigo-500">{packNumber}</span>
            </h1>
            <p className="text-[6px] portrait:text-[9px] lg:text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5 lg:mt-0">
              Pick #{currentPick}
            </p>
          </div>
          
          {/* Badge Coda di Pick (Queue) - Spostato qui per visibilità immediata vicino a Pack/Pick */}
          {queuedCount > 1 && (
            <div className="relative group shrink-0" title={`${queuedCount - 1} pacchetti in attesa`}>
              <div className="p-1 px-1.5 portrait:p-2 portrait:px-3 lg:p-3 lg:px-4 bg-amber-500/10 rounded-lg lg:rounded-2xl border border-amber-500/20 shadow-lg animate-bounce-subtle">
                <Layers className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 text-amber-500" />
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[6px] portrait:text-[8px] lg:text-[10px] font-black rounded-full w-3 h-3 portrait:w-4 portrait:h-4 lg:w-6 lg:h-6 flex items-center justify-center shadow-md border border-slate-950">
                  {queuedCount - 1}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-center items-center gap-2 portrait:gap-4 lg:gap-8">
          <button 
            onClick={isHost ? onTogglePause : undefined}
            disabled={!isHost}
            className={`group relative flex items-center gap-1.5 portrait:gap-3 lg:gap-6 px-3 portrait:px-6 lg:px-10 py-1.5 portrait:py-3 lg:py-4 rounded-xl portrait:rounded-2xl lg:rounded-[2rem] border transition-all duration-300
              ${isUrgent && timeLeft <= 5 ? 'shadow-2xl shadow-red-500/20 animate-pulse' : 'bg-slate-950/40 border-white/5'}
              ${isHost ? 'hover:bg-indigo-600/20 hover:border-indigo-500/50 cursor-pointer active:scale-95' : 'cursor-default'}
              max-lg:landscape:px-4 max-lg:landscape:py-2.5 max-lg:landscape:rounded-xl`}
            style={{
              backgroundColor: isUrgent ? `rgba(220, 38, 38, ${redBgOpacity})` : undefined,
              borderColor: isUrgent ? `rgba(248, 113, 113, ${redBgOpacity})` : undefined,
              transform: isTickingRed ? 'scale(1.05)' : 'scale(1)'
            }}
            title={isHost ? (isPaused ? "Riprendi Draft" : "Pausa Draft") : undefined}
          >
            <div className="relative w-3 h-3 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 flex items-center justify-center">
              {isHost ? (
                <>
                  {isPaused ? (
                    <Play className="w-full h-full text-emerald-400 fill-current animate-pulse" />
                  ) : (
                    <>
                      <Clock className="w-full h-full text-slate-500 transition-all duration-300 group-hover:opacity-0 group-hover:scale-0" />
                      <Pause className="w-full h-full text-white absolute opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 fill-current" />
                    </>
                  )}
                </>
              ) : (
                <Clock className="w-full h-full text-slate-500" />
              )}
            </div>
            
            <div className="flex flex-col portrait:items-center">
              <span 
                className={`text-xs portrait:text-xl lg:text-4xl font-black italic tabular-nums leading-none transition-all duration-300 max-lg:landscape:text-lg inline-block
                ${isTickingRed ? 'text-red-400' : (isPaused ? 'text-emerald-400' : 'text-white')}`}
                style={{ transform: isTickingRed ? 'scale(1.1)' : 'scale(1)' }}
              >
                {timeLeft !== null ? `${timeLeft}s` : '--'}
              </span>
            </div>

            {isPaused && (
              <div className="absolute -top-1 portrait:-top-2 lg:-top-3 -right-1 portrait:-right-2 lg:-right-3 px-1.5 portrait:px-2 lg:px-4 py-0.5 portrait:py-1 lg:py-1.5 bg-amber-500 rounded-lg lg:rounded-xl text-[6px] portrait:text-[10px] lg:text-xs font-black uppercase text-slate-900 tracking-tighter shadow-lg shadow-amber-500/20">
                Pausa
              </div>
            )}
          </button>
        </div>

        {/* Destra: Azioni e Pool - Spaziati */}
        <div className="flex items-center gap-2 portrait:gap-4 lg:gap-8 shrink-0">
          
          <div className="flex items-center gap-2 portrait:gap-3 lg:gap-5">
            <button 
              onClick={onOpenTable}
              className="p-1 max-lg:landscape:p-2.5 portrait:p-3 lg:p-5 bg-slate-800/50 hover:bg-slate-700 border border-white/5 rounded-lg portrait:rounded-2xl lg:rounded-3xl text-slate-400 hover:text-white transition-all active:scale-95"
              title="Tavolo Draft"
            >
              <Orbit className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5" />
            </button>

            <button 
              onClick={onOpenReview}
              className="relative p-1 max-lg:landscape:p-2.5 portrait:p-3 lg:p-5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 rounded-lg portrait:rounded-2xl lg:rounded-3xl text-indigo-400 hover:text-white transition-all active:scale-95 shadow-2xl shadow-indigo-600/10"
              title="Revisione Deck"
            >
              <Library className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
