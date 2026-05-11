import { ChevronLeft, ChevronRight, MoveVertical, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimplifiedCard } from '../../services/scryfall';

interface SideboardSidebarProps {
  sideboard: SimplifiedCard[];
  isSideboardCollapsed: boolean;
  flippedIds: Set<string>;
  onToggleFlip: (e: React.MouseEvent, id: string) => void;
  onToggleCollapse: () => void;
  onMoveToMainboard: (card: SimplifiedCard) => void;
  onRemoveFromSideboard: (card: SimplifiedCard) => void;
  onDragStart: (card: SimplifiedCard, source: 'main' | 'side') => void;
  onDrop: (target: 'main' | 'side') => void;
  renderManaSymbols: (manaCost: string) => React.ReactNode;
}

export const SideboardSidebar: React.FC<SideboardSidebarProps> = ({
  sideboard,
  isSideboardCollapsed,
  flippedIds,
  onToggleFlip,
  onToggleCollapse,
  onMoveToMainboard,
  onRemoveFromSideboard,
  onDragStart,
  onDrop,
  renderManaSymbols
}) => {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
      className={`fixed sm:relative top-0 right-0 bottom-0 sm:top-auto sm:right-auto sm:bottom-auto bg-[#0a0a0c] border-l border-white/5 flex flex-col shadow-2xl z-[70] transition-shadow duration-500 ${
        isSideboardCollapsed 
          ? 'w-0 sm:w-14' 
          : 'w-full sm:w-[20vw] sm:min-w-[280px] sm:max-w-[400px]'
      }`}
      onDragOver={e => e.preventDefault()}
      onDrop={() => onDrop('side')}
    >
      <button
        onClick={onToggleCollapse}
        className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 shadow-2xl z-[80] ${
          isSideboardCollapsed
            ? '-left-10 sm:-left-5'
            : '-left-5'
        } w-10 sm:w-8 h-16 sm:h-12 bg-[#0a0a0c] border-l border-y border-white/10 rounded-l-2xl text-white hover:bg-slate-800 hover:text-cyan-400 group/side-btn`}
      >
        {isSideboardCollapsed ? (
          <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5 ml-1 group-hover/side-btn:-translate-x-0.5 transition-transform" />
        ) : (
          <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5 ml-1 group-hover/side-btn:translate-x-0.5 transition-transform" />
        )}
      </button>

      <AnimatePresence>
        {!isSideboardCollapsed && (
          <motion.div 
            key="sideboard-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full w-full overflow-hidden min-w-[280px]"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/20">
              <h3 className="font-black text-white uppercase text-xs tracking-[0.3em] italic">Sideboard</h3>
              <div className="px-3 py-1 bg-indigo-600/20 rounded-full text-indigo-400 font-black text-[10px] border border-indigo-500/30 shadow-inner">
                {sideboard.length}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2.5">
              {sideboard.map((card, i) => {
                const cardId = (card as any).id || card.scryfall_id;
                const isFlipped = flippedIds.has(cardId);
                const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

                return (
                  <motion.div
                    key={cardId + i}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    draggable
                    onDragStart={() => onDragStart(card, 'side')}
                    onClick={() => onMoveToMainboard(card)}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveFromSideboard(card); }}
                    className="relative h-12 rounded-xl overflow-hidden border border-white/5 group bg-slate-950/40 shadow-lg flex items-center px-3 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <img
                      src={displayImage}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />

                    <div className="relative z-10 flex justify-between items-center w-full min-w-0">
                      <span className="text-[10px] font-bold text-white/90 truncate pr-2 group-hover:text-white transition-colors">{card.name}</span>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {card.back_image_url && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleFlip(e, cardId); }}
                            className={`p-1 rounded bg-black/40 border border-white/10 text-white/40 hover:text-white transition-all ${isFlipped ? 'text-indigo-400 border-indigo-500/50' : ''}`}
                          >
                            <RefreshCw className={`w-2.5 h-2.5 ${isFlipped ? 'rotate-180' : ''} transition-transform`} />
                          </button>
                        )}
                        {renderManaSymbols(card.mana_cost)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {sideboard.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-10">
                  <MoveVertical className="w-8 h-8 mb-2" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em]">Empty</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSideboardCollapsed && (
        <div className="absolute inset-y-0 left-0 w-14 flex flex-col items-center justify-center py-8 gap-6 opacity-20 pointer-events-none">
           <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full" />
           <span className="[writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-[0.6em] text-white rotate-180">Sideboard</span>
           <div className="w-px h-20 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-full" />
        </div>
      )}
    </motion.div>
  );
};
