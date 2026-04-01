import { motion, AnimatePresence } from 'framer-motion';
import { BattlefieldCard } from '../BattlefieldCard';
import { type GameObject, type PlayerState } from '@shared/engine_types';

interface ChoiceModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  onTapCard: (id: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
}

export const ChoiceModal = ({ pendingAction, me, onTapCard, onHoverStart, onHoverEnd }: ChoiceModalProps) => {
  if (pendingAction?.type !== 'CHOICE') return null;

  const isMyChoice = pendingAction.playerId === me?.id;
  if (!isMyChoice) return null;

  const choices = pendingAction.data?.choices || [];
  const hasCards = choices.some((c: any) => c.cardData);

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
          className={`bg-slate-900 border border-white/10 p-8 rounded-[3rem] shadow-2xl ${hasCards ? 'max-w-6xl' : 'max-w-md'} w-full flex flex-col items-center gap-6 text-center`}
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg ring-4 ring-indigo-500/20">
            <span className="text-2xl font-black italic text-white text-center">?</span>
          </div>
          
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            {pendingAction.data?.label || (hasCards ? "Scegli una Carta" : "Scegli un'Opzione")}
          </h3>
          
          <div className={`w-full ${hasCards ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6 bg-black/40 rounded-3xl border border-white/5' : 'flex flex-col gap-3'}`}>
            {choices.map((choice: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-3 group items-center">
                {choice.cardData ? (
                  <div 
                    onClick={() => choice.selectable && onTapCard?.(`CHOICE_${idx}`)}
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
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-500 text-[8px] font-black px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                        SELEZIONA
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => onTapCard?.(`CHOICE_${idx}`)}
                    className="w-full p-4 bg-slate-800 hover:bg-indigo-600 rounded-xl border border-white/5 text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] text-white"
                  >
                    {choice.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {!pendingAction.data?.hideUndo && (
            <button 
              onClick={() => onTapCard?.(`CHOICE_undo`)}
              className="px-8 py-2 bg-red-500/10 hover:bg-red-500/30 rounded-full border border-red-500/20 text-xs font-black uppercase italic tracking-widest transition-all text-red-400"
            >
              ANNULLA (Undo)
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
