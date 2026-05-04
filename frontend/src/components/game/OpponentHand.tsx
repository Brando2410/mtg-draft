import { memo } from 'react';
import { type GameObject } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCard } from './GameCard';

interface OpponentHandProps {
  hand: GameObject[];
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
  stateVersion?: number;
}

/**
 * Opponent's Hand tucked at the top of the screen.
 * Cards are inverted and sit slightly below the top edge.
 */
export const OpponentHand = memo(({ hand, onHoverStart, onHoverEnd }: OpponentHandProps) => {
  const cardCount = hand.length;

  const getCardRotation = (index: number) => {
    const middle = (cardCount - 1) / 2;
    // Steeper spread for a more professional 'fan' look
    const maxSpread = 30; // Total rotation from end to end
    return (index - middle) * (maxSpread / Math.max(cardCount - 1, 1)); 
  };

  const getCardY = (index: number) => {
    const middle = (cardCount - 1) / 2;
    const offset = Math.abs(index - middle);
    // Sit slightly lower in the frame for better visibility
    return -20 - (offset * 3); 
  };

  const getCardX = (index: number) => {
    const middle = (cardCount - 1) / 2;
    // Tight horizontal overlap
    const spacing = 45; 
    return (index - middle) * spacing;
  };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-32 flex items-start justify-center z-[600] pointer-events-none">
      <div className="relative w-full h-full flex items-start justify-center">
        <AnimatePresence>
          {(hand || []).map((card, index) => {
            const rotation = getCardRotation(index);
            const xBase = getCardX(index);
            const yBase = getCardY(index);
            const isRevealed = (card as any).isRevealed;

            const cardWithFlags = { ...card, isVirtual: (card as any).isVirtual || card.zone === 'Graveyard' || card.zone === 'Exile' };
            
            return (
              <motion.div
                key={card.id || index}
                initial={{ y: -200, opacity: 0 }}
                animate={{ 
                  // Keep them tucked at the top, slightly lower if revealed
                  y: isRevealed ? yBase + 15 : yBase, 
                  x: xBase,
                  opacity: 1, 
                  // Stay in the hand's fan orientation (opponent view)
                  rotate: rotation + 180, 
                  scale: isRevealed ? 1.1 : 1,
                  zIndex: isRevealed ? 700 : index,
                  transition: { type: 'spring', stiffness: 100, damping: 20 }
                }}
                exit={{ y: -200, opacity: 0 }}
                whileHover={{ 
                    y: isRevealed ? yBase + 25 : yBase + 10, 
                    scale: 1.2,
                    zIndex: 800,
                    transition: { type: 'spring', stiffness: 400, damping: 25 }
                }}
                className="absolute w-20 h-28 origin-center pointer-events-auto cursor-help"
                onMouseEnter={() => (isRevealed || true) && onHoverStart?.(cardWithFlags)}
                onMouseLeave={() => (isRevealed || true) && onHoverEnd?.(card.id)}
              >
                {isRevealed ? (
                    <div className="w-full h-full scale-[0.75] origin-center -translate-y-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                         <GameCard obj={cardWithFlags} variant="hand" isOpponent />
                    </div>
                ) : (
                    /* CSS-ONLY PREMIUM CARD BACK */
                    <div className="w-full h-full bg-[#0a0c14] rounded-md border border-white/20 shadow-2xl relative overflow-hidden group transition-colors duration-300">
                        {/* Ambient energy glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.25),transparent_70%)] transition-colors" />
                        
                        {/* Double border details */}
                        <div className="absolute inset-1 border border-white/10 rounded-sm" />
                        <div className="absolute inset-[3px] border border-white/5 rounded-[1px]" />
                        
                        {/* Minimalist mystic seal */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-indigo-500/10 rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 border border-indigo-500/5 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                                 <div className="w-0.5 h-full bg-indigo-500/5" />
                                 <div className="absolute w-full h-0.5 bg-indigo-500/5" />
                            </div>
                            <div className="absolute w-3 h-3 bg-indigo-500/10 rounded-full blur-[4px]" />
                            <div className="absolute w-1 h-1 bg-white/40 rounded-full shadow-[0_0_8px_white]" />
                        </div>

                        <div className="absolute bottom-1.5 left-0 right-0 flex justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                            <div className="text-[4px] font-black text-white uppercase tracking-[0.4em]">MTG ENGINE</div>
                        </div>
                    </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
    if (prevProps.stateVersion !== undefined && nextProps.stateVersion !== undefined) {
        return prevProps.stateVersion === nextProps.stateVersion;
    }
    if (prevProps.hand.length !== nextProps.hand.length) return false;
    for (let i = 0; i < prevProps.hand.length; i++) {
        if (prevProps.hand[i].id !== nextProps.hand[i].id) return false;
        if ((prevProps.hand[i] as any).isRevealed !== (nextProps.hand[i] as any).isRevealed) return false;
    }
    return true;
});
