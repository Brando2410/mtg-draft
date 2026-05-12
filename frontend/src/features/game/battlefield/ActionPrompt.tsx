import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionType } from '@shared/engine_types';

interface ActionPromptProps {
  pendingAction: any;
  isMe: boolean;
}

export const ActionPrompt = memo(({ pendingAction, isMe }: ActionPromptProps) => {
  if (!pendingAction) return null;


  return (
    <AnimatePresence>
      <motion.div 
          key={pendingAction.type + (isMe ? 'me' : 'opp')}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="pointer-events-none flex flex-col items-center"
      >
          {!isMe ? (
              <div className="flex flex-col items-center">
                  <h2 className="relative text-[var(--fs-3xl)] font-black text-white/40 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight italic uppercase leading-none">
                      {pendingAction.type === ActionType.Discard ? 'Opponent is discarding...' : 'Opponent is making a choice...'}
                  </h2>
                  {pendingAction.data?.label && (
                      <span className="relative text-[var(--fs-xs)] text-indigo-400 font-bold uppercase tracking-[0.3em] mt-[var(--sp-2)] block">{pendingAction.data.label}</span>
                  )}
              </div>
          ) : (
              !([ActionType.Choice, ActionType.ResolutionChoice, ActionType.ModalSelection, ActionType.OptionalAction, ActionType.Scry, ActionType.Surveil, ActionType.ChooseX] as any[]).includes(pendingAction.type) && (
                   <div className="flex flex-col items-center">
                      <h2 className="relative text-[var(--fs-3xl)] font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight italic uppercase leading-none">
                          {pendingAction.type === ActionType.DeclareAttackers ? 'Declare Attackers' :
                          pendingAction.type === ActionType.DeclareBlockers ? 'Declare Blockers' :
                          pendingAction.type === ActionType.OrderAttackers ? 'Order Blockers' :
                          pendingAction.type === ActionType.Discard ? (
                              <div className="flex items-center gap-[var(--sp-3)]">
                                  <span>{pendingAction.data?.label || 'Discard'}</span>
                                  <span className="font-black text-cyan-400">
                                      ({pendingAction.data?.count ?? pendingAction.count ?? 1})
                                  </span>
                              </div>
                          ) :
                          pendingAction.type === ActionType.Targeting ? (pendingAction.data?.prompt || pendingAction.data?.label || 'Select targets') :
                          (pendingAction.data?.label || 'Make a choice')}
                      </h2>
                  </div>
              )
          )}
      </motion.div>
    </AnimatePresence>
  );
});
