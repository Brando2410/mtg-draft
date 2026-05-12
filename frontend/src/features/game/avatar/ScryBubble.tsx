import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScryBubbleProps {
  scryNotice: { top: number, bottom: number, graveyard: number, type: string } | null;
  isOpponent: boolean;
}

export const ScryBubble = memo(({ scryNotice, isOpponent }: ScryBubbleProps) => {
  return (
    <AnimatePresence>
      {scryNotice && (
        <motion.div
          initial={{ opacity: 0, x: "-50%", y: isOpponent ? 20 : -20, scale: 0.8 }}
          animate={{ opacity: 1, x: "-50%", y: isOpponent ? 80 : -80, scale: 1 }}
          exit={{ opacity: 0, x: "-50%", scale: 0.8, transition: { duration: 0.2 } }}
          className={`absolute left-1/2 z-[600] pointer-events-none
              bg-slate-950/95 border border-indigo-500/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl
              shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(99,102,241,0.2)]
              flex flex-col items-center gap-1.5 min-w-fit whitespace-nowrap`}
        >
          {/* Speech bubble arrow */}
          <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 rotate-45 border-r border-b border-indigo-500/40
              ${isOpponent ? '-top-1.5 border-r-0 border-b-0 border-l border-t' : '-bottom-1.5'}`} 
          />

          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-400 italic leading-none">
              {scryNotice.type}
          </span>

          <div className="h-px w-full bg-white/10 my-0.5" />

          <div className="flex items-center gap-4 text-white">
              {scryNotice.type.toLowerCase() === 'surveil' ? (
                <>
                  <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold text-slate-500 tracking-tighter">GRAVE:</span>
                      <span className="text-[12px] font-black leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{scryNotice.graveyard}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold text-slate-500 tracking-tighter">TOP:</span>
                      <span className="text-[12px] font-black leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{scryNotice.top}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold text-slate-500 tracking-tighter">TOP:</span>
                      <span className="text-[12px] font-black leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{scryNotice.top}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold text-slate-500 tracking-tighter">BOTTOM:</span>
                      <span className="text-[12px] font-black leading-none drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{scryNotice.bottom}</span>
                  </div>
                </>
              )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
