import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Skull, LogOut } from 'lucide-react';

interface GameOverProps {
  winnerId: string | undefined;
  playerId: string;
  winnerName: string;
  onLeave: () => void;
}

export const GameOver = ({ winnerId, playerId, winnerName, onLeave }: GameOverProps) => {
  const isWinner = winnerId === playerId;
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className={`w-full max-w-md bg-[#0a0f1e] border ${isWinner ? 'border-emerald-500/30' : 'border-red-500/30'} rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden`}
        >
          {/* Background Glow */}
          <div className={`absolute -top-24 -left-24 w-64 h-64 ${isWinner ? 'bg-emerald-500/10' : 'bg-red-500/10'} blur-[80px] rounded-full`} />
          
          <div className="flex flex-col items-center text-center gap-6 relative">
            <div className={`w-20 h-20 ${isWinner ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} rounded-3xl flex items-center justify-center border ${isWinner ? 'border-emerald-500/30' : 'border-red-500/30'} shadow-xl`}>
              {isWinner ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
            </div>

            <div>
              <h2 className={`text-5xl font-black uppercase italic tracking-tighter ${isWinner ? 'text-emerald-400' : 'text-red-500'}`}>
                {isWinner ? 'Victory' : 'Defeat'}
              </h2>
              <p className="text-slate-400 mt-2 font-medium uppercase tracking-widest text-[10px]">
                {isWinner ? 'You have conquered the battlefield' : 'You have been defeated'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Winner</span>
              <span className="text-xl font-black text-white italic">{winnerName || "Unknown Player"}</span>
            </div>

            <button 
              onClick={onLeave}
              className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl transition-all font-black uppercase italic tracking-tight active:scale-95 ${isWinner ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
            >
              <LogOut className="w-5 h-5" />
              Return to Menu
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
