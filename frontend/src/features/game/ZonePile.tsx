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
        className={`flex flex-col items-center gap-[var(--sp-2)] group cursor-pointer pointer-events-auto`}
    >
        <div className="relative w-[calc(var(--u)*14.5)] h-[calc(var(--u)*20.2)] group-hover:ring-[calc(var(--u)*0.4)] group-hover:ring-indigo-400/80 group-hover:shadow-[0_0_25px_rgba(129,140,248,0.6)] rounded-lg transition-all duration-300">
            {/* STACK DEPTH EFFECT */}
            {Array.from({ length: depth }).map((_, i) => (
                <div 
                    key={i}
                    className={`absolute inset-0 rounded-lg border border-white/5 shadow-sm
                        ${isLibrary ? 'bg-[#1a1c24] border-black/40' : 'bg-slate-900'}
                    `}
                    style={{ 
                        transform: `translate(calc(var(--u) * ${i * 0.2}), calc(var(--u) * ${-i * 0.2}))`,
                        zIndex: -i
                    }}
                />
            ))}

            {/* TOP CARD FACE */}
            <div className={`w-full h-full rounded-lg border border-white/20 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center 
                ${isLibrary ? 'bg-gradient-to-br from-[#1a1c24] to-[#0a0c10]' : 'bg-slate-900'}
            `}>
                {isLibrary ? (
                    <div className="flex flex-col items-center relative w-full h-full p-[var(--sp-4)]">
                         {/* Arena-style Card Back Placeholder */}
                         <div className="absolute inset-[calc(var(--u)*0.5)] border border-white/5 rounded-md" />
                         <div className="mt-[var(--sp-8)] w-[calc(var(--u)*10)] h-[calc(var(--u)*14)] rounded-full bg-indigo-500/5 blur-xl absolute" />
                         <div className="relative flex flex-col items-center gap-[var(--sp-2)] mt-auto mb-[var(--sp-4)]">
                             <div className="w-[calc(var(--u)*6)] h-[calc(var(--u)*6)] rounded-full border-[calc(var(--u)*0.2)] border-indigo-500/20 flex items-center justify-center">
                                 <div className="w-[calc(var(--u)*3)] h-[calc(var(--u)*3)] bg-indigo-500/10 rounded-full blur-sm" />
                             </div>
                             <span className="text-[var(--fs-xs)] font-black uppercase text-white/20 tracking-[0.4em]">MAGIC</span>
                         </div>
                    </div>
                ) : effectiveTopCard ? (
                    <img src={effectiveTopCard.definition.image_url} className="w-full h-full object-cover" alt="" />
                 ) : (
                    <div className="flex flex-col items-center gap-[var(--sp-4)] opacity-20">
                         <div className="w-[calc(var(--u)*10)] h-[calc(var(--u)*10)] rounded-full border border-white/10 flex items-center justify-center">
                             <div className="w-[calc(var(--u)*5)] h-[calc(var(--u)*5)] bg-white/5 rounded-sm rotate-45" />
                         </div>
                         <div className="text-[var(--fs-xs)] font-black text-white uppercase tracking-widest italic">{label}</div>
                    </div>
                )}
                
                {/* COUNT BADGE (Arena Style) */}
                <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-[2px] py-[calc(var(--u)*0.3)] px-1 flex items-center justify-center gap-1.5 border-t border-white/10">
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
