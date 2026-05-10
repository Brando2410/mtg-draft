import { LayoutGrid, RefreshCw } from 'lucide-react';
import type { SimplifiedCard } from '../../services/scryfall';

interface MainboardGridProps {
  activeCmcs: number[];
  columns: Record<number, { creatures: SimplifiedCard[], others: SimplifiedCard[], all: SimplifiedCard[] }>;
  separateByType: boolean;
  mainboard: SimplifiedCard[];
  flippedIds: Set<string>;
  onToggleFlip: (e: React.MouseEvent, id: string) => void;
  onMoveToSideboard: (card: SimplifiedCard) => void;
  onDragStart: (card: SimplifiedCard, source: 'main' | 'side') => void;
  onDrop: (target: 'main' | 'side') => void;
  onZoom: (card: SimplifiedCard, flipped: boolean) => void;
}

export const MainboardGrid: React.FC<MainboardGridProps> = ({
  activeCmcs,
  columns,
  separateByType,
  flippedIds,
  onToggleFlip,
  onMoveToSideboard,
  onDragStart,
  onDrop,
  onZoom
}) => {
  return (
    <div
      className="flex-1 overflow-x-auto overflow-y-hidden p-[clamp(12px,2vw,32px)] flex gap-[clamp(8px,1vw,16px)] bg-[#0a0a0c] relative custom-scrollbar-h"
      onDragOver={e => e.preventDefault()}
      onDrop={() => onDrop('main')}
    >
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(79,70,229,0.1),_transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,_rgba(34,211,238,0.05),_transparent)] pointer-events-none" />

      {activeCmcs.map(cmc => (
        <div key={cmc} className="flex-1 min-w-[clamp(120px,12vw,180px)] flex flex-col gap-4 relative z-10">

          {/* COLUMN HEADER - Glassmorphism style */}
          <div className="h-[clamp(32px,5vh,44px)] flex items-center justify-between px-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-lg group/header overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-500" />
            <span className="text-[clamp(8px,0.7vw,10px)] font-black text-slate-400 uppercase tracking-widest relative z-10">
              CMC <span className="text-white ml-1">{cmc}{cmc === 6 ? '+' : ''}</span>
            </span>
            <div className="flex items-center gap-1.5 opacity-40 group-hover/header:opacity-100 transition-all duration-500">
              <span className="text-[9px] font-black text-indigo-400">
                {separateByType ? columns[cmc].creatures.length + columns[cmc].others.length : columns[cmc].all.length}
              </span>
            </div>
          </div>

          {/* SCROLLABLE COLUMN CONTENT */}
          <div className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-1">

            {/* SECTION: CREATURES (or All) */}
            <div 
              className="relative w-full aspect-[2.5/3.5] transition-all duration-500"
              style={{ 
                marginBottom: `${Math.max(0, ((separateByType ? columns[cmc].creatures : columns[cmc].all).length - 1) * (separateByType ? 50 : 70))}px` 
              }}
            >
              {(separateByType ? columns[cmc].creatures : columns[cmc].all).map((card, i) => {
                const cardId = (card as any).id || card.scryfall_id;
                const isFlipped = flippedIds.has(cardId);
                const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

                return (
                  <div
                    key={`${cardId}-${i}`}
                    draggable
                    onDragStart={() => onDragStart(card, 'main')}
                    onClick={() => onMoveToSideboard(card)}
                    onContextMenu={(e) => { e.preventDefault(); onZoom(card, isFlipped); }}
                    className="absolute w-full aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 cursor-pointer group bg-slate-900 hover:z-[100]"
                    style={{ top: `${i * (separateByType ? 50 : 70)}px`, zIndex: i }}
                  >
                    <img src={displayImage} alt={card.name} className="w-full h-full object-cover transition-transform duration-700" />

                    {/* Flipped Indicator */}
                    {card.back_image_url && (
                      <button
                        onClick={(e) => onToggleFlip(e, cardId)}
                        className={`absolute bottom-2 right-2 z-30 p-1.5 rounded-lg border border-white/10 backdrop-blur-md transition-all ${isFlipped ? 'bg-indigo-500 text-white shadow-lg' : 'bg-black/40 text-white/50 hover:text-white hover:bg-black/60'}`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SECTION: NON-CREATURES (if separateByType enabled) */}
            {separateByType && columns[cmc].others.length > 0 && (
              <div 
                className="relative w-full aspect-[2.5/3.5] mt-14 pt-4 border-t border-white/5 transition-all duration-500"
                style={{ 
                  marginBottom: `${Math.max(0, (columns[cmc].others.length - 1) * 50)}px` 
                }}
              >

                {columns[cmc].others.map((card, i) => {
                  const cardId = (card as any).id || card.scryfall_id;
                  const isFlipped = flippedIds.has(cardId);
                  const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

                  return (
                    <div
                      key={`${cardId}-${i}`}
                      draggable
                      onDragStart={() => onDragStart(card, 'main')}
                      onClick={() => onMoveToSideboard(card)}
                      onContextMenu={(e) => { e.preventDefault(); onZoom(card, isFlipped); }}
                      className="absolute w-full aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 cursor-pointer group bg-slate-900 hover:z-[100]"
                      style={{ top: `${i * 50}px`, zIndex: i }}
                    >
                      <img src={displayImage} alt={card.name} className="w-full h-full object-cover transition-transform duration-700" />

                      {card.back_image_url && (
                        <button
                          onClick={(e) => onToggleFlip(e, cardId)}
                          className={`absolute bottom-2 right-2 z-30 p-1.5 rounded-lg border border-white/10 backdrop-blur-md transition-all ${isFlipped ? 'bg-indigo-500 text-white shadow-lg' : 'bg-black/40 text-white/50 hover:text-white hover:bg-black/60'}`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {activeCmcs.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 animate-in fade-in duration-1000">
          <div className="w-32 h-32 bg-slate-900/40 rounded-[3rem] flex items-center justify-center border border-white/5 shadow-2xl mb-8 group">
            <LayoutGrid className="w-12 h-12 text-slate-700 group-hover:text-indigo-500 transition-colors duration-500" />
          </div>
          <h4 className="text-xl font-black text-slate-700 uppercase tracking-tighter italic">No Cards In Mainboard</h4>
          <p className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.3em] mt-2">All assets relocated to Sideboard</p>
        </div>
      )}
    </div>
  );
};

