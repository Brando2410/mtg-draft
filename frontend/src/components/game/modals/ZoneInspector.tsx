import { motion, AnimatePresence } from 'framer-motion';
import { X as CloseIcon } from 'lucide-react';
import { BattlefieldCard } from '../BattlefieldCard';
import { type GameObject, type PlayerState } from '@shared/engine_types';

interface ZoneInspectorProps {
  inspectingZone: { cards: GameObject[], label: string } | null;
  onClose: () => void;
  onTapCard: (id: string) => void;
  targetableIds: Set<string>;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  me: PlayerState | undefined;
}

export const ZoneInspector = ({ inspectingZone, onClose, onTapCard, targetableIds, onHoverStart, onHoverEnd, me }: ZoneInspectorProps) => {
  if (!inspectingZone) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-8 flex flex-col items-center"
      >
        <div className="w-full max-w-6xl flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {inspectingZone.label}
            </h2>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">
              {inspectingZone.cards.length} Carte in Totale
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/5 hover:bg-red-500/20 rounded-full flex items-center justify-center border border-white/10 transition-colors group"
          >
            <CloseIcon className="w-6 h-6 text-white group-hover:text-red-400" />
          </button>
        </div>
        
        <div className="flex-1 w-full max-w-6xl overflow-y-auto pr-4 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pb-20 justify-items-center">
            {inspectingZone.cards.map((obj) => (
              <BattlefieldCard 
                key={obj.id} 
                obj={obj} 
                onTapCard={() => onTapCard(obj.id)} 
                isTargetable={targetableIds.has(obj.id)}
                onHoverStart={onHoverStart}
                onHoverEnd={onHoverEnd}
                me={me}
              />
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
