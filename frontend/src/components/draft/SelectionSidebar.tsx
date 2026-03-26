import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import type { Card } from '@shared/types';

interface SelectionSidebarProps {
  selectedCard: Card;
  isPaused: boolean;
  currentIndex: number;
  totalCards: number;
  onClose: () => void;
  onPickCard: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const SelectionSidebar: React.FC<SelectionSidebarProps> = ({
  selectedCard,
  isPaused,
  currentIndex,
  totalCards,
  onClose,
  onPickCard,
  onNext,
  onPrev
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip when changing card
  useEffect(() => {
    setIsFlipped(false);
  }, [selectedCard.id]);

  return (
    <div 
      className="w-full landscape:w-[45vw] lg:w-96 bg-slate-100/10 backdrop-blur-xl border-t landscape:border-t-0 lg:border-t-0 landscape:border-l lg:border-l border-white/10 p-4 sm:p-8 flex flex-col z-40 fixed inset-y-0 right-0 h-full landscape:h-[100dvh] lg:h-[100dvh] rounded-t-[2.5rem] landscape:rounded-none lg:rounded-none shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Removed lateral dismiss tab as requested */}

      {/* PORTRAIT X BUTTON (Removed from top, will be in bottom footer) */}

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 lg:pt-0 pr-1 flex flex-col justify-center">
        <div className="flex-1 flex flex-col justify-end min-h-0">
          <motion.div 
            layoutId={`card-img-${selectedCard.id}`}
            className="group relative h-auto max-h-[58dvh] sm:max-h-[65dvh] landscape:max-h-[75dvh] lg:max-h-[75dvh] aspect-[7/10] mx-auto rounded-[2rem] overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-600/20 duration-500 mb-0 mt-0"
          >
            <motion.img 
              key={isFlipped ? 'back' : 'front'}
              src={(isFlipped && selectedCard.back_image_url) ? selectedCard.back_image_url : (selectedCard.image_uris?.normal || (selectedCard as any).image_url)} 
              alt={selectedCard.name} 
              className="w-full h-full object-cover" 
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.4 }}
            />

            {/* FLIP BUTTON */}
            {selectedCard.back_image_url && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
                className={`absolute bottom-6 right-6 z-50 p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl transition-all hover:scale-110 active:scale-90 ${isFlipped ? 'bg-indigo-600 text-white' : 'bg-black/60 text-white/80'}`}
                title="Gira carta"
              >
                <RefreshCw className={`w-6 h-6 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* LANDSCAPE/DESKTOP FLOATING NAV (Hidden in Portrait) */}
      <div className="hidden lg:block landscape:block">
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex items-center justify-between px-2 pointer-events-none z-[100]">
          <button 
            onClick={onPrev}
            className="p-4 bg-slate-900/40 backdrop-blur-md rounded-full border border-white/5 text-white pointer-events-auto active:scale-95 transition-all shadow-2xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-white/60 font-mono text-sm font-bold shadow-2xl">
            {currentIndex + 1} / {totalCards}
          </div>
          <button 
            onClick={onNext}
            className="p-4 bg-slate-900/40 backdrop-blur-md rounded-full border border-white/5 text-white pointer-events-auto active:scale-95 transition-all shadow-2xl"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* PORTRAIT CONTROLS (Only visible in mobile portrait) */}
      <div className="mt-auto flex flex-col gap-6 landscape:hidden lg:hidden pt-4 pb-2">
        {/* Navigation Arrows Row */}
        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={onPrev}
            className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white active:scale-90 transition-all shadow-xl"
            title="Precedente"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white font-mono text-xl font-black shadow-xl min-w-[5rem] text-center">
            <span className="text-indigo-400">{currentIndex + 1}</span>
            <span className="text-white/20 mx-2">/</span>
            <span className="text-white/60">{totalCards}</span>
          </div>

          <button 
            onClick={onNext}
            className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white active:scale-90 transition-all shadow-xl"
            title="Successiva"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-[1.5rem] border border-white/10 text-white active:scale-95 transition-all shadow-xl"
            title="Chiudi"
          >
            <X className="w-6 h-6" />
          </button>

          <button 
            disabled={isPaused}
            onClick={onPickCard}
            className="flex-1 py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 transition-all active:scale-95 group relative overflow-hidden shadow-amber-600/30 disabled:bg-slate-800 disabled:text-slate-600 shadow-xl"
          >
            <span className="flex items-center gap-4">
              CONFERMA PICK
              <Zap className="w-4 h-4 fill-current text-white group-hover:scale-125 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* LANDSCAPE/DESKTOP PICK BUTTON (Unified Layout) */}
      <div className="pt-4 border-t border-white/5 mt-auto hidden landscape:flex lg:flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-[1.5rem] border border-white/10 text-white active:scale-95 transition-all shadow-xl"
          title="Chiudi"
        >
          <X className="w-5 h-5" />
        </button>

        <button 
          disabled={isPaused}
          onClick={onPickCard}
          className="flex-1 py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 transition-all active:scale-95 group relative overflow-hidden shadow-amber-600/30 disabled:bg-slate-800 disabled:text-slate-600 shadow-xl"
        >
          <span className="flex items-center gap-4">
            CONFERMA PICK
            <Zap className="w-4 h-4 fill-current text-white group-hover:scale-125 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );
};
