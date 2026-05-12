import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionType, type PlayerState } from '@shared/engine_types';
import { Eye, EyeOff } from 'lucide-react';

interface XSelectionProps {
  pendingAction: any;
  me: PlayerState | undefined;
  onResolve: (payload: any) => void;
}

export const XSelection = ({ pendingAction, me, onResolve }: XSelectionProps) => {
  const [value, setValue] = useState(0);
  const [minimized, setMinimized] = useState(false);

  const isActive = pendingAction?.type === ActionType.ChooseX && pendingAction.playerId === me?.id;

  useEffect(() => {
    if (isActive) {
      setValue(0);
      setMinimized(false);
    }
  }, [isActive]);

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
              className="bg-[#0b0f1a]/95 border border-white/10 p-[var(--sp-10)] rounded-[calc(var(--u)*8)] shadow-[0_40px_100px_rgba(0,0,0,0.9)] max-w-md w-full flex flex-col items-center gap-[var(--sp-8)] text-center relative backdrop-blur-2xl"
            >
              {/* MINIMIZE BUTTON */}
              <button 
                onClick={() => setMinimized(true)}
                className="absolute top-[var(--sp-4)] left-1/2 -translate-x-1/2 h-[calc(var(--u)*4.5)] px-[var(--sp-6)] bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-[var(--sp-2)] text-[var(--fs-xs)] font-black z-30 tracking-widest border border-white/10 backdrop-blur-md"
              >
                <EyeOff className="w-[var(--sp-4)] h-[var(--sp-4)]" />
                SHOW BATTLEFIELD
              </button>

              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg ring-4 ring-indigo-500/20 rotate-3">
                 <span className="text-4xl font-black text-white">X</span>
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

                <div className="flex items-center gap-[var(--sp-4)] w-full">
                  <button 
                    onClick={() => onResolve?.('undo')}
                    className="flex-1 btn-premium-danger"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    onClick={() => onResolve?.(value)}
                    className="flex-[2] btn-premium-primary"
                  >
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase tracking-widest">Submit X={value}</span>
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
              className="h-[calc(var(--u)*7.5)] px-[var(--sp-12)] btn-premium-primary"
            >
              <Eye className="w-[var(--sp-6)] h-[var(--sp-6)]" />
              Return to Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
