import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, LayoutPanelLeft, Home } from 'lucide-react';

interface DraftCompletedOverlayProps {
  onOpenReview: () => void;
  onBack: () => void;
}

export const DraftCompletedOverlay: React.FC<DraftCompletedOverlayProps> = ({
  onOpenReview,
  onBack
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 landscape:p-4 overflow-hidden"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl text-center flex flex-col items-center justify-center space-y-12 landscape:space-y-2 lg:landscape:space-y-12 py-8 landscape:h-full lg:landscape:h-auto"
      >
        <div className="relative inline-block shrink-0 landscape:flex-1 lg:landscape:flex-none landscape:min-h-0 landscape:shrink flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="absolute inset-0 bg-indigo-500/20 blur-[100px] landscape:blur-[40px] lg:landscape:blur-[100px] rounded-full" 
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative landscape:h-full lg:landscape:h-auto flex items-center justify-center"
          >
            <CheckCircle2 className="w-32 h-32 landscape:w-auto lg:landscape:w-32 landscape:h-full lg:landscape:h-32 landscape:max-h-[20vh] lg:landscape:max-h-none text-indigo-500 mx-auto" />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 landscape:space-y-1 lg:landscape:space-y-4 shrink-0"
        >
          <h2 className="text-4xl sm:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
            Draft <span className="text-indigo-500">Completata!</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-sm px-4">
            Tutte le carte sono state scelte. Il tuo mazzo finale è pronto.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 landscape:gap-3 lg:landscape:gap-6 w-full max-w-sm sm:max-w-none px-4 shrink-0"
        >
          <button 
            onClick={onOpenReview}
            className="w-full sm:w-auto px-12 py-6 landscape:py-3 lg:landscape:py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] landscape:rounded-xl lg:landscape:rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] landscape:text-[10px] lg:landscape:text-[11px] flex items-center justify-center gap-4 landscape:gap-3 lg:landscape:gap-4 transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 group"
          >
            REVISIONA DRAFT <LayoutPanelLeft className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
          <button 
            onClick={onBack}
            className="w-full sm:w-auto px-12 py-6 landscape:py-3 lg:landscape:py-6 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-[2.5rem] landscape:rounded-xl lg:landscape:rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] landscape:text-[10px] lg:landscape:text-[11px] flex items-center justify-center gap-4 landscape:gap-3 lg:landscape:gap-4 transition-all border border-white/5 active:scale-95"
          >
            TORNA ALLA HOME <Home className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
