import { motion, AnimatePresence } from 'framer-motion';
import type { RestrictedMana } from '@shared/engine_types';

interface ManaPoolViewProps {
  pool: Record<string, number>;
  restrictedMana?: RestrictedMana[];
  isOpponent?: boolean;
}

const MANA_COLORS: Record<string, string> = {
  W: 'from-yellow-100 to-yellow-300 shadow-yellow-500/50',
  U: 'from-blue-400 to-blue-600 shadow-blue-500/50',
  B: 'from-purple-700 to-slate-900 shadow-purple-900/50',
  R: 'from-red-500 to-red-700 shadow-red-600/50',
  G: 'from-emerald-500 to-emerald-700 shadow-emerald-600/50',
  C: 'from-slate-400 to-slate-600 shadow-slate-500/50',
};

const ManaSymbol = ({ 
  color, 
  count, 
  isRestricted = false, 
  restrictions = [] 
}: { 
  color: string; 
  count: number; 
  isRestricted?: boolean; 
  restrictions?: string[];
}) => (
  <motion.div
    layout
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={`relative flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/50 backdrop-blur-md border ${isRestricted ? 'border-yellow-400/50 shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'border-white/10'} shadow-xl overflow-visible group`}
  >
    <div className="relative">
      {/* Mana Icon with subtle colored glow */}
      <div className={`absolute inset-0 blur-md opacity-30 rounded-full bg-gradient-to-tr ${MANA_COLORS[color]}`} />
      <img 
        src={`https://svgs.scryfall.io/card-symbols/${color.toUpperCase()}.svg`}
        alt={color}
        className="w-5 h-5 relative z-10 drop-shadow-lg"
      />
      {isRestricted && (
        <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black rounded-full w-3.5 h-3.5 flex items-center justify-center border border-black/50 z-20 shadow-sm">
           <span className="text-[8px] font-black">!</span>
        </div>
      )}
    </div>

    <div className="flex flex-col items-center">
      <span className="text-base font-black text-white leading-none tracking-tighter drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] italic">
        {count}
      </span>
    </div>

    {/* Restricted Tooltip */}
    {isRestricted && restrictions.length > 0 && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-yellow-400/30 rounded text-[10px] text-yellow-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[1100] backdrop-blur-sm shadow-2xl">
        {restrictions.map((r, i) => (
          <div key={i} className="flex items-center gap-1">
             <span className="w-1 h-1 rounded-full bg-yellow-400" />
             {r.replace(/_/g, ' ')}
          </div>
        ))}
      </div>
    )}

    {/* Subtle colored accent line */}
    <div className={`absolute bottom-0 left-0 right-0 h-[1.5px] opacity-40 bg-gradient-to-r ${MANA_COLORS[color]}`} />
  </motion.div>
);

export const ManaPoolView = ({ pool, restrictedMana = [], isOpponent = false }: ManaPoolViewProps) => {
  const symbols = Object.entries(pool)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => {
      const order = ['W', 'U', 'B', 'R', 'G', 'C'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });

  if (symbols.length === 0 && restrictedMana.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: isOpponent ? 10 : -10, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isOpponent ? 10 : -10, scale: 0.8 }}
      className={`absolute left-1/2 -translate-x-1/2 ${isOpponent ? 'top-full mt-3' : 'bottom-full mb-4'} flex gap-2 z-[1000]`}
    >
      <AnimatePresence mode="popLayout">
        {/* Regular Mana */}
        {symbols.map(([color, count]) => (
          <ManaSymbol key={color} color={color} count={count} />
        ))}

        {/* Restricted Mana */}
        {restrictedMana.map((mana, idx) => (
          <ManaSymbol 
            key={`restricted-${idx}-${mana.color}`} 
            color={mana.color} 
            count={mana.amount} 
            isRestricted 
            restrictions={mana.restrictions} 
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
