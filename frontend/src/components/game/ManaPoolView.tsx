import { motion } from 'framer-motion';

interface ManaPoolViewProps {
  pool: Record<string, number>;
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

export const ManaPoolView = ({ pool, isOpponent = false }: ManaPoolViewProps) => {
  const symbols = Object.entries(pool)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => {
      const order = ['W', 'U', 'B', 'R', 'G', 'C'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });

  if (symbols.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: isOpponent ? 10 : -10, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isOpponent ? 10 : -10, scale: 0.8 }}
      className={`absolute left-1/2 -translate-x-1/2 ${isOpponent ? 'top-full mt-3' : 'bottom-full mb-4'} flex gap-2 z-[1000]`}
    >
      {symbols.map(([color, count]) => (
        <motion.div
          key={color}
          layout
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden"
        >
          <div className="relative">
            {/* Mana Icon with subtle colored glow */}
            <div className={`absolute inset-0 blur-md opacity-30 rounded-full bg-gradient-to-tr ${MANA_COLORS[color]}`} />
            <img 
              src={`https://svgs.scryfall.io/card-symbols/${color.toUpperCase()}.svg`}
              alt={color}
              className="w-5 h-5 relative z-10 drop-shadow-lg"
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-base font-black text-white leading-none tracking-tighter drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] italic">
              {count}
            </span>
          </div>

          {/* Subtle colored accent line */}
          <div className={`absolute bottom-0 left-0 right-0 h-[1.5px] opacity-40 bg-gradient-to-r ${MANA_COLORS[color]}`} />
        </motion.div>
      ))}
    </motion.div>
  );
};
