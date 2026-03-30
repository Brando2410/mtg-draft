import { type GameObject } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerHandProps {
  hand: GameObject[];
  onPlayCard?: (cardId: string) => void;
  pendingDiscardCount?: number;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
}

export const PlayerHand = ({ hand, onPlayCard, pendingDiscardCount = 0, onHoverStart, onHoverEnd }: PlayerHandProps) => {
  const isDiscardMode = pendingDiscardCount > 0;
  return (
    <div className="h-56 bg-slate-900/95 border-t border-white/10 backdrop-blur-2xl flex items-center justify-center z-20 overflow-visible px-20">
      {hand.length === 0 ? (
        <div className="text-slate-600 font-black uppercase text-[10px] tracking-widest italic animate-pulse">
          La tua mano è vuota
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full gap-2 relative">
          <AnimatePresence>
            {hand.map((card, index) => (
              <motion.div
                key={card.id}
                layoutId={card.id}
                initial={{ y: 100, opacity: 0, rotate: index % 2 === 0 ? 5 : -5 }}
                animate={{ 
                  y: 0, 
                  opacity: 1, 
                  rotate: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={card.definition.types?.includes('Land') 
                  ? { y: 200, opacity: 0, scale: 0.8, filter: 'blur(10px)' } 
                  : { y: -400, opacity: 0, scale: 1.5, filter: 'brightness(2) blur(5px)' }
                }
                whileHover={{ 
                  y: -60, 
                  scale: 1.25, 
                  zIndex: 100,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                onMouseEnter={() => onHoverStart?.(card)}
                onMouseLeave={() => onHoverEnd?.()}
                className={`relative group shrink-0 cursor-pointer -ml-8 first:ml-0 ${card.effectiveStats?.isPlayable ? 'z-10' : ''}`}
                onClick={() => onPlayCard?.(card.id)}
              >
                <img 
                  src={card.definition.image_url} 
                  alt={card.definition.name}
                  className={`w-32 h-44 object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 select-none transition-all duration-300 ${
                    card.effectiveStats?.isPlayable
                    ? 'ring-4 ring-cyan-500/60 shadow-[0_0_40px_rgba(34,211,238,0.7)] border-cyan-400'
                    : isDiscardMode 
                    ? 'group-hover:border-red-500/50 group-hover:shadow-[0_0_50px_rgba(239,68,68,0.4)]' 
                    : 'group-hover:border-cyan-500/50 group-hover:shadow-[0_0_50px_rgba(34,211,238,0.4)]'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://cards.scryfall.io/large/front/2/d/2dfe1926-c0d5-40a2-b1aa-988524aefc31.jpg';
                  }}
                />
                
                {/* HINT PER PLAY/DISCARD */}
                <div className={`absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white whitespace-nowrap pointer-events-none shadow-2xl border border-white/20 ${
                  isDiscardMode ? 'bg-red-600' : 'bg-indigo-600'
                }`}>
                   {isDiscardMode ? 'Clicca per scartare' : 'Clicca per lanciare'}
                </div>

                {/* MANA COST OVERLAY (OPTIONAL) */}
                {card.definition.manaCost && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold text-white border border-white/10 backdrop-blur-sm">
                    {card.definition.manaCost}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
