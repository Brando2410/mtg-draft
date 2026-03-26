import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Card } from '@shared/types';

interface PackGridProps {
  currentPack: Card[];
  onSelectCard: (id: string) => void;
  onPreSelect: (id: string) => void;
  selectedCardId: string | null;
  preSelectedId: string | null;
  onPickCard: () => void;
  isPaused: boolean;
  queuedCount: number;
}

export const PackGrid: React.FC<PackGridProps> = ({
  currentPack,
  onSelectCard,
  onPreSelect,
  selectedCardId,
  preSelectedId,
  onPickCard,
  isPaused,
  queuedCount
}) => {
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollHorizDirection, setScrollHorizDirection] = useState<'left' | 'right' | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = container;
      
      // Controllo Verticale (Portrait/Desktop)
      if (scrollHeight >= clientHeight + 200) {
        const midPoint = (scrollHeight - clientHeight) / 2;
        setScrollDirection(scrollTop > midPoint ? 'up' : 'down');
      } else {
        setScrollDirection(null);
      }

      // Controllo Orizzontale (Landscape Mobile)
      if (scrollWidth >= clientWidth + 200) {
        const midPoint = (scrollWidth - clientWidth) / 2;
        setScrollHorizDirection(scrollLeft > midPoint ? 'left' : 'right');
      } else {
        setScrollHorizDirection(null);
      }
    };

    // Initial check
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [currentPack.length]);

  const handleSmartScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    if (scrollDirection === 'up') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleSmartHorizScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    if (scrollHorizDirection === 'left') {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
  };

  const toggleFlip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFlipped = new Set(flippedIds);
    if (flippedIds.has(id)) {
      newFlipped.delete(id);
    } else {
      newFlipped.add(id);
    }
    setFlippedIds(newFlipped);
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }),
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex-1 overflow-y-auto landscape:overflow-hidden p-6 sm:p-10 landscape:p-0 custom-scrollbar relative flex flex-col landscape:items-center landscape:justify-center">
      <div className="w-full flex-1 min-h-0 relative">
        <div 
          ref={scrollContainerRef}
          className="absolute inset-0 flex flex-row landscape:flex-row portrait:flex-col portrait:grid portrait:grid-cols-1 portrait:overflow-y-auto landscape:overflow-x-auto lg:grid lg:grid-rows-2 lg:grid-flow-col lg:overflow-y-hidden lg:overflow-x-auto gap-8 portrait:gap-6 landscape:gap-10 lg:gap-8 portrait:px-6 lg:px-12 landscape:px-12 pb-8 landscape:pb-12 pt-4 landscape:items-center portrait:items-start lg:items-start custom-scrollbar-horizontal"
        >
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
                  className={`relative aspect-[7/10] portrait:w-full lg:w-[26.6vh] lg:h-[38vh] landscape:h-[65vh] lg:landscape:h-[38vh] landscape:shrink-0 lg:shrink-0 ${isPaused ? 'opacity-50 cursor-not-allowed' : ''} z-0`}
                >
                  {/* Internal selection/hover wrapper for instant return */}
                  <div 
                    onClick={() => {
                      if (!isPaused) {
                        onSelectCard(card.id);
                        onPreSelect(card.id);
                      }
                    }}
                    onDoubleClick={() => {
                      if (!isPaused) {
                        onPickCard();
                      }
                    }}
                    className={`w-full h-full relative rounded-xl portrait:rounded-2xl cursor-pointer transition-shadow duration-300 
                      ${selectedCardId === card.id ? 'z-10 shadow-[0_0_40px_rgba(79,70,229,0.4)]' : 'hover:shadow-xl'} 
                      ${preSelectedId === card.id 
                        ? 'ring-4 ring-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.6)]' 
                        : 'hover:ring-4 hover:ring-indigo-500/60 shadow-[0_0_8px_rgba(79,70,229,0.3)]'}
                      hover:-translate-y-1.5 transition-none`}
                  >
                    <div className="relative w-full h-full z-0 pointer-events-none transition-colors duration-300 rounded-xl lg:border lg:border-white/5 group-hover:bg-white/5" />
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-0 z-10 p-3 flex flex-col items-center justify-center opacity-0 portrait:opacity-100 max-lg:landscape:opacity-100 group:hover:opacity-100 hover:opacity-100 transition-opacity bg-gradient-to-b from-black/20 via-black/40 to-black/60 rounded-xl lg:rounded-2xl pointer-events-none portrait:pointer-events-auto max-lg:landscape:pointer-events-auto group">
                      {/* Flip Button (Top Right) */}
                      {card.back_image_url && (
                        <div className="absolute top-3 right-3 pointer-events-auto">
                          <div 
                            className={`p-2 backdrop-blur-md rounded-lg shadow-lg transition-colors ${isFlipped ? 'bg-amber-500/80' : 'bg-black/60 hover:bg-black/80'}`} 
                            onClick={(e) => toggleFlip(e, card.id)}
                          >
                            <RefreshCw className={`w-4 h-4 text-white transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      )}

                      {/* Contextual Action Buttons */}
                      <div className="flex flex-col gap-3 w-full px-4 mt-auto mb-4">
                        {preSelectedId === card.id && (
                          <button 
                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 backdrop-blur-md rounded-xl border border-amber-400/50 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(245,158,11,0.4)] pointer-events-auto transition-all active:scale-95" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onPickCard(); 
                            }}
                          >
                            Conferma Pick
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <motion.img
                      src={displayImage}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl lg:rounded-2xl border border-white/10 shadow-lg transition-transform duration-300"
                      initial={false}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                    />

                    {selectedCardId === card.id && (
                      <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none rounded-xl lg:rounded-2xl ring-2 ring-indigo-500/50" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {currentPack.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 sm:p-10 pointer-events-none"
          >
            <div className="max-w-md w-full p-8 sm:p-12 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-8 relative overflow-hidden">
              {/* Decorative Background Glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/10 blur-[100px] rounded-full" />

              {/* Animated Card Stack Icon */}
              <div className="relative w-24 h-32 mb-4">
                <motion.div 
                  animate={{ 
                    rotate: [-5, 5, -5],
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/40 rounded-xl"
                />
                <motion.div 
                  animate={{ 
                    rotate: [5, -5, 5],
                    y: [0, -15, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute inset-x-2 inset-y-2 bg-indigo-600/40 border border-indigo-400/50 rounded-xl shadow-2xl flex items-center justify-center"
                >
                  <RefreshCw className="w-8 h-8 text-white/50 animate-spin-slow" />
                </motion.div>
              </div>

              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                  {queuedCount > 0 ? 'Caricamento' : 'In attesa'} <span className="text-indigo-400">{queuedCount > 0 ? 'prossimo pack' : 'del pack'}</span>
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
                  {queuedCount > 0 
                    ? `Hai ancora ${queuedCount} ${queuedCount === 1 ? 'pacchetto' : 'pacchetti'} in coda.`
                    : 'Gli altri giocatori stanno finendo la loro scelta.'}
                </p>
              </div>
              
              <div className="flex gap-2 relative z-10">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                  />
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-4">
        <AnimatePresence>
          {scrollDirection && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              onClick={handleSmartScroll}
              className={`p-3 backdrop-blur-md text-white rounded-full shadow-2xl border border-white/10 flex items-center justify-center group pointer-events-auto transition-all
                ${scrollDirection === 'up' ? 'bg-indigo-500/20 hover:bg-indigo-500/80 text-indigo-400 hover:text-white' : 'bg-slate-800/20 hover:bg-slate-700/80 text-slate-400 hover:text-white'}`}
              title={scrollDirection === 'up' ? 'Torna in cima' : 'Vai in fondo'}
            >
              {scrollDirection === 'up' ? (
                <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              ) : (
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              )}
            </motion.button>
          )}

          {/* Horizontal Scroll (Landscape) */}
          {scrollHorizDirection && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              onClick={handleSmartHorizScroll}
              className={`p-3 backdrop-blur-md text-white rounded-full shadow-2xl border border-white/10 flex items-center justify-center group pointer-events-auto transition-all
                ${scrollHorizDirection === 'left' ? 'bg-indigo-500/20 hover:bg-indigo-500/80 text-indigo-400 hover:text-white' : 'bg-slate-800/20 hover:bg-slate-700/80 text-slate-400 hover:text-white'}`}
              title={scrollHorizDirection === 'left' ? 'Torna all\'inizio' : 'Vai alla fine'}
            >
              {scrollHorizDirection === 'left' ? (
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
