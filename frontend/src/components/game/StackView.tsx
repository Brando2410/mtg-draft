import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import { GameCard } from './GameCard';
import { type StackObject, AbilityType, type PlayerState, type GameObject } from '@shared/engine_types';

interface StackViewProps {
  stack: StackObject[];
  pendingAction?: any;
  me: PlayerState | undefined;
  exile?: GameObject[];
  battlefield: GameObject[];
  onTapCard: (id: string) => void;
  onInspect?: (zone: { cards: GameObject[], label: string }) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  targetableIds?: Set<string>;
}

/**
 * Arena-style StackView. 
 * Shows spells and abilities currently waiting to resolve.
 */
export const StackView = ({ stack, pendingAction, me, battlefield, onTapCard, onHoverStart, onHoverEnd }: StackViewProps) => {
  const effectiveStack = [...stack];
  if (pendingAction?.playerId === me?.id && pendingAction?.data?.stackObj) {
    effectiveStack.push(pendingAction.data.stackObj);
  }

  if (effectiveStack.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4 p-5 bg-slate-950/60 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-visible ring-1 ring-white/5">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-inner">
          Stack
        </div>
      </div>
      
      <div className="flex flex-col-reverse items-center justify-center -space-y-12 max-h-[75vh] overflow-y-visible px-4 py-2">
        <AnimatePresence mode="popLayout">
          {effectiveStack.map((sobj, index) => {
            const isPending = pendingAction?.data?.stackObj?.id === sobj.id;
            const isTop = index === effectiveStack.length - 1;
            
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
                layout
                id={`stack-obj-${sobj.id}`}
                initial={{ opacity: 0, y: 30 }} 
                animate={{ 
                    opacity: isPending ? 0.7 : 1, 
                    y: 0,
                    zIndex: index + 10,
                    marginTop: index === 0 ? 0 : -50 // Create overlap
                }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`relative flex justify-center transition-opacity duration-300 ${isPending ? 'grayscale-[0.4] brightness-75' : ''}`}
              >
                <div className="relative group/stack-item perspective-1000">
                  {/* GLOW EFFECT FOR NEWEST ITEM */}
                  {isTop && (
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-lg animate-pulse z-0" />
                  )}

                  <GameCard 
                      obj={displayObj as any} 
                      variant="small" 
                      onClick={() => onTapCard(sobj.id)}
                      onHoverStart={() => {
                        onHoverStart?.(displayObj as any);
                      }}
                      onHoverEnd={() => {
                        onHoverEnd?.();
                      }}
                  />
                  
                  {/* TYPE INDICATOR - SLIGHTLY SMALLER */}
                  <div className={`absolute -bottom-1.5 -right-1.5 ${sobj.type === AbilityType.Triggered ? 'bg-emerald-500 shadow-emerald-500/50' : sobj.type === AbilityType.Activated ? 'bg-amber-500 shadow-amber-500/50' : 'bg-indigo-600 shadow-indigo-500/50'} rounded-full p-1 border border-white/40 shadow-xl z-50 transition-all group-hover/stack-item:scale-110`}>
                    {sobj.type === AbilityType.Triggered ? (
                      <RefreshCw className="w-3 h-3 text-white" />
                    ) : (
                      <Zap className="w-3 h-3 text-white fill-white" />
                    )}
                  </div>

                  {/* ABILITY LABEL OVERLAY */}
                  {(!sobj.card && sobj.name) && (
                    <div className="absolute inset-x-0 bottom-2 px-1 z-40">
                      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded py-0.5 px-1 flex items-center justify-center">
                        <span className="text-[7px] font-black text-white whitespace-nowrap overflow-hidden text-ellipsis uppercase">
                          {sobj.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* STACK DEPTH HINT */}
      {effectiveStack.length > 1 && (
          <div className="flex items-center gap-2 py-1 px-3 bg-white/5 rounded-full border border-white/5">
              <div className="text-[8px] font-black text-slate-400 tracking-tighter uppercase italic">
                {effectiveStack.length} Resolving
              </div>
          </div>
      )}
    </div>
  );
};
