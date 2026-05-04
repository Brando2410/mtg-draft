import { memo } from 'react';
import { Reorder } from 'framer-motion';
import { GameCard } from '../../GameCard';
import { ActionType, type GameObject } from '@shared/engine_types';

interface ScrySurveilViewProps {
  scryState: { top: any[], bottom: any[], graveyard: any[] };
  setScryState: React.Dispatch<React.SetStateAction<{ top: any[], bottom: any[], graveyard: any[] }>>;
  moveCard: (card: any, from: 'top' | 'bottom' | 'graveyard', to: 'top' | 'bottom' | 'graveyard') => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
  type: ActionType;
}

export const ScrySurveilView = memo(({ scryState, setScryState, moveCard, onHoverStart, onHoverEnd, type }: ScrySurveilViewProps) => {
  return (
    <div className="flex flex-col items-center w-full gap-8 py-4">
        <div className="flex flex-row items-start justify-center gap-10 w-full relative">
            {type === ActionType.Surveil && (
                <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]" data-zone="graveyard">
                    <h4 className="text-xs font-black italic uppercase tracking-widest text-red-500/80">Graveyard</h4>
                    <div className="w-full aspect-[4/3] rounded-3xl border border-white/10 bg-white/5 flex flex-col items-center justify-center p-4 relative overflow-x-auto custom-scrollbar shadow-2xl">
                        <Reorder.Group axis="x" values={scryState.graveyard} onReorder={(vals) => setScryState(p => ({ ...p, graveyard: vals }))} className="flex flex-row justify-center items-center w-full gap-4 px-4">
                            {scryState.graveyard.map((card: any, idx: number) => (
                                <Reorder.Item key={card.id || `grave-${idx}`} value={card} className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0" drag="y" whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                    onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 50) { const el = document.elementFromPoint(info.point.x, info.point.y); const zone = el?.closest('[data-zone]'); const targetZone = zone?.getAttribute('data-zone'); if (targetZone && targetZone !== 'graveyard') moveCard(card, 'graveyard', targetZone as any); } }}
                                    onClick={() => moveCard(card, 'graveyard', 'top')}>
                                    <GameCard obj={card} variant="small" onHoverStart={() => onHoverStart?.(card)} onHoverEnd={onHoverEnd} />
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]" data-zone="top">
                <h4 className="text-xs font-black italic uppercase tracking-widest text-cyan-400">Top of Library</h4>
                <div className="w-full aspect-[4/3] rounded-3xl border border-white/10 bg-indigo-500/5 shadow-2xl flex flex-col items-center justify-center p-4 relative overflow-x-auto custom-scrollbar">
                    <Reorder.Group axis="x" values={scryState.top} onReorder={(vals) => setScryState(p => ({ ...p, top: vals }))} className="flex flex-row justify-center items-center w-full gap-4 px-4">
                        {scryState.top.map((card: any, idx: number) => (
                            <Reorder.Item key={card.id || `scry-item-${idx}`} value={card} className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0" drag="y" whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 50) { const el = document.elementFromPoint(info.point.x, info.point.y); const zone = el?.closest('[data-zone]'); const targetZone = zone?.getAttribute('data-zone'); if (targetZone && targetZone !== 'top') moveCard(card, 'top', targetZone as any); } }}
                                onClick={() => moveCard(card, 'top', type === ActionType.Surveil ? 'graveyard' : 'bottom')}>
                                <div className="relative group/card">
                                    <GameCard obj={card} variant="small" onHoverStart={() => onHoverStart?.(card)} onHoverEnd={onHoverEnd} />
                                    {scryState.top.length > 1 && (
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 border-2 border-[#0b0f1a] flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-50">
                                            {scryState.top.indexOf(card) + 1}
                                        </div>
                                    )}
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>

            {type === ActionType.Scry && (
                <div className="flex flex-col items-center gap-4 flex-1 min-w-[200px]" data-zone="bottom">
                    <h4 className="text-xs font-black italic uppercase tracking-widest text-amber-500/80">Bottom</h4>
                    <div className="w-full aspect-[4/3] rounded-3xl border border-white/10 bg-white/5 shadow-2xl flex flex-col items-center justify-center p-4 relative overflow-x-auto custom-scrollbar">
                        <Reorder.Group axis="x" values={scryState.bottom} onReorder={(vals) => setScryState(p => ({ ...p, bottom: vals }))} className="flex flex-row justify-center items-center w-full gap-4 px-4">
                            {scryState.bottom.map((card: any, idx: number) => (
                                <Reorder.Item key={card.id || `top-${idx}`} value={card} className="relative scale-[0.8] cursor-grab active:cursor-grabbing shrink-0" drag="y" whileDrag={{ pointerEvents: 'none', zIndex: 100, scale: 0.6 }}
                                    onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 50) { const el = document.elementFromPoint(info.point.x, info.point.y); const zone = el?.closest('[data-zone]'); const targetZone = zone?.getAttribute('data-zone'); if (targetZone && targetZone !== 'bottom') moveCard(card, 'bottom', targetZone as any); } }}
                                    onClick={() => moveCard(card, 'bottom', 'top')}>
                                    <div className="relative group/card">
                                        <GameCard obj={card} variant="small" onHoverStart={() => onHoverStart?.(card)} onHoverEnd={onHoverEnd} />
                                        {scryState.bottom.length > 1 && (
                                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-600 border-2 border-[#0b0f1a] flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-50">
                                                {scryState.bottom.indexOf(card) + 1}
                                            </div>
                                        )}
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
});
