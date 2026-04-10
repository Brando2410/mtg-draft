import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattlefieldCard } from '../BattlefieldCard';
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
                  confirmSelection([originalIdx]);
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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setSelectedIndices([])}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-slate-900 border border-white/10 p-8 rounded-[3rem] shadow-2xl ${hasCards ? 'max-w-6xl' : 'max-w-md'} w-full flex flex-col items-center gap-6 text-center shadow-indigo-500/10`}
        >
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
                    {cardChoices.map((choice: any) => {
                        const originalIdx = choices.indexOf(choice);
                        const isSelected = selectedIndices.includes(originalIdx);
                        
                        return (
                            <motion.div 
                                key={choice.cardData.id}
                                className={`relative cursor-pointer transition-all ${isSelected ? 'scale-105' : 'hover:scale-105'}`}
                                onClick={() => handleChoiceClick(originalIdx)}
                            >
                                <BattlefieldCard 
                                    obj={choice.cardData} 
                                    onHoverStart={onHoverStart} 
                                    onHoverEnd={onHoverEnd}
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.6)] pointer-events-none z-10" />
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

          <div className="flex flex-col gap-4 w-full max-w-xs">
            {/* MULTI-SELECT CONFIRM BUTTON */}
            {maxChoices > 1 && selectedIndices.length >= minChoices && (
               <button 
                 onClick={() => confirmSelection(selectedIndices)}
                 className="w-full p-6 bg-yellow-400 hover:bg-yellow-300 rounded-2xl border-none text-md font-black uppercase italic tracking-widest transition-all hover:scale-[1.05] active:scale-[0.95] text-slate-950 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
               >
                 CONFERMA {maxChoices > 1 ? `(${selectedIndices.length})` : 'SELEZIONE'}
               </button>
            )}

            {/* NONE/SKIP BUTTON */}
            {noneChoice && selectedIndices.length === 0 && (
              <button 
                onClick={() => onTapCard?.(`CHOICE_${noneChoiceIdx}`)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.05] active:scale-[0.95] text-white"
              >
                {noneChoice.label}
              </button>
            )}

            {/* UNDO BUTTON */}
            {!pendingAction.data?.hideUndo && (
              <button 
                onClick={() => onTapCard?.(`CHOICE_undo`)}
                className="px-8 py-3 bg-red-500/10 hover:bg-red-500/30 rounded-full border border-red-500/20 text-xs font-black uppercase italic tracking-widest transition-all text-red-100/60 hover:text-red-100"
              >
                ANNULLA (Undo)
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
