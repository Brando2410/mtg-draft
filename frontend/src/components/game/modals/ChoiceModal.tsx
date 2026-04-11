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

  const isOrderTriggers = pendingAction?.type === ActionType.OrderTriggers;
  const isChoiceAction = [
    ActionType.Choice,
    ActionType.ModalSelection,
    ActionType.ResolutionChoice,
    ActionType.OptionalAction
  ].includes(pendingAction?.type) || isOrderTriggers;

  useEffect(() => {
    if (isOrderTriggers && pendingAction.data?.triggers) {
        setOrderedTriggers(pendingAction.data.triggers);
    }
  }, [pendingAction?.data?.triggers, isOrderTriggers]);

  if (!isChoiceAction) return null;

  const isMyChoice = pendingAction.playerId === me?.id;
  if (!isMyChoice) return null;

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

  return (
    <>
      <AnimatePresence>
        {!minimized && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto custom-scrollbar"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0b0f1a] border border-white/10 p-10 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] max-w-7xl w-full flex flex-col items-center gap-8 text-center relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full" />

              {/* MINIMIZE BUTTON */}
              <button 
                onClick={() => setMinimized(true)}
                className="absolute top-4 left-1/2 -translate-x-1/2 p-2 px-6 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-3 text-[10px] font-black z-30 tracking-[0.3em] border border-white/5"
              >
                <EyeOff className="w-3.5 h-3.5" />
                SHOW BATTLEFIELD
              </button>

              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mb-2 shadow-2xl border border-indigo-500/30">
                <span className="text-3xl font-black italic text-indigo-400 drop-shadow-lg leading-none">?</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-sm">
                  {isOrderTriggers ? "Choose Order" : (pendingAction.data?.label || (hasCards ? "Choose a Card" : "Choose an Option"))}
                </h3>
                {isOrderTriggers ? (
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Drag items to define resolution order</p>
                ) : maxChoices > 1 && (
                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
                        Select {minChoices === maxChoices ? minChoices : `${minChoices}-${maxChoices}`} options ({selectedIndices.length} selected)
                    </span>
                )}
              </div>
              
              <div className={`w-full custom-scrollbar overflow-y-auto max-h-[55vh] px-4 py-8 ${hasCards || isOrderTriggers ? 'bg-black/30 rounded-[3rem] border border-white/5 shadow-inner' : ''}`}>
                
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
                                        <div className="relative transform transition-transform group-hover/trigger:scale-[1.03]">
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
                {!isOrderTriggers && cardChoices.length > 0 && (
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
                                    <GameCard 
                                        obj={choice.cardData} 
                                        onHoverStart={onHoverStart} 
                                        onHoverEnd={onHoverEnd}
                                        isSelected={isSelected}
                                    />
                                    {isSelected && (
                                        <div className="absolute inset-x-[-8px] inset-y-[-8px] border-[4px] border-yellow-400 rounded-[1.4rem] shadow-[0_0_30px_rgba(250,204,21,0.5)] pointer-events-none z-10" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* BUTTON LIST */}
                {!isOrderTriggers && buttonChoices.length > 0 && (
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

              <div className="flex flex-row items-center justify-center gap-6 w-full max-w-2xl mt-4 relative z-20">
                {/* UNDO/CANCEL BUTTON */}
                {!pendingAction.data?.hideUndo && !isOrderTriggers && (
                  <button 
                    onClick={() => onTapCard?.(`CHOICE_undo`)}
                    className="flex-1 max-w-[180px] p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/10 text-[11px] font-black uppercase italic tracking-[0.2em] transition-all text-red-500/60 hover:text-red-500"
                  >
                    CANCEL
                  </button>
                )}

                {/* CONFIRM BUTTON */}
                <button 
                  disabled={!isOrderTriggers && selectedIndices.length < minChoices}
                  onClick={() => isOrderTriggers ? confirmTriggerOrder() : confirmSelection(selectedIndices)}
                  className={`flex-1 max-w-[280px] p-5 rounded-[1.25rem] border-none text-base font-black uppercase italic tracking-[0.2em] transition-all shadow-[0_15px_30px_rgba(0,0,0,0.3)]
                    ${(isOrderTriggers || selectedIndices.length >= minChoices)
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 scale-105 shadow-[0_0_30px_rgba(250,204,21,0.4)]' 
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
                >
                  {isOrderTriggers ? "Stack Triggers" : `Confirm ${selectedIndices.length > 1 ? `(${selectedIndices.length})` : ''}`}
                </button>

                {/* NONE/SKIP BUTTON */}
                {noneChoice && !isOrderTriggers && (
                  <button 
                    onClick={() => onTapCard?.(`CHOICE_${noneChoiceIdx}`)}
                    className="flex-1 max-w-[180px] p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-[11px] font-black uppercase italic tracking-[0.2em] transition-all text-white/70 hover:text-white"
                  >
                    {noneChoice.label}
                  </button>
                )}
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
