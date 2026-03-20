import React from 'react';
import { X, Clock } from 'lucide-react';
import type { Room } from '@shared/types';

const AVATARS = [
  'ajani.png', 'alena_halana.png', 'angrath.png', 'aragorn.png', 'ashiok.png',
  'astarion.png', 'atraxa.png', 'aurelia.png', 'basri.png', 'baylen.png',
  'beckett.png', 'borborygmos.png', 'braids.png', 'chandra.png', 'cruelclaw.png',
  'davriel.png', 'dina.png', 'domri.png', 'dovin.png', 'elesh_norn.png'
];

interface TableViewModalProps {
  room: Room;
  playerId: string | null;
  round: number;
  onClose: () => void;
  timeLeft: number | null;
}

export const TableViewModal: React.FC<TableViewModalProps> = ({
  room,
  playerId,
  round,
  onClose,
  timeLeft
}) => {
  const isSmallHeight = typeof window !== 'undefined' && window.innerHeight < 600;
  const isVerySmallHeight = typeof window !== 'undefined' && window.innerHeight < 420;
  const isAnonymous = room.rules?.anonymousMode;
  
  const baseRadius = isVerySmallHeight ? 75 : (isSmallHeight ? 100 : 180);
  const avatarSize = isVerySmallHeight ? 'w-10 h-10' : (isSmallHeight ? 'w-14 h-14' : 'w-20 h-20');
  const centerSize = isVerySmallHeight ? 'w-16 h-16' : (isSmallHeight ? 'w-24 h-24' : 'w-32 h-32');

  return (
    <div className="fixed inset-0 z-[550] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-2 sm:p-6 animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-slate-900/40 border border-white/5 sm:rounded-[3rem] rounded-3xl shadow-2xl overflow-hidden h-full max-h-[95vh] sm:h-auto p-4 sm:p-10 flex flex-col items-center justify-center landscape:flex-row-reverse landscape:gap-8 lg:flex-col lg:gap-0" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-slate-800/50 hover:bg-red-500/20 rounded-full transition-all text-slate-400 hover:text-red-500 z-[560]">
          <X className="w-5 h-5 sm:w-6 h-6" />
        </button>
        
        <div className="text-center mb-4 sm:mb-12 shrink-0 landscape:mb-0 landscape:text-left landscape:w-48 lg:mb-12 lg:text-center lg:w-auto">
          <h3 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1 sm:mb-2">Stato del <span className="text-amber-500">Tavolo</span></h3>
          <p className="text-slate-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.3em]">Pack #{round} • {round % 2 !== 0 ? 'Orario' : 'Antiorario'}</p>
          
          <div className="hidden landscape:block lg:hidden mt-6 space-y-4">
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 backdrop-blur-md">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Direzione</span>
              <span className="text-lg font-black text-white uppercase italic">{round % 2 !== 0 ? 'Sinistra' : 'Destra'}</span>
            </div>
          </div>
        </div>

        <div className="relative w-full aspect-square flex items-center justify-center grow shrink min-h-0 landscape:h-full landscape:w-auto landscape:max-w-full lg:h-auto lg:w-full lg:aspect-square">
          <div className={`absolute border-2 sm:border-4 border-dashed border-indigo-500/10 rounded-full ${round % 2 !== 0 ? 'animate-spin-slow' : 'animate-reverse-spin-slow'}`} 
               style={{ 
                 width: `calc(${baseRadius} * 2px)`, 
                 height: `calc(${baseRadius} * 2px)` 
               }} 
          />
          
          {room.players.map((p, idx) => {
            const totalPlayers = room.players.length;
            const angle = (idx / totalPlayers) * 2 * Math.PI - Math.PI / 2;
            const x = Math.cos(angle) * baseRadius;
            const y = Math.sin(angle) * baseRadius;
            
            const qCount = room.draftState?.queues[idx]?.length || 0;
            const isMe = p.playerId === playerId;
            const isThinking = !!room.draftState?.playerTimers?.[p.playerId];

            return (
              <div 
                 key={p.playerId} 
                 className="absolute transition-all duration-700 flex flex-col items-center gap-1 sm:gap-2"
                 style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                 <div className={`relative ${avatarSize} rounded-full flex items-center justify-center border-2 sm:border-4 transition-all overflow-hidden ${
                    isMe ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 
                    isThinking ? 'bg-slate-800 border-amber-500/50' : 'bg-slate-900 border-slate-700'
                 }`}>
                    {isAnonymous && !isMe ? (
                       <img src={`/avatars/${AVATARS[idx % AVATARS.length]}`} alt="Avatar" className="w-full h-full object-cover opacity-60 grayscale-[0.5]" />
                    ) : p.avatar ? (
                       <img src={`/avatars/${p.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-tighter">
                          {p.name.substring(0,2)}
                       </span>
                    )}
                  </div>
                  
                  {qCount > 0 && (
                     <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 h-8 bg-amber-500 rounded-lg flex flex-col items-center justify-center shadow-lg animate-bounce-slow z-20 border border-slate-950/20">
                        <span className="text-[10px] sm:text-[12px] font-black text-slate-950 leading-none">{qCount}</span>
                        <span className="text-[5px] sm:text-[6px] font-black text-slate-950/70 uppercase leading-none hidden sm:block mt-0.5">Packs</span>
                     </div>
                  )}

                  {isThinking && (
                     <div className="absolute -bottom-1 -left-1 z-20">
                        <Clock className={`w-4 h-4 sm:w-5 h-5 ${timeLeft !== null && timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-500'} bg-slate-950 rounded-full p-0.5 sm:p-1 shadow-md border border-white/5`} />
                     </div>
                  )}
                 
                 <div className="text-center px-2 sm:px-3 py-0.5 sm:py-1 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-md max-w-[80px] sm:max-w-none truncate">
                    <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-widest block truncate ${isMe ? 'text-indigo-400' : 'text-slate-400'}`}>
                       {isAnonymous && !isMe ? '???' : p.name}
                    </span>
                 </div>
              </div>
            );
          })}

          <div className={`absolute inset-x-0 inset-y-0 m-auto ${centerSize} bg-slate-950/50 rounded-full border border-slate-800/50 backdrop-blur-md flex flex-col items-center justify-center z-10 shadow-inner shrink-0`}>
            <span className="text-[6px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Pack</span>
            <span className="text-xl sm:text-5xl font-black text-white leading-tight">{round}</span>
            <div className="hidden sm:flex items-center gap-1 mt-1">
               <div className={`w-2 h-2 rounded-full ${round%2!==0 ? 'bg-indigo-500' : 'bg-rose-500'}`} />
               <span className="text-[8px] font-black text-slate-400 uppercase">{round%2!==0 ? 'Sinistra' : 'Destra'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
