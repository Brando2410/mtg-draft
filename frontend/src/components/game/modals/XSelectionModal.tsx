import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionType, type PlayerState } from '@shared/engine_types';
import { Hash, Check, X } from 'lucide-react';

interface XSelectionModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  onResolve: (payload: any) => void;
}

export const XSelectionModal = ({ pendingAction, me, onResolve }: XSelectionModalProps) => {
  const [value, setValue] = useState(0);

  const isActive = pendingAction?.type === ActionType.ChooseX && pendingAction.playerId === me?.id;

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 border-2 border-indigo-500/30 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(79,70,229,0.2)] max-w-md w-full flex flex-col items-center gap-8 text-center"
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg ring-4 ring-indigo-500/20 rotate-3">
             <Hash className="w-10 h-10 text-white" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Scegli il valore di <span className="text-indigo-500">X</span>
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {pendingAction.data?.label || "Dichiara il valore della variabile X"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setValue(Math.max(0, value - 1))}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-white hover:bg-white/10 transition-all active:scale-90"
              >
                -
              </button>
              
              <div className="w-32 h-20 bg-black/40 rounded-3xl border-2 border-indigo-500/50 flex items-center justify-center text-4xl font-black text-white shadow-inner">
                {value}
              </div>

              <button 
                onClick={() => setValue(value + 1)}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-white hover:bg-white/10 transition-all active:scale-90"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
                {[0, 1, 2, 3, 4, 5, 10].map(v => (
                    <button 
                        key={v}
                        onClick={() => setValue(v)}
                        className={`py-2 rounded-xl text-[10px] font-black border transition-all ${value === v ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        {v}
                    </button>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => onResolve(value)}
              className="group w-full p-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl border border-indigo-400/50 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-600/20"
            >
              <Check className="w-5 h-5 text-white group-hover:scale-125 transition-transform" />
              <span className="text-sm font-black uppercase italic tracking-widest text-white">Conferma X = {value}</span>
            </button>

            <button
              onClick={() => onResolve('undo')}
              className="group w-full p-4 bg-white/5 hover:bg-red-500/10 rounded-2xl border border-white/10 hover:border-red-500/30 flex items-center justify-center gap-3 transition-all text-slate-500 hover:text-red-400"
            >
              <X className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Annulla Lancio</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
