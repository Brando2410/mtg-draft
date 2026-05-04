import { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff } from 'lucide-react';
import { type GameObject, type PlayerState, ActionType, type StackObject } from '@shared/engine_types';

// Modular Components
import { SourceObjectPreview } from './choice/SourceObjectPreview';
import { ScrySurveilView } from './choice/ScrySurveilView';
import { TriggerOrderView } from './choice/TriggerOrderView';
import { CardChoiceGrid } from './choice/CardChoiceGrid';
import { ButtonChoiceList } from './choice/ButtonChoiceList';
import { useChoiceModalLogic } from '../../../hooks/game/useChoiceModalLogic';

interface ChoiceModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  battlefield: GameObject[];
  stack: StackObject[];
  exile: any[];
  onTapCard: (id: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
}

export const ChoiceModal = memo(({ 
    pendingAction, 
    me, 
    opponent,
    battlefield,
    stack,
    exile,
    onTapCard, 
    onHoverStart, 
    onHoverEnd 
}: ChoiceModalProps) => {
  const {
      selectedIndices, setSelectedIndices,
      minimized, setMinimized,
      orderedTriggers, setOrderedTriggers,
      scryState, setScryState,
      viewedPlayerId, setViewedPlayerId,
      sourceObject,
      handleChoiceClick,
      handleChoiceRightClick,
      moveCard,
      choices,
      minChoices,
      maxChoices
  } = useChoiceModalLogic(pendingAction, me, opponent, battlefield, stack, exile, onTapCard);

  const isOrderTriggers = pendingAction?.type === ActionType.OrderTriggers;
  const isScrySurveil = pendingAction?.type === ActionType.Scry || pendingAction?.type === ActionType.Surveil;
  const isChoiceAction = [
    ActionType.Choice,
    ActionType.ModalSelection,
    ActionType.ResolutionChoice,
    ActionType.OptionalAction,
    ActionType.Scry,
    ActionType.Surveil,
    ActionType.LegendRule,
    ActionType.OrderTriggers
  ].includes(pendingAction?.type);

  const isCostChoice = pendingAction?.data?.isCostChoice;
  const hasCards = choices.some((c: any) => c.cardData);
  
  const noneChoiceIdx = choices.findIndex((c: any) => c.value === 'none' || c.isNone === true);
  const cardChoices = choices.filter((c: any) => c.cardData);
  const buttonChoices = choices.filter((c: any, i: number) => !c.cardData && i !== noneChoiceIdx);
  const noneChoice = noneChoiceIdx !== -1 ? choices[noneChoiceIdx] : null;

  const availablePlayerIds = useMemo(() => {
    const ids = new Set<string>();
    cardChoices.forEach((c: any) => { if (c.cardData?.ownerId) ids.add(c.cardData.ownerId); });
    const sorted = Array.from(ids);
    if (me?.id && sorted.includes(me.id)) return [me.id, ...sorted.filter(id => id !== me.id)];
    return sorted;
  }, [cardChoices, me?.id]);

  const activeViewedPlayerId = viewedPlayerId || me?.id || availablePlayerIds[0];
  const filteredCardChoices = useMemo(() => {
    if (availablePlayerIds.length <= 1) return cardChoices;
    return cardChoices.filter((c: any) => c.cardData?.ownerId === activeViewedPlayerId);
  }, [cardChoices, availablePlayerIds, activeViewedPlayerId]);

  if (!isChoiceAction || pendingAction?.playerId !== me?.id || pendingAction?.data?.isContextual) return null;

  const confirmSelection = () => {
      if (selectedIndices.length < minChoices) return;
      onTapCard?.(selectedIndices.map(i => `CHOICE_${i}`).join('|'));
      setSelectedIndices([]);
  };

  const confirmTriggerOrder = () => {
    onTapCard?.(`CHOICE_${orderedTriggers.map(t => t.id).join('|')}`);
  };
  
  const confirmScryResult = () => {
      const payload = JSON.stringify({
          top: scryState.top.map((c: any) => c.id),
          bottom: scryState.bottom.map((c: any) => c.id),
          graveyard: scryState.graveyard.map((c: any) => c.id)
      });
      onTapCard?.(`CHOICE_${payload}`);
  };

  return (
    <>
      <AnimatePresence>
        {!minimized && (
          <motion.div 
            key="choice-modal-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 10 }} 
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0b0f1a]/95 border border-white/10 p-5 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] max-w-[90vw] w-[1100px] flex flex-row items-stretch gap-0 text-center relative overflow-hidden backdrop-blur-2xl"
            >
              <SourceObjectPreview sourceObject={sourceObject} />

              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 relative min-h-0 w-[55vw] bg-black/5 border-l border-white/10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                  
                  <button 
                    onClick={() => setMinimized(true)}
                    className="absolute top-6 right-8 p-2 px-6 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black z-30 tracking-widest border border-white/10 group backdrop-blur-md"
                  >
                    <EyeOff className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    MINIMIZE
                  </button>

                  <div className="flex flex-col gap-1 mb-4 select-none px-6 w-full text-center">
                    <h3 className={`font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] ${isCostChoice ? 'text-3xl' : 'text-5xl'}`}>
                      {isScrySurveil ? (pendingAction.type === ActionType.Surveil ? "Surveil" : "Scry") : 
                       isOrderTriggers ? "Order Triggers" : 
                       (pendingAction.data?.label || (hasCards ? "Choose a Card" : "Choose an Option"))}
                    </h3>
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-[2px]" />
                  </div>

                  <div className={`w-full custom-scrollbar overflow-x-auto overflow-y-auto max-h-[60vh] px-8 py-6 flex flex-col items-center ${hasCards || isOrderTriggers ? 'bg-black/30 rounded-[2.5rem] border border-white/5 shadow-inner mx-8' : ''}`}>
                      {isScrySurveil && <ScrySurveilView scryState={scryState} setScryState={setScryState} moveCard={moveCard} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} type={pendingAction.type} />}
                      {isOrderTriggers && <TriggerOrderView orderedTriggers={orderedTriggers} setOrderedTriggers={setOrderedTriggers} />}
                      {!isOrderTriggers && !isScrySurveil && cardChoices.length > 0 && (
                          <CardChoiceGrid 
                              cardChoices={cardChoices} filteredCardChoices={filteredCardChoices} choices={choices} 
                              selectedIndices={selectedIndices} maxChoices={maxChoices} 
                              allowDuplicates={pendingAction.data?.allowDuplicates} availablePlayerIds={availablePlayerIds} 
                              activeViewedPlayerId={activeViewedPlayerId} me={me} opponent={opponent} 
                              setViewedPlayerId={setViewedPlayerId} handleChoiceClick={handleChoiceClick} 
                              handleChoiceRightClick={handleChoiceRightClick} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} 
                          />
                      )}
                      {!isOrderTriggers && !isScrySurveil && buttonChoices.length > 0 && (
                          <ButtonChoiceList 
                              buttonChoices={buttonChoices} choices={choices} selectedIndices={selectedIndices} 
                              allowDuplicates={pendingAction.data?.allowDuplicates} handleChoiceClick={handleChoiceClick} 
                              handleChoiceRightClick={handleChoiceRightClick} 
                          />
                      )}
                      {!isOrderTriggers && !isScrySurveil && buttonChoices.length === 0 && !hasCards && (
                          <div className="p-10 border-2 border-dashed border-red-500/20 rounded-[2rem] text-red-500/40 font-black uppercase tracking-[0.2em] italic">
                              No choices available to select
                          </div>
                      )}
                  </div>

                  <div className="flex flex-row items-center justify-center gap-6 w-full max-w-xl mt-6 relative z-20">
                    {(!isOrderTriggers && !isScrySurveil && pendingAction?.type !== ActionType.ResolutionChoice && !pendingAction?.data?.hideUndo) && (
                      <button onClick={() => onTapCard?.(`CHOICE_undo`)} className="flex-1 max-w-[140px] p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/10 text-[11px] font-black uppercase italic tracking-[0.2em] transition-all text-red-500/60 hover:text-red-500">
                        CANCEL
                      </button>
                    )}
                    {noneChoice && !isOrderTriggers && (
                      <button onClick={() => onTapCard?.(`CHOICE_${noneChoiceIdx}`)} className="flex-1 max-w-[140px] p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-[11px] font-black uppercase italic tracking-[0.2em] transition-all text-white/70 hover:text-white">
                        SKIP
                      </button>
                    )}
                    <button disabled={!isOrderTriggers && !isScrySurveil && selectedIndices.length < minChoices} onClick={() => { if (isOrderTriggers) confirmTriggerOrder(); else if (isScrySurveil) confirmScryResult(); else confirmSelection(); }} className={`flex-1 max-w-[240px] p-5 rounded-2xl border-none text-base font-black uppercase italic tracking-[0.2em] transition-all shadow-2xl ${(isOrderTriggers || isScrySurveil || selectedIndices.length >= minChoices) ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 scale-105 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}>
                      {isOrderTriggers ? "Stack All" : isScrySurveil ? "Done" : `Confirm ${selectedIndices.length > 0 ? `(${selectedIndices.length})` : ''}`}
                    </button>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {minimized && (
          <motion.div 
            key="minimized-choice-button"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[1001]"
          >
            <button 
              onClick={() => setMinimized(false)}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center gap-3 border border-white/20 font-black italic uppercase tracking-widest text-xs transition-all hover:scale-105"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              PENDING CHOICE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
