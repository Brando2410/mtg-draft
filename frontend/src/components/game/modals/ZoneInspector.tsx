import { motion, AnimatePresence } from 'framer-motion';
import { X as CloseIcon, RefreshCw as SwapIcon } from 'lucide-react';
import { GameCard } from '../GameCard';
import { type GameObject } from '@shared/engine_types';

interface ZoneInspectorProps {
  inspectingZone: { cards: GameObject[], label: string } | null;
  onClose: () => void;
  onTapCard: (id: string) => void;
  targetableIds: Set<string>;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
  onSwap?: () => void;
}

export const ZoneInspector = ({ inspectingZone, onClose, onTapCard, targetableIds, onHoverStart, onHoverEnd, onSwap }: ZoneInspectorProps) => {
  if (!inspectingZone) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl p-8 flex flex-col items-center"
      >
        <div className="w-full max-w-6xl flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                    {inspectingZone.label}
                </h2>
                {onSwap && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSwap(); }}
                        className="p-2 bg-white/5 hover:bg-white/10 text-purple-400 rounded-lg border border-white/5 transition-all group"
                        title="Swap Player"
                    >
                        <SwapIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                )}
              </div>
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">
                {inspectingZone.cards.length} Total Cards
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/5 hover:bg-red-500/20 rounded-full flex items-center justify-center border border-white/10 transition-colors group"
          >
            <CloseIcon className="w-6 h-6 text-white group-hover:text-red-400" />
          </button>
        </div>
        
        <div className="flex-1 w-full max-w-7xl overflow-y-auto pr-4 custom-scrollbar">
          <div className="flex flex-wrap justify-center gap-10 pb-20">
            {inspectingZone.cards.map((obj, i) => (
              <div 
                key={obj.id || `zone-card-${i}`} 
                className="w-[calc(var(--u)*26)] h-[calc(var(--u)*18.7)] flex items-center justify-center shrink-0"
                style={{ '--header-scale': 2.0 } as any}
              >
                <GameCard 
                  obj={obj} 
                  variant="battlefield"
                  onClick={() => onTapCard(obj.id)} 
                  isTargetable={targetableIds.has(obj.id)}
                  onHoverStart={onHoverStart}
                  onHoverEnd={onHoverEnd}
                />
              </div>
            ))}
            {inspectingZone.cards.length === 0 && (
               <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-700 bg-black/20 rounded-3xl border border-white/5 w-full">
                  <p className="text-xl font-black uppercase italic tracking-widest opacity-20">Vuoto</p>
               </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
