import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X, Home, RefreshCw, BarChart2, Sun, FileText, AlertTriangle, Database, Clipboard as ClipboardIcon, Menu, Filter, Save, ArrowRight } from 'lucide-react';
import { fetchRegistryCards, fetchRegistryCardsBatch, mapRegistryToSimplified, enrichCardsWithScryfall } from '../../services/registry';
import type { SimplifiedCard } from '../../services/scryfall';
import { StatsModal } from '../shared/StatsModal';
import { CardGridItem } from '../shared/CardGridItem';

interface DeckBuilderProps {
  onBack?: () => void;
  initialDeck?: any;
  pool?: any[];
  onConfirm?: (deck: any[]) => void;
}

interface PoolCardImageProps {
  card: SimplifiedCard;
}

const PoolCardImage = ({ card }: PoolCardImageProps) => {
  const [error, setError] = useState(false);
  
  if (error || !card.image_url) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-slate-900 to-slate-950 text-center border border-white/5">
        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-1">Image Lost</span>
        <span className="text-[10px] font-black text-white italic leading-tight uppercase line-clamp-3">{card.name}</span>
        <div className="mt-auto pt-1 border-t border-white/5 w-full">
           <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{card.mana_cost || 'No Cost'}</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={card.image_url} 
      alt={card.name}
      onError={() => setError(true)}
      className="w-full h-full object-cover" 
    />
  );
};

