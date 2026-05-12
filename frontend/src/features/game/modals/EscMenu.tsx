import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, ChevronRight, RefreshCw, Trash2, X } from 'lucide-react';

interface EscMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onResetMatch: () => void;
  onConcede: () => void;
  onLeave: () => void;
  isSpectator?: boolean;
  onSwapPOV?: () => void;
}

export const EscMenu = ({ 
  isOpen, 
  onClose, 
  onResetMatch, 
  onConcede,
  onLeave,
  isSpectator = false,
  onSwapPOV
}: EscMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 30, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            className="w-full max-w-md bg-[#0a0f1e]/90 border border-white/10 rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full" />
            
            <div className="flex flex-col items-center text-center gap-2 mb-10 relative">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 mb-2 shadow-inner">
                <Settings className="w-8 h-8 text-indigo-400 animate-[spin_10s_linear_infinite]" />
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                Game <span className="text-indigo-500">Menu</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Options & Session Management</p>
            </div>

            <div className="flex flex-col gap-3 relative">
              <button 
                onClick={onClose} 
                className="flex justify-between items-center bg-emerald-500 group/btn hover:bg-emerald-400 p-5 rounded-3xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="text-lg font-black uppercase italic tracking-tight text-white">Resume Game</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              {!isSpectator && (
                <>
                  <button 
                    onClick={onResetMatch} 
                    className="flex justify-between items-center bg-indigo-600 group/btn hover:bg-indigo-500 p-5 rounded-3xl transition-all shadow-[0_10px_20px_rgba(79,70,229,0.2)] active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white group-hover/btn:rotate-180 transition-all duration-700" />
                      </div>
                      <span className="text-lg font-black uppercase italic tracking-tight text-white">Restart Match</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50 group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={onConcede} 
                    className="flex justify-between items-center bg-red-600 group/btn hover:bg-red-500 p-5 rounded-3xl transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)] active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                      </div>
                      <span className="text-lg font-black uppercase italic tracking-tight text-white">Concede Game</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </>
              )}

              {isSpectator && (
                <button 
                  onClick={onSwapPOV} 
                  className="flex justify-between items-center bg-amber-600 group/btn hover:bg-amber-500 p-5 rounded-3xl transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white group-hover/btn:rotate-180 transition-all duration-700" />
                    </div>
                    <span className="text-lg font-black uppercase italic tracking-tight text-white">Swap POV</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}

              <button 
                onClick={onLeave} 
                className="flex justify-between items-center bg-slate-800 group/btn hover:bg-slate-700 p-5 rounded-3xl transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <X className="w-5 h-5 text-white group-hover/btn:rotate-90 transition-transform" />
                  </div>
                  <span className="text-lg font-black uppercase italic tracking-tight text-white">Leave / Spectate</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-700 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
