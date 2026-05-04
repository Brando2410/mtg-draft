import { memo } from 'react';
import { motion } from 'framer-motion';

interface ButtonChoiceListProps {
  buttonChoices: any[];
  choices: any[];
  selectedIndices: number[];
  allowDuplicates: boolean;
  handleChoiceClick: (originalIdx: number) => void;
  handleChoiceRightClick: (e: React.MouseEvent, originalIdx: number) => void;
}

export const ButtonChoiceList = memo(({
  buttonChoices,
  choices,
  selectedIndices,
  allowDuplicates,
  handleChoiceClick,
  handleChoiceRightClick
}: ButtonChoiceListProps) => {
  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto py-4">
            {buttonChoices.map((choice: any, idx: number) => {
                const originalIdx = choices.indexOf(choice);
                const isSelected = selectedIndices.includes(originalIdx);
                const isSelectable = choice.selectable !== false;
                const label = (choice.label || "");
                const fontSize = label.length > 80 ? 'text-[10px] p-4 leading-tight' : 
                               label.length > 50 ? 'text-xs p-5' : 
                               label.length > 30 ? 'text-sm p-5' : 'text-base p-6';
                
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
  );
});
