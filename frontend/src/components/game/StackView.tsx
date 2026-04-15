import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import { GameCard } from './GameCard';
import { type StackObject, AbilityType, type PlayerState, type GameObject } from '@shared/engine_types';

interface StackViewProps {
  stack: StackObject[];
  pendingAction?: any;
  me: PlayerState | undefined;
  exile: GameObject[];
  battlefield: GameObject[];
  onTapCard: (id: string) => void;
  onInspect: (zone: { cards: GameObject[], label: string }) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  targetableIds: Set<string>;
}

/**
 * Arena-style StackView. 
 * Shows spells and abilities currently waiting to resolve.
 */
export const StackView = ({ stack, pendingAction, me, battlefield, onInspect, onTapCard, onHoverStart, onHoverEnd }: StackViewProps) => {
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
            
            // Try to resolve a display object for the ability
            // 1. If it's a spell, it already has .card
            // 2. If it's an ability, try to find the source in battlefield
            // 3. If still nothing, use a dummy object for the UI to render something
            const displayObj = sobj.card || (sobj.sourceId ? (battlefield || []).find((o: any) => o.id === sobj.sourceId) : null) || {
                id: sobj.id,
                definition: {
                    name: sobj.name || 'Ability',
                    image_url: sobj.image_url || '/back.png',
                    types: [],
                    colors: [],
                    manaCost: '',
                    oracleText: ''
                },
                counters: {},
                keywords: [],
                zone: 'Stack' as any
            };

            return (
              <motion.div 
                key={sobj.id} 
                id={`stack-obj-${sobj.id}`}
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
                <div className="relative group/stack-item">
                  <GameCard 
                      obj={displayObj as any} 
                      variant="tiny" 
                      onClick={() => onTapCard(sobj.id)}
                      onHoverStart={() => {
                        onHoverStart?.(displayObj as any);
                      }}
                      onHoverEnd={() => {
                        onHoverEnd?.();
                      }}
                  />
                  
                  {/* TYPE INDICATOR */}
                  <div className={`absolute -bottom-1 -right-1 ${sobj.type === AbilityType.Triggered ? 'bg-emerald-500' : sobj.type === AbilityType.Activated ? 'bg-amber-500' : 'bg-indigo-500'} rounded-full p-1 border border-white/20 shadow-lg z-30 transition-transform group-hover/stack-item:scale-125`}>
                    {sobj.type === AbilityType.Triggered ? (
                      <RefreshCw className="w-2 h-2 text-white" />
                    ) : (
                      <Zap className="w-2 h-2 text-white" />
                    )}
                  </div>
                </div>
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
