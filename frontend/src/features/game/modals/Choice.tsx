import { useMemo, memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff } from 'lucide-react';
import { type GameObject, type PlayerState, ActionType, type StackObject, type PendingAction, type ChoiceOption } from '@shared/engine_types';

// Modular Components
import { SourceObjectPreview } from './ChoiceContent/SourceObjectPreview';
import { ScrySurveilView } from './ChoiceContent/ScrySurveil';
import { TriggerOrderView } from './ChoiceContent/TriggerOrder';
import { CardChoiceGrid } from './ChoiceContent/CardChoiceGrid';
import { ButtonChoiceList } from './ChoiceContent/ButtonChoiceList';
import { ManaChoiceToggleView, type HybridGroup } from './ChoiceContent/ManaChoiceToggle';
import { useChoiceModalLogic } from '../../../hooks/game/useChoiceModalLogic';

interface ChoiceProps {
  pendingAction: PendingAction | null;
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  battlefield: GameObject[];
  stack: StackObject[];
  exile: GameObject[];
  onTapCard: (id: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
}

export const Choice = memo(({
  pendingAction,
  me,
  opponent,
  battlefield,
  stack,
  exile,
  onTapCard,
  onHoverStart,
  onHoverEnd
}: ChoiceProps) => {
  const {
    selectedIndices, setSelectedIndices,
    minimized, setMinimized,
    orderedTriggers, setOrderedTriggers,
    scryState, setScryState,
    viewedPlayerId, setViewedPlayerId,
    sourceObjects,
    handleChoiceClick,
    handleChoiceRightClick,
    moveCard,
    choices,
    minChoices,
    maxChoices,
    meta
  } = useChoiceModalLogic(pendingAction, me, opponent, battlefield, stack, exile, onTapCard);

  const [manaToggleState, setManaToggleState] = useState<Record<number, string>>({});

  const isOrderTriggers = pendingAction?.type === ActionType.OrderTriggers;
  const isScrySurveil = pendingAction?.type === ActionType.Scry || pendingAction?.type === ActionType.Surveil;
  const isManaToggle = pendingAction?.data?.isManaChoiceToggle || meta.isManaChoiceToggle;

  useEffect(() => {
    const hybridGroups = pendingAction?.data?.hybridGroups || meta.hybridGroups;
    if (isManaToggle && hybridGroups) {
      const initial: Record<number, string> = {};
      hybridGroups.forEach((g: HybridGroup, i: number) => {
        initial[i] = g.options[0];
      });
      setManaToggleState(initial);
    }
  }, [isManaToggle, pendingAction?.data?.hybridGroups, meta.hybridGroups]);

  const isChoiceAction = pendingAction?.type && ([
    ActionType.Choice,
    ActionType.ModalSelection,
    ActionType.ResolutionChoice,
    ActionType.OptionalAction,
    ActionType.Scry,
    ActionType.Surveil,
    ActionType.LegendRule,
    ActionType.OrderTriggers,
    ActionType.StartingPlayerSelection,
    ActionType.MiracleReveal
  ] as string[]).includes(pendingAction.type);

  const isCostChoice = pendingAction?.data?.isCostChoice;
  const hasCards = choices.some((c: ChoiceOption) => c.cardData);

  const noneChoiceIdx = choices.findIndex((c: ChoiceOption) => c.value === 'none' || c.isNone === true);
  const cardChoices = choices.filter((c: ChoiceOption) => c.cardData);
  const buttonChoices = choices.filter((c: ChoiceOption, i: number) => !c.cardData && i !== noneChoiceIdx);
  const noneChoice = noneChoiceIdx !== -1 ? choices[noneChoiceIdx] : null;

  const availablePlayerIds = useMemo(() => {
    const ids = new Set<string>();
    cardChoices.forEach((c: ChoiceOption) => { if (c.cardData?.ownerId) ids.add(c.cardData.ownerId); });
    const sorted = Array.from(ids);
    if (me?.id && sorted.includes(me.id)) return [me.id, ...sorted.filter(id => id !== me.id)];
    return sorted;
  }, [cardChoices, me?.id]);

  const activeViewedPlayerId = viewedPlayerId || me?.id || availablePlayerIds[0];
  const filteredCardChoices = useMemo(() => {
    if (availablePlayerIds.length <= 1) return cardChoices;
    return cardChoices.filter((c: ChoiceOption) => c.cardData?.ownerId === activeViewedPlayerId);
  }, [cardChoices, availablePlayerIds, activeViewedPlayerId]);

  if (!isChoiceAction || !pendingAction || pendingAction?.playerId !== me?.id || pendingAction?.data?.isContextual) return null;

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
      top: scryState.top.map((c: GameObject) => c.id),
      bottom: scryState.bottom.map((c: GameObject) => c.id),
      graveyard: scryState.graveyard.map((c: GameObject) => c.id)
    });
    onTapCard?.(`CHOICE_${payload}`);
  };

  const confirmManaToggle = () => {
    onTapCard?.(`CHOICE_${JSON.stringify(manaToggleState)}`);
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
              className="bg-[#0b0f1a]/95 border border-white/10 p-[var(--sp-5)] rounded-[calc(var(--u)*6)] shadow-[0_40px_100px_rgba(0,0,0,0.9)] max-w-[95vw] w-[calc(var(--u)*185)] flex flex-row items-stretch gap-0 text-center relative overflow-hidden backdrop-blur-2xl"
            >
              <SourceObjectPreview sourceObjects={sourceObjects} />

              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 relative min-h-0 bg-black/5 border-l border-white/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(var(--u)*40)] h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

                <button
                  onClick={() => setMinimized(true)}
                  className="absolute top-[var(--sp-6)] right-[var(--sp-8)] p-[var(--sp-2)] px-[var(--sp-6)] bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-[var(--sp-2)] text-[var(--fs-xs)] font-black z-30 tracking-widest border border-white/10 group backdrop-blur-md"
                >
                  <EyeOff className="w-[var(--sp-4)] h-[var(--sp-4)] transition-transform" />
                  Hide
                </button>

                <div className="flex flex-col gap-[var(--sp-1)] mb-[var(--sp-4)] select-none px-[var(--sp-6)] w-full text-center">
                  <h3 className="font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" style={{ fontSize: isCostChoice ? 'var(--fs-3xl)' : 'var(--fs-5xl)' }}>
                    {isScrySurveil ? (pendingAction.type === ActionType.Surveil ? "Surveil" : "Scry") :
                      isOrderTriggers ? "Order Triggers" :
                        (pendingAction.data?.label || (hasCards ? "Choose a Card" : "Choose an Option"))}
                  </h3>
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-[2px]" />
                </div>

                <div className={`w-full custom-scrollbar overflow-x-auto overflow-y-auto max-h-[60vh] px-[var(--sp-8)] py-[var(--sp-6)] flex flex-col items-center ${hasCards || isOrderTriggers ? 'bg-black/30 rounded-[calc(var(--u)*6)] border border-white/5 shadow-inner mx-[var(--sp-8)]' : ''}`}>
                  {isScrySurveil && <ScrySurveilView scryState={scryState} setScryState={setScryState} moveCard={moveCard} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} type={pendingAction.type as ActionType} />}
                  {isOrderTriggers && <TriggerOrderView orderedTriggers={orderedTriggers} setOrderedTriggers={setOrderedTriggers} />}
                  {isManaToggle && <ManaChoiceToggleView hybridGroups={pendingAction.data?.hybridGroups || meta.hybridGroups} toggleState={manaToggleState} setToggleState={setManaToggleState} />}
                  {!isOrderTriggers && !isScrySurveil && !isManaToggle && cardChoices.length > 0 && (
                    <CardChoiceGrid
                      cardChoices={cardChoices} filteredCardChoices={filteredCardChoices} choices={choices}
                      selectedIndices={selectedIndices} maxChoices={maxChoices}
                      allowDuplicates={!!meta.allowDuplicates} availablePlayerIds={availablePlayerIds}
                      activeViewedPlayerId={activeViewedPlayerId} me={me} opponent={opponent}
                      setViewedPlayerId={setViewedPlayerId} handleChoiceClick={handleChoiceClick}
                      handleChoiceRightClick={handleChoiceRightClick} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd}
                    />
                  )}
                  {!isOrderTriggers && !isScrySurveil && !isManaToggle && buttonChoices.length > 0 && (
                    <ButtonChoiceList
                      buttonChoices={buttonChoices} choices={choices} selectedIndices={selectedIndices}
                      allowDuplicates={!!meta.allowDuplicates} handleChoiceClick={handleChoiceClick}
                      handleChoiceRightClick={handleChoiceRightClick}
                    />
                  )}
                  {!isOrderTriggers && !isScrySurveil && !isManaToggle && buttonChoices.length === 0 && !hasCards && (
                    <div className="p-[var(--sp-12)] border-2 border-dashed border-red-500/20 rounded-[calc(var(--u)*4)] text-red-500/40 font-black uppercase tracking-[0.2em] italic text-[var(--fs-lg)]">
                      No choices available to select
                    </div>
                  )}
                </div>

                {pendingAction?.type !== ActionType.StartingPlayerSelection && (
                  <div className="flex flex-row items-center justify-center gap-[var(--sp-6)] w-full max-w-[calc(var(--u)*100)] mt-[var(--sp-6)] relative z-20">
                    {(!isOrderTriggers && !isScrySurveil && !isManaToggle && pendingAction?.type !== ActionType.ResolutionChoice && !pendingAction?.data?.hideUndo) && (
                      <button
                        onClick={() => onTapCard?.(`CHOICE_undo`)}
                        className="max-w-[calc(var(--u)*24)] btn-premium-danger"
                      >
                        CANCEL
                      </button>
                    )}
                    {noneChoice && !isOrderTriggers && !isManaToggle && (
                      <button
                        onClick={() => onTapCard?.(`CHOICE_${noneChoiceIdx}`)}
                        className="max-w-[calc(var(--u)*24)] btn-premium-secondary"
                      >
                        SKIP
                      </button>
                    )}
                    <button
                      disabled={!isOrderTriggers && !isScrySurveil && !isManaToggle && selectedIndices.length < minChoices}
                      onClick={() => { if (isOrderTriggers) confirmTriggerOrder(); else if (isScrySurveil) confirmScryResult(); else if (isManaToggle) confirmManaToggle(); else confirmSelection(); }}
                      className={`max-w-[calc(var(--u)*45)] ${(isOrderTriggers || isScrySurveil || isManaToggle || selectedIndices.length >= minChoices) ? 'btn-premium-primary' : 'btn-premium-empty'}`}
                    >
                      <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {isOrderTriggers ? "Stack All" : isScrySurveil ? "Done" : isManaToggle ? "Confirm" : `Confirm ${selectedIndices.length > 0 ? `(${selectedIndices.length})` : ''}`}
                      </span>
                    </button>
                  </div>
                )}
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
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center gap-3 border border-white/20 font-black italic uppercase tracking-widest text-xs transition-all"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Return to Choice
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
