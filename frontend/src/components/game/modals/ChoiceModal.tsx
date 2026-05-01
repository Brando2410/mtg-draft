import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ArrowRight, EyeOff, GripVertical } from 'lucide-react';
import { GameCard } from '../GameCard';
import { type GameObject, type PlayerState, ActionType, type StackObject } from '@shared/engine_types';

interface ChoiceModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  battlefield: GameObject[];
  stack: StackObject[];
  exile: any[];
  onTapCard: (id: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
}

export const ChoiceModal = ({ 
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
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [orderedTriggers, setOrderedTriggers] = useState<any[]>([]);
  const [scryState, setScryState] = useState<{ top: any[], bottom: any[], graveyard: any[] }>({ top: [], bottom: [], graveyard: [] });
  const [viewedPlayerId, setViewedPlayerId] = useState<string | null>(null);

  // CRITICAL: Reset state when the action changes (e.g. from mode selection to targeting modal)
  useEffect(() => {
    setSelectedIndices([]);
    setOrderedTriggers([]);
    setScryState({ top: [], bottom: [], graveyard: [] });
    setViewedPlayerId(null);
  }, [pendingAction?.type, pendingAction?.sourceId, pendingAction?.data?.label]);

  const sourceId = pendingAction?.sourceId;
  const sourceObject = useMemo(() => {
    if (!sourceId) return null;
    let obj = battlefield.find(c => c.id === sourceId);
    if (obj) return obj;
    const stackObj = stack.find(s => s.id === sourceId || s.sourceId === sourceId);
    if (stackObj) {
        return {
            id: stackObj.id,
            definition: stackObj.definition || (stackObj as any).cardData?.definition
        } as GameObject;
    }
    obj = (me?.graveyard as any[])?.find(c => c.id === sourceId);
    if (obj) return obj;
    obj = (opponent?.graveyard as any[])?.find(c => c.id === sourceId);
    if (obj) return obj;
    obj = exile.find(c => c.id === sourceId);
    if (obj) return obj;
    obj = (me?.hand as any[])?.find(c => c.id === sourceId);
    if (obj) return obj;
    return null;
  }, [sourceId, battlefield, stack, me, opponent, exile]);

  const isOrderTriggers = pendingAction?.type === ActionType.OrderTriggers;
  const isScrySurveil = pendingAction?.type === ActionType.Scry || pendingAction?.type === ActionType.Surveil;
  const isChoiceAction = [
    ActionType.Choice,
    ActionType.ModalSelection,
    ActionType.ResolutionChoice,
    ActionType.OptionalAction,
    ActionType.Scry,
    ActionType.Surveil,
    ActionType.LegendRule
  ].includes(pendingAction?.type) || isOrderTriggers;

  const choices = pendingAction?.data?.choices || [];
  const minChoices = pendingAction?.data?.minChoices || 1;
  const maxChoices = pendingAction?.data?.maxChoices || 1;
  const isCostChoice = pendingAction?.data?.isCostChoice;
  const hasCards = choices.some((c: any) => c.cardData);
  
  const noneChoiceIdx = choices.findIndex((c: any) => 
    c.value === 'none' || c.isNone === true
  );
  
  const cardChoices = choices.filter((c: any) => c.cardData);
  const buttonChoices = choices.filter((c: any, i: number) => !c.cardData && i !== noneChoiceIdx);
  const noneChoice = noneChoiceIdx !== -1 ? choices[noneChoiceIdx] : null;

  const availablePlayerIds = useMemo(() => {
    const ids = new Set<string>();
    cardChoices.forEach((c: any) => {
        if (c.cardData?.ownerId) ids.add(c.cardData.ownerId);
    });
    const sorted = Array.from(ids);
    if (me?.id && sorted.includes(me.id)) {
        return [me.id, ...sorted.filter(id => id !== me.id)];
    }
    return sorted;
  }, [cardChoices, me?.id]);

  const activeViewedPlayerId = viewedPlayerId || me?.id || availablePlayerIds[0];

  const filteredCardChoices = useMemo(() => {
    if (availablePlayerIds.length <= 1) return cardChoices;
    return cardChoices.filter((c: any) => c.cardData?.ownerId === activeViewedPlayerId);
  }, [cardChoices, availablePlayerIds, activeViewedPlayerId]);

  useEffect(() => {
    if (isOrderTriggers && pendingAction?.data?.triggers) {
        setOrderedTriggers(pendingAction.data.triggers);
    }
    if (isScrySurveil && pendingAction?.data?.lookingCards) {
        setScryState({
            top: [...pendingAction.data.lookingCards],
            bottom: [],
            graveyard: []
        });
    }
  }, [pendingAction?.data?.triggers, pendingAction?.data?.lookingCards, isOrderTriggers, isScrySurveil]);

  useEffect(() => {
    if (me?.id) setViewedPlayerId(me.id);
    setSelectedIndices([]); // Reset selections whenever the action context changes
  }, [pendingAction?.id, pendingAction?.type, pendingAction?.sourceId, me?.id]);

  if (!isChoiceAction) return null;

  const isMyChoice = pendingAction?.playerId === me?.id;
  if (!isMyChoice || pendingAction?.data?.isContextual) return null;

  const handleChoiceClick = (originalIdx: number) => {
      const choice = choices[originalIdx];
      if (!choice || choice.selectable === false) return;
      const allowDuplicates = pendingAction?.data?.allowDuplicates;

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
          if (allowDuplicates) {
              if (selectedIndices.length < maxChoices) {
                  setSelectedIndices([...selectedIndices, originalIdx]);
              }
          } else {
              if (selectedIndices.includes(originalIdx)) {
                  setSelectedIndices(selectedIndices.filter(i => i !== originalIdx));
              } else if (selectedIndices.length < maxChoices) {
                  setSelectedIndices([...selectedIndices, originalIdx]);
              }
          }
      }
  };

  const handleChoiceRightClick = (e: React.MouseEvent, originalIdx: number) => {
      e.preventDefault();
      const allowDuplicates = pendingAction?.data?.allowDuplicates;
      if (!allowDuplicates) return;

      const firstMatch = selectedIndices.indexOf(originalIdx);
      if (firstMatch !== -1) {
          const newIndices = [...selectedIndices];
          newIndices.splice(firstMatch, 1);
          setSelectedIndices(newIndices);
      }
  };

  const confirmSelection = (indices: number[]) => {
      if (indices.length < minChoices) return;
      onTapCard?.(indices.map(i => `CHOICE_${i}`).join('|'));
      setSelectedIndices([]);
  };

  const confirmTriggerOrder = () => {
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
              {/* SOURCE CARD SECTION (Left) */}
              {sourceObject && (
                <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/[0.04] border-r border-white/5 relative group/source w-[35vw] max-w-[480px]">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
                   
                   <div className="flex flex-col items-center gap-12">
                     <div className="flex flex-col items-center gap-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.8em] text-indigo-400 italic drop-shadow-md">Source</p>
                        <div className="h-0.5 w-12 bg-indigo-500/30 rounded-full" />
                     </div>
                     
                     <motion.div 
                      initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
                      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="relative z-10 perspective-1000"
                     >
                       <div className="relative group/card-3d transform-gpu transition-transform">
                          {/* Powerful Depth Glow */}
                          <div className="absolute inset-x-[-30%] inset-y-[-15%] bg-indigo-500/30 blur-[100px] opacity-100 rounded-full animate-pulse" />
                          <div className="absolute inset-0 bg-indigo-400/40 blur-[40px] opacity-0 group-hover/card-3d:opacity-100 transition-all duration-700 rounded-2xl" />
                          
                          {/* Sized container for the card */}
                          <div className="w-[calc(var(--u)*38)] h-[calc(var(--u)*53)] relative z-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden">
                              <GameCard obj={sourceObject} variant="full" hideHeader={true} />
                          </div>
                          
                          {/* Holographic Reflection Effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-20 pointer-events-none" />
                       </div>
                     </motion.div>
                     
                     <motion.div 
                      animate={{ 
                        x: [0, 15, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="text-indigo-400 flex flex-col items-center gap-1"
                     >
                        <ArrowRight className="w-16 h-16 stroke-[2.5]" />
                        <span className="text-[8px] font-black tracking-[0.5em] text-indigo-400/40 uppercase">Choice</span>
                     </motion.div>
                   </div>
                </div>
              )}

              {/* MAIN CONTENT COLUMN (Right) */}
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 relative min-h-0 w-[55vw] bg-black/5 border-l border-white/10">
                  {/* BACKGROUND DECOR */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                  
                  {/* MINIMIZE BUTTON */}
                  <button 
                    onClick={() => setMinimized(true)}
                    className="absolute top-6 right-8 p-2 px-6 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black z-30 tracking-widest border border-white/10 group backdrop-blur-md"
                  >
                    <EyeOff className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    MINIMIZE
                  </button>

                  {/* Header Title */}
                  <div className="flex flex-col gap-1 mb-4 select-none px-6 w-full text-center">
                    <h3 className={`font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] ${isCostChoice ? 'text-3xl' : 'text-5xl'}`}>
                      {isScrySurveil ? (pendingAction.type === ActionType.Surveil ? "Surveil" : "Scry") : 
                       isOrderTriggers ? "Order Triggers" : 
                       (pendingAction.data?.label || (hasCards ? "Choose a Card" : "Choose an Option"))}
                    </h3>
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-[2px]" />
                  </div>

                  {/* Choices Area */}
                  <div className={`w-full custom-scrollbar overflow-x-auto overflow-y-auto max-h-[60vh] px-8 py-6 flex flex-col items-center ${hasCards || isOrderTriggers ? 'bg-black/30 rounded-[2.5rem] border border-white/5 shadow-inner mx-8' : ''}`}>
                      {/* SCRY / SURVEIL VIEW */}
                      {isScrySurveil && (
                          <div className="flex flex-col items-center w-full gap-8 py-4">
                              <div className="flex flex-row items-start justify-center gap-10 w-full relative">
                                  {pendingAction.type === ActionType.Surveil && (
                                      <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]" data-zone="graveyard">
                                          <h4 className="text-xs font-black italic uppercase tracking-widest text-red-500/80">Graveyard</h4>
                                          <div className="w-full aspect-[4/3] rounded-3xl border border-white/10 bg-white/5 flex flex-col items-center justify-center p-4 relative overflow-x-auto custom-scrollbar shadow-2xl">
                                              <Reorder.Group axis="x" values={scryState.graveyard} onReorder={(vals) => setScryState(p => ({ ...p, graveyard: vals }))} className="flex flex-row justify-center items-center w-full gap-4 px-4">
                                                  {scryState.graveyard.map((card: any, idx: number) => (
                                                      <Reorder.Item key={card.id || `grave-${idx}`} value={card} className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0" drag="y" whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                                          onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 50) { const el = document.elementFromPoint(info.point.x, info.point.y); const zone = el?.closest('[data-zone]'); const targetZone = zone?.getAttribute('data-zone'); if (targetZone && targetZone !== 'graveyard') moveCard(card, 'graveyard', targetZone as any); } }}
                                                          onClick={() => moveCard(card, 'graveyard', 'top')}>
                                                          <GameCard obj={card} variant="small" onHoverStart={() => onHoverStart?.(card)} onHoverEnd={onHoverEnd} />
                                                      </Reorder.Item>
                                                  ))}
                                              </Reorder.Group>
                                          </div>
                                      </div>
                                  )}

                                  <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]" data-zone="top">
                                      <h4 className="text-xs font-black italic uppercase tracking-widest text-cyan-400">Top of Library</h4>
                                      <div className="w-full aspect-[4/3] rounded-3xl border border-white/10 bg-indigo-500/5 shadow-2xl flex flex-col items-center justify-center p-4 relative overflow-x-auto custom-scrollbar">
                                          <Reorder.Group axis="x" values={scryState.top} onReorder={(vals) => setScryState(p => ({ ...p, top: vals }))} className="flex flex-row justify-center items-center w-full gap-4 px-4">
                                              {scryState.top.map((card: any, idx: number) => (
                                                  <Reorder.Item key={card.id || `scry-item-${idx}`} value={card} className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0" drag="y" whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                                      onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 50) { const el = document.elementFromPoint(info.point.x, info.point.y); const zone = el?.closest('[data-zone]'); const targetZone = zone?.getAttribute('data-zone'); if (targetZone && targetZone !== 'top') moveCard(card, 'top', targetZone as any); } }}
                                                      onClick={() => moveCard(card, 'top', pendingAction.type === ActionType.Surveil ? 'graveyard' : 'bottom')}>
                                                      <div className="relative group/card">
                                                          <GameCard obj={card} variant="small" onHoverStart={() => onHoverStart?.(card)} onHoverEnd={onHoverEnd} />
                                                          {scryState.top.length > 1 && (
                                                              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 border-2 border-[#0b0f1a] flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-50">
                                                                  {scryState.top.indexOf(card) + 1}
                                                              </div>
                                                          )}
                                                      </div>
                                                  </Reorder.Item>
                                              ))}
                                          </Reorder.Group>
                                      </div>
                                  </div>

                                  {pendingAction.type === ActionType.Scry && (
                                      <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]" data-zone="bottom">
                                          <h4 className="text-xs font-black italic uppercase tracking-widest text-amber-500/80">Bottom</h4>
                                          <div className="w-full aspect-[4/3] rounded-3xl border border-white/10 bg-white/5 shadow-2xl flex flex-col items-center justify-center p-4 relative overflow-x-auto custom-scrollbar">
                                              <Reorder.Group axis="x" values={scryState.bottom} onReorder={(vals) => setScryState(p => ({ ...p, bottom: vals }))} className="flex flex-row justify-center items-center w-full gap-4 px-4">
                                                  {scryState.bottom.map((card: any, idx: number) => (
                                                      <Reorder.Item key={card.id || `top-${idx}`} value={card} className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0" drag="y" whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                                          onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 50) { const el = document.elementFromPoint(info.point.x, info.point.y); const zone = el?.closest('[data-zone]'); const targetZone = zone?.getAttribute('data-zone'); if (targetZone && targetZone !== 'bottom') moveCard(card, 'bottom', targetZone as any); } }}
                                                          onClick={() => moveCard(card, 'bottom', 'top')}>
                                                          <div className="relative group/card">
                                                              <GameCard obj={card} variant="small" onHoverStart={() => onHoverStart?.(card)} onHoverEnd={onHoverEnd} />
                                                              {scryState.bottom.length > 1 && (
                                                                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-600 border-2 border-[#0b0f1a] flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-50">
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
                          <div className="flex flex-col items-center w-full px-12 py-4">
                              <div className="w-full flex justify-between px-4 mb-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 relative">
                                   <div className="absolute left-0 right-0 h-px bg-white/10 top-1/2 -z-10" />
                                   <span className="bg-[#0b0f1a] px-6 text-indigo-400">Resolves Last</span>
                                   <span className="bg-[#0b0f1a] px-6 text-amber-400">Resolves First</span>
                              </div>
                              <Reorder.Group axis="x" values={orderedTriggers} onReorder={setOrderedTriggers} className="flex flex-row justify-center gap-10 w-full py-4">
                                  {orderedTriggers.map((trigger, idx) => (
                                      <Reorder.Item key={trigger.id || `trigger-${idx}`} value={trigger} className="relative group/trigger cursor-grab active:cursor-grabbing">
                                          <div className="relative transform transition-transform group-hover/trigger:scale-[1.05] scale-90 -my-6">
                                              <GameCard obj={{ id: trigger.id, definition: trigger.definition || { name: trigger.name, image_url: trigger.image_url, types: ['Ability'] } } as any} variant="small" />
                                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover/trigger:opacity-100 transition-all shadow-xl">
                                                <GripVertical className="w-4 h-4 text-indigo-400" />
                                              </div>
                                          </div>
                                          <div className="mt-8 text-xs font-black italic text-slate-500 group-hover/trigger:text-indigo-400 transition-colors uppercase tracking-[0.2em]">
                                              Step {orderedTriggers.indexOf(trigger) + 1}
                                          </div>
                                      </Reorder.Item>
                                  ))}
                              </Reorder.Group>
                          </div>
                      )}

                      {/* CARD GRID */}
                      {!isOrderTriggers && !isScrySurveil && cardChoices.length > 0 && (
                          <>
                              {availablePlayerIds.length > 1 && (
                                  <div className="flex items-center justify-center gap-4 mb-8 bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-md">
                                      {availablePlayerIds.map(pid => {
                                          const isMe = pid === me?.id;
                                          const isActive = pid === activeViewedPlayerId;
                                          const countInTab = cardChoices.filter((c: any) => c.cardData?.ownerId === pid && selectedIndices.includes(choices.indexOf(c))).length;
                                          const playerName = isMe ? "Your Cards" : (pid === opponent?.id ? `${opponent.name}'s Cards` : "Opponent's Cards");

                                          return (
                                              <button 
                                                  key={pid}
                                                  onClick={() => setViewedPlayerId(pid)}
                                                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${isActive ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                              >
                                                  {playerName}
                                                  {countInTab > 0 && (
                                                      <span className="w-5 h-5 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center text-[10px] shadow-lg animate-in zoom-in duration-300">
                                                          {countInTab}
                                                      </span>
                                                  )}
                                              </button>
                                          );
                                      })}
                                  </div>
                              )}
                              
                              <div className="flex flex-wrap justify-center gap-8 p-6">
                                  {filteredCardChoices.map((choice: any, idx: number) => {
                                      const originalIdx = choices.indexOf(choice);
                                      const isSelected = selectedIndices.includes(originalIdx);
                                      const allowDuplicates = pendingAction?.data?.allowDuplicates;
                                      const selectionCount = selectedIndices.filter(i => i === originalIdx).length;
                                      return (
                                          <motion.div key={choice.cardData.id || `choice-card-${idx}`} className={`relative cursor-pointer transition-all hover:translate-y-[-5px] ${isSelected ? 'z-20 scale-105' : 'z-10'}`} onClick={() => handleChoiceClick(originalIdx)} onContextMenu={(e) => handleChoiceRightClick(e, originalIdx)}>
                                              <div className="w-[calc(var(--u)*26)] h-[calc(var(--u)*18.7)]">
                                                  <GameCard obj={choice.cardData} variant="battlefield" onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} isSelected={false} disableHoverAnim={true} />
                                              </div>
                                              {isSelected && (
                                                  <>
                                                      <div className="absolute inset-x-[-4px] inset-y-[-4px] border-[4px] border-yellow-400 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.8)] pointer-events-none z-10" />
                                                      {maxChoices > 1 && (
                                                          <div className="absolute -top-4 -right-4 w-10 h-10 bg-yellow-400 text-slate-950 font-black rounded-full flex items-center justify-center border-4 border-[#0b0f1a] shadow-2xl z-30 text-sm italic">
                                                              {allowDuplicates ? `x${selectionCount}` : selectedIndices.indexOf(originalIdx) + 1}
                                                          </div>
                                                      )}
                                                  </>
                                              )}
                                          </motion.div>
                                      );
                                  })}
                              </div>
                          </>
                      )}

                      {/* BUTTON LIST */}
                      {!isOrderTriggers && !isScrySurveil && buttonChoices.length > 0 && (
                          <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto py-4">
                                  {buttonChoices.map((choice: any, idx: number) => {
                                      const originalIdx = choices.indexOf(choice);
                                      const isSelected = selectedIndices.includes(originalIdx);
                                      const isSelectable = choice.selectable !== false;
                                      const label = (choice.label || "");
                                      const fontSize = label.length > 80 ? 'text-[10px] p-4 leading-tight' : 
                                                     label.length > 50 ? 'text-xs p-5' : 
                                                     label.length > 30 ? 'text-sm p-5' : 'text-base p-6';
                                      
                                      const allowDuplicates = pendingAction?.data?.allowDuplicates;
                                      const selectionCount = selectedIndices.filter(i => i === originalIdx).length;

                                      return (
                                          <button 
                                              key={`choice-button-${originalIdx}-${idx}`} 
                                              onClick={() => isSelectable && handleChoiceClick(originalIdx)} 
                                              onContextMenu={(e) => isSelectable && handleChoiceRightClick(e, originalIdx)}
                                              className={`w-full rounded-[2rem] border font-black uppercase italic tracking-[0.2em] transition-all shadow-2xl ${fontSize} relative
                                                  ${!isSelectable 
                                                      ? 'bg-slate-900/40 border-white/5 text-slate-600 cursor-not-allowed opacity-50 grayscale' 
                                                      : isSelected 
                                                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-yellow-400 text-white ring-8 ring-yellow-400/10 hover:translate-y-[-4px]' 
                                                          : 'bg-slate-800/40 hover:bg-slate-800/80 border-white/5 text-slate-400 hover:text-white hover:translate-y-[-4px] active:scale-[0.98]'
                                                  }`}
                                          >
                                              <div className="flex items-center justify-between gap-4">
                                                <span className="flex-1 text-center">{label}</span>
                                                {allowDuplicates && selectionCount > 0 && (
                                                    <motion.span 
                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="w-10 h-10 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center text-sm shadow-[0_0_15px_rgba(250,204,21,0.5)] border-2 border-[#0b0f1a]"
                                                    >
                                                        x{selectionCount}
                                                    </motion.span>
                                                )}
                                              </div>
                                              {!isSelectable && (
                                                  <div className="text-[9px] mt-1 opacity-60 tracking-normal font-bold">Cannot satisfy costs</div>
                                              )}
                                          </button>
                                      );
                                  })}
                          </div>
                      )}
                      
                      {/* FALLBACK FOR MISSING BUTTONS */}
                      {!isOrderTriggers && !isScrySurveil && buttonChoices.length === 0 && !hasCards && (
                          <div className="p-10 border-2 border-dashed border-red-500/20 rounded-[2rem] text-red-500/40 font-black uppercase tracking-[0.2em] italic">
                              No choices available to select
                              <div className="text-[8px] mt-2 opacity-50">PendingAction Type: {pendingAction?.type} | Choices: {choices.length}</div>
                          </div>
                      )}
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
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
                    <button disabled={!isOrderTriggers && !isScrySurveil && selectedIndices.length < minChoices} onClick={() => { if (isOrderTriggers) confirmTriggerOrder(); else if (isScrySurveil) confirmScryResult(); else confirmSelection(selectedIndices); }} className={`flex-1 max-w-[240px] p-5 rounded-2xl border-none text-base font-black uppercase italic tracking-[0.2em] transition-all shadow-2xl ${(isOrderTriggers || isScrySurveil || selectedIndices.length >= minChoices) ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 scale-105 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}>
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
};
