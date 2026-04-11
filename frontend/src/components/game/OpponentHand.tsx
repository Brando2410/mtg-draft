import { type GameObject } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCard } from './GameCard';

interface OpponentHandProps {
  hand: GameObject[];
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
}

/**
 * Opponent's Hand tucked at the top of the screen.
 * Cards are inverted and sit slightly below the top edge.
 */
export const OpponentHand = ({ hand, onHoverStart, onHoverEnd }: OpponentHandProps) => {
  const cardCount = hand.length;

  const getCardRotation = (index: number) => {
    if (cardCount <= 1) return 0;
    const middle = (cardCount - 1) / 2;
    // Shallower spread like the reference image
    return (index - middle) * (15 / Math.max(cardCount - 1, 1)); 
  };

  const getCardY = (index: number) => {
    const middle = (cardCount - 1) / 2;
    const offset = Math.abs(index - middle);
    // Move cards further 'outside' the view (deeper negative Y)
    return -40 - (offset * 4); 
  };

  const getCardX = (index: number) => {
    const middle = (cardCount - 1) / 2;
    // Wider horizontal spread matching the reference image
    const spacing = Math.min(65, 1200 / Math.max(cardCount, 1));
    return (index - middle) * spacing;
  };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-32 flex items-start justify-center z-[600] pointer-events-none">
      <div className="relative w-full h-full flex items-start justify-center">
        <AnimatePresence>
          {hand.map((card, index) => {
            const rotation = getCardRotation(index);
            const xBase = getCardX(index);
            const yBase = getCardY(index);
            const isRevealed = (card as any).isRevealed;
            
            return (
              <motion.div
                key={card.id || index}
                initial={{ y: -200, opacity: 0 }}
                animate={{ 
                  y: yBase, 
                  x: xBase,
                  opacity: 1, 
                  rotate: rotation + 180, // Facing towards battlefield
                  transition: { type: 'spring', stiffness: 100, damping: 20 }
                }}
                exit={{ y: -200, opacity: 0 }}
                whileHover={isRevealed ? { 
                    y: yBase + 40, 
                    zIndex: 100,
                    scale: 1.1,
                    transition: { type: 'spring', stiffness: 400, damping: 25 }
                } : {}}
                className="absolute w-20 h-28 origin-center pointer-events-auto cursor-help"
                onMouseEnter={() => isRevealed && onHoverStart?.(card)}
                onMouseLeave={() => isRevealed && onHoverEnd?.()}
              >
                {isRevealed ? (
                    <div className="w-full h-full scale-[0.65] origin-center -translate-y-5">
                         <GameCard obj={card} variant="hand" isOpponent />
                    </div>
                ) : (
                    /* MTG CARD BACK */
                    <div className="w-full h-full bg-[#1a1c24] rounded-md border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
                        <div className="absolute inset-1.5 border border-white/5 rounded" />
                        {/* Minimalist MTG pattern */}
                        <div className="w-10 h-14 rounded-full bg-indigo-500/5 blur-lg" />
                        <div className="text-[5px] font-black text-white/5 uppercase tracking-[0.4em] scale-75">MTG</div>
                    </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
