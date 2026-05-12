import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X, RefreshCw, BarChart2, FileText, Database, Save, ArrowRight, Clipboard, ArrowLeft, Pencil } from 'lucide-react';
import { fetchRegistryCards, fetchRegistryCardsBatch, mapRegistryToSimplified, calculateCMC } from '../../services/registry';
import type { SimplifiedCard } from '../../services/scryfall';
import { StatsModal } from '../../components/shared/StatsModal';
import { SideboardSidebar } from './SideboardSidebar';

interface DeckBuilderProps {
  onBack?: () => void;
  initialDeck?: any; // Can be Card[] or { cards: Card[], sideboard: Card[] }
  pool?: any[];
  onConfirm?: (deck: { cards: any[], sideboard: any[] }) => void;
}

const PoolCardImage = ({ card }: { card: SimplifiedCard }) => {
  if (!card.image_url) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-900 text-center border border-white/5">
        <span className="text-[6px] font-black uppercase text-indigo-400">Lost</span>
        <span className="text-[8px] font-black text-white uppercase truncate w-full px-1">{card.name}</span>
      </div>
    );
  }
  return <img src={card.image_url} alt={card.name} className="w-full h-full object-top object-cover" />;
};

export const DeckBuilder = ({ onBack, initialDeck, pool, onConfirm }: DeckBuilderProps) => {
  // --- STATO ---
  const [deckName, setDeckName] = useState(initialDeck?.name || 'New Deck');
  const [isEditingName, setIsEditingName] = useState(false);
  const [deckCards, setDeckCards] = useState<SimplifiedCard[]>(
    Array.isArray(initialDeck) ? initialDeck : (initialDeck?.cards || [])
  );
  const [sideboardCards, setSideboardCards] = useState<SimplifiedCard[]>(initialDeck?.sideboard || []);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isSideboardCollapsed, setIsSideboardCollapsed] = useState(true);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [splitPercent, setSplitPercent] = useState(45); // % height for pool area

  // --- SEARCH & FILTERS ---
  const [addQuery, setAddQuery] = useState('');
  const [apiSuggestions, setApiSuggestions] = useState<SimplifiedCard[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [poolFilterColors, setPoolFilterColors] = useState<string[]>([]);
  const [poolFilterCmc, setPoolFilterCmc] = useState<number | null>(null);
  const [poolFilterLand, setPoolFilterLand] = useState(false);

  // --- MODALS & UI ---
  const [zoomCard, setZoomCard] = useState<SimplifiedCard | null>(null);
  const [isZoomFlipped, setIsZoomFlipped] = useState(false);
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const handleHoverStart = (card: SimplifiedCard) => {
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = setTimeout(() => {
      setZoomCard(card);
      setIsZoomFlipped(false);
    }, 1000);
  };

  const handleHoverEnd = () => {
    if (zoomTimerRef.current) {
      clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = null;
    }
    setZoomCard(null);
    setIsZoomFlipped(false);
  };

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    };
  }, []);

  const manaSymbols: Record<string, string> = {
    'W': 'https://svgs.scryfall.io/card-symbols/W.svg',
    'U': 'https://svgs.scryfall.io/card-symbols/U.svg',
    'B': 'https://svgs.scryfall.io/card-symbols/B.svg',
    'R': 'https://svgs.scryfall.io/card-symbols/R.svg',
    'G': 'https://svgs.scryfall.io/card-symbols/G.svg',
  };

  const basicLands = [
    { name: 'Plains', color: 'W' },
    { name: 'Island', color: 'U' },
    { name: 'Swamp', color: 'B' },
    { name: 'Mountain', color: 'R' },
    { name: 'Forest', color: 'G' },
  ];

  // Logic for Pool loading/filtering
  const poolCards = useMemo(() => {
    if (!pool) return [];
    const groups: Record<string, { card: SimplifiedCard, total: number }> = {};
    pool.forEach(c => {
      const key = c.name;
      if (!groups[key]) {
        groups[key] = {
          card: {
            id: c.id,
            scryfall_id: c.scryfall_id || c.id,
            name: c.name,
            rarity: c.rarity || 'common',
            colors: c.colors || c.card_colors || [],
            image_url: c.image_url || c.image_uris?.normal || '',
            back_image_url: c.back_image_url,
            cmc: c.cmc ?? calculateCMC(c.manaCost || c.mana_cost || ''),
            typeLine: c.typeLine || c.type_line || '',
            manaCost: c.manaCost || c.mana_cost || '',
            types: c.types || [],
            supertypes: c.supertypes || [],
            keywords: c.keywords || []
          },
          total: 0
        };
      }
      groups[key].total++;
    });
    return Object.values(groups);
  }, [pool]);

  useEffect(() => {
    const loadCards = async () => {
      setIsApiLoading(true);

      if (pool) {
        const filtered = poolCards.filter(({ card: c }) => {
          const matchesName = !addQuery || c.name.toLowerCase().includes(addQuery.toLowerCase());
          const matchesColor = poolFilterColors.length === 0 || poolFilterColors.every(col => c.colors.includes(col));
          const matchesCmc = poolFilterCmc === null || (poolFilterCmc === 6 ? c.cmc >= 6 : c.cmc === poolFilterCmc);
          const matchesLand = !poolFilterLand || (c.types || []).some(t => t.toLowerCase() === 'land');
          return matchesName && matchesColor && matchesCmc && matchesLand;
        });

        setApiSuggestions(filtered.map(f => f.card).slice(0, 75));
      } else {
        const results = await fetchRegistryCards(addQuery.length >= 2 ? addQuery : undefined);
        const filtered = results.filter(c => {
          const matchesName = !addQuery || c.name.toLowerCase().includes(addQuery.toLowerCase());
          const cardColors = c.colors || [];
          const matchesColor = poolFilterColors.length === 0 || poolFilterColors.every(col => cardColors.includes(col));
          const matchesCmc = poolFilterCmc === null || (poolFilterCmc === 6 ? (c.cmc || 0) >= 6 : (c.cmc || 0) === poolFilterCmc);
          const matchesLand = !poolFilterLand || (c.types || []).some(t => t.toLowerCase() === 'land');
          return matchesName && matchesColor && matchesCmc && matchesLand;
        });

        const limited = filtered.slice(0, 75);
        setApiSuggestions(limited.map(mapRegistryToSimplified));
      }
      setIsApiLoading(false);
    };

    const timeoutId = setTimeout(loadCards, 300);
    return () => clearTimeout(timeoutId);
  }, [addQuery, poolFilterColors, poolFilterCmc, poolFilterLand, pool, poolCards]);

  const getRemainingCount = (cardName: string) => {
    if (!pool) return Infinity; // No pool means infinite (e.g. admin mode)
    const isBasic = basicLands.some(l => l.name === cardName);
    if (isBasic) return Infinity;

    const totalInPool = poolCards.find(p => p.card.name === cardName)?.total || 0;
    const inDeck = deckCards.filter(c => c.name === cardName).length;
    const inSideboard = sideboardCards.filter(c => c.name === cardName).length;
    return totalInPool - (inDeck + inSideboard);
  };

  const handleAddCard = async (cardName: string) => {
    if (getRemainingCount(cardName) <= 0) return;

    setIsApiLoading(true);
    // Optimization: If card is in pool, use that instead of fetching
    const poolMatch = poolCards.find(p => p.card.name === cardName);
    if (poolMatch) {
      setDeckCards(prev => [...prev, poolMatch.card]);
    } else {
      const results = await fetchRegistryCards(cardName);
      const match = results.find(c => c.name.toLowerCase() === cardName.toLowerCase());
      if (match) {
        setDeckCards(prev => [...prev, mapRegistryToSimplified(match)]);
      }
    }
    setIsApiLoading(false);
  };

  const moveCardToSideboard = (card: SimplifiedCard) => {
    const scryfallId = card.scryfall_id;
    // Remove from deck
    setDeckCards(prev => {
      const next = [...prev];
      const targetIdx = next.findLastIndex(c => c.scryfall_id === scryfallId);
      if (targetIdx !== -1) next.splice(targetIdx, 1);
      return next;
    });

    // Add to sideboard
    setSideboardCards(prev => [...prev, card]);
  };

  const moveCardToMainboard = (card: SimplifiedCard) => {
    setDeckCards(prev => [...prev, card]);
    setSideboardCards(prev => {
      const next = prev.filter(c => (c.scryfall_id + (c as any).id) !== (card.scryfall_id + (card as any).id));
      return next;
    });
  };

  const removeCardFromDeck = (card: SimplifiedCard) => {
    const scryfallId = card.scryfall_id;
    setDeckCards(prev => {
      const next = [...prev];
      const idx = next.findLastIndex(c => c.scryfall_id === scryfallId);
      if (idx !== -1) next.splice(idx, 1);
      return next;
    });
  };

  const removeCardFromSideboard = (card: SimplifiedCard) => {
    setSideboardCards(prev => {
      const next = prev.filter(c => (c.scryfall_id + (c as any).id) !== (card.scryfall_id + (card as any).id));
      return next;
    });
  };

  const saveDeck = async () => {
    setSaveStatus('saving');
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deckName,
          cards: deckCards,
          sideboard: sideboardCards,
          cardCount: deckCards.length,
          lastUpdated: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) { setSaveStatus('idle'); }
  };

  const toggleFlip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group deck cards into CMC columns
  const cmcColumns = useMemo(() => {
    const columns: Record<number, SimplifiedCard[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    deckCards.forEach(card => {
      const cmc = Math.min(card.cmc || 0, 6);
      columns[cmc].push(card);
    });

    // Sort each column by name for a clean layout
    Object.keys(columns).forEach(cmcKey => {
      const cmc = parseInt(cmcKey);
      columns[cmc].sort((a, b) => a.name.localeCompare(b.name));
    });

    return columns;
  }, [deckCards]);

  const renderManaSymbols = (manaCost: string) => {
    if (!manaCost) return null;
    const symbols = manaCost.match(/\{[^}]+\}/g) || [];
    return (
      <div className="flex gap-0.5">
        {symbols.map((s, i) => {
          const sym = s.replace(/[{}]/g, '');
          const url = `https://svgs.scryfall.io/card-symbols/${sym}.svg`;
          return <img key={i} src={url} className="w-3 h-3" alt={sym} />;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] text-white flex flex-col overflow-hidden font-sans select-none">

      {/* NEW INTEGRATED TOP BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-white/10 flex flex-col shrink-0 z-50 shadow-2xl">
        {/* Row 1: Main Controls */}
        <div className="h-14 flex items-center px-6 justify-between border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white" title="Back to Collection">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-col leading-tight">
              {isEditingName ? (
                <input
                  value={deckName}
                  onChange={e => setDeckName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  className="bg-transparent border-b border-indigo-500 text-sm font-black text-white outline-none uppercase italic w-40"
                />
              ) : (
                <div onClick={() => setIsEditingName(true)} className="group cursor-pointer flex items-center gap-2">
                  <h2 className="text-sm font-black text-white uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">
                    {deckName}
                  </h2>
                  <Pencil className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${pool && deckCards.length < 40 ? 'text-red-400' : 'text-indigo-400'}`}>
                  {deckCards.length} {pool ? '/ 40' : ''} Cards
                </span>
                <div className="flex gap-0.5">
                  {['W', 'U', 'B', 'R', 'G'].map(c => {
                    const count = deckCards.filter(card => card.colors.includes(c)).length;
                    if (count === 0) return null;
                    return <img key={c} src={manaSymbols[c]} className="w-3 h-3" alt={c} />;
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              value={addQuery}
              onChange={e => setAddQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/5 rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
            />
            {isApiLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-500 animate-spin" />}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
              <button onClick={() => setShowStats(true)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Stats"><BarChart2 className="w-4 h-4" /></button>
              <button onClick={() => setIsImportModalOpen(true)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Import"><FileText className="w-4 h-4" /></button>
              {pool && (
                <button
                  onClick={() => {
                    const text = poolCards.map(p => `${p.total} ${p.card.name}`).join('\n');
                    navigator.clipboard.writeText(text);
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Copy Pool"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-white/10" />

            {onConfirm ? (
              <button
                onClick={() => {
                  if (pool && deckCards.length < 40) return;
                  let finalSideboard = sideboardCards;
                  if (pool) {
                    const remainingPool = [...pool];
                    deckCards.forEach(deckCard => {
                      const idx = remainingPool.findIndex(p => p.name === deckCard.name);
                      if (idx !== -1) remainingPool.splice(idx, 1);
                    });
                    finalSideboard = remainingPool
                      .filter(c => !basicLands.some(bl => bl.name === c.name))
                      .map(c => ({
                        id: c.id,
                        scryfall_id: c.scryfall_id || c.id,
                        name: c.name,
                        rarity: c.rarity || 'common',
                        colors: c.colors || c.card_colors || [],
                        image_url: c.image_url || c.image_uris?.normal || '',
                        back_image_url: c.back_image_url,
                        cmc: c.cmc ?? calculateCMC(c.manaCost || c.mana_cost || ''),
                        typeLine: c.typeLine || c.type_line || '',
                        manaCost: c.manaCost || c.mana_cost || '',
                        types: c.types || [],
                        supertypes: c.supertypes || [],
                        keywords: c.keywords || []
                      }));
                  }
                  onConfirm?.({ cards: deckCards, sideboard: finalSideboard });
                }}
                disabled={!!pool && deckCards.length < 40}
                className={`px-6 h-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg transition-all
                  ${(pool && deckCards.length < 40)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                  }`}
              >
                {(pool && deckCards.length < 40) ? 'Min 40' : 'Done'} <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={saveDeck}
                className={`px-6 h-10 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 ${saveStatus === 'saved' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}
              >
                {saveStatus === 'saving' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {saveStatus === 'saved' ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Filtering & Quick Actions */}
        <div className="h-12 flex items-center px-6 justify-between bg-black/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              {['W', 'U', 'B', 'R', 'G'].map(col => (
                <button
                  key={col}
                  onClick={() => setPoolFilterColors(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${poolFilterColors.includes(col) ? 'bg-indigo-600/50 shadow-inner' : 'opacity-30 hover:opacity-100 grayscale hover:grayscale-0'}`}
                >
                  <img src={manaSymbols[col]} className="w-6 h-6" alt={col} />
                </button>
              ))}
              <div className="w-px h-4 bg-white/10 mx-2" />
              <button
                onClick={() => setPoolFilterLand(!poolFilterLand)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${poolFilterLand ? 'bg-amber-600/50 shadow-inner' : 'opacity-30 hover:opacity-100 grayscale hover:grayscale-0'}`}
              >
                <img src="/land_symbol.png" className="w-7 h-7 object-contain" alt="Lands" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              {[0, 1, 2, 3, 4, 5, 6].map(val => (
                <button
                  key={val}
                  onClick={() => setPoolFilterCmc(poolFilterCmc === val ? null : val)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${poolFilterCmc === val ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  {val === 6 ? '6+' : val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Add Basics</span>
            <div className="flex gap-1">
              {basicLands.map(land => (
                <button
                  key={land.name}
                  onClick={() => handleAddCard(land.name)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 active:scale-90"
                  title={land.name}
                >
                  <img src={manaSymbols[land.color]} className="w-4 h-4" alt={land.color} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ POOL AREA (top half, full width) ═══ */}
      <div className="shrink-0 border-b border-white/5 relative overflow-hidden transition-all duration-300" style={{ height: `${splitPercent}%` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e12] to-[#0a0a0c] pointer-events-none" />
        <div className="relative h-full overflow-y-auto overflow-x-hidden custom-scrollbar p-3">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 content-start">
            {apiSuggestions.map((card, i) => {
              const remaining = getRemainingCount(card.name);
              const total = poolCards.find(p => p.card.name === card.name)?.total || 0;
              const isAvailable = remaining > 0;

              return (
                <button
                  key={card.scryfall_id + '-' + i}
                  onClick={() => {
                    if (isAvailable) {
                      setDeckCards(prev => [...prev, card]);
                    }
                  }}
                  onMouseEnter={() => handleHoverStart(card)}
                  onMouseLeave={handleHoverEnd}
                  onContextMenu={(e) => { e.preventDefault(); /* Optionally do something else or just prevent menu */ }}
                  className={`relative aspect-[2.5/3.5] rounded-lg overflow-hidden shadow-xl border transition-all group
                    ${isAvailable ? 'border-white/10 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.5)] cursor-pointer active:scale-95' : 'border-white/5 opacity-40 grayscale cursor-not-allowed'}
                  `}
                  disabled={!isAvailable}
                >
                  <PoolCardImage card={card} />

                  {/* COUNT BADGE */}
                  {pool && total > 1 && (
                    <div className="absolute bottom-2 left-2 flex items-center justify-center min-w-[28px] h-7 bg-indigo-600/90 backdrop-blur-md text-white rounded-lg shadow-xl border border-white/20 z-10 px-2 pointer-events-none">
                      <span className="text-xs font-black italic">
                        {remaining} / {total}
                      </span>
                    </div>
                  )}

                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="px-2 py-1 bg-black/80 rounded text-[8px] font-black uppercase text-white/50 tracking-widest border border-white/5">Maxed</div>
                    </div>
                  )}
                </button>
              );
            })}
            {apiSuggestions.length === 0 && !isApiLoading && (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-3 py-12">
                <Search className="w-10 h-10 opacity-15" />
                <p className="text-[10px] font-black uppercase tracking-widest">No cards found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ DIVIDER with expand arrows ═══ */}
      <div className="relative h-5 shrink-0 flex items-center justify-center bg-[#0a0a0c] z-40">
        <div className="flex items-center gap-8 px-4 py-0.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/20 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] h-8">
          <button
            onClick={() => {
              if (splitPercent !== 45) setSplitPercent(45);
              else setSplitPercent(15);
            }}
            className={`transition-all px-4 h-full flex items-center justify-center ${splitPercent <= 20 ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}
            title="Maximize Deck / Restore"
          >
            <svg viewBox="0 0 10 6" className="w-5 h-3 fill-current drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"><polygon points="5,0 10,6 0,6" /></svg>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => {
              if (splitPercent !== 45) setSplitPercent(45);
              else setSplitPercent(80);
            }}
            className={`transition-all px-4 h-full flex items-center justify-center ${splitPercent >= 75 ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}
            title="Maximize Pool / Restore"
          >
            <svg viewBox="0 0 10 6" className="w-5 h-3 fill-current drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"><polygon points="5,6 10,0 0,0" /></svg>
          </button>
        </div>
      </div>

      {/* ═══ LOWER SECTION (Deck + Sideboard side by side) ═══ */}
      <motion.div layout className="flex-1 flex overflow-hidden min-h-0">

        {/* DECK AREA (CMC Columns with stacked card strips) */}
        <motion.div layout className="flex-1 bg-[#0b0b0d] relative overflow-x-auto overflow-y-hidden flex gap-2 px-3 pt-3 custom-scrollbar-h">
          {/* PREMIUM AMBIENT BACKGROUND */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(79,70,229,0.1),_transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,_rgba(34,211,238,0.05),_transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-[0.03] pointer-events-none" />

          {deckCards.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
              <div className="flex flex-col items-center gap-6">
                <div className="flex gap-16">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-[10px] font-black">L</div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Aggiungi / Sideboard</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-[10px] font-black">R</div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Zoom / Rimuovi</span>
                   </div>
                </div>
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.4em]">Il mazzo è vuoto</p>
              </div>
            </div>
          ) : (
            [0, 1, 2, 3, 4, 5, 6].map(cmc => {
              const cards = cmcColumns[cmc];
              return (
                <div key={cmc} className="flex-1 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] flex flex-col relative">
                  {/* Scrollable Column Content — uniform 30px fan */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="relative w-full" style={{ height: `${60 * (cards.length - 1) + 160}px` }}>
                      {cards.map((card, cardIdx) => (
                        <div
                          key={cardIdx}
                          className="absolute inset-x-0 aspect-[2.5/3.5] rounded-lg overflow-hidden border border-white/10 shadow-lg cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.5)] hover:z-[100] transition-all"
                          style={{ top: `${cardIdx * 60}px`, zIndex: cardIdx }}
                          onClick={() => moveCardToSideboard(card)}
                          onMouseEnter={() => handleHoverStart(card)}
                          onMouseLeave={handleHoverEnd}
                          onContextMenu={(e) => { e.preventDefault(); removeCardFromDeck(card); }}
                        >
                          <PoolCardImage card={card} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>

        {/* SIDEBOARD (only in bottom half) */}
        <SideboardSidebar
          sideboard={sideboardCards}
          isSideboardCollapsed={isSideboardCollapsed}
          flippedIds={flippedIds}
          onToggleFlip={toggleFlip}
          onToggleCollapse={() => setIsSideboardCollapsed(!isSideboardCollapsed)}
          onMoveToMainboard={moveCardToMainboard}
          onRemoveFromSideboard={removeCardFromSideboard}
          onDragStart={() => { }}
          onDrop={() => { }}
          renderManaSymbols={renderManaSymbols}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
        />
      </motion.div>

      {/* REMOVED BOTTOM BAR */}

      {/* MODALS */}
      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} cards={deckCards} title="Deck Analytics" />

      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#121214] w-full max-w-2xl rounded-3xl border border-white/10 shadow-4xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Import Deck</h3>
                <button onClick={() => setIsImportModalOpen(false)} className="p-2 text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="1 Counterspell&#10;4 Island"
                  className="w-full h-64 bg-black/40 border border-white/5 rounded-2xl p-6 text-sm font-mono outline-none focus:border-indigo-500/30 transition-all resize-none"
                />
                {importErrors.length > 0 && (
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Errors ({importErrors.length} cards not found)</p>
                    <div className="flex flex-wrap gap-2">
                      {importErrors.map((err, i) => <span key={i} className="text-[9px] bg-black/40 px-2 py-1 rounded border border-white/5 text-slate-400">{err}</span>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 bg-black/20 flex gap-4">
                <button onClick={() => setIsImportModalOpen(false)} className="flex-1 py-3 text-slate-400 font-black uppercase text-[10px]">Cancel</button>
                <button
                  onClick={async () => {
                    if (!importText.trim()) return;
                    setIsImporting(true);
                    setImportErrors([]);
                    const lines = importText.split('\n').filter(l => l.trim());
                    try {
                      let { found, notFound } = await fetchRegistryCardsBatch(lines);

                      // Filter if in limited mode
                      if (pool) {
                        const poolNames = new Set(poolCards.map(p => p.card.name.toLowerCase()));
                        const allowedFound = found.filter(c =>
                          poolNames.has(c.name.toLowerCase()) ||
                          (c.types || []).some((t: string) => t.toLowerCase() === 'land' && basicLands.some(bl => bl.name.toLowerCase() === c.name.toLowerCase()))
                        );

                        const disallowed = found.filter(c => !allowedFound.includes(c));
                        found = allowedFound;
                        notFound = [...notFound, ...disallowed.map(c => `${c.name} (Not in Pool)`)];
                      }

                      if (found.length > 0) setDeckCards(prev => [...prev, ...found]);
                      if (notFound.length > 0) setImportErrors(notFound);
                      else { setIsImportModalOpen(false); setImportText(''); }
                    } catch (err) { alert('Import error'); } finally { setIsImporting(false); }
                  }}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                  Import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING PREVIEW (Game Style) */}
      <AnimatePresence>
        {zoomCard && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            className="fixed left-12 bottom-12 z-[2000] pointer-events-none"
          >
            <div className="relative group">
              <img
                src={(isZoomFlipped && zoomCard.back_image_url) ? zoomCard.back_image_url : zoomCard.image_url}
                className="w-[clamp(250px,22vw,380px)] h-auto rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-4 border-white/10"
                alt="Zoomed Card"
              />

              {zoomCard.back_image_url && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-2xl border border-indigo-400/50 uppercase tracking-widest flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin-slow" /> Double Faced
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
