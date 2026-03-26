import React, { useState, useEffect } from 'react';
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
  
  const [radiusX, setRadiusX] = useState(150);
  const [radiusY, setRadiusY] = useState(150);
  
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const vmin = Math.min(vw, vh);
      
      // Calcolo raggio dinamico
      const isMobile = vw < 1024;
      
      const safeX = isMobile ? 120 : 250; 
      const safeY = isMobile ? 180 : 250;
      
      const rx = isMobile ? Math.max(70, (vw - safeX) / 2.1) : Math.max(70, (vmin - 250) / 2.2);
      const ry = isMobile ? Math.max(70, (vh - safeY) / 2.1) : rx;
      
      setRadiusX(rx);
      setRadiusY(ry);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const avatarSize = isVerySmallHeight ? 'w-10 h-10' : (isSmallHeight ? 'w-12 h-12' : 'w-20 h-20 sm:w-24 sm:h-24');
  const centerSize = isVerySmallHeight ? 'w-12 h-12' : (isSmallHeight ? 'w-16 h-16' : 'w-24 h-24 sm:w-32 sm:h-32');

  return (
    <div className="fixed inset-0 z-[550] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-2 sm:p-6 animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full h-full lg:h-auto lg:max-w-4xl lg:aspect-square bg-slate-900/40 border-0 lg:border border-white/5 lg:rounded-[4rem] rounded-none shadow-2xl overflow-hidden flex flex-col items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 landscape:top-4 p-3 bg-slate-800/50 hover:bg-red-500/20 rounded-full transition-all text-slate-400 hover:text-red-500 z-[560]">
          <X className="w-5 h-5 sm:w-6 h-6" />
        </button>
        
        <div className="absolute top-6 left-8 sm:top-12 sm:left-16 landscape:top-6 z-20">
          <h3 className="text-sm sm:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1 sm:mb-2 italic">Draft <span className="text-amber-500">Table</span></h3>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
          <svg className="absolute w-full h-full pointer-events-none overflow-visible">
            <ellipse 
              cx="50%" cy="50%" 
              rx={radiusX} ry={radiusY}
              className={`fill-none stroke-indigo-500/20 ${round % 2 !== 0 ? 'animate-dash-reverse' : 'animate-dash'}`}
              strokeWidth="2"
              strokeDasharray="10 10"
            />
          </svg>
          
          {room.players.map((p, idx) => {
            const totalPlayers = room.players.length;
            const angle = (idx / totalPlayers) * 2 * Math.PI - Math.PI / 2;
            const x = Math.cos(angle) * radiusX;
            const y = Math.sin(angle) * radiusY;
            
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
          </div>
        </div>
      </div>
    </div>
  );
};
