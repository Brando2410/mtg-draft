import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, ChevronRight, RefreshCw, LogOut, Trash2, X } from 'lucide-react';

interface EscMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onResetMatch: () => void;
  onBackToLobby: () => void;
  onBack: () => void;
  onToggleAutoOrder: () => void;
  autoOrderTriggers?: boolean;
}

export const EscMenu = ({ 
  isOpen, 
  onClose, 
  onResetMatch, 
  onBackToLobby, 
  onBack, 
  onToggleAutoOrder, 
  autoOrderTriggers 
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

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  onClick={onResetMatch} 
                  className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-3xl transition-all group/sub active:scale-95"
                >
                  <RefreshCw className="w-6 h-6 text-slate-500 group-hover/sub:text-indigo-400 group-hover/sub:rotate-180 transition-all duration-700" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/sub:text-white">Restart Match</span>
                </button>

                <button 
                  onClick={onBackToLobby} 
                  className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-3xl transition-all group/sub active:scale-95"
                >
                  <LogOut className="w-6 h-6 text-slate-500 group-hover/sub:text-amber-400 group-hover/sub:translate-x-1 transition-all" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/sub:text-white">Exit to Lobby</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button 
                  onClick={onToggleAutoOrder} 
                  className={`flex items-center justify-between p-5 rounded-2xl transition-all border ${autoOrderTriggers ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Auto-order Triggers</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${autoOrderTriggers ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoOrderTriggers ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>

                <button 
                  onClick={onBack} 
                  className="flex items-center justify-center gap-3 p-5 group/danger hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20 active:scale-95"
                >
                  <Trash2 className="w-4 h-4 text-red-500/40 group-hover/danger:text-red-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/50 group-hover/danger:text-red-500">Concede & Leave Game</span>
                </button>
              </div>
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
