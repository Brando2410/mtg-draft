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
  
  // Separate 'none' choice if it exists
  const noneChoiceIdx = choices.findIndex((c: any) => c.value === 'none' || c.label?.includes('Salte') || c.label?.includes('Skip') || c.label?.includes('Saluta') || c.label?.includes('Nessuna'));
  const filteredChoices = noneChoiceIdx !== -1 ? choices.filter((_: any, i: number) => i !== noneChoiceIdx) : choices;
  const noneChoice = noneChoiceIdx !== -1 ? choices[noneChoiceIdx] : null;

  const handleChoiceClick = (originalIdx: number) => {
      const choice = choices[originalIdx];
      if (!choice.selectable) return;

      if (choice.cardData) {
          if (maxChoices === 1) {
              // Standard single select
              if (selectedIndices.includes(originalIdx)) {
                  confirmSelection([originalIdx]);
              } else {
                  setSelectedIndices([originalIdx]);
              }
          } else {
              // Multi-select
              if (selectedIndices.includes(originalIdx)) {
                  setSelectedIndices(selectedIndices.filter(i => i !== originalIdx));
              } else if (selectedIndices.length < maxChoices) {
                  setSelectedIndices([...selectedIndices, originalIdx]);
              }
          }
      } else {
          // Direct pick for non-card choices (buttons)
          onTapCard?.(`CHOICE_${originalIdx}`);
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
            {maxChoices > 1 && <span className="block text-sm text-indigo-400 mt-1">Seleziona {minChoices === maxChoices ? minChoices : `${minChoices}-${maxChoices}`} carte ({selectedIndices.length} selezionate)</span>}
          </h3>
          
          <div className={`w-full custom-scrollbar overflow-y-auto max-h-[50vh] px-2 py-4 ${hasCards ? 'bg-black/20 rounded-3xl border border-white/5' : ''}`}>
            <div className={`w-full ${hasCards ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4' : 'flex flex-col gap-3'}`}>
              {filteredChoices.map((choice: any, idx: number) => {
                if (!choice.cardData) return null; // Skip non-card choices in the grid
                
                const originalIdx = choices.indexOf(choice);
                const isSelected = selectedIndices.includes(originalIdx);

                return (
                  <div key={idx} className="flex flex-col gap-3 group items-center">
                    <div 
                      onClick={() => handleChoiceClick(originalIdx)}
                      className={`relative transition-all duration-300 ${
                        choice.selectable 
                        ? `cursor-pointer hover:scale-110 active:scale-95 ring-offset-4 ring-offset-slate-900 ring-4 rounded-xl ${
                            isSelected 
                            ? 'ring-yellow-400 scale-110 shadow-[0_0_40px_rgba(250,204,21,0.6)] z-10' 
                            : 'ring-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                          }` 
                        : 'opacity-40 grayscale cursor-not-allowed'
                      }`}
                    >
                      <BattlefieldCard 
                        obj={choice.cardData} 
                        size="normal"
                        onHoverStart={onHoverStart}
                        onHoverEnd={onHoverEnd}
                        me={me}
                        forceNormal={true}
                      />
                      {choice.selectable && (
                        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap ${isSelected ? 'bg-yellow-400 text-black' : 'bg-cyan-500 text-slate-950'} text-[10px] font-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl`}>
                          {maxChoices === 1 ? (isSelected ? 'CLICCA DI NUOVO' : 'SELEZIONA') : (isSelected ? 'DESELEZIONA' : 'AGGIUNGI')}
                        </div>
                      )}
                      
                      {maxChoices > 1 && isSelected && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-slate-950 font-black shadow-lg z-20 animate-bounce">
                          {selectedIndices.indexOf(originalIdx) + 1}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {!hasCards && filteredChoices.map((choice: any, idx: number) => {
                const originalIdx = choices.indexOf(choice);
                return (
                  <button 
                    key={idx}
                    onClick={() => handleChoiceClick(originalIdx)}
                    className="w-full p-5 bg-slate-800 hover:bg-indigo-600 rounded-2xl border border-white/5 text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] text-white shadow-lg"
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            {selectedIndices.length >= minChoices && (
               <button 
                 onClick={() => confirmSelection(selectedIndices)}
                 className="w-full p-6 bg-yellow-400 hover:bg-yellow-300 rounded-2xl border-none text-md font-black uppercase italic tracking-widest transition-all hover:scale-[1.05] active:scale-[0.95] text-slate-950 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
               >
                 {maxChoices > 1 ? `CONFERMA (${selectedIndices.length})` : 'CONFERMA SELEZIONE'}
               </button>
            )}

            {noneChoice && selectedIndices.length === 0 && (
              <button 
                onClick={() => onTapCard?.(`CHOICE_${noneChoiceIdx}`)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.05] active:scale-[0.95] text-white"
              >
                {noneChoice.label}
              </button>
            )}

            {filteredChoices.map((choice: any, idx: number) => {
               if (choice.cardData || !choice.selectable || choice === noneChoice) return null;
               if (hasCards && choice.label.includes(choice.cardData?.definition?.name || "")) return null;

               const originalIdx = choices.indexOf(choice);
               
               return (
                 <button 
                   key={idx}
                   onClick={() => handleChoiceClick(originalIdx)}
                   className="w-full p-4 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-2xl border border-indigo-500/30 text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.05] active:scale-[0.95] text-white shadow-lg shadow-indigo-500/10"
                 >
                   {choice.label}
                 </button>
               );
            })}

            {!pendingAction.data?.hideUndo && pendingAction.type === ActionType.ModalSelection && (
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

