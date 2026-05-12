
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import type { SimplifiedCard } from '../../services/scryfall';

interface CardGridItemProps {
  card: SimplifiedCard;
  count: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onHoverStart?: (card: SimplifiedCard) => void;
  onHoverEnd?: () => void;
  onRemove: () => void;
  onQuickAdd: () => void;
  onFlipToggle?: (e: React.MouseEvent) => void;
  isFlipped?: boolean;
}

export const CardGridItem = ({
  card,
  count,
  isSelected,
  onHoverStart,
  onHoverEnd,
  onRemove,
  onQuickAdd,
  onFlipToggle,
  isFlipped = false
}: CardGridItemProps) => {
  const [imageError, setImageError] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      onHoverStart?.(card);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    onHoverEnd?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRemove();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Click sinistro (button 0) aggiunge, click destro (button 2) gestito da handleContextMenu
    if (e.button === 0) {
      onQuickAdd();
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  return (
    <motion.div 
      layout
      transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      className={`group relative rounded-xl overflow-hidden bg-slate-950 shadow-2xl transition-all duration-300 cursor-pointer ring-2 ${isSelected ? 'ring-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'ring-transparent hover:ring-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'}`}
    >
      <div className="relative aspect-[2.5/3.5] overflow-hidden">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-950 text-center border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Image Lost</span>
            <span className="text-sm font-black text-white italic leading-tight uppercase line-clamp-3">{card.name}</span>
          </div>
        ) : (
          <img 
            src={displayImage} 
            alt={card.name} 
            onError={() => setImageError(true)}
            className="w-full h-full object-cover pointer-events-none" 
          />
        )}
        
        {/* COUNT BADGE */}
        <div className="absolute bottom-2 left-2 flex items-center justify-center min-w-[28px] h-7 bg-indigo-600/90 backdrop-blur-md text-white rounded-lg shadow-xl border border-white/20 z-10 px-2 pointer-events-none">
          <span className="text-xs font-black italic">x{count}</span>
        </div>

        {/* FLIP INDICATOR / BUTTON */}
        {card.back_image_url && onFlipToggle && (
          <button 
            onClick={(e) => { e.stopPropagation(); onFlipToggle(e); }}
            className={`absolute top-2 right-2 z-30 p-1.5 rounded-lg border border-white/10 transition-all ${isFlipped ? 'bg-indigo-500/80 text-white shadow-lg' : 'bg-black/40 text-white/60 hover:text-white hover:bg-black/80'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
