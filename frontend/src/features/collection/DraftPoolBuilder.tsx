
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X, Database, Save, Download, FileText, RefreshCw, ChevronUp, BarChart2, Mountain, ChevronLeft, ChevronRight, ArrowLeft, Pencil } from 'lucide-react';
import { fetchCardsBatch } from '../../services/scryfall';
import type { SimplifiedCard } from '../../services/scryfall';
import { fetchRegistryCards, mapRegistryToSimplified } from '../../services/registry';
import { StatsModal } from '../../components/shared/StatsModal';
import { CardGridItem } from '../../components/shared/CardGridItem';
import { useRef } from 'react';

interface DraftPoolBuilderProps {
  onBack?: () => void;
  skipRestore?: boolean;
}

export const DraftPoolBuilder = ({ onBack, skipRestore = false }: DraftPoolBuilderProps) => {
  // --- STATO DEL CUBO ---
  const [cubeName, setCubeName] = useState('Custom Cube');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftPool, setDraftPool] = useState<SimplifiedCard[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- STATO IMPORT ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // --- STATO PER AGGIUNTA CARTE (API Scryfall) ---
  const [addQuery, setAddQuery] = useState('');
  const [apiSuggestions, setApiSuggestions] = useState<SimplifiedCard[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [zoomCard, setZoomCard] = useState<SimplifiedCard | null>(null);
  const [isZoomFlipped] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const searchScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const container = searchScrollRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 10);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [apiSuggestions]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- STATO FLIP CARTE ---
  const [flippedIndices, setFlippedIndices] = useState<Set<string>>(new Set());

  const toggleFlip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedIndices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    const names = importText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    try {
      const { found, notFound } = await fetchCardsBatch(names);
      if (found.length > 0) setDraftPool(prev => [...found, ...prev]);
      if (notFound.length > 0) {
        console.warn('Some cards not found during import:', notFound);
      } else {
        setIsImportModalOpen(false);
        setImportText('');
      }
    } catch (err) { alert('Errore import.'); } finally { setIsImporting(false); }
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (addQuery.length >= 2) {
        setIsApiLoading(true);
        const results = await fetchRegistryCards(addQuery);
        setApiSuggestions(results
          .filter(c => c.image_url)
          .map(mapRegistryToSimplified)
        );
        setIsApiLoading(false);
      } else { setApiSuggestions([]); }
    }, 450);
    return () => clearTimeout(timeoutId);
  }, [addQuery]);

  const handleAddCard = async (card: any) => {
    if (card.scryfall_id) {
      setDraftPool(prev => [card, ...prev]);
      return;
    }

    setIsApiLoading(true);
    const results = await fetchRegistryCards(card.name);
    const match = results.find(c => c.name.toLowerCase() === card.name.toLowerCase());
    if (match) {
      setDraftPool(prev => [mapRegistryToSimplified(match), ...prev]);
    }
    setIsApiLoading(false);
  };

  const removeCard = (scryfallId: string) => {
    setDraftPool(prev => {
      const idx = prev.findIndex(c => c.scryfall_id === scryfallId);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const saveCube = async () => {
    setSaveStatus('saving');
    const cubeData = { name: cubeName, cards: draftPool, lastUpdated: new Date().toISOString() };
    try {
      localStorage.setItem('mtg_draft_cube', JSON.stringify(cubeData));
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/cubes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cubeData)
      });
      if (!res.ok) throw new Error('Errore sync');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) { alert(`Errore: ${e.message}`); setSaveStatus('idle'); }
  };

  const downloadTxt = () => {
    const data = draftPool.map(c => c.name.split(' // ')[0]).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${cubeName.replace(/\s+/g, '_')}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const getColorWeight = (card: SimplifiedCard) => {
    const COLOR_ORDER = ['W', 'U', 'B', 'R', 'G'];
    if (card.typeLine?.toLowerCase().includes('land')) return 200;
    if (card.colors.length === 0) return 150;
    if (card.colors.length > 1) return 100;
    return COLOR_ORDER.indexOf(card.colors[0]);
  };

  const [selectedPoolId] = useState<string | null>(null);
  const [filterQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterColor, setFilterColor] = useState<string[]>([]);
  const [filterCmc, setFilterCmc] = useState<number | null>(null);
  const [showLandsOnly, setShowLandsOnly] = useState(false);

  // --- STATO RESTORE ---
  useEffect(() => {
    const savedCube = localStorage.getItem('mtg_draft_cube');
    if (savedCube) {
      try {
        const parsed = JSON.parse(savedCube);
        if (parsed.cards && parsed.cards.length > 0) {
          if (skipRestore) {
            setCubeName(parsed.name || 'Custom Cube');
            setDraftPool(parsed.cards || []);
          }
        }
      } catch (e) {
        console.error('Errore parsing:', e);
      }
    }
  }, [skipRestore]);

  const groupedPool = useMemo(() => {
    const filtered = draftPool.filter(card => {
      const isLand = card.typeLine?.toLowerCase().includes('land');
      if (showLandsOnly && !isLand) return false;
      if (!showLandsOnly && isLand && filterColor.length > 0) return false;

      const matchesName = card.name.toLowerCase().includes(filterQuery.toLowerCase());
      const matchesRarity = filterRarity === 'all' || card.rarity.toLowerCase() === filterRarity.toLowerCase();

      let matchesColor = true;
      if (filterColor.length > 0) {
        if (filterColor.includes('C')) {
          matchesColor = card.colors.length === 0 && !isLand;
        } else {
          matchesColor = filterColor.every(c => card.colors.includes(c));
        }
      }

      const matchesCmc = filterCmc === null || (filterCmc === 6 ? card.cmc >= 6 : card.cmc === filterCmc);
      return matchesName && matchesRarity && matchesColor && matchesCmc;
    });
    const groups: Map<string, { card: SimplifiedCard, count: number }> = new Map();
    filtered.forEach(card => {
      const existing = groups.get(card.scryfall_id);
      if (existing) existing.count++;
      else groups.set(card.scryfall_id, { card, count: 1 });
    });
    return Array.from(groups.values()).sort((a, b) => {
      const wA = getColorWeight(a.card); const wB = getColorWeight(b.card);
      if (wA !== wB) return wA - wB;
      if (a.card.cmc !== b.card.cmc) return a.card.cmc - b.card.cmc;
      return a.card.name.localeCompare(b.card.name);
    });
  }, [draftPool, filterQuery, filterRarity, filterColor, filterCmc, showLandsOnly]);

  const toggleColorFilter = (c: string) => {
    setFilterColor(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    setShowLandsOnly(false);
  };

  const handleMouseDownSearch = (e: React.MouseEvent) => {
    const container = searchScrollRef.current;
    if (!container) return;

    const startX = e.pageX - container.offsetLeft;
    const scrollLeft = container.scrollLeft;
    let isDragging = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) isDragging = true;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      if (isDragging) {
        const preventClick = (e: MouseEvent) => {
          e.stopImmediatePropagation();
          window.removeEventListener('click', preventClick, true);
        };
        window.addEventListener('click', preventClick, true);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <div className="w-full max-w-[2100px] mx-auto px-4 sm:px-8 py-4 sm:py-10 space-y-8 animate-in fade-in duration-700 pb-32">
        <header className="flex flex-col lg:flex-row items-center justify-between gap-6 py-8 border-b border-indigo-500/10">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="p-4 bg-slate-900/50 hover:bg-slate-800 text-slate-500 rounded-3xl border border-white/5 transition-all shadow-xl active:scale-95" title="Back to Collection"><ArrowLeft className="w-6 h-6" /></button>
            <div className="space-y-1">
              {isEditingName ? (
                <input
                  value={cubeName}
                  onChange={e => setCubeName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  className="bg-transparent border-b-2 border-indigo-500 text-4xl sm:text-6xl font-black text-white outline-none italic uppercase tracking-tighter w-full max-w-4xl"
                />
              ) : (
                <div onClick={() => setIsEditingName(true)} className="group cursor-pointer flex items-center gap-4">
                  <h2 className="text-4xl sm:text-6xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase italic tracking-tighter">{cubeName}</h2>
                  <Pencil className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
              <input value={addQuery} onChange={e => setAddQuery(e.target.value)} placeholder="Search for implemented cards..." className="w-full bg-slate-900 border border-white/5 pl-14 pr-14 py-5 rounded-[2rem] outline-none focus:border-indigo-500/50 transition-all font-bold text-lg" />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {isApiLoading && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
                {addQuery && (
                  <button
                    onClick={() => setAddQuery('')}
                    className="p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowStats(true)} title="Analytics" className="p-5 bg-indigo-600/10 text-indigo-400 rounded-[2rem] border border-indigo-500/20 hover:bg-indigo-600/20 active:scale-95 transition-all"><BarChart2 className="w-6 h-6" /></button>
              <button onClick={() => setIsImportModalOpen(true)} title="Import List" className="p-5 bg-slate-900/50 text-indigo-400 rounded-[2rem] border border-white/5 active:scale-95 transition-all"><FileText className="w-6 h-6" /></button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <aside className="xl:col-span-1 space-y-6 sticky top-10 self-start">

            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block px-2">Card Rarity</span>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'common', 'uncommon', 'rare', 'mythic'].map(r => (
                    <button key={r} onClick={() => setFilterRarity(r)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRarity === r ? 'bg-white text-slate-950 shadow-lg' : 'bg-slate-800/40 text-slate-500 border border-white/5 hover:text-white'}`}>{r}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block px-2">Mana Value</span>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(v => (
                    <button key={v} onClick={() => setFilterCmc(filterCmc === v ? null : v)} className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all ${filterCmc === v ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-800/40 text-slate-500 border border-white/5'}`}>{v === 6 ? '6+' : v}</button>
                  ))}
                </div>
              </div>

              {/* COLORS & LANDS - Combined row with SVGs */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block px-2">Colors</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'W', symbol: 'W' },
                    { id: 'U', symbol: 'U' },
                    { id: 'B', symbol: 'B' },
                    { id: 'R', symbol: 'R' },
                    { id: 'G', symbol: 'G' },
                    { id: 'C', symbol: 'C' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => toggleColorFilter(c.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border overflow-hidden p-0.5 ${filterColor.includes(c.id) ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-white/10' : 'border-white/5 bg-slate-800/40 hover:border-white/20'}`}
                    >
                      <img
                        src={`https://svgs.scryfall.io/card-symbols/${c.symbol}.svg`}
                        alt={c.id}
                        className={`w-full h-full object-contain ${filterColor.includes(c.id) ? 'opacity-100' : 'opacity-40 hover:opacity-100 transition-opacity'}`}
                      />
                    </button>
                  ))}

                  <button
                    onClick={() => { setShowLandsOnly(!showLandsOnly); setFilterColor([]); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${showLandsOnly ? 'border-indigo-400 bg-indigo-500/20 scale-110 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'border-white/5 bg-slate-800/40 hover:border-white/20'}`}
                    title="Filtra Terre"
                  >
                    <Mountain className={`w-7 h-7 ${showLandsOnly ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={saveCube} className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 flex items-center justify-center gap-3 transition-all">
                {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saveStatus === 'saved' ? 'Saved' : 'Save'}
              </button>
              <button onClick={downloadTxt} title="Scarica Testo" className="p-5 bg-slate-900/50 text-slate-400 rounded-[2rem] border border-white/5 active:scale-95 transition-all hover:text-white"><Download className="w-6 h-6" /></button>
            </div>
          </aside>

          <main className="xl:col-span-3 h-[calc(100vh-250px)] flex flex-col gap-6">
            <AnimatePresence>
              {apiSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative group/search"
                >
                  <div
                    ref={searchScrollRef}
                    onMouseDown={handleMouseDownSearch}
                    className="shrink-0 p-6 bg-slate-900/80 rounded-[3rem] border border-indigo-500/20 backdrop-blur-xl overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
                    onScroll={checkScroll}
                  >
                    <div className="flex gap-6 min-w-max px-4">
                      {apiSuggestions.map(card => (
                        <button
                          key={card.scryfall_id}
                          onClick={() => handleAddCard(card)}
                          onMouseEnter={() => {
                            const timer = setTimeout(() => setZoomCard(card), 1000);
                            (window as any)[`zoom_timer_${card.scryfall_id}`] = timer;
                          }}
                          onMouseLeave={() => {
                            clearTimeout((window as any)[`zoom_timer_${card.scryfall_id}`]);
                            setZoomCard(null);
                          }}
                          className="w-[140px] aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0 transition-all"
                        >
                          <img src={card.image_url} className="w-full h-full object-cover pointer-events-none" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SCROLL BUTTONS - Conditional Visibility */}
                  <AnimatePresence>
                    {canScrollLeft && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => searchScrollRef.current?.scrollBy({ left: -1000, behavior: 'smooth' })}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-2xl z-10 hover:bg-indigo-600 hover:border-indigo-400 active:scale-90"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {canScrollRight && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => searchScrollRef.current?.scrollBy({ left: 1000, behavior: 'smooth' })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-2xl z-10 hover:bg-indigo-600 hover:border-indigo-400 active:scale-90"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-indigo-500/20 hover:scrollbar-thumb-indigo-500/40 scrollbar-track-transparent">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 items-start pb-20">
                {groupedPool.map(({ card, count }) => (
                  <CardGridItem
                    key={card.scryfall_id}
                    card={card}
                    count={count}
                    isSelected={selectedPoolId === card.scryfall_id}
                    onHoverStart={(c) => setZoomCard(c)}
                    onHoverEnd={() => setZoomCard(null)}
                    onRemove={() => removeCard(card.scryfall_id)}
                    onQuickAdd={() => handleAddCard(card)}
                    onFlipToggle={(e) => toggleFlip(e, card.scryfall_id)}
                    isFlipped={flippedIndices.has(card.scryfall_id)}
                  />
                ))}
              </div>
            </div>
          </main>
        </section>
      </div>

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} cards={draftPool} title="Cube Environment Stats" />

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
                className="w-[clamp(250px,25vw,400px)] h-auto rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-4 border-white/10"
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

      {/* MODAL IMPORT */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4"><div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400"><FileText className="w-6 h-6" /></div><div><h3 className="text-xl font-black text-white uppercase tracking-tight">Cube Import</h3></div></div>
                <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-slate-500" /></button>
              </div>
              <div className="p-8"><textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="One card per line..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-200 outline-none resize-none" /></div>
              <div className="p-8 border-t border-white/5 bg-slate-950/30 flex gap-4">
                <button onClick={() => setIsImportModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase hover:text-white transition-colors">Cancel</button>
                <button onClick={handleImportSubmit} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">{isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-4 h-4" />} Import Now</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {showScrollTop && (<button onClick={scrollToTop} className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"><ChevronUp className="w-6 h-6" /></button>)}
    </>
  );
};
