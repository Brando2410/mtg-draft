import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X, Database, Save, Download, Home, FileText, RefreshCw, ChevronUp, BarChart2 } from 'lucide-react';
import { fetchSearchCards, fetchExactCard, fetchCardsBatch } from '../../services/scryfall';
import type { SimplifiedCard, ScryfallCard } from '../../services/scryfall';
import { StatsModal } from '../shared/StatsModal';
import { CardGridItem } from '../shared/CardGridItem';

interface DraftPoolBuilderProps {
  onBack?: () => void;
  skipRestore?: boolean;
}

export const DraftPoolBuilder = ({ onBack, skipRestore = false }: DraftPoolBuilderProps) => {
  // --- STATO DEL CUBO ---
  const [cubeName, setCubeName] = useState('Il mio Cubo Personalizzato');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftPool, setDraftPool] = useState<SimplifiedCard[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- STATO IMPORT ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // --- STATO PER AGGIUNTA CARTE (API Scryfall) ---
  const [addQuery, setAddQuery] = useState('');
  const [apiSuggestions, setApiSuggestions] = useState<ScryfallCard[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [zoomCard, setZoomCard] = useState<SimplifiedCard | null>(null);
  const [isZoomFlipped, setIsZoomFlipped] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showStats, setShowStats] = useState(false);

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

  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterColor, setFilterColor] = useState<string[]>([]);
  const [filterCmc, setFilterCmc] = useState<number | null>(null);
  
  // --- STATO RESTORE ---
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [tempCubeData, setTempCubeData] = useState<any>(null);

  useEffect(() => {
    const savedCube = localStorage.getItem('mtg_draft_cube');
    if (savedCube) {
      try {
        const parsed = JSON.parse(savedCube);
        if (parsed.cards && parsed.cards.length > 0) {
          if (skipRestore) {
            setCubeName(parsed.name || 'Il mio Cubo Personalizzato');
            setDraftPool(parsed.cards || []);
          } else {
            setTempCubeData(parsed);
            setIsRestoreModalOpen(true);
          }
        }
      } catch (e) {
        console.error('Errore parsing:', e);
      }
    }
  }, [skipRestore]);

  const handleRestore = () => {
    if (tempCubeData) {
      setCubeName(tempCubeData.name || 'Il mio Cubo Personalizzato');
      setDraftPool(tempCubeData.cards || []);
      setIsRestoreModalOpen(false);
    }
  };

  const handleStartFresh = () => {
    localStorage.removeItem('mtg_draft_cube');
    setTempCubeData(null);
    setIsRestoreModalOpen(false);
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    setImportErrors([]);
    const names = importText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    try {
      const { found, notFound } = await fetchCardsBatch(names);
      if (found.length > 0) setDraftPool(prev => [...found, ...prev]);
      if (notFound.length > 0) setImportErrors(notFound);
      else { setIsImportModalOpen(false); setImportText(''); }
    } catch (err) { alert('Errore import.'); } finally { setIsImporting(false); }
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (addQuery.length >= 2) {
        setIsApiLoading(true);
        const results = await fetchSearchCards(addQuery, 'en');
        setApiSuggestions(results);
        setIsApiLoading(false);
      } else { setApiSuggestions([]); }
    }, 450);
    return () => clearTimeout(timeoutId);
  }, [addQuery]);

  const handleAddCard = async (card: any) => {
    setIsApiLoading(true);
    const result = await fetchExactCard(card.name);
    if (result) setDraftPool(prev => [result, ...prev]);
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
    if (card.type_line?.toLowerCase().includes('land')) return 200;
    if (card.color.length === 0) return 150;
    if (card.color.length > 1) return 100;
    return COLOR_ORDER.indexOf(card.color[0]);
  };

  const groupedPool = useMemo(() => {
    const filtered = draftPool.filter(card => {
      const matchesName = card.name.toLowerCase().includes(filterQuery.toLowerCase());
      const matchesRarity = filterRarity === 'all' || card.rarity.toLowerCase() === filterRarity.toLowerCase();
      const matchesColor = filterColor.length === 0 || filterColor.some(c => card.color.includes(c));
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
  }, [draftPool, filterQuery, filterRarity, filterColor, filterCmc]);

  return (
    <>
      <div className="w-full max-w-[1700px] mx-auto p-4 sm:p-10 space-y-8 animate-in fade-in duration-700 pb-32">
        <header className="flex flex-col lg:flex-row items-center justify-between gap-6 py-8 border-b border-indigo-500/10">
           <div className="flex items-center gap-6">
              <button onClick={onBack} className="p-4 bg-slate-900/50 hover:bg-slate-800 text-slate-500 rounded-3xl border border-white/5 transition-all"><Home className="w-6 h-6" /></button>
              <div className="space-y-1">
                 {isEditingName ? (
                   <input value={cubeName} onChange={e => setCubeName(e.target.value)} onBlur={() => setIsEditingName(false)} autoFocus className="bg-slate-950 border-b-2 border-indigo-500 text-3xl font-black text-white outline-none italic uppercase" />
                 ) : (
                   <h2 onClick={() => setIsEditingName(true)} className="text-4xl sm:text-6xl font-black text-white hover:text-indigo-400 cursor-pointer transition-colors uppercase italic tracking-tighter">{cubeName}</h2>
                 )}
                 <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Draft Environment Designer</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 w-full lg:max-w-2xl">
              <div className="relative flex-1 group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                 <input value={addQuery} onChange={e => setAddQuery(e.target.value)} placeholder="Scryfall Search..." className="w-full bg-slate-900 border border-white/5 pl-14 pr-6 py-5 rounded-[2rem] outline-none focus:border-indigo-500/50 transition-all font-bold text-lg" />
                 {isApiLoading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />}
              </div>
              <button onClick={() => setIsImportModalOpen(true)} className="p-5 bg-slate-900/50 text-indigo-400 rounded-[2rem] border border-white/5 active:scale-95 transition-all"><FileText className="w-6 h-6" /></button>
           </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-4 gap-8">
           <aside className="xl:col-span-1 space-y-6">
              <button onClick={() => setShowStats(true)} className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all group">
                 <BarChart2 className="w-12 h-12 text-indigo-400 group-hover:scale-110 transition-transform" />
                 <div className="text-center"><h4 className="text-xl font-black text-white uppercase italic">Analytics</h4><p className="text-indigo-400/60 font-black uppercase text-[10px] tracking-widest">Environment Balance</p></div>
              </button>
              
              <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                 <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block px-2">Card Rarity</span>
                    <div className="grid grid-cols-2 gap-2">
                       {['all', 'common', 'uncommon', 'rare', 'mythic'].map(r => (
                         <button key={r} onClick={() => setFilterRarity(r)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRarity === r ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>{r}</button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block px-2">Mana Value</span>
                    <div className="flex flex-wrap gap-2">
                       {[0,1,2,3,4,5,6].map(v => (
                         <button key={v} onClick={() => setFilterCmc(filterCmc === v ? null : v)} className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all ${filterCmc === v ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>{v === 6 ? '6+' : v}</button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={saveCube} className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 flex items-center justify-center gap-3">
                    {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saveStatus === 'saved' ? 'Saved' : 'Save'}
                 </button>
                 <button onClick={downloadTxt} className="p-5 bg-slate-900/50 text-slate-400 rounded-[2rem] border border-white/5 active:scale-95 transition-all"><Download className="w-6 h-6" /></button>
              </div>
           </aside>

           <main className="xl:col-span-3 space-y-8">
              <AnimatePresence>
                 {apiSuggestions.length > 0 && (
                   <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-8 bg-slate-900/80 rounded-[3rem] border border-indigo-500/20">
                      {apiSuggestions.map(card => (
                        <button key={card.id} onClick={() => handleAddCard(card)} className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-xl"><img src={card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal} className="w-full h-full object-cover" /></button>
                      ))}
                   </motion.div>
                 )}
              </AnimatePresence>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                 {groupedPool.map(({ card, count }) => (
                   <CardGridItem 
                     key={card.scryfall_id}
                     card={card}
                     count={count}
                     isSelected={selectedPoolId === card.scryfall_id}
                     onSelect={() => setSelectedPoolId(selectedPoolId === card.scryfall_id ? null : card.scryfall_id)}
                     onZoom={() => setZoomCard(card)}
                     onRemove={() => removeCard(card.scryfall_id)}
                     onQuickAdd={() => handleAddCard(card)}
                     onFlipToggle={(e) => toggleFlip(e, card.scryfall_id)}
                     isFlipped={flippedIndices.has(card.scryfall_id)}
                   />
                 ))}
              </div>
           </main>
        </section>
      </div>

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} cards={draftPool} title="Cube Environment Stats" />
      
      <AnimatePresence>
        {zoomCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-10" onClick={() => setZoomCard(null)}>
             <img src={isZoomFlipped && zoomCard.back_image_url ? zoomCard.back_image_url : zoomCard.image_url} className="max-h-[85dvh] w-auto rounded-[3rem] shadow-4xl border-8 border-white/5" />
             <div className="mt-8 flex gap-4">
               {zoomCard.back_image_url && (<button onClick={(e) => { e.stopPropagation(); setIsZoomFlipped(!isZoomFlipped); }} className="px-8 py-4 bg-indigo-600 text-white font-black uppercase rounded-2xl flex items-center gap-3"><RefreshCw className="w-5 h-5" /> Flip </button>)}
               <button onClick={() => setZoomCard(null)} className="px-8 py-4 bg-slate-800 text-white font-black uppercase rounded-2xl">Close</button>
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
                   <button onClick={() => setIsImportModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase">Cancel</button>
                   <button onClick={handleImportSubmit} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-3">{isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-4 h-4" />} Import Now</button>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
      
      {showScrollTop && (<button onClick={scrollToTop} className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white rounded-full flex items-center justify-center shadow-2xl transition-all"><ChevronUp className="w-6 h-6" /></button>)}
    </>
  );
};
