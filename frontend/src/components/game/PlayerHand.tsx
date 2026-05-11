import { memo } from 'react';
import { type GameObject } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCard } from './GameCard';

interface PlayerHandProps {
  hand: GameObject[];
  virtualHand?: GameObject[];
  onPlayCard?: (cardId: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
  targetableIds?: Set<string>;
  stateVersion?: number;
}

/**
 * PlayerHand: Precise Vision Polish.
 * - Removed blocking tray background.
 * - Higher baseline to keep names above screen edge.
 * - Dynamic z-index for natural overlapping.
 */
export const PlayerHand = memo(({ 
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
  // Dynamic spread: Use universal units for spacing
  const spacing = Math.min(8.5, 120 / Math.max(totalCards, 1));

  const getCardRotation = (index: number) => {
    if (totalCards <= 1) return 0;
    const middle = (totalCards - 1) / 2;
    return (index - middle) * (18 / Math.max(totalCards - 1, 1)); 
  };

  const getCardY = (index: number) => {
    const middle = (totalCards - 1) / 2;
    const offset = Math.abs(index - middle);
    // Vertical arch in unit increments
    return 6 + (offset * 0.8); 
  };

  const getCardX = (index: number) => {
    const middle = (totalCards - 1) / 2;
    return (index - middle) * spacing; 
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-[calc(var(--u)*46)] flex items-end justify-center z-[600] pointer-events-none">
      <div className="relative w-full h-full flex items-end justify-center pointer-events-none">
        <AnimatePresence>
          {allCards.map((card, index) => {
            const rotation = getCardRotation(index);
            const xBase = getCardX(index);
            const yBase = getCardY(index);
            
            return (
              <motion.div
                key={card.id}
                initial={{ y: 'calc(var(--u)*40)', opacity: 0, rotate: rotation }}
                animate={{ 
                  y: `calc(var(--u)*${yBase})`, 
                  x: `calc(var(--u)*${xBase})`,
                  opacity: 1, 
                  rotate: rotation,
                  zIndex: index, 
                  transition: { type: 'tween', duration: 0.3, ease: "easeOut" }
                }}
                exit={{ y: 'calc(var(--u)*50)', opacity: 0 }}
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
      <div className="absolute inset-x-0 bottom-0 h-[calc(var(--u)*20)] bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-[-1]" />
    </div>
  );
}, (prevProps, nextProps) => {
    if (prevProps.hand.length !== nextProps.hand.length) return false;
    if ((prevProps.virtualHand?.length || 0) !== (nextProps.virtualHand?.length || 0)) return false;
    if (prevProps.targetableIds?.size !== nextProps.targetableIds?.size) return false;

    if (prevProps.targetableIds && nextProps.targetableIds) {
        for (let id of prevProps.targetableIds) {
            if (!nextProps.targetableIds.has(id)) return false;
        }
    }

    // 3. Check if playability or versions changed for any card
    const anyPlayabilityChanged = prevProps.hand.some((c, i) => {
        const nextCard = nextProps.hand[i];
        return c.effectiveStats?.isPlayable !== nextCard.effectiveStats?.isPlayable || 
               c.version !== nextCard.version;
    });

    if (anyPlayabilityChanged) return false;

    for (let i = 0; i < prevProps.hand.length; i++) {
        if (prevProps.hand[i].id !== nextProps.hand[i].id) return false;
    }

    const pv = prevProps.virtualHand || [];
    const nv = nextProps.virtualHand || [];
    for (let i = 0; i < pv.length; i++) {
        if (pv[i].id !== nv[i].id) return false;
    }

    // 4. Fallback to stateVersion if provided
    if (prevProps.stateVersion !== undefined && nextProps.stateVersion !== undefined) {
        return prevProps.stateVersion === nextProps.stateVersion;
    }

    return true;
});
