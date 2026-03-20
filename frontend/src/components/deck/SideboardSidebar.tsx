import { ChevronLeft, ChevronRight, ArrowRightLeft, MoveVertical, RefreshCw, Maximize2 } from 'lucide-react';
import type { SimplifiedCard } from '../../services/scryfall';

interface SideboardSidebarProps {
  sideboard: SimplifiedCard[];
  isSideboardCollapsed: boolean;
  flippedIds: Set<string>;
  onToggleFlip: (e: React.MouseEvent, id: string) => void;
  onToggleCollapse: () => void;
  onMoveToMainboard: (index: number) => void;
  onDragStart: (index: number, source: 'main' | 'side') => void;
  onDrop: (e: React.DragEvent, target: 'main' | 'side') => void;
  renderManaSymbols: (manaCost: string) => React.ReactNode;
  onZoom?: (card: SimplifiedCard, flipped: boolean) => void;
}

export const SideboardSidebar: React.FC<SideboardSidebarProps> = ({
  sideboard,
  isSideboardCollapsed,
  flippedIds,
  onToggleFlip,
  onToggleCollapse,
  onMoveToMainboard,
  onDragStart,
  onDrop,
  renderManaSymbols,
  onZoom
}) => {
  return (
    <div 
      className={`relative bg-slate-900 border-l border-white/5 transition-all duration-700 ease-in-out flex flex-col shadow-2xl z-10 ${isSideboardCollapsed ? 'w-1 sm:w-14' : 'w-80'}`}
      onDragOver={e => e.preventDefault()}
      onDrop={(e) => onDrop(e, 'side')}
    >
      <button 
        onClick={onToggleCollapse}
        className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all shadow-2xl z-20 ${
          isSideboardCollapsed 
            ? '-left-5' 
            : '-left-6'
        } w-8 h-12 bg-slate-900 border-l border-y border-white/10 rounded-l-2xl text-white hover:bg-slate-800`}
      >
        {isSideboardCollapsed ? <ChevronLeft className="w-5 h-5 ml-1" /> : <ChevronRight className="w-5 h-5 ml-1" />}
      </button>

      {!isSideboardCollapsed && (
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          <h3 className="font-black text-white uppercase text-sm tracking-widest">Sideboard</h3>
          <div className="px-4 py-1.5 bg-slate-950 rounded-full text-indigo-400 font-black text-[12px] border border-white/5 shadow-inner">{sideboard.length}</div>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 transition-opacity duration-300 ${isSideboardCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {sideboard.map((card, i) => {
          const cardId = (card as any).id || card.scryfall_id;
          const isFlipped = flippedIds.has(cardId);
          const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

          return (
            <div 
              key={i}
              draggable
              onDragStart={() => onDragStart(i, 'side')}
              onClick={() => onMoveToMainboard(i)}
              className="relative h-14 rounded-2xl overflow-hidden border border-white/5 group bg-slate-950/80 shadow-xl flex items-center px-4 hover:border-indigo-500/50 transition-all cursor-pointer"
            >
              <img src={displayImage} alt={card.name} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="relative z-10 flex justify-between items-center w-full min-w-0 pr-6">
                <span className="text-[10px] font-bold text-white whitespace-normal break-words drop-shadow-lg">{card.name}</span>
                <div className="shrink-0 scale-90 sm:scale-100 flex items-center gap-2">
                  {onZoom && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onZoom(card, isFlipped); }}
                      className="p-1 rounded-md bg-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all"
                      title="Zoom"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {card.back_image_url && (
                    <button 
                      onClick={(e) => onToggleFlip(e, cardId)}
                      className={`p-1 rounded-md border border-white/10 transition-all ${isFlipped ? 'bg-indigo-500 text-white' : 'bg-black/40 text-white/50 hover:text-white'}`}
                      title="Gira"
                    >
                      <RefreshCw className={`w-3 h-3 ${isFlipped ? 'rotate-180' : ''} transition-transform`} />
                    </button>
                   )}
                  {renderManaSymbols(card.mana_cost)}
                </div>
              </div>
              <ArrowRightLeft className="absolute right-4 w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
        {sideboard.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-800/40 rounded-[3rem] opacity-20 group-hover:opacity-40 transition-opacity">
            <MoveVertical className="w-10 h-10 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Trascina o clicca qui per svuotare il mazzo</p>
          </div>
        )}
      </div>
    </div>
  );
};
