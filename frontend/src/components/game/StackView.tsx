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
export const StackView = ({ stack, pendingAction, battlefield, onTapCard, onHoverStart, onHoverEnd }: StackViewProps) => {
  const effectiveStack = [...stack];
  if (pendingAction?.data?.stackObj) {
    const pObj = pendingAction.data.stackObj;
    // CRITICAL: Ensure we have a valid object to show. 
    // If it has no sourceId and no name, it's likely a hidden system action we shouldn't render as a card.
    if (pObj.sourceId || pObj.name || pObj.card || pObj.definition) {
      // Deduplicate: If the pending action's stackObj is already represented on the stack, don't show it twice.
      const isAlreadyOnStack = stack.some(s => 
        s.id === pObj.id || 
        (s.sourceId && s.sourceId === pObj.sourceId && s.type === pObj.type)
      );
      if (!isAlreadyOnStack) {
          effectiveStack.push(pObj);
      }
    }
  }

  if (effectiveStack.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 p-1 bg-slate-950/60 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden ring-1 ring-white/5 w-full max-w-[18vw] min-h-[30vh]">
      {/* HEADER */}
      <div className="flex items-center gap-3 mt-4 mb-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
        <div className="text-xs font-black uppercase tracking-[0.5em] text-cyan-200 px-4 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 shadow-inner">
          Stack
        </div>
      </div>
      
      <div className="flex-1 w-full flex flex-col-reverse items-center justify-start gap-3 max-h-[65vh] overflow-y-auto overflow-x-hidden px-2 py-4 no-scrollbar scroll-smooth">
        <AnimatePresence mode="popLayout">
          {effectiveStack.map((sobj, index) => {
            const isPending = pendingAction?.data?.stackObj?.id === sobj.id;
            const isTop = index === effectiveStack.length - 1;
            
            const displayObj = sobj.card || (sobj.definition ? { id: sobj.id, definition: sobj.definition, counters: {}, keywords: [], zone: 'Stack' } : null) || (sobj.sourceId ? (battlefield || []).find((o: any) => o.id === sobj.sourceId) : null) || {
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
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: 0,
                    zIndex: index + 10,
                    filter: isPending ? 'drop-shadow(0 0 15px rgba(34,211,238,0.6)) grayscale(0)' : 'none'
                }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`flex justify-center transition-all duration-300 ${isPending ? 'brightness-110' : ''}`}
              >
                <div className="relative group/stack-item perspective-1000">
                  {/* GLOW EFFECT FOR NEWEST ITEM */}
                  {isTop && (
                    <div className="absolute inset-x-[-10px] inset-y-[-10px] bg-cyan-500/20 blur-2xl rounded-xl animate-pulse z-0" />
                  )}

                  <GameCard 
                      obj={displayObj as any} 
                      variant="stack" 
                      onClick={() => onTapCard(sobj.id)}
                      onHoverStart={() => {
                        onHoverStart?.(displayObj as any);
                      }}
                      onHoverEnd={() => {
                        onHoverEnd?.();
                      }}
                  />
                  
                  {/* TYPE INDICATOR - SLIGHTLY LARGER FOR LARGER CARDS */}
                  <div className={`absolute -bottom-2 -right-2 ${sobj.type === AbilityType.Triggered ? 'bg-emerald-500 shadow-emerald-500/50' : sobj.type === AbilityType.Activated ? 'bg-amber-500 shadow-amber-500/50' : 'bg-cyan-600 shadow-cyan-500/50'} rounded-full p-1.5 border-2 border-white/40 shadow-xl z-50 transition-all group-hover/stack-item:scale-110`}>
                    {sobj.type === AbilityType.Triggered ? (
                      <RefreshCw className="w-4 h-4 text-white" />
                    ) : (
                      <Zap className="w-4 h-4 text-white fill-white" />
                    )}
                  </div>

                  {/* ABILITY LABEL OVERLAY - ONLY SHOW IF GENERIC IMAGE OR NO DEF AVAILABLE */}
                  {(!sobj.card && !sobj.definition && sobj.name) && (
                    <div className="absolute inset-x-0 bottom-4 px-2 z-40">
                      <div className="bg-slate-950/90 backdrop-blur-md border border-white/30 rounded-md py-1 px-2 flex items-center justify-center shadow-2xl">
                        <span className="text-[8px] font-black text-white whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-tighter">
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
          <div className="flex items-center gap-3 py-2 px-5 bg-white/5 rounded-full border border-white/10 mb-2">
              <div className="text-[10px] font-black text-cyan-400 tracking-[0.2em] uppercase italic drop-shadow-sm">
                {effectiveStack.length} Spells & Triggers
              </div>
          </div>
      )}
    </div>
  );
};
