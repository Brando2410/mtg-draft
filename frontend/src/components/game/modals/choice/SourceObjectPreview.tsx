import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GameCard } from '../../GameCard';
import { type GameObject } from '@shared/engine_types';

interface SourceObjectPreviewProps {
  sourceObjects: GameObject[];
}

export const SourceObjectPreview = memo(({ sourceObjects }: SourceObjectPreviewProps) => {
  if (!sourceObjects || sourceObjects.length === 0) return null;

  const isMulti = sourceObjects.length > 1;

  return (
    <div className="hidden lg:flex flex-col items-center justify-start py-8 px-4 bg-white/[0.04] relative group/source w-[400px] shrink-0 border-r border-white/10">
       <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
       
       <div className="flex flex-col items-center gap-12 w-full">
         <div className="flex flex-col items-center gap-2">
            <p className="text-[13px] font-black uppercase tracking-[0.8em] text-indigo-400 italic drop-shadow-md">Source</p>
            <div className="h-0.5 w-16 bg-indigo-500/30 rounded-full" />
         </div>
         
         <div className={`flex-1 w-full min-h-0 p-4 flex flex-col items-center justify-center`}>
            <div className={`grid ${isMulti ? 'grid-cols-2 gap-6' : 'grid-cols-1'} items-center justify-items-center w-full`}>
              {sourceObjects.map((obj, idx) => (
                <motion.div 
                  key={obj.id || idx}
                  initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ type: "spring", damping: 15, delay: idx * 0.1 }}
                  className="relative z-10 perspective-1000 py-4"
                >
                  <div className="relative group/card-3d transform-gpu transition-transform">
                      <div className="absolute inset-x-[-30%] inset-y-[-15%] bg-indigo-500/30 blur-[100px] opacity-100 rounded-full animate-pulse" />
                      <div className="absolute inset-0 bg-indigo-400/40 blur-[40px] opacity-0 group-hover/card-3d:opacity-100 transition-all duration-700 rounded-2xl" />
                      
                      <div className={`${isMulti ? 'w-[calc(var(--u)*23)] h-[calc(var(--u)*32)]' : 'w-[calc(var(--u)*34)] h-[calc(var(--u)*47.6)]'} relative z-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden`}>
                          <GameCard obj={obj} variant="full" hideHeader={true} disableHoverAnim={true} />
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-20 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </div>
         </div>
         
         <motion.div 
          animate={{ 
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-indigo-400 flex flex-col items-center gap-1"
         >
            <ArrowRight className="w-16 h-16 stroke-[2.5]" />
            <span className="text-[8px] font-black tracking-[0.5em] text-indigo-400/40 uppercase">Choice</span>
         </motion.div>
       </div>
    </div>
  );
});
