import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { SimplifiedCard } from '../../services/scryfall';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: SimplifiedCard[];
  title?: string;
}

export const StatsModal = ({ isOpen, onClose, cards, title = "Analisi Deck" }: StatsModalProps) => {
  const manaSymbols: Record<string, string> = {
    'W': 'https://svgs.scryfall.io/card-symbols/W.svg',
    'U': 'https://svgs.scryfall.io/card-symbols/U.svg',
    'B': 'https://svgs.scryfall.io/card-symbols/B.svg',
    'R': 'https://svgs.scryfall.io/card-symbols/R.svg',
    'G': 'https://svgs.scryfall.io/card-symbols/G.svg',
  };

  const stats = useMemo(() => {
    const counts = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    const curve: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const types: Record<string, number> = {};

    cards.forEach(card => {
      card.color.forEach(c => {
        if (counts[c as keyof typeof counts] !== undefined) counts[c as keyof typeof counts]++;
      });
      
      const cmc = Math.min(card.cmc, 6);
      if (!card.type_line.includes('Land')) {
        curve[cmc]++;
      }
      
      const primaryType = card.type_line.split('—')[0].trim().split(' ')[0];
      types[primaryType] = (types[primaryType] || 0) + 1;
    });

    return { counts, curve, types };
  }, [cards]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-10"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-900 w-full max-w-6xl rounded-[3rem] sm:rounded-[4.5rem] border border-white/10 shadow-3xl overflow-hidden p-6 sm:p-16 space-y-10 sm:space-y-16 max-h-[90dvh] overflow-y-auto custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center sm:px-4">
              <div className="space-y-1">
                 <h3 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter">
                   {title.split(' ')[0]} <span className="text-indigo-500">{title.split(' ').slice(1).join(' ') || 'Analytics'}</span>
                 </h3>
                 <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Advanced Performance Metrics</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-4 sm:p-6 bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-full transition-all active:scale-95 border border-white/5"
              >
                <X className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-20">
              {/* MANA CURVE */}
              <div className="space-y-8 bg-slate-950/30 p-8 rounded-[3rem] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mana Curve</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Non-Lands</span>
                </div>
                <div className="flex items-end justify-between h-48 sm:h-64 gap-3 px-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(v => {
                    const maxCount = Math.max(...Object.values(stats.curve), 1);
                    const height = (stats.curve[v] / maxCount) * 100;
                    return (
                      <div key={v} className="flex-1 flex flex-col items-center gap-4">
                        <div className="text-xs font-black text-white">{stats.curve[v]}</div>
                        <div className="w-full bg-indigo-500/10 rounded-xl relative group overflow-hidden" style={{ height: `${Math.max(6, height)}%` }}>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: '100%' }}
                            transition={{ duration: 1, delay: v * 0.1 }}
                            className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-indigo-400 opacity-80" 
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{v === 6 ? '6+' : v}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COLOR PIE */}
              <div className="space-y-8 bg-slate-950/30 p-8 rounded-[3rem] border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 block">Color Distribution</span>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-4 h-full lg:h-auto">
                  {['W', 'U', 'B', 'R', 'G'].map(c => (
                    <div key={c} className="flex flex-col lg:flex-row items-center lg:justify-between gap-4 p-5 bg-slate-950/60 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-colors group">
                      <div className="flex flex-col lg:flex-row items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                            <img src={manaSymbols[c as keyof typeof manaSymbols]} className="w-full h-full" alt={c} />
                         </div>
                         <span className="text-[10px] font-black text-slate-400 hidden lg:block uppercase tracking-wider">{
                           c === 'W' ? 'White' : c === 'U' ? 'Blue' : c === 'B' ? 'Black' : c === 'R' ? 'Red' : 'Green'
                         }</span>
                      </div>
                      <span className="text-2xl lg:text-3xl font-black text-white italic">{stats.counts[c as keyof typeof stats.counts]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TYPE BREAKDOWN */}
              <div className="space-y-8 bg-slate-950/30 p-8 rounded-[3rem] border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 block">Type Breakdown</span>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(stats.types).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-5 bg-slate-950/60 rounded-2xl border border-white/5 group hover:bg-slate-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-slate-200 transition-colors">{type}</span>
                      </div>
                      <span className="font-black text-white text-xl">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
