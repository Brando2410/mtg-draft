import { memo } from 'react';
import { type GameObject } from '@shared/engine_types';

interface ZonePileProps {
  label: string;
  count: number;
  topCard?: GameObject;
  cards?: GameObject[];
  onClick?: () => void;
  type?: 'library' | 'graveyard' | 'exile';
}

/**
 * Standard MTG Zone Pile (Library, Graveyard, Exile).
 * Visualized as a 3D pile of cards.
 */
export const ZonePile = memo(({ label, count, topCard, cards, onClick, type = 'library' }: ZonePileProps) => {
  // pick top card from array if not provided explicitly
  const effectiveTopCard = topCard || (cards && cards.length > 0 ? cards[cards.length - 1] : undefined);
  
  // Visual pile depth based on count
  const depth = Math.min(6, Math.ceil(count / 10));

  const isLibrary = type === 'library';

  return (
    <div 
        onClick={onClick}
        className={`flex flex-col items-center gap-[1vh] group cursor-pointer pointer-events-auto`}
    >
        <div className="relative w-[10vh] h-[13.5vh] group-hover:ring-[3px] group-hover:ring-indigo-400/80 group-hover:shadow-[0_0_25px_rgba(129,140,248,0.6)] rounded-lg transition-all duration-300">
            {/* STACK DEPTH EFFECT */}
            {Array.from({ length: depth }).map((_, i) => (
                <div 
                    key={i}
                    className={`absolute inset-0 rounded-lg border border-white/5 shadow-sm
                        ${isLibrary ? 'bg-[#1a1c24] border-black/40' : 'bg-slate-900'}
                    `}
                    style={{ 
                        transform: `translate(${i * 1.5}px, ${-i * 1.5}px)`,
                        zIndex: -i
                    }}
                />
            ))}

            {/* TOP CARD FACE */}
            <div className={`w-full h-full rounded-lg border border-white/20 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center 
                ${isLibrary ? 'bg-gradient-to-br from-[#1a1c24] to-[#0a0c10]' : 'bg-slate-900'}
            `}>
                {isLibrary ? (
                    <div className="flex flex-col items-center relative w-full h-full p-4">
                         {/* Arena-style Card Back Placeholder */}
                         <div className="absolute inset-2 border border-white/5 rounded-md" />
                         <div className="mt-8 w-12 h-16 rounded-full bg-indigo-500/5 blur-xl absolute" />
                         <div className="relative flex flex-col items-center gap-2 mt-auto mb-4">
                             <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                                 <div className="w-4 h-4 bg-indigo-500/10 rounded-full blur-sm" />
                             </div>
                             <span className="text-[7px] font-black uppercase text-white/20 tracking-[0.4em]">MAGIC</span>
                         </div>
                    </div>
                ) : effectiveTopCard ? (
                    <img src={effectiveTopCard.definition.image_url} className="w-full h-full object-cover" alt="" />
                ) : (
                    <div className="flex flex-col items-center gap-4 opacity-20">
                         <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                             <div className="w-6 h-6 bg-white/5 rounded-sm rotate-45" />
                         </div>
                         <div className="text-[8px] font-black text-white uppercase tracking-widest italic">{label}</div>
                    </div>
                )}
                
                {/* COUNT BADGE (Arena Style) */}
                <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-[2px] py-[0.1vh] px-1 flex items-center justify-center gap-1.5 border-t border-white/10">
                     <span className="text-[calc(var(--u)*1.2)] font-black text-white/50 uppercase tracking-tight italic select-none leading-none">
                        {label}
                     </span>
                     <span className="text-white/20 font-black text-[calc(var(--u)*1.2)] leading-none">-</span>
                     <span className="text-[calc(var(--u)*1.2)] font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] leading-none">
                        {count}
                     </span>
                </div>
            </div>

        </div>
    </div>
  );
});
