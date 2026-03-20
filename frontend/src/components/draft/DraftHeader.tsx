import { Layout, Pause, Play, Users, Clock, Package } from 'lucide-react';
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
  const currentPick = (currentPlayer?.pool?.length || 0) + 1;

  // Header per Mobile Landscape (Altamente Compresso)
  // Header per Desktop (Spazioso e Iconico)
  // Header per Mobile Portrait (Stack Verticale)

  return (
    <header className="relative portrait:fixed portrait:top-0 portrait:left-0 portrait:right-0 z-[100] bg-slate-900/80 backdrop-blur-xl border-b border-white/5 
                       px-2 py-1.5 portrait:px-6 portrait:py-4 lg:px-10 lg:py-6 shrink-0
                       max-lg:landscape:h-[75px] max-lg:landscape:flex max-lg:landscape:items-center">
      
      <div className="flex items-center justify-between w-full gap-2 portrait:gap-4 lg:gap-8">
        
        {/* Sinistra: Info Sessione */}
        <div className="flex items-center gap-2 portrait:gap-4 lg:gap-8 shrink-0">
          <div className="flex flex-col max-lg:landscape:hidden">
            <h1 className="text-[10px] portrait:text-sm lg:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
              Pack <span className="text-indigo-500">{packNumber}</span>
            </h1>
            <p className="text-[6px] portrait:text-[9px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Pick #{currentPick}
            </p>
          </div>
          
          {/* Versione Landscape Mobile: Pack info estesa e leggibile */}
          <div className="hidden max-lg:landscape:flex items-center gap-3">
            <span className="text-[14px] font-black text-white italic uppercase leading-none">
              Pack <span className="text-indigo-400">{packNumber}</span>
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[14px] font-black text-white italic uppercase leading-none">
              Pick <span className="text-indigo-400">{currentPick}</span>
            </span>
          </div>
        </div>

        {/* Centro: Timer e Code di Pick - Ora con Pulsante Pausa Host a sinistra */}
        <div className="flex-1 flex justify-center items-center gap-2 portrait:gap-4 lg:gap-8">
          {isHost && (
            <button 
              onClick={onTogglePause}
              className={`p-2 portrait:p-3 lg:p-5 border rounded-xl portrait:rounded-2xl lg:rounded-[1.5rem] transition-all active:scale-95 shadow-2xl shrink-0
                ${isPaused 
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/20' 
                  : 'bg-amber-600/20 border-amber-500/30 text-amber-500 hover:bg-amber-600 hover:text-white shadow-amber-500/10'
                }
                max-lg:landscape:p-2.5`}
              title={isPaused ? "Riprendi" : "Metti in Pausa"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 max-lg:landscape:w-5 max-lg:landscape:h-5 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 fill-current" /> : <Pause className="w-3.5 h-3.5 max-lg:landscape:w-5 max-lg:landscape:h-5 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 fill-current" />}
            </button>
          )}

          <div className={`relative flex items-center gap-1.5 portrait:gap-3 lg:gap-6 px-3 portrait:px-6 lg:px-10 py-1.5 portrait:py-3 lg:py-4 rounded-xl portrait:rounded-2xl lg:rounded-[2rem] border transition-all duration-500
            ${timeLeft !== null && timeLeft <= 5 && !isPaused ? 'bg-red-500/10 border-red-500/50 shadow-2xl shadow-red-500/20 animate-pulse' : 'bg-slate-950/40 border-white/5'}
            max-lg:landscape:px-4 max-lg:landscape:py-2.5 max-lg:landscape:rounded-xl`}>
            
            <Clock className={`w-3 h-3 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 transition-colors max-lg:landscape:w-5 max-lg:landscape:h-5 ${timeLeft !== null && timeLeft <= 5 ? 'text-red-500' : 'text-slate-500'}`} />
            
            <div className="flex flex-col portrait:items-center">
              <span className={`text-xs portrait:text-xl lg:text-4xl font-black italic tabular-nums leading-none transition-colors max-lg:landscape:text-lg
                ${timeLeft !== null && timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}>
                {timeLeft !== null ? `${timeLeft}s` : '--'}
              </span>
            </div>

            {isPaused && (
              <div className="absolute -top-1 portrait:-top-2 lg:-top-3 -right-1 portrait:-right-2 lg:-right-3 px-1.5 portrait:px-2 lg:px-4 py-0.5 portrait:py-1 lg:py-1.5 bg-amber-500 rounded-lg lg:rounded-xl text-[6px] portrait:text-[10px] lg:text-xs font-black uppercase text-slate-900 tracking-tighter">
                Pausa
              </div>
            )}
          </div>

          {/* Badge Coda di Pick (Queue) - Spinto a destra del timer */}
          {queuedCount > 1 && (
            <div className="relative group shrink-0" title={`${queuedCount - 1} pacchetti in attesa`}>
              <div className="p-2 portrait:p-3 lg:p-4 bg-amber-500/10 rounded-xl lg:rounded-2xl border border-amber-500/20 shadow-lg animate-bounce-subtle">
                <Layout className="w-4 h-4 portrait:w-5 portrait:h-5 lg:w-8 lg:h-8 text-amber-500" />
                <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[8px] portrait:text-[10px] lg:text-xs font-black rounded-full w-4 h-4 portrait:w-6 portrait:h-6 lg:w-8 lg:h-8 flex items-center justify-center shadow-xl border-2 border-slate-950">
                  {queuedCount - 1}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Destra: Azioni e Pool - Spaziati */}
        <div className="flex items-center gap-2 portrait:gap-4 lg:gap-8 shrink-0">
          
          <div className="flex items-center gap-2 portrait:gap-3 lg:gap-5">
            <button 
              onClick={onOpenTable}
              className="p-1 max-lg:landscape:p-2.5 portrait:p-3 lg:p-5 bg-slate-800/50 hover:bg-slate-700 border border-white/5 rounded-lg portrait:rounded-2xl lg:rounded-3xl text-slate-400 hover:text-white transition-all active:scale-95"
              title="Tavolo Draft"
            >
              <Users className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5" />
            </button>

            <button 
              onClick={onOpenReview}
              className="relative p-1 max-lg:landscape:p-2.5 portrait:p-3 lg:p-5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 rounded-lg portrait:rounded-2xl lg:rounded-3xl text-indigo-400 hover:text-white transition-all active:scale-95 shadow-2xl shadow-indigo-600/10"
              title="Revisione Deck"
            >
              <Package className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-7 lg:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
