import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, Heart, Library, Trash2, XCircle } from 'lucide-react';
import { BattlefieldCard } from './BattlefieldCard';
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

export const StackView = ({ stack, pendingAction, me, exile, onTapCard, onInspect, targetableIds }: StackViewProps) => {
  const effectiveStack = [...stack];
  if (pendingAction?.playerId === me?.id && pendingAction?.data?.stackObj) {
    effectiveStack.push(pendingAction.data.stackObj);
  }

  const ManaSymbol = ({ symbol, amount }: { symbol: string, amount: number }) => {
    const config: Record<string, string> = {
      W: 'bg-[#f8f6d8] text-[#9b8d1a] border-[#e5e1b5]',
      U: 'bg-[#b3ceea] text-[#1a5b9b] border-[#89b2d8]',
      B: 'bg-[#a69191] text-[#2a1a1a] border-[#7d6b6b]',
      R: 'bg-[#f4aaaa] text-[#a61a1a] border-[#d88989]',
      G: 'bg-[#bcd6ba] text-[#1a5b1a] border-[#91b88e]',
      C: 'bg-[#ccc2c0] text-[#4d4d4d] border-[#a69c9b]',
    };
    return (
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[8px] font-black ${
        amount > 0 ? config[symbol] : 'bg-slate-800/30 text-slate-700 opacity-10 border-transparent'
      }`}>
        {amount > 0 ? amount : symbol}
      </div>
    );
  };

  return (
    <div className="w-44 border-l border-white/5 bg-slate-950/60 flex flex-col items-center py-6 z-10 shrink-0 px-2 overflow-y-auto custom-scrollbar">
      {/* STACK SECTION */}
      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]" />
        Active Stack
      </div>
      
      <div className="flex-1 w-full flex flex-col-reverse gap-3 items-center mb-6 px-2 overflow-y-auto custom-scrollbar min-h-0">
        <AnimatePresence>
          {effectiveStack.map((sobj) => {
            const isPending = pendingAction?.data?.stackObj?.id === sobj.id;
            return (
              <motion.div 
                key={sobj.id} 
                initial={{ x: 20, opacity: 0 }} 
                animate={{ x: 0, opacity: isPending ? 0.6 : 1 }} 
                exit={{ scale: 1.5, opacity: 0 }} 
                className={`relative group w-full flex justify-center ${isPending ? 'grayscale-[0.5] contrast-[0.8]' : ''}`}
              >
                {sobj.card || sobj.image_url ? (
                  <div className="relative">
                    {sobj.card ? (
                      <BattlefieldCard obj={sobj.card} size="small" />
                    ) : (
                      <div className="w-14 h-20 rounded-lg overflow-hidden border border-white/20 shadow-2xl relative bg-slate-900 group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={sobj.image_url} 
                          alt={sobj.name} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-1 left-0 right-0 px-1">
                          <p className="text-[6px] font-bold text-white truncate text-center leading-tight shadow-sm">
                            {sobj.name || 'Ability'}
                          </p>
                        </div>
                      </div>
                    )}
                    {(sobj.type === AbilityType.Activated || sobj.type === AbilityType.Triggered) && (
                      <div className={`absolute -bottom-1 -left-1 ${sobj.type === AbilityType.Triggered ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full p-1 border border-white/20 shadow-lg z-30`}>
                        {sobj.type === AbilityType.Triggered ? (
                          <RefreshCw className="w-2 h-2 text-white" />
                        ) : (
                          <Zap className="w-2 h-2 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                   <div className="w-14 h-20 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center p-2">
                       <Zap className="w-4 h-4 text-white/20" />
                   </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {effectiveStack.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 opacity-10">
             <div className="w-px h-full bg-indigo-500/20" />
          </div>
        )}
      </div>

      {/* PLAYER STATS SECTION */}
      <div className="w-full h-px bg-white/5 mb-6" />
      
      <div className="flex flex-col items-center gap-6 w-full">
         {/* Life Points */}
         <div 
            onClick={() => onTapCard?.(me?.id || '')}
            className={`flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95
              ${targetableIds.has(me?.id || '') ? 'ring-4 ring-green-500 animate-pulse border-green-500' : 'border-white/10'}`}
          >
            <Heart className="w-4 h-4 text-green-500 fill-green-500/20" />
            <span className="text-xl font-black italic text-white">{me?.life ?? 20}</span>
          </div>

          {/* Mana Pool */}
          <div className="flex flex-wrap justify-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/5 mx-2">
              {['W', 'U', 'B', 'R', 'G', 'C'].map(c => (
                <ManaSymbol key={c} symbol={c} amount={(me?.manaPool as any)?.[c] || 0} />
              ))}
          </div>

          {/* Zones */}
          <div className="flex gap-3 justify-center w-full px-2">
             <button 
                onClick={() => onInspect({ cards: (me as any)?.library || [], label: "Your Library" })} 
                className="relative flex-1 h-16 bg-blue-900/10 rounded-lg border border-white/5 flex items-center justify-center group overflow-hidden"
              >
                <Library className="w-4 h-4 text-white/20 group-hover:text-blue-400" />
                <span className="absolute bottom-0 right-0 bg-slate-900 border-l border-t border-white/10 px-1 text-[8px] font-bold text-white">
                  {me?.library.length || 0}
                </span>
             </button>
             
             <button 
                onClick={() => onInspect({ cards: me?.graveyard || [], label: "Your Graveyard" })} 
                className={`relative flex-1 h-16 bg-slate-900 rounded-lg border flex items-center justify-center group transition-all
                  ${me?.graveyard.length && me?.graveyard.some(c => targetableIds.has(c.id)) ? 'ring-2 ring-green-500 animate-pulse border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-white/5'}`}
              >
                <Trash2 className="w-4 h-4 text-white/20 group-hover:text-red-400" />
                <span className="absolute bottom-0 right-0 bg-indigo-600 px-1 text-[8px] font-bold text-white">
                  {me?.graveyard.length || 0}
                </span>
             </button>

             <button 
                onClick={() => onInspect({ cards: exile, label: "Global Exile" })} 
                className={`relative flex-1 h-16 bg-amber-900/10 rounded-lg border flex items-center justify-center group transition-all
                  ${exile.some(c => targetableIds.has(c.id)) ? 'ring-2 ring-amber-500 animate-pulse border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-amber-500/20'}`}
             >
                <XCircle className="w-4 h-4 text-amber-500/20 group-hover:text-amber-400" />
                <span className="absolute bottom-0 right-0 bg-amber-600 px-1 text-[8px] font-bold text-white">{exile.length}</span>
             </button>
          </div>
      </div>
    </div>
  );
};