export const DeckBuilder = ({ onBack, initialDeck, pool, onConfirm }: DeckBuilderProps) => {
  // --- STATO DEL MAZZO ---
  const [deckName, setDeckName] = useState(initialDeck?.name || 'Nuovo Mazzo');
  const [isEditingName, setIsEditingName] = useState(false);
  const [deckCards, setDeckCards] = useState<SimplifiedCard[]>(initialDeck?.cards || []);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- STATO SEARCH & UI ---
  const [addQuery, setAddQuery] = useState('');
  const [apiSuggestions, setApiSuggestions] = useState<SimplifiedCard[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [zoomCard, setZoomCard] = useState<SimplifiedCard | null>(null);
  const [isZoomFlipped, setIsZoomFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATO IMPORT ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // --- FILTRI ---
  const [filterQuery, setFilterQuery] = useState('');
  const [filterCmc, setFilterCmc] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // --- FILTRI POOL ---
  const [poolFilterColors, setPoolFilterColors] = useState<string[]>([]);
  const [poolFilterRarity, setPoolFilterRarity] = useState<string | null>(null);
  const [poolFilterCmc, setPoolFilterCmc] = useState<number | null>(null);

  // Mappa simboli Scryfall
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

  // Initial load and Debounce per Local Registry Search
  useEffect(() => {
    if (pool) {
      // If pool is provided, we don't fetch from registry
      const mappedPool = pool.map(c => ({
        scryfall_id: c.scryfall_id || c.id,
        name: c.name,
        rarity: c.rarity || 'common',
        color: c.colors || [],
        image_url: c.image_url || c.image_uris?.normal || '',
        back_image_url: c.back_image_url,
        cmc: c.cmc || 0,
        type_line: c.type_line,
        mana_cost: c.manaCost || '',
        keywords: c.keywords || []
      }));
      
      const filtered = mappedPool.filter(c => {
        const matchesName = c.name.toLowerCase().includes(addQuery.toLowerCase());
        const matchesColor = poolFilterColors.length === 0 || poolFilterColors.some(col => c.color.includes(col));
        const matchesRarity = !poolFilterRarity || c.rarity.toLowerCase() === poolFilterRarity.toLowerCase();
        const matchesCmc = poolFilterCmc === null || (poolFilterCmc === 6 ? c.cmc >= 6 : c.cmc === poolFilterCmc);
        return matchesName && matchesColor && matchesRarity && matchesCmc;
      });
        
      setApiSuggestions(filtered as any);
      return;
    }

    const loadCards = async () => {
      setIsApiLoading(true);
      let results = [];
      if (addQuery.length >= 2) {
        results = await fetchRegistryCards(addQuery);
      } else {
        // Se la query è vuota, mostriamo le prime 50 carte implementate
        const all = await fetchRegistryCards();
        results = all.slice(0, 50);
      }

      // Filtriamo per implementate (manteniamo tutte, anche senza immagine locale)
      const implemented = results.filter(c => c.engineStatus === 'IMPLEMENTED');
      
      // Arricchiamo con Scryfall (immagini, ecc.)
      const enriched = await enrichCardsWithScryfall(implemented);
      
      setApiSuggestions(enriched.map(mapRegistryToSimplified));
      setIsApiLoading(false);
    };

    const timeoutId = setTimeout(loadCards, addQuery.length >= 2 ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [addQuery, poolFilterColors, poolFilterRarity, poolFilterCmc]);

  const handleAddCard = async (cardName: string) => {
    setIsApiLoading(true);
    const results = await fetchRegistryCards(cardName);
    const match = results.find(c => c.name.toLowerCase() === cardName.toLowerCase());
    
    if (match && match.engineStatus === 'IMPLEMENTED') {
      const enriched = await enrichCardsWithScryfall([match]);
      setDeckCards(prev => [...prev, mapRegistryToSimplified(enriched[0])]);
    } else {
      if (match) {
        alert(`${cardName} non è ancora stata implementata nell'engine.`);
      }
    }
    setIsApiLoading(false);
  };

  const removeCard = (scryfallId: string) => {
    setDeckCards(prev => {
      const idx = prev.findIndex(c => c.scryfall_id === scryfallId);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    setImportErrors([]);
    const names = importText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    try {
      const { found, notFound } = await fetchRegistryCardsBatch(names);
      if (found.length > 0) setDeckCards(prev => [...prev, ...found]);
      if (notFound.length > 0) setImportErrors(notFound);
      else { setIsImportModalOpen(false); setImportText(''); }
    } catch (err) { alert('Errore import.'); } finally { setIsImporting(false); }
  };

  const saveDeck = async () => {
    setSaveStatus('saving');
    const deckData = { name: deckName, cards: deckCards, cardCount: deckCards.length, lastUpdated: new Date().toISOString() };
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deckData)
      });
      if (!res.ok) throw new Error('Errore salvataggio');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) { alert(`Errore: ${e.message}`); setSaveStatus('idle'); }
  };

  const groupedCards = useMemo(() => {
    const filtered = deckCards.filter(card => {
      const matchesQuery = card.name.toLowerCase().includes(filterQuery.toLowerCase());
      const matchesCmc = filterCmc === null || (filterCmc === 6 ? card.cmc >= 6 : card.cmc === filterCmc);
      return matchesQuery && matchesCmc;
    });
    const groups: Map<string, { card: SimplifiedCard, count: number }> = new Map();
    filtered.forEach(card => {
      const existing = groups.get(card.scryfall_id);
      if (existing) existing.count++;
      else groups.set(card.scryfall_id, { card, count: 1 });
    });
    return Array.from(groups.values()).sort((a,b) => a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name));
  }, [deckCards, filterQuery, filterCmc]);

  return (
    <div className="w-full max-w-[1700px] mx-auto min-h-screen pb-40 lg:p-10 lg:space-y-12 animate-in fade-in duration-700 overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 text-slate-400 hover:text-white transition-colors"><Home className="w-6 h-6" /></button>
            <div className="space-y-0.5">
               <h2 className="text-xl font-black text-white uppercase italic tracking-tighter truncate max-w-[150px]">{deckName}</h2>
               <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">Cards: {deckCards.length}</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <button onClick={saveDeck} className={`p-2.5 rounded-xl transition-all ${saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white shadow-lg active:scale-95'}`}>{saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}</button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 active:bg-slate-800"><Menu className="w-5 h-5" /></button>
         </div>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden lg:flex items-center justify-between gap-8 pb-10 border-b border-white/5">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-slate-900/50 hover:bg-slate-800 text-slate-500 rounded-3xl border border-white/5 transition-all shadow-xl"><Home className="w-6 h-6" /></button>
          <div className="space-y-1">
            {isEditingName ? (
              <input value={deckName} onChange={e => setDeckName(e.target.value)} onBlur={() => setIsEditingName(false)} autoFocus className="bg-slate-950 border-b-2 border-indigo-500 text-3xl font-black text-white outline-none uppercase italic" />
            ) : (
              <h2 onClick={() => setIsEditingName(true)} className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter cursor-pointer hover:text-indigo-400 transition-colors">{deckName}</h2>
            )}
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Deck Builder & Strategy Lab</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:max-w-3xl">
          <div className="relative flex-1 group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" /><input value={addQuery} onChange={e => setAddQuery(e.target.value)} placeholder="Cerca tra le carte implementate..." className="w-full bg-slate-900 border border-white/5 pl-14 pr-6 py-5 rounded-[2rem] outline-none focus:border-emerald-500/50 transition-all font-bold text-lg" />{isApiLoading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-spin" />}</div>
          <button onClick={() => setIsImportModalOpen(true)} className="p-5 bg-slate-900/50 text-indigo-400 rounded-[2rem] border border-white/5"><FileText className="w-6 h-6" /></button>
          {onConfirm ? (
            <button onClick={() => onConfirm(deckCards)} className={`px-10 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-3 transition-all bg-emerald-600 text-white shadow-lg active:scale-95`}>
               Conferma Mazzo <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={saveDeck} className={`px-10 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-3 transition-all ${saveStatus === 'saved' ? 'bg-emerald-600' : 'bg-indigo-600 text-white'}`}>{saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} {saveStatus === 'saved' ? 'Saved' : 'Save'}</button>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
         {isMobileMenuOpen && (
            <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-sm" />
               <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="lg:hidden fixed right-0 top-0 bottom-0 w-[80%] max-w-sm z-[200] bg-slate-900 border-l border-white/5 p-8 flex flex-col gap-6 shadow-4xl">
                  <div className="flex items-center justify-between"><h3 className="text-2xl font-black text-white uppercase italic">Opzioni</h3><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500"><X className="w-6 h-6" /></button></div>
                  <div className="space-y-4">
                     <button onClick={() => { setShowStats(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 font-black uppercase tracking-widest text-xs"><BarChart2 className="w-5 h-5" /> Analytics</button>
                     <button onClick={() => { setIsImportModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 p-5 bg-slate-800 border border-white/5 rounded-2xl text-white font-black uppercase tracking-widest text-xs"><FileText className="w-5 h-5" /> Import</button>
                  </div>
                  <div className="mt-4 space-y-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 block">Quick Add Lands</span>
                     <div className="grid grid-cols-5 gap-2">{basicLands.map(land => (<button key={land.name} onClick={() => handleAddCard(land.name)} className="aspect-square bg-slate-800 rounded-xl flex items-center justify-center p-2 border border-white/5 active:bg-slate-700"><img src={manaSymbols[land.color as keyof typeof manaSymbols]} className="w-full h-full" alt={land.name} /></button>))}</div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      <div className="p-4 lg:p-0 space-y-8">
         <div className="lg:hidden relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
            <input value={addQuery} onChange={e => setAddQuery(e.target.value)} placeholder="Search Implemented..." className="w-full bg-slate-900 border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold text-white outline-none" />
            {isApiLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />}
         </div>

         {apiSuggestions.length > 0 && (
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
                  {['W', 'U', 'B', 'R', 'G'].map(col => (
                    <button 
                      key={col} 
                      onClick={() => setPoolFilterColors(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${poolFilterColors.includes(col) ? 'bg-indigo-600 shadow-lg scale-110' : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`}
                    >
                      <img src={manaSymbols[col]} className="w-5 h-5" alt={col} />
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
                  {['Common', 'Uncommon', 'Rare', 'Mythic'].map(rar => (
                    <button 
                      key={rar} 
                      onClick={() => setPoolFilterRarity(poolFilterRarity === rar ? null : rar)}
                      className={`px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${poolFilterRarity === rar ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-white'}`}
                    >
                      {rar[0]}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
                  {[0,1,2,3,4,5,6].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setPoolFilterCmc(poolFilterCmc === val ? null : val)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] transition-all ${poolFilterCmc === val ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-white'}`}
                    >
                      {val === 6 ? '6+' : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

         <AnimatePresence>
           {apiSuggestions.length > 0 && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex lg:grid gap-4 p-4 lg:p-8 bg-indigo-950/20 border border-indigo-500/20 rounded-[1.5rem] lg:rounded-[3rem] shadow-2xl overflow-x-auto lg:overflow-x-visible lg:grid-cols-8 custom-scrollbar mb-8">
                {apiSuggestions.map(card => (
                  <button 
                    key={card.scryfall_id} 
                    onClick={() => setDeckCards(prev => [...prev, card])} 
                    className="relative min-w-[120px] lg:min-w-0 aspect-[2.5/3.5] rounded-xl overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-xl border border-white/5 bg-slate-900 group"
                  >
                    <PoolCardImage card={card} />
                  </button>
                ))}
             </motion.div>
           )}
         </AnimatePresence>

         <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-2">
               <div className="flex items-center justify-between w-full lg:w-auto gap-4"><h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tight">Main Deck ({deckCards.length})</h3><button onClick={() => setShowFilters(!showFilters)} className="lg:hidden p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400 active:bg-slate-800"><Filter className="w-5 h-5" /></button></div>
               <AnimatePresence>{(showFilters || window.innerWidth > 1024) && (<motion.div initial={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : {}} animate={window.innerWidth < 1024 ? { height: 'auto', opacity: 1 } : {}} exit={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : {}} className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto overflow-hidden"><div className="relative w-full lg:w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input value={filterQuery} onChange={e => setFilterQuery(e.target.value)} placeholder="Filter deck..." className="w-full bg-slate-900/50 border border-white/5 pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold text-white outline-none" /></div><div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 w-full lg:w-auto overflow-x-auto justify-center">{[0,1,2,3,4,5,6].map(val => (<button key={val} onClick={() => setFilterCmc(filterCmc === val ? null : val)} className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center font-black text-[10px] transition-all ${filterCmc === val ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-white'}`}>{val === 6 ? '6+' : val}</button>))}</div></motion.div>)}</AnimatePresence>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 sm:gap-6">
               {groupedCards.map(({ card, count }) => (<CardGridItem key={card.scryfall_id} card={card} count={count} onZoom={() => setZoomCard(card)} onRemove={() => removeCard(card.scryfall_id)} onQuickAdd={() => handleAddCard(card.name)} />))}
               {groupedCards.length === 0 && (<div className="col-span-full py-20 bg-slate-900/10 border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4"><AlertTriangle className="w-10 h-10 text-slate-700" /><p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Nessuna carta trovata</p></div>)}
            </div>

            {/* LOWER ACTIONS */}
            {/* PREMIUM DECK FOOTER UTILITIES */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-12 mt-12 border-t border-white/5">
              <div className="bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 px-2 relative"><Sun className="w-5 h-5 text-amber-400" /><span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Terre Base Fast-Add</span></div>
                <div className="flex justify-between gap-4 relative">
                    {basicLands.map(land => (
                        <button 
                            key={land.name} 
                            onClick={() => handleAddCard(land.name)} 
                            className="group flex-1 flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 hover:border-indigo-500/30 transition-all active:scale-90"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center p-2 shadow-lg ${land.color === 'W' ? 'bg-amber-100 text-amber-600' : land.color === 'U' ? 'bg-blue-100 text-blue-600' : land.color === 'B' ? 'bg-slate-800 text-slate-100' : land.color === 'R' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                <img src={manaSymbols[land.color as keyof typeof manaSymbols]} className="w-full h-full" alt={land.color} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{land.name}</span>
                        </button>
                    ))}
                </div>
              </div>

              <button 
                onClick={() => setShowStats(true)} 
                className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 p-8 rounded-[3rem] flex items-center justify-center gap-8 group transition-all shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <BarChart2 className="w-14 h-14 text-indigo-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                <div className="text-left relative">
                    <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Analisi Mazzo</h4>
                    <p className="text-indigo-400/80 font-black uppercase text-[10px] tracking-[0.3em] mt-1">Deep stats & Mana Curve Distribution</p>
                </div>
              </button>
            </div>
         </div>
      </div>

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} cards={deckCards} title="Deck Strategy Analytics" />

      {/* MODAL IMPORT */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-300">
             <div className="bg-slate-900 w-full max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
                <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-3 sm:gap-4"><div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><FileText className="w-5 h-5 sm:w-6 sm:h-6" /></div><div><h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Importazione</h3><p className="text-slate-500 text-[8px] sm:text-[10px] uppercase font-black tracking-widest">Uno per riga</p></div></div><button onClick={async () => { try { const text = await navigator.clipboard.readText(); if (text) setImportText(prev => prev ? prev + '\n' + text : text); } catch(e) { } }} className="p-3 bg-slate-800 text-slate-300 rounded-xl border border-white/5"><ClipboardIcon className="w-5 h-5" /></button></div>
                <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6 custom-scrollbar"><textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Counterspell\nLightning Bolt" className="w-full h-48 sm:h-64 bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 text-slate-200 font-mono text-sm outline-none resize-none" disabled={isImporting} />{importErrors.length > 0 && <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4"><div className="flex items-center gap-3 text-red-500"><AlertTriangle className="w-5 h-5" /><span className="text-xs font-black uppercase">Mancanti ({importErrors.length})</span></div><div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">{importErrors.map((name, i) => (<div key={i} className="text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-red-500/10 truncate font-bold">{name}</div>))}</div></div>}</div>
                <div className="p-6 sm:p-8 border-t border-white/5 bg-slate-950/30 flex gap-4"><button onClick={() => setIsImportModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px]">Annulla</button><button onClick={handleImportSubmit} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3">{isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />} {isImporting ? '...' : 'Import'}</button></div>
             </div>
          </div>
        )}
      </AnimatePresence>

      {/* ZOOM MODAL */}
      <AnimatePresence>
        {zoomCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 sm:p-10" onClick={() => setZoomCard(null)}>
             <motion.img layoutId={`card-${zoomCard.scryfall_id}`} src={isZoomFlipped && zoomCard.back_image_url ? zoomCard.back_image_url : zoomCard.image_url} className="max-h-[80dvh] w-auto rounded-[2rem] sm:rounded-[3rem] shadow-4xl border-4 sm:border-8 border-white/5" /><div className="mt-8 flex gap-4">{zoomCard.back_image_url && (<button onClick={(e) => { e.stopPropagation(); setIsZoomFlipped(!isZoomFlipped); }} className="px-6 sm:px-8 py-4 bg-indigo-600 text-white font-black uppercase rounded-2xl flex items-center gap-3"><RefreshCw className="w-5 h-5" /> Gira </button>)}<button onClick={() => setZoomCard(null)} className="px-6 sm:px-8 py-4 bg-slate-800 text-white font-black uppercase rounded-2xl">Chiudi</button></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
