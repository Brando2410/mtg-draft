import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCard } from '../GameCard';
import { type GameObject, type StackObject } from '@shared/engine_types';

interface TargetPreviewProps {
  hoveredStackObj: StackObject | null;
  findObject: (id: string) => GameObject | undefined;
}

export const TargetPreview = memo(({ hoveredStackObj, findObject }: TargetPreviewProps) => {
  return (
    <AnimatePresence>
      {hoveredStackObj && hoveredStackObj.targets && hoveredStackObj.targets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9 }}
          className="absolute right-[calc(100%+2.5vh)] top-0 z-[2000] flex flex-col gap-2 pointer-events-none"
        >
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.8)] min-w-[300px]">
             <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
               <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/70">Targeted Objects</span>
             </div>
             <div className="flex gap-4 p-2 overflow-x-visible">
                {hoveredStackObj.targets.map((tid, idx) => {
                  const targetObj = findObject(tid);
                  if (!targetObj) return null;
                  return (
                    <div key={tid || `target-${idx}`} className="flex-none w-32 transform transition-transform duration-300">
                       <GameCard obj={targetObj} variant="small" />
                    </div>
                  );
                })}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
