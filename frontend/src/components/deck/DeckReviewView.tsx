import { useState, useMemo, useCallback, useEffect } from 'react';
import type { SimplifiedCard } from '../../services/scryfall';
import { DeckHeader } from './DeckHeader';
import { MainboardGrid } from './MainboardGrid';
import { SideboardSidebar } from './SideboardSidebar';
import { StatsModal } from './StatsModal';
import { X, RefreshCw } from 'lucide-react';

interface DeckReviewProps {
  pool: SimplifiedCard[];
  onClose: () => void;
  onUpdatePool: (newPool: SimplifiedCard[]) => void;
  onPoolUpdate?: (main: SimplifiedCard[], side: SimplifiedCard[]) => void;
  timeLeft?: number | null;
  isPaused?: boolean;
  isHost?: boolean;
  onTogglePause?: () => void;
}

export const DeckReviewView = ({ 
  pool, 
  onClose, 
  onUpdatePool, 
  onPoolUpdate, 
  timeLeft, 
  isPaused = false, 
  isHost = false, 
  onTogglePause
}: DeckReviewProps) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [filterColors, setFilterColors] = useState<string[]>([]);
  const [filterRarity, setFilterRarity] = useState<string | null>(null);
  const [filterCmc, setFilterCmc] = useState<number | null>(null);

  const [draggedCardIndex, setDraggedCardIndex] = useState<{ index: number, source: 'main' | 'side' } | null>(null);
  const [isSideboardCollapsed, setIsSideboardCollapsed] = useState(true);
  const [separateByType, setSeparateByType] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [zoomCard, setZoomCard] = useState<SimplifiedCard | null>(null);
  const [isZoomFlipped, setIsZoomFlipped] = useState(false);

  const manaSymbols: Record<string, string> = {
    'W': 'https://svgs.scryfall.io/card-symbols/W.svg',
    'U': 'https://svgs.scryfall.io/card-symbols/U.svg',
    'B': 'https://svgs.scryfall.io/card-symbols/B.svg',
    'R': 'https://svgs.scryfall.io/card-symbols/R.svg',
    'G': 'https://svgs.scryfall.io/card-symbols/G.svg',
  };

  const toggleFlip = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredPool = useMemo(() => {
    return pool.filter(card => {
        const matchesQuery = card.name.toLowerCase().includes(filterQuery.toLowerCase());
        const matchesColor = filterColors.length === 0 || filterColors.some(col => (card as any).color?.includes(col) || (card as any).colors?.includes(col));
        const matchesRarity = !filterRarity || (card.rarity || '').toLowerCase() === filterRarity.toLowerCase();
        const matchesCmc = filterCmc === null || (filterCmc === 6 ? card.cmc >= 6 : card.cmc === filterCmc);
        return matchesQuery && matchesColor && matchesRarity && matchesCmc;
    });
  }, [pool, filterQuery, filterColors, filterRarity, filterCmc]);

  // We still want to manage main/side but we filter what we SEE
  const [mainboard, setMainboard] = useState<SimplifiedCard[]>(pool);
  const [sideboard, setSideboard] = useState<SimplifiedCard[]>([]);
  
  // Re-sync mainboard when pool changes (new pick)
  useEffect(() => {
      setMainboard(() => {
          // Keep existing sideboard cards in sideboard, new cards go to main
          const sideIds = new Set(sideboard.map(c => c.scryfall_id + (c as any).id));
          const newMain = pool.filter(c => !sideIds.has(c.scryfall_id + (c as any).id));
          return newMain;
      });
  }, [pool]);
