import { type GameObject } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCard } from './GameCard';

interface PlayerHandProps {
  hand: GameObject[];
  virtualHand?: GameObject[];
  onPlayCard?: (cardId: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  targetableIds?: Set<string>;
}

/**
 * PlayerHand: Precise Vision Polish.
 * - Removed blocking tray background.
 * - Higher baseline to keep names above screen edge.
 * - Dynamic z-index for natural overlapping.
 */
export const PlayerHand = ({ 
  hand, 
  virtualHand = [], 
  onPlayCard, 
  onHoverStart, 
  onHoverEnd,
  targetableIds = new Set()
}: PlayerHandProps) => {
  
  const allCards = [
    ...hand.map(c => ({ ...c, isVirtual: false })),
    ...virtualHand.map(c => ({ ...c, isVirtual: true }))
  ];

  const totalCards = allCards.length;
  // Dynamic spread: Use viewport-relative spacing (converted to rem for consistency)
  const maxHandWidthRem = 48; 
  const spacingRem = Math.min(3.8, maxHandWidthRem / Math.max(totalCards, 1));

  const getCardRotation = (index: number) => {
    if (totalCards <= 1) return 0;
    const middle = (totalCards - 1) / 2;
    return (index - middle) * (18 / Math.max(totalCards - 1, 1)); 
  };

  const getCardY = (index: number) => {
    const middle = (totalCards - 1) / 2;
    const offset = Math.abs(index - middle);
    // Vertical arch in VH units for perfect scaling
    // Vertical arch sitting higher from total bottom
    return 6 + (offset * 0.6); 
  };

  const getCardX = (index: number) => {
    const middle = (totalCards - 1) / 2;
    return (index - middle) * (spacingRem * 1.1); // Tightened spread
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-[35vh] flex items-end justify-center z-[600] pointer-events-none">
      <div className="relative w-full h-full flex items-end justify-center pointer-events-none">
        <AnimatePresence>
          {allCards.map((card, index) => {
            const rotation = getCardRotation(index);
            const xBase = getCardX(index);
            const yBase = getCardY(index);
            
            return (
              <motion.div
                key={card.id}
                initial={{ y: '30vh', opacity: 0, rotate: rotation }}
                animate={{ 
                  y: `${yBase}vh`, 
                  x: `${xBase}vw`,
                  opacity: 1, 
                  rotate: rotation,
                  zIndex: index, 
                  transition: { type: 'tween', duration: 0.3, ease: "easeOut" }
                }}
                exit={{ y: '40vh', opacity: 0 }}
                whileHover={{ 
                  y: 0, 
                  rotate: 0,
                  scale: 1.35,
                  zIndex: 800, // Pop above Avatar (500)
                  transition: { type: 'spring', stiffness: 1200, damping: 50 }
                }}
                className="absolute origin-bottom cursor-pointer pointer-events-auto"
                onClick={() => onPlayCard?.(card.id)}
              >
                <div className="relative group">
                    <GameCard 
                        obj={card} 
                        variant="hand" 
                        isPlayable={card.effectiveStats?.isPlayable}
                        isTargetable={targetableIds.has(card.id)}
                        onHoverStart={onHoverStart}
                        onHoverEnd={onHoverEnd}
                    />


                    {/* Removed duplicate playable indicator, handled by GameCard */}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* SUBTLE VIGNETTE (Optional, non-blocking) */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-[-1]" />
    </div>
  );
};
