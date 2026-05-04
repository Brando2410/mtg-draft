import { memo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import { GameCard } from '../GameCard';
import { AbilityType, type GameObject, type StackObject } from '@shared/engine_types';

interface StackItemProps {
  sobj: StackObject;
  displayObj: GameObject;
  index: number;
  isPending: boolean;
  isTop: boolean;
  onTapCard: (id: string) => void;
  onHoverStart: () => void;
  onHoverEnd: (id: string) => void;
}

export const StackItem = memo(({
  sobj,
  displayObj,
  index,
  isPending,
  isTop,
  onTapCard,
  onHoverStart,
  onHoverEnd
}: StackItemProps) => {
  return (
    <motion.div 
      layout
      id={`stack-obj-${sobj.id}`}
      initial={false} 
      animate={{ 
          opacity: 1, 
          scale: 1,
          y: 0,
          zIndex: index + 10,
          filter: isPending ? 'drop-shadow(0px 0px 15px rgba(34,211,238,0.6)) grayscale(0)' : 'drop-shadow(0px 0px 0px rgba(0,0,0,0)) grayscale(0)'
      }} 
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
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
        />
        
        {/* TYPE INDICATOR */}
        <div className={`absolute -bottom-2 -right-2 ${sobj.type === AbilityType.Triggered ? 'bg-emerald-500 shadow-emerald-500/50' : sobj.type === AbilityType.Activated ? 'bg-amber-500 shadow-amber-500/50' : 'bg-cyan-600 shadow-cyan-500/50'} rounded-full p-1.5 border-2 border-white/40 shadow-xl z-50 transition-all group-hover/stack-item:scale-110`}>
          {sobj.type === AbilityType.Triggered ? (
            <RefreshCw className="w-4 h-4 text-white" />
          ) : (
            <Zap className="w-4 h-4 text-white fill-white" />
          )}
        </div>

        {/* CHOICE/X-VALUE OVERLAY */}
        {((!sobj.card && !sobj.definition && sobj.name) || (sobj as any).data?.summary) && (
          <div className="absolute inset-x-0 bottom-2 px-2 z-40">
            <div className="bg-slate-950/90 backdrop-blur-md border border-white/30 rounded-md py-1 px-2 flex items-center justify-center shadow-2xl ring-1 ring-white/10">
              <span className="text-[10px] font-black text-cyan-400 whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-tighter">
                {(sobj as any).data?.summary || sobj.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});
