import { useState, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { type StackObject, type PlayerState, type GameObject } from '@shared/engine_types';
import { StackItem } from './stack/StackItem';
import { TargetPreview } from './stack/TargetPreview';
import { useStackLogic } from '../../hooks/game/useStackLogic';

interface StackViewProps {
  stack: StackObject[];
  pendingAction?: any;
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  exile?: GameObject[];
  battlefield: GameObject[];
  onTapCard: (id: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
  targetableIds?: Set<string>;
}

export const StackView = memo(({ stack, pendingAction, me, opponent, battlefield, exile, onTapCard, onHoverStart, onHoverEnd }: StackViewProps) => {
  const [hoveredStackObj, setHoveredStackObj] = useState<StackObject | null>(null);
  const { effectiveStack, findObject, getDisplayObj } = useStackLogic(stack, pendingAction, me, opponent, battlefield, exile);

  if (effectiveStack.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 p-1 bg-slate-950/60 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] ring-1 ring-white/5 w-full max-w-[24vw] min-h-[15vh] relative overflow-visible">

      <TargetPreview hoveredStackObj={hoveredStackObj} findObject={findObject} />

      <div className="flex items-center gap-3 mt-4 mb-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
        <div className="text-xs font-black uppercase tracking-[0.5em] text-cyan-200 px-4 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 shadow-inner">
          Stack
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col-reverse items-center justify-end gap-5 max-h-[65vh] overflow-y-auto px-2 py-4 no-scrollbar scroll-smooth">
        <AnimatePresence mode="popLayout">
          {effectiveStack.map((sobj, index) => {
            const isPending = pendingAction?.data?.stackObj?.id === sobj.id;
            const isTop = index === effectiveStack.length - 1;
            const displayObj = getDisplayObj(sobj);

            return (
              <StackItem
                key={sobj.id || `stack-${sobj.name}-${index}`}
                sobj={sobj}
                displayObj={displayObj as any}
                index={index}
                isPending={isPending}
                isTop={isTop}
                onTapCard={onTapCard}
                onHoverStart={() => {
                  setHoveredStackObj(sobj);
                  onHoverStart?.(displayObj as any);
                }}
                onHoverEnd={(id) => {
                  setHoveredStackObj(null);
                  onHoverEnd?.(id);
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {effectiveStack.length > 1 && (
        <div className="flex items-center gap-3 py-2 px-5 bg-white/5 rounded-full border border-white/10 mb-2">
          <div className="text-[10px] font-black text-cyan-400 tracking-[0.2em] uppercase italic drop-shadow-sm">
            {effectiveStack.length} Spells & Triggers
          </div>
        </div>
      )}
    </div>
  );
});
