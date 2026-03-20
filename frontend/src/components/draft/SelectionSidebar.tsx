import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import type { Card } from '@shared/types';

interface SelectionSidebarProps {
  selectedCard: Card;
  preSelectedId: string | null;
  isPaused: boolean;
  onClose: () => void;
  onPickCard: () => void;
  onPreSelect: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex?: number;
  totalCards?: number;
}

export const SelectionSidebar: React.FC<SelectionSidebarProps> = ({
  selectedCard,
  preSelectedId,
  isPaused,
  onClose,
  onPickCard,
  onPreSelect,
  onNext,
  onPrev,
  currentIndex,
  totalCards
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isPreselected = preSelectedId === selectedCard.id;

  // Reset flip when changing card
  useEffect(() => {
    setIsFlipped(false);
  }, [selectedCard.id]);

  return (
    <motion.div 
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-full lg:w-96 bg-slate-900/80 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 p-4 sm:p-8 flex flex-col z-40 fixed lg:relative bottom-0 lg:bottom-auto h-[90vh] lg:h-auto rounded-t-[2.5rem] lg:rounded-none shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] leading-none">Dettagli</span>
              {currentIndex && totalCards && (
                <span className="lg:hidden text-[10px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {currentIndex} / {totalCards}
                </span>
              )}
            </div>
            <span className="text-lg font-black text-white uppercase tracking-tighter italic whitespace-normal">{selectedCard.name}</span>
          </motion.div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4 lg:space-y-8">
          <motion.div 
            layoutId={`card-img-${selectedCard.id}`}
            className="group relative aspect-[7/10] w-[90%] mx-auto rounded-[2rem] overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-600/20 duration-500"
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

      {/* Mobile Floating Overlay Controls */}
      <div className="lg:hidden">
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex items-center justify-between px-2 pointer-events-none z-[100]">
          <button 
            onClick={onPrev}
            className="p-4 bg-slate-900/40 backdrop-blur-md rounded-full border border-white/5 text-white pointer-events-auto active:scale-95 transition-all shadow-2xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={onNext}
            className="p-4 bg-slate-900/40 backdrop-blur-md rounded-full border border-white/5 text-white pointer-events-auto active:scale-95 transition-all shadow-2xl"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pt-8 border-t border-white/5 mt-auto"
      >
        <button 
          disabled={isPaused}
          onClick={() => {
            if (isPreselected) {
              onPickCard();
            } else {
              onPreSelect(selectedCard.id);
            }
          }}
          className={`w-full py-5 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 transition-all active:scale-95 group relative overflow-hidden ${
            isPreselected 
              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' 
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
          } disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none`}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isPreselected ? 'confirm' : 'preselect'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-4"
            >
              {isPreselected ? 'CONFERMA PICK' : 'PRESELEZIONA'}
              <Zap className={`w-4 h-4 fill-current ${isPreselected ? 'text-white' : 'text-white/80'} group-hover:scale-125 transition-transform`} />
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.div>
    </motion.div>
  );
};
