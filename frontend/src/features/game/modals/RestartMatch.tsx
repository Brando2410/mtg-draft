import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, X, AlertTriangle } from 'lucide-react';

interface RestartMatchProps {
  isOpen: boolean;
  isRequesting: boolean; // True if I am the one who requested it
  requesterName?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const RestartMatch: React.FC<RestartMatchProps> = ({ 
  isOpen, 
  isRequesting, 
  requesterName, 
  onAccept, 
  onDecline 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[6000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="w-full max-w-md bg-[#0a0f1e] border border-orange-500/30 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full" />
            
            <div className="flex flex-col items-center text-center gap-6 relative">
              <div className="w-20 h-20 bg-orange-500/20 text-orange-400 rounded-3xl flex items-center justify-center border border-orange-500/30 shadow-xl">
                <RotateCcw className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                  Match Restart
                </h2>
                <p className="text-slate-400 mt-2 font-medium uppercase tracking-widest text-[10px]">
                  {isRequesting 
                    ? "Waiting for opponent to approve the restart request..." 
                    : `${requesterName || "Opponent"} has requested to restart the current game.`
                  }
                </p>
              </div>

              {!isRequesting ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-start gap-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl text-left mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                    <p className="text-[10px] font-bold text-orange-200/60 uppercase leading-relaxed">
                      Accepting will reset the battlefield and life totals. Match wins are preserved.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={onAccept}
                      className="flex-1 flex items-center justify-center gap-2 p-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl transition-all font-black uppercase italic tracking-tight active:scale-95"
                    >
                      <Check className="w-5 h-5" />
                      Accept
                    </button>
                    <button 
                      onClick={onDecline}
                      className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all font-black uppercase italic tracking-tight active:scale-95"
                    >
                      <X className="w-5 h-5" />
                      Decline
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/10 rounded-3xl">
                    <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Awaiting Response
                    </span>
                  </div>
                  <button 
                    onClick={onDecline}
                    className="w-full mt-6 flex items-center justify-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 rounded-2xl transition-all font-black uppercase italic tracking-tight"
                  >
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
