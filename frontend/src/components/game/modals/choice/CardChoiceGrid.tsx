import { memo } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from '../../GameCard';
import { type PlayerState, type GameObject } from '@shared/engine_types';

interface CardChoiceGridProps {
  cardChoices: any[];
  filteredCardChoices: any[];
  choices: any[];
  selectedIndices: number[];
  maxChoices: number;
  allowDuplicates: boolean;
  availablePlayerIds: string[];
  activeViewedPlayerId: string;
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  setViewedPlayerId: (id: string) => void;
  handleChoiceClick: (originalIdx: number) => void;
  handleChoiceRightClick: (e: React.MouseEvent, originalIdx: number) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
}

export const CardChoiceGrid = memo(({
  cardChoices,
  filteredCardChoices,
  choices,
  selectedIndices,
  maxChoices,
  allowDuplicates,
  availablePlayerIds,
  activeViewedPlayerId,
  me,
  opponent,
  setViewedPlayerId,
  handleChoiceClick,
  handleChoiceRightClick,
  onHoverStart,
  onHoverEnd
}: CardChoiceGridProps) => {
  return (
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
        
        <div className="flex flex-wrap justify-center gap-8 p-6 w-full">
            {filteredCardChoices.map((choice: any, idx: number) => {
                const originalIdx = choices.indexOf(choice);
                const isSelected = selectedIndices.includes(originalIdx);
                const selectionCount = selectedIndices.filter(i => i === originalIdx).length;
                return (
                    <motion.div key={choice.cardData.id || `choice-card-${idx}-${originalIdx}`} className={`relative cursor-pointer transition-all hover:translate-y-[-5px] ${isSelected ? 'z-20 scale-105' : 'z-10'}`} onClick={() => handleChoiceClick(originalIdx)} onContextMenu={(e) => handleChoiceRightClick(e, originalIdx)}>
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
  );
});