// Sideboard is not a dependency here because we want to stick to what's in it, not re-run when it changes via UI

  const displayedMain = useMemo(() => {
      return mainboard.filter(c => filteredPool.some(f => (f.scryfall_id + (f as any).id) === (c.scryfall_id + (c as any).id)));
  }, [mainboard, filteredPool]);

  const displayedSide = useMemo(() => {
      return sideboard.filter(c => filteredPool.some(f => (f.scryfall_id + (f as any).id) === (c.scryfall_id + (c as any).id)));
  }, [sideboard, filteredPool]);

  const columns = useMemo(() => {
    const cols: Record<number, { creatures: SimplifiedCard[], others: SimplifiedCard[], all: SimplifiedCard[] }> = {};
    for (let i = 0; i <= 6; i++) cols[i] = { creatures: [], others: [], all: [] };

    displayedMain.forEach(card => {
      const cmc = Math.min(card.cmc, 6);
      const isCreature = card.type_line?.toLowerCase().includes('creature');
      if (isCreature) cols[cmc].creatures.push(card);
      else cols[cmc].others.push(card);
      cols[cmc].all.push(card);
    });
    return cols;
  }, [displayedMain]);

  const stats = useMemo(() => {
    const creatures = displayedMain.filter((c) => c.type_line?.toLowerCase().includes('creature')).length;
    const nonCreatures = displayedMain.length - creatures;
    const manaCurve = new Array(9).fill(0);
    
    displayedMain.forEach((c) => {
      const cmc = Math.floor(c.cmc || 0);
      const idx = Math.min(cmc, 8);
      manaCurve[idx]++;
    });

    const colorSymbols: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    let totalColorSymbols = 0;

    displayedMain.forEach((c) => {
      const manaCost = c.mana_cost || "";
      const matches = manaCost.match(/\{([^}]+)\}/g) || [];
      matches.forEach((sym: string) => {
         const s = sym.replace(/[{}]/g, '');
         ['W','U','B','R','G'].forEach(col => {
            if (s.includes(col)) {
               colorSymbols[col]++;
               totalColorSymbols++;
            }
         });
      });
    });

    const colorPercentages: Record<string, string> = { W: "0", U: "0", B: "0", R: "0", G: "0" };
    if (totalColorSymbols > 0) {
       Object.keys(colorSymbols).forEach(col => {
          colorPercentages[col] = ((colorSymbols[col] / totalColorSymbols) * 100).toFixed(1);
       });
    }

    const totalCmc = displayedMain.reduce((acc: number, c) => acc + (c.cmc || 0), 0);
    const avgCmc = displayedMain.length > 0 ? (totalCmc / displayedMain.length).toFixed(1) : "0.0";
    
    return { creatures, nonCreatures, manaCurve, colorSymbols, colorPercentages, avgCmc };
  }, [displayedMain]);

  const activeCmcs = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].filter(cmc => columns[cmc].all.length > 0);
  }, [columns]);

  const syncPool = useCallback((newMain: SimplifiedCard[], newSide: SimplifiedCard[]) => {
    onUpdatePool([...newMain, ...newSide]);
    if (onPoolUpdate) onPoolUpdate(newMain, newSide);
  }, [onUpdatePool, onPoolUpdate]);

  const moveToSideboard = useCallback((index: number) => {
    const card = mainboard[index];
    const newMain = mainboard.filter((_, i) => i !== index);
    const newSide = [...sideboard, card];
    setMainboard(newMain);
    setSideboard(newSide);
    syncPool(newMain, newSide);
  }, [mainboard, sideboard, syncPool]);

  const moveToMainboard = useCallback((index: number) => {
    const card = sideboard[index];
    const newSide = sideboard.filter((_, i) => i !== index);
    const newMain = [...mainboard, card];
    setSideboard(newSide);
    setMainboard(newMain);
    syncPool(newMain, newSide);
  }, [mainboard, sideboard, syncPool]);

  const handleDragStart = useCallback((index: number, source: 'main' | 'side') => {
    setDraggedCardIndex({ index, source });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, target: 'main' | 'side') => {
    e.preventDefault();
    if (!draggedCardIndex) return;

    if (draggedCardIndex.source === 'main' && target === 'side') {
      moveToSideboard(draggedCardIndex.index);
    } else if (draggedCardIndex.source === 'side' && target === 'main') {
      moveToMainboard(draggedCardIndex.index);
    }
    setDraggedCardIndex(null);
  }, [draggedCardIndex, moveToMainboard, moveToSideboard]);

  const renderManaSymbols = useCallback((manaCost: string) => {
    if (!manaCost) return <span className="text-[8px] text-slate-600 font-bold uppercase">No Cost</span>;
    const symbols = manaCost.match(/\{([^}]+)\}/g) || [];
    return (
      <div className="flex items-center gap-0.5">
        {symbols.map((sym, i) => {
          const s = sym.replace(/[{}]/g, '').replace(/\//g, '_');
          return (
            <img 
              key={i} 
              src={`https://svgs.scryfall.io/card-symbols/${s}.svg`} 
              alt={s} 
              className="w-3.5 h-3.5 drop-shadow shadow-black" 
            />
          );
        })}
      </div>
    );
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-hidden font-sans pt-safe">
      <DeckHeader 
        isPaused={isPaused}
        separateByType={separateByType}
        onToggleSeparate={() => setSeparateByType(!separateByType)}
        onOpenStats={() => setIsStatsOpen(true)}
        timeLeft={timeLeft}
        isHost={isHost}
        onTogglePause={onTogglePause}
        onClose={onClose}
        formatTime={formatTime}
      />

      {/* FILTERS BAR */}
      <div className="bg-slate-900/50 border-b border-white/5 p-4 flex flex-wrap items-center gap-6 z-10">
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 shadow-inner">
            {['W', 'U', 'B', 'R', 'G'].map(col => (
              <button 
                key={col} 
                onClick={() => setFilterColors(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${filterColors.includes(col) ? 'bg-indigo-600 shadow-lg scale-110 active:scale-95' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
              >
                <img src={manaSymbols[col]} className="w-6 h-6" alt={col} />
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 h-12 items-center px-1">
            {['Common', 'Uncommon', 'Rare', 'Mythic'].map(rar => (
              <button 
                key={rar} 
                onClick={() => setFilterRarity(filterRarity === rar ? null : rar)}
                className={`px-4 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterRarity === rar ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {rar[0]}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 h-12 items-center px-1">
            {[0,1,2,3,4,5,6].map(val => (
              <button 
                key={val} 
                onClick={() => setFilterCmc(filterCmc === val ? null : val)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-[11px] transition-all ${filterCmc === val ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {val === 6 ? '6+' : val}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[200px] relative">
             <input 
                value={filterQuery} 
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Search in pool..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-indigo-500/50 transition-all shadow-inner"
             />
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <MainboardGrid 
          activeCmcs={activeCmcs}
          columns={columns}
          separateByType={separateByType}
          mainboard={displayedMain}
          flippedIds={flippedIds}
          onToggleFlip={toggleFlip}
          onMoveToSideboard={moveToSideboard}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onZoom={(card, flipped) => { setZoomCard(card); setIsZoomFlipped(flipped); }}
        />

        <SideboardSidebar 
          sideboard={displayedSide}
          isSideboardCollapsed={isSideboardCollapsed}
          flippedIds={flippedIds}
          onToggleFlip={toggleFlip}
          onToggleCollapse={() => setIsSideboardCollapsed(!isSideboardCollapsed)}
          onMoveToMainboard={moveToMainboard}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          renderManaSymbols={renderManaSymbols}
          onZoom={(card, flipped) => { setZoomCard(card); setIsZoomFlipped(flipped); }}
        />
      </div>
      
      {isStatsOpen && (
        <StatsModal 
          stats={stats} 
          onClose={() => setIsStatsOpen(false)} 
          manaSymbols={{
            'W': 'https://svgs.scryfall.io/card-symbols/W.svg',
            'U': 'https://svgs.scryfall.io/card-symbols/U.svg',
            'B': 'https://svgs.scryfall.io/card-symbols/B.svg',
            'R': 'https://svgs.scryfall.io/card-symbols/R.svg',
            'G': 'https://svgs.scryfall.io/card-symbols/G.svg',
          }}
        />
      )}

      {/* MODAL ZOOM - Deck Review View */}
      {zoomCard && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl p-4 sm:p-10 animate-in fade-in duration-300" onClick={() => { setZoomCard(null); setIsZoomFlipped(false); }}>
          {/* Pulsante di chiusura - Spostato in alto a destra fisso */}
          <button className="fixed top-4 right-4 sm:top-8 sm:right-8 text-white/40 hover:text-white transition-all p-3 bg-white/5 rounded-full backdrop-blur-md border border-white/5 z-50">
            <X className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
          
          <div className="relative flex flex-col items-center gap-6">
            <img 
              src={isZoomFlipped && zoomCard.back_image_url ? zoomCard.back_image_url : zoomCard.image_url} 
              alt={zoomCard.name} 
              className="max-h-[75vh] sm:max-h-[85vh] w-auto object-contain rounded-[2rem] sm:rounded-[3rem] shadow-[0_40px_150px_rgba(99,102,241,0.3)] border-[4px] sm:border-[6px] border-white/10 animate-in zoom-in-95 duration-500 relative z-10" 
              onClick={(e) => e.stopPropagation()} 
            />
            
            {zoomCard.back_image_url && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsZoomFlipped(!isZoomFlipped); }}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3 active:scale-95 group z-20"
              >
                <RefreshCw className={`w-5 h-5 ${isZoomFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
                Gira Carta
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
