import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GameCard } from '../../GameCard';
import { type GameObject } from '@shared/engine_types';

interface SourceObjectPreviewProps {
  sourceObject: GameObject | null;
}

export const SourceObjectPreview = memo(({ sourceObject }: SourceObjectPreviewProps) => {
  if (!sourceObject) return null;

  return (
    <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/[0.04] border-r border-white/5 relative group/source w-[35vw] max-w-[480px]">
       <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
       
       <div className="flex flex-col items-center gap-12">
         <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.8em] text-indigo-400 italic drop-shadow-md">Source</p>
            <div className="h-0.5 w-12 bg-indigo-500/30 rounded-full" />
         </div>
         
         <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative z-10 perspective-1000"
         >
           <div className="relative group/card-3d transform-gpu transition-transform">
              <div className="absolute inset-x-[-30%] inset-y-[-15%] bg-indigo-500/30 blur-[100px] opacity-100 rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-indigo-400/40 blur-[40px] opacity-0 group-hover/card-3d:opacity-100 transition-all duration-700 rounded-2xl" />
              
              <div className="w-[calc(var(--u)*38)] h-[calc(var(--u)*53)] relative z-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden">
                  <GameCard obj={sourceObject} variant="full" hideHeader={true} />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-20 pointer-events-none" />
           </div>
         </motion.div>
         
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
