import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import { GameCard } from '../GameCard';
import { type GameObject, type PlayerState, ActionType } from '@shared/engine_types';

interface ChoiceModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  onTapCard: (id: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
}

export const ChoiceModal = ({ pendingAction, me, onTapCard, onHoverStart, onHoverEnd }: ChoiceModalProps) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [orderedTriggers, setOrderedTriggers] = useState<any[]>([]);
  const [scryState, setScryState] = useState<{ top: any[], bottom: any[], graveyard: any[] }>({ top: [], bottom: [], graveyard: [] });

  const isOrderTriggers = pendingAction?.type === ActionType.OrderTriggers;
  const isScrySurveil = pendingAction?.type === ActionType.Scry || pendingAction?.type === ActionType.Surveil;
  const isChoiceAction = [
    ActionType.Choice,
    ActionType.ModalSelection,
    ActionType.ResolutionChoice,
    ActionType.OptionalAction,
    ActionType.Scry,
    ActionType.Surveil
  ].includes(pendingAction?.type) || isOrderTriggers;

  useEffect(() => {
    if (isOrderTriggers && pendingAction.data?.triggers) {
        setOrderedTriggers(pendingAction.data.triggers);
    }
    if (isScrySurveil && pendingAction.data?.lookingCards) {
        setScryState({
            top: [...pendingAction.data.lookingCards],
            bottom: [],
            graveyard: []
        });
    }
  }, [pendingAction?.data?.triggers, pendingAction?.data?.lookingCards, isOrderTriggers, isScrySurveil]);

  if (!isChoiceAction) return null;

  const isMyChoice = pendingAction.playerId === me?.id;
  if (!isMyChoice || pendingAction.data?.isContextual) return null;

  const choices = pendingAction.data?.choices || [];
  const minChoices = pendingAction.data?.minChoices || 1;
  const maxChoices = pendingAction.data?.maxChoices || 1;
  const hasCards = choices.some((c: any) => c.cardData);
  
  const noneChoiceIdx = choices.findIndex((c: any) => 
    c.value === 'none' || 
    c.label?.toLowerCase().includes('salta') || 
    c.label?.toLowerCase().includes('skip') || 
    c.label?.toLowerCase().includes('nessuna')
  );
  
  const cardChoices = choices.filter((c: any) => c.cardData && c.selectable !== false);
  const buttonChoices = choices.filter((c: any, i: number) => !c.cardData && c.selectable !== false && i !== noneChoiceIdx);
  const noneChoice = noneChoiceIdx !== -1 ? choices[noneChoiceIdx] : null;

  const handleChoiceClick = (originalIdx: number) => {
      const choice = choices[originalIdx];
      if (!choice || choice.selectable === false) return;

      if (maxChoices === 1) {
          if (choice.cardData) {
              if (selectedIndices.includes(originalIdx)) {
                  setSelectedIndices([]);
              } else {
                  setSelectedIndices([originalIdx]);
              }
          } else {
              onTapCard?.(`CHOICE_${originalIdx}`);
          }
      } else {
          if (selectedIndices.includes(originalIdx)) {
              setSelectedIndices(selectedIndices.filter(i => i !== originalIdx));
          } else if (selectedIndices.length < maxChoices) {
              setSelectedIndices([...selectedIndices, originalIdx]);
          }
      }
  };

  const confirmSelection = (indices: number[]) => {
      if (indices.length < minChoices) return;
      onTapCard?.(indices.map(i => `CHOICE_${i}`).join('|'));
      setSelectedIndices([]);
  };

  const confirmTriggerOrder = () => {
    // Send joined IDs
    onTapCard?.(`CHOICE_${orderedTriggers.map(t => t.id).join('|')}`);
  };

  const moveCard = (card: any, from: 'top' | 'bottom' | 'graveyard', to: 'top' | 'bottom' | 'graveyard') => {
      setScryState(prev => {
          const newFrom = prev[from].filter((c: any) => c.id !== card.id);
          const newTo = [...prev[to], card];
          return { ...prev, [from]: newFrom, [to]: newTo };
      });
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
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 10 }} 
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0b0f1a]/80 border border-white/10 p-5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-w-5xl w-full flex flex-col items-center gap-4 text-center relative overflow-hidden backdrop-blur-md"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              
              {/* MINIMIZE BUTTON */}
              <button 
                onClick={() => setMinimized(true)}
                className="absolute top-3 right-4 p-2 px-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-2 text-[9px] font-black z-30 tracking-widest border border-white/5"
              >
                <EyeOff className="w-3 h-3" />
                MINIMIZE
              </button>

              {/* Header Title */}
              <div className="flex flex-col gap-1 mt-4">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  {isScrySurveil ? (pendingAction.type === ActionType.Surveil ? "Surveil" : "Scry") : 
                   isOrderTriggers ? "Order Triggers" : 
                   (pendingAction.data?.label || (hasCards ? "Choose a Card" : "Choose an Option"))}
                </h3>
              </div>
              
              <div className={`w-full custom-scrollbar overflow-x-auto max-h-[60vh] px-4 py-4 ${hasCards || isOrderTriggers ? 'bg-black/20 rounded-[1.5rem] border border-white/5 shadow-inner' : ''}`}>
                
                {/* SCRY / SURVEIL VIEW - ARENA STYLE */}
                {isScrySurveil && (
                    <div className="flex flex-col items-center w-full gap-6 py-2">
                        <div className="flex flex-row items-start justify-center gap-6 w-full relative">
                            
                            {/* GRAVEYARD ZONE (Left) */}
                            {pendingAction.type === ActionType.Surveil && (
                                <div className="flex flex-col items-center gap-3 flex-1 min-w-[200px]" data-zone="graveyard">
                                    <h4 className="text-sm font-black italic uppercase tracking-widest text-red-500/80">Graveyard</h4>
                                    <div className="w-full aspect-[4/3] rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center p-2 relative overflow-x-auto custom-scrollbar">
                                        <Reorder.Group 
                                            axis="x" 
                                            values={scryState.graveyard} 
                                            onReorder={(vals) => setScryState(p => ({ ...p, graveyard: vals }))}
                                            className="flex flex-row justify-center items-center w-full gap-2 px-4"
                                        >
                                            {scryState.graveyard.map((card: any) => (
                                                <Reorder.Item 
                                                    key={card.id} 
                                                    value={card}
                                                    className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0"
                                                    drag="y"
                                                    whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                                    onDragEnd={(_, info) => {
                                                        if (Math.abs(info.offset.y) > 50) {
                                                            const el = document.elementFromPoint(info.point.x, info.point.y);
                                                            const zone = el?.closest('[data-zone]');
                                                            const targetZone = zone?.getAttribute('data-zone');
                                                            if (targetZone && targetZone !== 'graveyard') {
                                                                moveCard(card, 'graveyard', targetZone as any);
                                                            }
                                                        }
                                                    }}
                                                    onClick={() => moveCard(card, 'graveyard', 'top')}
                                                >
                                                    <GameCard 
                                                        obj={card} 
                                                        variant="small" 
                                                        onHoverStart={() => onHoverStart?.(card)}
                                                        onHoverEnd={onHoverEnd}
                                                    />
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </div>
                                </div>
                            )}

                            {/* TOP ZONE (Center) */}
                            <div className="flex flex-col items-center gap-3 flex-1 min-w-[200px]" data-zone="top">
                                <h4 className="text-sm font-black italic uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                                    Top 
                                </h4>
                                <div className="w-full aspect-[4/3] rounded-2xl border border-white/10 bg-white/5 shadow-xl flex flex-col items-center justify-center p-2 relative overflow-x-auto custom-scrollbar">
                                    <Reorder.Group 
                                        axis="x" 
                                        values={scryState.top} 
                                        onReorder={(vals) => setScryState(p => ({ ...p, top: vals }))}
                                        className="flex flex-row justify-center items-center w-full gap-2 px-4"
                                    >
                                        {scryState.top.map((card: any) => (
                                            <Reorder.Item 
                                                key={card.id} 
                                                value={card}
                                                className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0"
                                                drag="y" // Allow y dragging to pull out of the x-reorder group
                                                whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                                onDragEnd={(_, info) => {
                                                    // Only move if dragged significantly up or down
                                                    if (Math.abs(info.offset.y) > 50) {
                                                        const el = document.elementFromPoint(info.point.x, info.point.y);
                                                        const zone = el?.closest('[data-zone]');
                                                        const targetZone = zone?.getAttribute('data-zone');
                                                        if (targetZone && targetZone !== 'top') {
                                                            moveCard(card, 'top', targetZone as any);
                                                        }
                                                    }
                                                }}
                                                onClick={() => {
                                                    const target = pendingAction.type === ActionType.Surveil ? 'graveyard' : 'bottom';
                                                    moveCard(card, 'top', target);
                                                }}
                                            >
                                                <div className="relative group/card shadow-2xl">
                                                    <GameCard 
                                                        obj={card} 
                                                        variant="small"
                                                        onHoverStart={() => onHoverStart?.(card)}
                                                        onHoverEnd={onHoverEnd}
                                                    />

                                                    {/* ORDER INDICATOR */}
                                                    {scryState.top.length > 1 && (
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 border-2 border-[#0b0f1a] flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-50">
                                                            {scryState.top.indexOf(card) + 1}
                                                        </div>
                                                    )}
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            </div>

                            {/* BOTTOM ZONE (Right) - Scry Only */}
                            {pendingAction.type === ActionType.Scry && (
                                <div className="flex flex-col items-center gap-3 flex-1 min-w-[200px]" data-zone="bottom">
                                    <h4 className="text-sm font-black italic uppercase tracking-widest text-amber-500/80 flex items-center gap-2">
                                        Bottom
                                    </h4>
                                    <div className="w-full aspect-[4/3] rounded-2xl border border-white/10 bg-white/5 shadow-xl flex flex-col items-center justify-center p-2 relative overflow-x-auto custom-scrollbar">
                                        <Reorder.Group 
                                            axis="x" 
                                            values={scryState.bottom} 
                                            onReorder={(vals) => setScryState(p => ({ ...p, bottom: vals }))}
                                            className="flex flex-row justify-center items-center w-full gap-2 px-4"
                                        >
                                            {scryState.bottom.map((card: any) => (
                                                <Reorder.Item 
                                                    key={card.id} 
                                                    value={card}
                                                    className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0"
                                                    drag="y"
                                                    whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                                    onDragEnd={(_, info) => {
                                                        if (Math.abs(info.offset.y) > 50) {
                                                            const el = document.elementFromPoint(info.point.x, info.point.y);
                                                            const zone = el?.closest('[data-zone]');
                                                            const targetZone = zone?.getAttribute('data-zone');
                                                            if (targetZone && targetZone !== 'bottom') {
                                                                moveCard(card, 'bottom', targetZone as any);
                                                            }
                                                        }
                                                    }}
                                                    onClick={() => moveCard(card, 'bottom', 'top')}
                                                >
                                                    <div className="relative group/card shadow-2xl">
                                                        <GameCard 
                                                            obj={card} 
                                                            variant="small" 
                                                            onHoverStart={() => onHoverStart?.(card)}
                                                            onHoverEnd={onHoverEnd}
                                                        />

                                                        {/* ORDER INDICATOR */}
                                                        {scryState.bottom.length > 1 && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-600 border-2 border-[#0b0f1a] flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-50">
                                                                {scryState.bottom.indexOf(card) + 1}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* TRIGGER ORDERING VIEW */}
                {isOrderTriggers && (
                    <div className="flex flex-col items-center w-full px-12">
                        {/* Legend */}
                        <div className="w-full flex justify-between px-4 mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 relative">
                             <div className="absolute left-0 right-0 h-px bg-white/5 top-1/2 -z-10" />
                             <span className="bg-[#0b0f1a] px-4 text-indigo-400">Resolves Last</span>
                             <span className="bg-[#0b0f1a] px-4 text-amber-400">Resolves First</span>
                        </div>

                        <Reorder.Group 
                            axis="x" 
                            values={orderedTriggers} 
                            onReorder={setOrderedTriggers}
                            className="flex flex-row justify-center gap-8 w-full py-4"
                        >
                            {orderedTriggers.map((trigger) => (
                                <Reorder.Item 
                                    key={trigger.id} 
                                    value={trigger}
                                    className="relative group/trigger cursor-grab active:cursor-grabbing"
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/trigger:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                        <div className="bg-slate-800/90 border border-white/10 px-3 py-1 rounded-lg shadow-xl text-[9px] font-bold text-white uppercase tracking-widest">
                                            {trigger.name}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl opacity-0 group-hover/trigger:opacity-100 transition-all" />
                                        <div className="relative transform transition-transform group-hover/trigger:scale-[1.03] scale-75 -my-10">
                                            <GameCard 
                                                obj={{
                                                   id: trigger.id,
                                                   definition: {
                                                      name: trigger.name,
                                                      image_url: trigger.image_url,
                                                      type_line: 'Triggered Ability',
                                                      oracleText: trigger.data?.effects?.map((e: any) => e.type).join(', ') || 'Resolves...',
                                                      types: ['Ability'],
                                                      subtypes: [],
                                                      supertypes: [],
                                                      colors: [],
                                                      keywords: [],
                                                      manaCost: ''
                                                   }
                                                } as any}
                                                variant="small"
                                                onHoverStart={() => onHoverStart?.(trigger as any)}
                                                onHoverEnd={onHoverEnd}
                                            />
                                        </div>
                                        
                                        {/* Drag Handle Overlay */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover/trigger:opacity-100 transition-all shadow-xl">
                                             <GripVertical className="w-4 h-4 text-indigo-400" />
                                        </div>
                                    </div>

                                    {/* Position Indicator */}
                                    <div className="mt-6 text-[11px] font-black italic text-slate-600 group-hover/trigger:text-indigo-400 transition-colors uppercase tracking-widest">
                                        Step {orderedTriggers.indexOf(trigger) + 1}
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                )}

                {/* CARD GRID */}
                {!isOrderTriggers && !isScrySurveil && cardChoices.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-6 p-4">
                        {cardChoices.map((choice: any) => {
                            const originalIdx = choices.indexOf(choice);
                            const isSelected = selectedIndices.includes(originalIdx);
                            
                            return (
                                <motion.div 
                                    key={choice.cardData.id}
                                    className={`relative cursor-pointer transition-none ${isSelected ? 'z-20' : 'z-10'}`}
                                    onClick={() => handleChoiceClick(originalIdx)}
                                >
                                    <div 
                                        className="w-[calc(var(--u)*24)] h-[calc(var(--u)*17.3)]"
                                        style={{ '--header-scale': 2.0 } as any}
                                    >
                                        <GameCard 
                                            obj={choice.cardData} 
                                            variant="battlefield"
                                            onHoverStart={onHoverStart} 
                                            onHoverEnd={onHoverEnd}
                                            isSelected={false}
                                            disableHoverAnim={true}
                                        />
                                    </div>
                                    {isSelected && (
                                        <>
                                            <div className="absolute inset-x-[-2px] inset-y-[-2px] border-[3px] border-yellow-400 rounded-lg shadow-[0_0_20px_rgba(250,204,21,0.6)] pointer-events-none z-10" />
                                            {maxChoices > 1 && (
                                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 text-slate-950 font-black rounded-full flex items-center justify-center border-4 border-[#0b0f1a] shadow-2xl z-30 text-xs italic">
                                                    {selectedIndices.indexOf(originalIdx) + 1}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* BUTTON LIST */}
                {!isOrderTriggers && !isScrySurveil && buttonChoices.length > 0 && (
                    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
                        {buttonChoices.map((choice: any) => {
                            const originalIdx = choices.indexOf(choice);
                            const isSelected = selectedIndices.includes(originalIdx);
                            
                            return (
                                <button 
                                    key={originalIdx}
                                    onClick={() => handleChoiceClick(originalIdx)}
                                    className={`w-full p-6 rounded-[1.5rem] border text-base font-black uppercase italic tracking-[0.2em] transition-all hover:translate-y-[-2px] active:scale-[0.98] shadow-xl
                                        ${isSelected 
                                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-yellow-400 text-white ring-4 ring-yellow-400/20' 
                                            : 'bg-slate-800/50 hover:bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
                                >
                                    {choice.label}
                                </button>
                            );
                        })}
                    </div>
                )}
              </div>

              <div className="flex flex-row items-center justify-center gap-4 w-full max-w-xl mt-2 relative z-20">
                {/* UNDO/CANCEL BUTTON */}
                {(!isOrderTriggers && !isScrySurveil && pendingAction?.type !== ActionType.ResolutionChoice && !pendingAction?.data?.hideUndo) && (
                  <button 
                    onClick={() => onTapCard?.(`CHOICE_undo`)}
                    className="flex-1 max-w-[120px] p-2 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 text-[9px] font-black uppercase italic tracking-widest transition-all text-red-500/60 hover:text-red-500"
                  >
                    CANCEL
                  </button>
                )}

                {/* NONE/SKIP BUTTON */}
                {noneChoice && !isOrderTriggers && (
                  <button 
                    onClick={() => onTapCard?.(`CHOICE_${noneChoiceIdx}`)}
                    className="flex-1 max-w-[120px] p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[9px] font-black uppercase italic tracking-widest transition-all text-white/70 hover:text-white"
                  >
                    SKIP
                  </button>
                )}

                {/* CONFIRM BUTTON */}
                <button 
                  disabled={!isOrderTriggers && !isScrySurveil && selectedIndices.length < minChoices}
                  onClick={() => {
                      if (isOrderTriggers) confirmTriggerOrder();
                      else if (isScrySurveil) confirmScryResult();
                      else confirmSelection(selectedIndices);
                  }}
                  className={`flex-1 max-w-[200px] p-3 rounded-xl border-none text-sm font-black uppercase italic tracking-widest transition-all shadow-xl
                    ${(isOrderTriggers || isScrySurveil || selectedIndices.length >= minChoices)
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)]' 
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
                >
                  {isOrderTriggers ? "Stack" : isScrySurveil ? "Done" : `Confirm ${selectedIndices.length > 0 ? `(${selectedIndices.length})` : ''}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMIZED VIEW */}
      <AnimatePresence>
        {minimized && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-[1100]"
          >
            <button 
              onClick={() => setMinimized(false)}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black italic uppercase tracking-widest shadow-2xl shadow-indigo-600/40 border border-white/20 flex items-center gap-4 animate-bounce-subtle group"
            >
              <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Return to Choice
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
