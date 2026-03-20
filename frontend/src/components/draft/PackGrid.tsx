import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutPanelLeft, Loader2, RefreshCw } from 'lucide-react';
import type { Card } from '@shared/types';

interface PackGridProps {
  currentPack: Card[];
  selectedCardId: string | null;
  preSelectedId: string | null;
  isPaused: boolean;
  round: number;
  poolCount: number;
  onSelectCard: (id: string) => void;
  onPickCard: () => void;
  setPreSelectedId: (id: string) => void;
  queuedCount: number;
  isCompleted: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut" as any
    }
  }),
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export const PackGrid: React.FC<PackGridProps> = ({
  currentPack,
  selectedCardId,
  preSelectedId,
  isPaused,
  round,
  poolCount,
  onSelectCard,
  onPickCard,
  setPreSelectedId,
  queuedCount,
  isCompleted
}) => {
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());

  const toggleFlip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto landscape:overflow-hidden p-6 sm:p-10 landscape:p-0 custom-scrollbar relative flex flex-col landscape:items-center landscape:justify-center">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-10 w-full landscape:space-y-0">
        <div className="flex items-center justify-between landscape:hidden">
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-4xl font-black text-white uppercase tracking-tighter italic lg:block"
          >
            Pack {round} <span className="text-indigo-500 px-2">/</span> Pick {poolCount + 1}
          </motion.h2>

          <AnimatePresence>
            {queuedCount > 1 && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center gap-4 bg-amber-500/10 px-5 py-2.5 rounded-[1.5rem] border border-amber-500/30 shadow-lg shadow-amber-500/5"
              >
                <div className="flex items-center gap-2">
                  <LayoutPanelLeft className="w-4 h-4 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Coda di Pick</span>
                    <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-widest mt-0.5">Hai pacchetti in attesa</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-amber-500/20" />
                <span className="text-lg font-black text-white leading-none">+{queuedCount - 1}</span>
              </motion.div>
            )}
            {currentPack.length === 0 && !isCompleted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-2xl border border-indigo-500/20"
              >
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">In attesa del pacchetto...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 landscape:flex lg:landscape:grid landscape:flex-nowrap lg:landscape:flex-wrap landscape:overflow-x-auto lg:landscape:overflow-visible landscape:pb-12 lg:landscape:pb-0 landscape:pt-4 landscape:gap-4 landscape:justify-start lg:landscape:justify-start landscape:px-8 lg:landscape:px-0 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {currentPack.map((card: Card, index: number) => {
              const isFlipped = flippedIds.has(card.id);
              const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : (card.image_uris?.normal || (card as any).image_url);

              return (
                <motion.div 
                  key={card.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  onClick={() => !isPaused && onSelectCard(card.id)}
                  onDoubleClick={() => {
                    if (!isPaused) {
                      if (preSelectedId === card.id) {
                        onPickCard();
                      } else {
                        setPreSelectedId(card.id);
                        onSelectCard(card.id);
                      }
                    }
                  }}
                  className={`group relative aspect-[7/10] landscape:h-[65vh] lg:landscape:h-auto landscape:w-auto lg:landscape:w-full landscape:shrink-0 lg:landscape:shrink rounded-2xl cursor-pointer transition-shadow duration-300 ${isPaused ? 'opacity-50 cursor-not-allowed' : ''} 
                    ${selectedCardId === card.id ? 'z-10 shadow-[0_0_40px_rgba(79,70,229,0.4)]' : 'hover:shadow-xl'} 
                    ${preSelectedId === card.id ? 'ring-4 ring-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.6)]' : ''}`}
                  whileHover={!isPaused ? { scale: 1.02, y: -8 } : {}}
                  whileTap={!isPaused ? { scale: 0.98 } : {}}
                >
                  {/* Ghost Card (staying in the grid while motion card 'flies') */}
                  {selectedCardId === card.id && (
                    <img 
                      src={displayImage}
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl border-2 border-indigo-400 opacity-100"
                    />
                  )}

                  {/* FLIP BUTTON */}
                  {card.back_image_url && (
                    <button 
                      onClick={(e) => toggleFlip(e, card.id)}
                      className={`absolute top-1.5 left-1/2 -translate-x-1/2 z-50 p-1 rounded-lg border border-white/10 transition-all ${isFlipped ? 'bg-indigo-500/60 text-white shadow-lg' : 'bg-black/30 text-white/50 hover:text-white hover:bg-black/60'}`}
                      title="Gira carta"
                    >
                      <RefreshCw className={`w-3 h-3 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
                    </button>
                  )}
                
                  <motion.img 
                    layoutId={`card-img-${card.id}`}
                    src={displayImage} 
                    alt={card.name}
                    className={`relative z-[5] w-full h-full object-cover rounded-2xl border-2 transition-colors duration-500 
                      ${selectedCardId === card.id ? 'border-indigo-400' : (preSelectedId === card.id ? 'border-amber-400' : 'border-transparent group-hover:border-indigo-500/30')}`}
                  />
                  <AnimatePresence>
                    {(selectedCardId === card.id || preSelectedId === card.id) && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 rounded-2xl pointer-events-none transition-colors duration-300 
                          ${selectedCardId === card.id ? 'bg-indigo-600/20' : 'bg-amber-600/30'}`} 
                      />
                    )}
                  </AnimatePresence>
                  
                  {preSelectedId === card.id && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950 z-20"
                    >
                      <span className="text-[10px] font-black italic">!</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
