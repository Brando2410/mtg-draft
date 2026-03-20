import { LayoutGrid, RefreshCw, Maximize2 } from 'lucide-react';
import type { SimplifiedCard } from '../../services/scryfall';

interface MainboardGridProps {
  activeCmcs: number[];
  columns: Record<number, { creatures: SimplifiedCard[], others: SimplifiedCard[], all: SimplifiedCard[] }>;
  separateByType: boolean;
  mainboard: SimplifiedCard[];
  flippedIds: Set<string>;
  onToggleFlip: (e: React.MouseEvent, id: string) => void;
  onMoveToSideboard: (index: number) => void;
  onDragStart: (index: number, source: 'main' | 'side') => void;
  onDrop: (e: React.DragEvent, target: 'main' | 'side') => void;
  onZoom: (card: SimplifiedCard, flipped: boolean) => void;
}

export const MainboardGrid: React.FC<MainboardGridProps> = ({
  activeCmcs,
  columns,
  separateByType,
  mainboard,
  flippedIds,
  onToggleFlip,
  onMoveToSideboard,
  onDragStart,
  onDrop,
  onZoom
}) => {
  return (
    <div 
      className="flex-1 overflow-x-auto overflow-y-hidden p-6 sm:p-10 flex gap-6 sm:gap-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 scrollbar-thin"
      onDragOver={e => e.preventDefault()}
      onDrop={(e) => onDrop(e, 'main')}
    >
      {activeCmcs.map(cmc => (
        <div key={cmc} className="flex-1 min-w-[150px] max-w-[200px] flex flex-col gap-6">
          <div className="h-12 flex flex-col items-center justify-center font-black text-slate-600 bg-slate-900/40 rounded-2xl uppercase text-[9px] tracking-widest border border-white/5 shadow-inner">
            <span>Costo {cmc}{cmc === 6 ? '+' : ''}</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-12">
            <div className="relative flex-1">
              {(separateByType ? columns[cmc].creatures : columns[cmc].all).map((card, i) => {
                const idx = mainboard.findIndex(m => m === card);
                const cardId = (card as any).id || card.scryfall_id;
                const isFlipped = flippedIds.has(cardId);
                const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

                return (
                  <div 
                    key={`${cardId}-${i}`}
                    draggable
                    onDragStart={() => onDragStart(idx, 'main')}
                    onClick={() => onMoveToSideboard(idx)}
                    className="absolute w-full aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl border border-white/5 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group bg-slate-900 hover:scale-125 hover:!z-[100]"
                    style={{ top: `${i * (separateByType ? 28 : 45)}px`, zIndex: i }}
                  >
                    <img src={displayImage} alt={card.name} className="w-full h-full object-cover transition-transform duration-500" />
                    
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-20">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onZoom(card, isFlipped); }}
                        className="w-10 h-10 rounded-xl bg-white/40 hover:bg-white/60 text-white flex items-center justify-center border border-white/20 shadow-2xl transition-all"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>

                    {card.back_image_url && (
                        <button 
                          onClick={(e) => onToggleFlip(e, cardId)}
                          className={`absolute top-1 left-1/2 -translate-x-1/2 z-30 p-1 rounded-lg border border-white/10 transition-all ${isFlipped ? 'bg-indigo-500/60 text-white shadow-lg' : 'bg-black/30 text-white/50 hover:text-white hover:bg-black/60'}`}
                        >
                           <RefreshCw className={`w-3 h-3 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
                        </button>
                    )}
                  </div>
                );
              })}
            </div>

            {separateByType && columns[cmc].others.length > 0 && (
              <div className="relative flex-1 pt-6 border-t border-slate-900">
                {columns[cmc].others.map((card, i) => {
                  const idx = mainboard.findIndex(m => m === card);
                  const cardId = (card as any).id || card.scryfall_id;
                  const isFlipped = flippedIds.has(cardId);
                  const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;

                  return (
                    <div 
                      key={`${cardId}-${i}`}
                      draggable
                      onDragStart={() => onDragStart(idx, 'main')}
                      onClick={() => onMoveToSideboard(idx)}
                      className="absolute w-full aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl border border-white/5 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group bg-slate-900 hover:scale-125 hover:!z-[100]"
                      style={{ top: `${i * 28}px`, zIndex: i }}
                    >
                      <img src={displayImage} alt={card.name} className="w-full h-full object-cover transition-transform duration-500" />
                      
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onZoom(card, isFlipped); }}
                          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white flex items-center justify-center border border-white/10 shadow-2xl transition-all"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>

                      {card.back_image_url && (
                         <button 
                           onClick={(e) => onToggleFlip(e, cardId)}
                           className={`absolute top-1 left-1/2 -translate-x-1/2 z-30 p-1 rounded-lg border border-white/10 transition-all ${isFlipped ? 'bg-indigo-500/60 text-white shadow-lg' : 'bg-black/30 text-white/50 hover:text-white hover:bg-black/60'}`}
                         >
                            <RefreshCw className={`w-3 h-3 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
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
        <div className="flex-1 flex flex-col items-center justify-center opacity-20">
          <LayoutGrid className="w-16 h-16 mb-6 text-slate-700" />
          <p className="font-black uppercase tracking-[0.4em] text-xs text-slate-700">Tutto in Sideboard</p>
        </div>
      )}
    </div>
  );
};
