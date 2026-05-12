import { useState, useMemo, useCallback, useEffect } from 'react';
import type { SimplifiedCard } from '../../services/scryfall';
import { DeckHeader } from './DeckHeader';
import { MainboardGrid } from './MainboardGrid';
import { SideboardSidebar } from './SideboardSidebar';
import { StatsModal } from '../../components/shared/StatsModal';
import { Search, X, RefreshCw } from 'lucide-react';

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

  const [draggedCard, setDraggedCard] = useState<{ card: SimplifiedCard, source: 'main' | 'side' } | null>(null);
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
        const matchesColor = filterColors.length === 0 || filterColors.some(col => card.colors?.includes(col));
        const matchesRarity = !filterRarity || (card.rarity || '').toLowerCase() === filterRarity.toLowerCase();
        const matchesCmc = filterCmc === null || (filterCmc === 6 ? card.cmc >= 6 : card.cmc === filterCmc);
        return matchesQuery && matchesColor && matchesRarity && matchesCmc;
    });
  }, [pool, filterQuery, filterColors, filterRarity, filterCmc]);

  const [mainboard, setMainboard] = useState<SimplifiedCard[]>(pool);
  const [sideboard, setSideboard] = useState<SimplifiedCard[]>([]);
  
  useEffect(() => {
      setMainboard(() => {
          const sideIds = new Set(sideboard.map(c => c.id));
          const newMain = pool.filter(c => !sideIds.has(c.id));
          return newMain;
      });
  }, [pool]);

  const displayedMain = useMemo(() => {
      return mainboard.filter(c => filteredPool.some(f => f.id === c.id));
  }, [mainboard, filteredPool]);

  const displayedSide = useMemo(() => {
      return sideboard.filter(c => filteredPool.some(f => f.id === c.id));
  }, [sideboard, filteredPool]);

  const columns = useMemo(() => {
    const cols: Record<number, { creatures: SimplifiedCard[], others: SimplifiedCard[], all: SimplifiedCard[] }> = {};
    for (let i = 0; i <= 6; i++) cols[i] = { creatures: [], others: [], all: [] };

    displayedMain.forEach(card => {
      const cmc = Math.min(card.cmc, 6);
      const isCreature = card.typeLine?.toLowerCase().includes('creature');
      if (isCreature) cols[cmc].creatures.push(card);
      else cols[cmc].others.push(card);
      cols[cmc].all.push(card);
    });
    return cols;
  }, [displayedMain]);

  const activeCmcs = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].filter(cmc => columns[cmc].all.length > 0);
  }, [columns]);

  const syncPool = useCallback((newMain: SimplifiedCard[], newSide: SimplifiedCard[]) => {
    onUpdatePool([...newMain, ...newSide]);
    if (onPoolUpdate) onPoolUpdate(newMain, newSide);
  }, [onUpdatePool, onPoolUpdate]);

  const moveToSideboard = useCallback((card: SimplifiedCard) => {
    const newMain = mainboard.filter(c => c.id !== card.id);
    const newSide = [...sideboard, card];
    setMainboard(newMain);
    setSideboard(newSide);
    syncPool(newMain, newSide);
  }, [mainboard, sideboard, syncPool]);

  const moveToMainboard = useCallback((card: SimplifiedCard) => {
    const newSide = sideboard.filter(c => c.id !== card.id);
    const newMain = [...mainboard, card];
    setSideboard(newSide);
    setMainboard(newMain);
    syncPool(newMain, newSide);
  }, [mainboard, sideboard, syncPool]);

  const removeCardFromSideboard = useCallback((card: SimplifiedCard) => {
    const newSide = sideboard.filter(c => c.id !== card.id);
    setSideboard(newSide);
    syncPool(mainboard, newSide);
  }, [mainboard, sideboard, syncPool]);

  const handleDragStart = useCallback((card: SimplifiedCard, source: 'main' | 'side') => {
    setDraggedCard({ card, source });
  }, []);

  const handleDrop = useCallback((target: 'main' | 'side') => {
    if (!draggedCard) return;

    if (draggedCard.source === 'main' && target === 'side') {
      moveToSideboard(draggedCard.card);
    } else if (draggedCard.source === 'side' && target === 'main') {
      moveToMainboard(draggedCard.card);
    }
    setDraggedCard(null);
  }, [draggedCard, moveToMainboard, moveToSideboard]);

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

      {/* PREMIUM FILTERS BAR */}
      <div className="bg-slate-950/40 backdrop-blur-2xl border-b border-white/[0.03] px-3 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center gap-3 sm:gap-8 z-[60] shadow-2xl relative">
          {/* Ambient light for filter bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          {/* COLOR FILTERS */}
          <div className="flex items-center gap-2 sm:gap-3">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hidden md:block">Identity</span>
             <div className="flex gap-1 sm:gap-1.5 bg-black/40 p-0.5 sm:p-1 rounded-2xl border border-white/5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                {['W', 'U', 'B', 'R', 'G'].map(col => (
                  <button 
                    key={col} 
                    onClick={() => setFilterColors(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 relative group ${
                      filterColors.includes(col) 
                        ? 'bg-indigo-600/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <img 
                      src={manaSymbols[col]} 
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-500 ${filterColors.includes(col) ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105'}`} 
                      alt={col} 
                    />
                    {filterColors.includes(col) && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />
                    )}
                  </button>
                ))}
             </div>
          </div>

          {/* RARITY FILTERS */}
          <div className="flex items-center gap-2 sm:gap-3">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hidden md:block">Rarity</span>
             <div className="flex gap-1 sm:gap-1.5 bg-black/40 p-0.5 sm:p-1 rounded-2xl border border-white/5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                {['Common', 'Uncommon', 'Rare', 'Mythic'].map(rar => (
                  <button 
                    key={rar} 
                    onClick={() => setFilterRarity(filterRarity === rar ? null : rar)}
                    className={`px-3 sm:px-5 h-9 sm:h-11 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-tighter transition-all duration-300 border ${
                      filterRarity === rar 
                        ? 'bg-white text-slate-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {rar[0]}
                  </button>
                ))}
             </div>
          </div>

          {/* CMC FILTERS */}
          <div className="flex items-center gap-2 sm:gap-3">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hidden md:block">Value</span>
             <div className="flex gap-1 sm:gap-1.5 bg-black/40 p-0.5 sm:p-1 rounded-2xl border border-white/5 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                {[0,1,2,3,4,5,6].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setFilterCmc(filterCmc === val ? null : val)}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-[11px] sm:text-[12px] transition-all duration-300 border ${
                      filterCmc === val 
                        ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {val === 6 ? '6+' : val}
                  </button>
                ))}
             </div>
          </div>

          {/* SEARCH BOX */}
          <div className="flex-1 min-w-[200px] sm:min-w-[280px] relative group">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
             </div>
             <input 
                value={filterQuery} 
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-11 pr-4 py-3 sm:py-3.5 text-[12px] sm:text-[13px] font-medium text-slate-200 outline-none focus:border-indigo-500/50 focus:bg-black/60 focus:shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all placeholder:text-slate-700 shadow-inner"
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
          onRemoveFromSideboard={removeCardFromSideboard}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          renderManaSymbols={renderManaSymbols}
        />
      </div>
      
      <StatsModal 
        isOpen={isStatsOpen}
        cards={displayedMain}
        onClose={() => setIsStatsOpen(false)}
        title="Deck Review Analysis"
      />

      {zoomCard && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl p-4 sm:p-10 animate-in fade-in duration-300" onClick={() => { setZoomCard(null); setIsZoomFlipped(false); }}>
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
