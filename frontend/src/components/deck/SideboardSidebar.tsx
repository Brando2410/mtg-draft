import { ChevronLeft, ChevronRight, MoveVertical, RefreshCw } from 'lucide-react';
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
    <div
      className={`fixed sm:relative top-0 right-0 bottom-0 sm:top-auto sm:right-auto sm:bottom-auto bg-slate-900 border-l border-white/5 transition-all duration-500 ease-in-out flex flex-col shadow-2xl z-[70] ${
        isSideboardCollapsed 
          ? 'translate-x-full sm:translate-x-0 sm:w-14' 
          : 'w-full sm:w-[20vw] sm:min-w-[280px] sm:max-w-[400px] translate-x-0'
      }`}
      onDragOver={e => e.preventDefault()}
      onDrop={() => onDrop('side')}
    >
      <button
        onClick={onToggleCollapse}
        className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 shadow-2xl z-20 ${
          isSideboardCollapsed
            ? '-left-12 sm:-left-5'
            : '-left-6'
        } w-10 sm:w-8 h-16 sm:h-12 bg-slate-900 border-l border-y border-white/10 rounded-l-2xl text-white hover:bg-slate-800`}
      >
        {isSideboardCollapsed ? <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5 ml-1" /> : <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5 ml-1" />}
      </button>

      {!isSideboardCollapsed && (
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          <h3 className="font-black text-white uppercase text-sm tracking-widest">Sideboard</h3>
          <div className="px-4 py-1.5 bg-slate-950 rounded-full text-indigo-400 font-black text-[12px] border border-white/5 shadow-inner">{sideboard.length}</div>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 transition-opacity duration-200 ${isSideboardCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {sideboard.map((card, i) => {
          const cardId = (card as any).id || card.scryfall_id;
          const isFlipped = flippedIds.has(cardId);
          const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

          return (
            <div
              key={i}
              draggable
              onDragStart={() => onDragStart(card, 'side')}
              onClick={() => onMoveToMainboard(card)}
              onContextMenu={(e) => { e.preventDefault(); onRemoveFromSideboard(card); }}
              className="relative h-14 rounded-2xl overflow-hidden border border-white/5 group bg-slate-950/80 shadow-xl flex items-center px-4 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all cursor-pointer"
            >
              <img
                src={displayImage}
                alt={card.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />

              <div className="relative z-10 flex justify-between items-center w-full min-w-0 pr-6">
                <span className="text-[10px] font-bold text-white whitespace-normal break-words drop-shadow-lg group-hover:scale-110 transition-transform origin-left">{card.name}</span>
                <div className="shrink-0 scale-90 sm:scale-100 flex items-center gap-2">
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
            </div>
          );
        })}
        {sideboard.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-800/40 rounded-[3rem] opacity-20 group-hover:opacity-40 transition-opacity">
            <MoveVertical className="w-10 h-10 mb-4" />
          </div>
        )}
      </div>
    </div>
  );
};
