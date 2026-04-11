import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import { GameCard } from './GameCard';
import { type StackObject, AbilityType, type PlayerState, type GameObject } from '@shared/engine_types';

interface StackViewProps {
  stack: StackObject[];
  pendingAction?: any;
  me: PlayerState | undefined;
  exile: GameObject[];
  onTapCard: (id: string) => void;
  onInspect: (zone: { cards: GameObject[], label: string }) => void;
  targetableIds: Set<string>;
}

/**
 * Arena-style StackView. 
 * Shows spells and abilities currently waiting to resolve.
 */
export const StackView = ({ stack, pendingAction, me }: StackViewProps) => {
  const effectiveStack = [...stack];
  if (pendingAction?.playerId === me?.id && pendingAction?.data?.stackObj) {
    effectiveStack.push(pendingAction.data.stackObj);
  }

  if (effectiveStack.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-black/40 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-2xl overflow-visible">
      {/* HEADER */}
      <div className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 px-4 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
        Stack
      </div>
      
      <div className="flex flex-col-reverse items-center justify-center gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar px-2 py-1">
        <AnimatePresence>
          {effectiveStack.map((sobj, index) => {
            const isPending = pendingAction?.data?.stackObj?.id === sobj.id;
            return (
              <motion.div 
                key={sobj.id} 
                initial={{ scale: 0.5, opacity: 0, y: 20 }} 
                animate={{ 
                    scale: 1, 
                    opacity: isPending ? 0.6 : 1, 
                    y: 0,
                    zIndex: index 
                }} 
                exit={{ scale: 1.5, opacity: 0 }} 
                whileHover={{ scale: 1.1, zIndex: 100 }}
                className={`relative flex justify-center ${isPending ? 'grayscale-[0.5] contrast-[0.8]' : ''}`}
              >
                {sobj.card ? (
                  <div className="relative">
                    <GameCard 
                        obj={sobj.card} 
                        variant="tiny" 
                        onHoverStart={() => {}} // We could pass zoom if needed
                    />
                    
                    {/* TYPE INDICATOR */}
                    <div className={`absolute -bottom-1 -right-1 ${sobj.type === AbilityType.Triggered ? 'bg-emerald-500' : sobj.type === AbilityType.Activated ? 'bg-amber-500' : 'bg-indigo-500'} rounded-full p-1 border border-white/20 shadow-lg z-30`}>
                      {sobj.type === AbilityType.Triggered ? (
                        <RefreshCw className="w-2 h-2 text-white" />
                      ) : (
                        <Zap className="w-2 h-2 text-white" />
                      )}
                    </div>
                  </div>
                ) : (
                   <div className="w-12 h-16 bg-slate-900 rounded border border-white/20 flex flex-col items-center justify-center p-1 shadow-lg">
                       <Zap className={`w-4 h-4 ${sobj.type === AbilityType.Triggered ? 'text-emerald-400' : 'text-amber-400'} mb-1`} />
                       <span className="text-[5px] font-black uppercase text-white tracking-widest text-center truncate w-full">
                           {sobj.name || 'Ability'}
                       </span>
                   </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* STACK DEPTH HINT */}
      {effectiveStack.length > 1 && (
          <div className="text-[7px] font-bold text-slate-500 italic mt-1 leading-none">
              {effectiveStack.length} Items on Stack
          </div>
      )}
    </div>
  );
};
