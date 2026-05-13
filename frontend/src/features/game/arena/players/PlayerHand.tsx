import { memo } from 'react';
import { type GameObject } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCard } from '../objects/GameCard';

interface PlayerHandProps {
  hand: GameObject[];
  virtualHand?: GameObject[];
  onPlayCard?: (cardId: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
  targetableIds?: Set<string>;
  stateVersion?: number;
  pendingAction?: any;
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
  targetableIds = new Set(),
  pendingAction
}: PlayerHandProps) => {

  const hasVirtual = virtualHand.length > 0;
  const hasReal = hand.length > 0;

  const allCards = [
    ...hand.map(c => ({ ...c, isVirtual: false, isSeparator: false })),
    ...(hasReal && hasVirtual ? [{ id: 'separator', isSeparator: true }] : []),
    ...virtualHand.map(c => ({ ...c, isVirtual: true, isSeparator: false }))
  ];

  const totalCards = allCards.length;
  // Dynamic spread: Increase base spacing and max limit to reduce hitbox overlap
  const spacing = Math.min(12, 140 / Math.max(totalCards, 1));

  const getCardRotation = (index: number) => {
    if (totalCards <= 1) return 0;
    const middle = (totalCards - 1) / 2;
    // Slightly less aggressive rotation for better readability
    return (index - middle) * (15 / Math.max(totalCards - 1, 1));
  };

  const getCardY = (index: number) => {
    const middle = (totalCards - 1) / 2;
    const offset = Math.abs(index - middle);
    // Base Y is the amount "tucked" into the bottom. Center cards are tucked less.
    return 4 + (offset * 1.2); 
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
            if ((card as any).isSeparator) {
               return (
                <motion.div
                  key="separator"
                  animate={{ 
                    y: `calc(var(--u)*${getCardY(index)})`, 
                    x: `calc(var(--u)*${getCardX(index)})`,
                    rotate: getCardRotation(index),
                  }}
                  className="absolute bottom-0 w-[calc(var(--u)*12)] pointer-events-none"
                />
               );
            }

            const rotation = getCardRotation(index);
            const xBase = getCardX(index);
            const yBase = getCardY(index);
            const gameObject = card as GameObject;
            
            return (
              <motion.div
                key={gameObject.id}
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
                  y: 0, // Ground the card to the bottom edge on hover
                  rotate: 0,
                  scale: 1.35,
                  zIndex: 1000, 
                  transition: { type: 'spring', stiffness: 1200, damping: 50 }
                }}
                className="absolute bottom-0 origin-bottom cursor-pointer pointer-events-auto"
                onClick={() => onPlayCard?.(gameObject.id)}
              >
                <div className="relative group">
                  <GameCard
                    obj={gameObject}
                    variant="hand"
                    isPlayable={gameObject.effectiveStats?.isPlayable}
                    isTargetable={targetableIds.has(gameObject.id)}
                    onHoverStart={onHoverStart}
                    onHoverEnd={onHoverEnd}
                    pendingAction={pendingAction}
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
    if (prevProps.stateVersion !== nextProps.stateVersion) return false;
  }

  // 5. Explicitly check for pendingAction and playerId changes to prevent stale closures
  if (prevProps.pendingAction?.type !== nextProps.pendingAction?.type) return false;
  if (prevProps.pendingAction?.playerId !== nextProps.pendingAction?.playerId) return false;
  // Note: effectivePlayerId is not a prop here, but onPlayCard changes when it does.
  // Since we don't check functions, we must rely on stateVersion or explicit data props.

  return true;
});
