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
  const hasCards = choices.some((c: any) => c.cardData);
  
  // Separate 'none' choice if it exists
  const noneChoiceIdx = choices.findIndex((c: any) => c.value === 'none' || c.label?.includes('Salte') || c.label?.includes('Skip') || c.label?.includes('Saluta'));
  const filteredChoices = noneChoiceIdx !== -1 ? choices.filter((_: any, i: number) => i !== noneChoiceIdx) : choices;
  const noneChoice = noneChoiceIdx !== -1 ? choices[noneChoiceIdx] : null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }}
          className={`bg-slate-900 border border-white/10 p-8 rounded-[3rem] shadow-2xl ${hasCards ? 'max-w-6xl' : 'max-w-md'} w-full flex flex-col items-center gap-6 text-center shadow-indigo-500/10`}
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg ring-4 ring-indigo-500/20">
            <span className="text-2xl font-black italic text-white text-center">?</span>
          </div>
          
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            {pendingAction.data?.label || (hasCards ? "Scegli una Carta" : "Scegli un'Opzione")}
          </h3>
          
          <div className={`w-full custom-scrollbar overflow-y-auto max-h-[50vh] px-2 py-4 ${hasCards ? 'bg-black/20 rounded-3xl border border-white/5' : ''}`}>
            <div className={`w-full ${hasCards ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4' : 'flex flex-col gap-3'}`}>
              {filteredChoices.map((choice: any, idx: number) => {
                if (!choice.cardData) return null; // Skip non-card choices in the grid (already in footer)
                
                const originalIdx = choices.indexOf(choice);
                return (
                  <div key={idx} className="flex flex-col gap-3 group items-center">
                    <div 
                      onClick={() => choice.selectable && onTapCard?.(`CHOICE_${originalIdx}`)}
                      className={`relative transition-all ${
                        choice.selectable 
                        ? 'cursor-pointer hover:scale-110 active:scale-95 ring-offset-4 ring-offset-slate-900 ring-4 ring-cyan-500 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)]' 
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
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-500 text-[10px] font-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl text-slate-950">
                          SELEZIONA
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
                    onClick={() => onTapCard?.(`CHOICE_${originalIdx}`)}
                    className="w-full p-5 bg-slate-800 hover:bg-indigo-600 rounded-2xl border border-white/5 text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] text-white shadow-lg"
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            {noneChoice && (
              <button 
                onClick={() => onTapCard?.(`CHOICE_${noneChoiceIdx}`)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.05] active:scale-[0.95] text-white"
              >
                {noneChoice.label}
              </button>
            )}

            {filteredChoices.map((choice: any, idx: number) => {
               if (choice.cardData || choice.selectable !== true || choice === noneChoice) return null;
               const originalIdx = choices.indexOf(choice);
               return (
                 <button 
                   key={idx}
                   onClick={() => onTapCard?.(`CHOICE_${originalIdx}`)}
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
