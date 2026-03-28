import { motion } from 'framer-motion';
import { Maximize2, Trash2, Plus, RefreshCw } from 'lucide-react';
import type { SimplifiedCard } from '../../services/scryfall';

interface CardGridItemProps {
  card: SimplifiedCard;
  count: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onZoom: () => void;
  onRemove: () => void;
  onQuickAdd: () => void;
  onFlipToggle?: (e: React.MouseEvent) => void;
  isFlipped?: boolean;
}

export const CardGridItem = ({
  card,
  count,
  isSelected,
  onSelect,
  onZoom,
  onRemove,
  onQuickAdd,
  onFlipToggle,
  isFlipped = false
}: CardGridItemProps) => {
  const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl transition-all duration-300 hover:-translate-y-2 ring-1 ring-inset ${isSelected ? 'ring-indigo-500 ring-2 translate-y-[-8px]' : 'ring-white/5 hover:shadow-indigo-500/20'}`}
    >
      <div className="relative aspect-[2.5/3.5] bg-slate-950 overflow-hidden">
        <img src={displayImage} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 duration-700 pointer-events-none ring-1 ring-white/10" />
        
        {/* COUNT BADGE */}
        <div className="absolute bottom-2 left-2 flex items-center justify-center min-w-[32px] h-8 bg-indigo-600 text-white rounded-lg shadow-xl border border-indigo-400 z-10 px-2 pointer-events-none">
          <span className="text-sm font-black italic">x{count}</span>
        </div>

        {/* FLIP INDICATOR / BUTTON */}
        {card.back_image_url && onFlipToggle && (
          <button 
            onClick={onFlipToggle}
            className={`absolute top-1.5 left-1/2 -translate-x-1/2 z-30 p-1 rounded-lg border border-white/10 transition-all ${isFlipped ? 'bg-indigo-500/60 text-white shadow-lg' : 'bg-black/30 text-white/50 hover:text-white hover:bg-black/60'}`}
          >
            <RefreshCw className={`w-3 h-3 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
          </button>
        )}

        {/* ACTIONS OVERLAY */}
        <div 
          className={`absolute inset-0 bg-slate-950/40 transition-all flex items-center justify-center gap-3 z-20 ${isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onZoom} 
            className="w-10 h-10 rounded-xl bg-white/40 hover:bg-white/60 text-white flex items-center justify-center border border-white/20 shadow-2xl transition-all active:scale-90"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col gap-1">
             <button 
               onClick={onQuickAdd} 
               className="w-10 h-10 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/50 text-white flex items-center justify-center border border-emerald-500/30 shadow-2xl transition-all active:scale-90"
             >
               <Plus className="w-4 h-4" />
             </button>
             <button 
               onClick={onRemove} 
               className="w-10 h-10 rounded-xl bg-red-500/30 hover:bg-red-500/50 text-white flex items-center justify-center border border-red-500/30 shadow-2xl transition-all active:scale-90"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
