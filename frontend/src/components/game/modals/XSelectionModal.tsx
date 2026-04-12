import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionType, type PlayerState } from '@shared/engine_types';
import { Hash, Eye, EyeOff } from 'lucide-react';

interface XSelectionModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  onResolve: (payload: any) => void;
}

export const XSelectionModal = ({ pendingAction, me, onResolve }: XSelectionModalProps) => {
  const [value, setValue] = useState(0);
  const [minimized, setMinimized] = useState(false);

  const isActive = pendingAction?.type === ActionType.ChooseX && pendingAction.playerId === me?.id;

  if (!isActive) return null;

  return (
    <>
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border-2 border-indigo-500/30 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(79,70,229,0.2)] max-w-md w-full flex flex-col items-center gap-8 text-center relative"
            >
              {/* MINIMIZE BUTTON */}
              <button 
                onClick={() => setMinimized(true)}
                className="absolute top-4 left-1/2 -translate-x-1/2 p-2 px-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black z-30 tracking-[0.2em]"
              >
                <EyeOff className="w-3.5 h-3.5" />
                SHOW BATTLEFIELD
              </button>

              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg ring-4 ring-indigo-500/20 rotate-3">
                 <Hash className="w-10 h-10 text-white" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  Choose <span className="text-indigo-500">X</span> value
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {pendingAction.data?.label || "Declare the value for the variable X"}
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

                <div className="flex items-center gap-4 w-full">
                  <button 
                    onClick={() => onResolve?.('undo')}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    onClick={() => onResolve?.(value)}
                    className="flex-[2] py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-xl shadow-yellow-400/10"
                  >
                    Submit X={value}
                  </button>
                </div>
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
              Return to Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
