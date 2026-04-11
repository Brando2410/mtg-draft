import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
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

  const isChoiceAction = [
    ActionType.Choice,
    ActionType.ModalSelection,
    ActionType.ResolutionChoice,
    ActionType.OptionalAction
  ].includes(pendingAction?.type);

  if (!isChoiceAction) return null;

  const isMyChoice = pendingAction.playerId === me?.id;
  if (!isMyChoice) return null;

  const choices = pendingAction.data?.choices || [];
  const minChoices = pendingAction.data?.minChoices || 1;
  const maxChoices = pendingAction.data?.maxChoices || 1;
  const hasCards = choices.some((c: any) => c.cardData);
  
  // Find 'None/Skip' choice
  const noneChoiceIdx = choices.findIndex((c: any) => 
    c.value === 'none' || 
    c.label?.toLowerCase().includes('salta') || 
    c.label?.toLowerCase().includes('skip') || 
    c.label?.toLowerCase().includes('nessuna')
  );
  
  // Separate into card choices and button choices
  const cardChoices = choices.filter((c: any) => c.cardData && c.selectable !== false);
  const buttonChoices = choices.filter((c: any, i: number) => !c.cardData && c.selectable !== false && i !== noneChoiceIdx);
  const noneChoice = noneChoiceIdx !== -1 ? choices[noneChoiceIdx] : null;

  const handleChoiceClick = (originalIdx: number) => {
      const choice = choices[originalIdx];
      if (!choice || choice.selectable === false) return;

      if (maxChoices === 1) {
          // Standard single select
          if (choice.cardData) {
              if (selectedIndices.includes(originalIdx)) {
                  // Deselect if already selected
                  setSelectedIndices([]);
              } else {
                  setSelectedIndices([originalIdx]);
              }
          } else {
              // Direct pick for non-card choices (buttons)
              onTapCard?.(`CHOICE_${originalIdx}`);
          }
      } else {
          // Multi-select
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

  return (
    <>
      <AnimatePresence>
        {!minimized && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto custom-scrollbar"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-6xl w-full flex flex-col items-center gap-8 text-center relative"
            >
              {/* MINIMIZE BUTTON */}
              <button 
                onClick={() => setMinimized(true)}
                className="absolute top-4 left-1/2 -translate-x-1/2 p-2 px-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black z-30 tracking-[0.2em]"
              >
                <EyeOff className="w-3.5 h-3.5" />
                SHOW BATTLEFIELD
              </button>

              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg ring-4 ring-indigo-500/20">
                <span className="text-2xl font-black italic text-white text-center">?</span>
              </div>
              
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                {pendingAction.data?.label || (hasCards ? "Scegli una Carta" : "Scegli un'Opzione")}
                {maxChoices > 1 && (
                    <span className="block text-sm text-indigo-400 mt-1">
                        Seleziona {minChoices === maxChoices ? minChoices : `${minChoices}-${maxChoices}`} opzioni ({selectedIndices.length} selezionate)
                    </span>
                )}
              </h3>
              
              <div className={`w-full custom-scrollbar overflow-y-auto max-h-[50vh] px-2 py-4 ${hasCards ? 'bg-black/20 rounded-3xl border border-white/5' : ''}`}>
                {/* CARD GRID */}
                {cardChoices.length > 0 && (
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
                                        <div className="absolute inset-x-[-6px] inset-y-[-6px] border-[3px] border-yellow-400 rounded-[1.2rem] shadow-[0_0_20px_rgba(250,204,21,0.4)] pointer-events-none z-10" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* BUTTON LIST */}
                {buttonChoices.length > 0 && (
                    <div className="flex flex-col gap-3 w-full">
                        {buttonChoices.map((choice: any) => {
                            const originalIdx = choices.indexOf(choice);
                            const isSelected = selectedIndices.includes(originalIdx);
                            
                            return (
                                <button 
                                    key={originalIdx}
                                    onClick={() => handleChoiceClick(originalIdx)}
                                    className={`w-full p-5 rounded-2xl border text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg
                                        ${isSelected 
                                            ? 'bg-indigo-600 border-yellow-400 text-white ring-2 ring-yellow-400/50' 
                                            : 'bg-slate-800 hover:bg-indigo-600 border-white/5 text-slate-300 hover:text-white'}`}
                                >
                                    {choice.label}
                                </button>
                            );
                        })}
                    </div>
                )}
              </div>

              <div className="flex flex-row items-center justify-center gap-4 w-full max-w-xl mt-4">
                {/* UNDO BUTTON (Now on the left) */}
                {!pendingAction.data?.hideUndo && (
                  <button 
                    onClick={() => onTapCard?.(`CHOICE_undo`)}
                    className="flex-1 max-w-[160px] p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-[10px] font-black uppercase italic tracking-widest transition-all text-red-100/60 hover:text-red-100"
                  >
                    CANCEL
                  </button>
                )}

                {/* CONFIRM BUTTON (Always visible, disabled if no selection) */}
                <button 
                  disabled={selectedIndices.length < minChoices}
                  onClick={() => confirmSelection(selectedIndices)}
                  className={`flex-1 max-w-[200px] p-4 rounded-xl border-none text-sm font-black uppercase italic tracking-widest transition-all shadow-lg
                    ${selectedIndices.length >= minChoices 
                      ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.3)]' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                >
                  CONFIRM {selectedIndices.length > 1 ? `(${selectedIndices.length})` : ''}
                </button>

                {/* NONE/SKIP BUTTON */}
                {noneChoice && (
                  <button 
                    onClick={() => onTapCard?.(`CHOICE_${noneChoiceIdx}`)}
                    className="flex-1 max-w-[160px] p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[10px] font-black uppercase italic tracking-widest transition-all text-white"
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
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic uppercase tracking-widest shadow-2xl shadow-indigo-600/40 border border-white/20 flex items-center gap-3 animate-bounce-subtle"
            >
              <Eye className="w-5 h-5" />
              Return to Choice
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
