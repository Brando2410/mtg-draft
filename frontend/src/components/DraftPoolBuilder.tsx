import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Plus, X, Trash2, Maximize2, Database, Save, Download, Home, FileText, AlertTriangle, RefreshCw, ChevronUp, Check, Clipboard as ClipboardIcon } from 'lucide-react';
import { fetchSearchCards, fetchExactCard, fetchCardsBatch } from '../services/scryfall';
import type { SimplifiedCard, ScryfallCard } from '../services/scryfall';

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
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400); // Mostra dopo 400px
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- STATO FLIP CARTE ---
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  const toggleFlip = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setFlippedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const [selectedPoolIndex, setSelectedPoolIndex] = useState<number | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterColor, setFilterColor] = useState<string[]>([]);
  const [filterCmc, setFilterCmc] = useState<number | null>(null);
  
  // Mappa simboli Scryfall
  const manaSymbols: Record<string, string> = {
    'W': 'https://svgs.scryfall.io/card-symbols/W.svg',
    'U': 'https://svgs.scryfall.io/card-symbols/U.svg',
    'B': 'https://svgs.scryfall.io/card-symbols/B.svg',
    'R': 'https://svgs.scryfall.io/card-symbols/R.svg',
    'G': 'https://svgs.scryfall.io/card-symbols/G.svg',
  };

  // --- STATO RESTORE ---
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [tempCubeData, setTempCubeData] = useState<any>(null);

  // Caricamento iniziale da localStorage con conferma
  useEffect(() => {
    const savedCube = localStorage.getItem('mtg_draft_cube');
    if (savedCube) {
      try {
        const parsed = JSON.parse(savedCube);
        if (parsed.cards && parsed.cards.length > 0) {
          if (skipRestore) {
            // Se veniamo dalla collezione, carichiamo subito
            setCubeName(parsed.name || 'Il mio Cubo Personalizzato');
            setDraftPool(parsed.cards || []);
          } else {
            // Se clicchiamo "Nuovo Cubo" dal menu, chiediamo conferma
            setTempCubeData(parsed);
            setIsRestoreModalOpen(true);
          }
        }
      } catch (e) {
        console.error('Errore durante il parsing del cubo salvato:', e);
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

  // --- LOGICA IMPORT BATCH ---
  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    
    setIsImporting(true);
    setImportErrors([]);
    
    const names = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
      
    if (names.length === 0) {
      setIsImporting(false);
      return;
    }

    try {
      const { found, notFound } = await fetchCardsBatch(names);
      
      if (found.length > 0) {
        setDraftPool(prev => [...found, ...prev]);
      }
      
      if (notFound.length > 0) {
        setImportErrors(notFound);
      } else {
        setIsImportModalOpen(false);
        setImportText('');
      }
    } catch (err) {
      console.error('Import failed:', err);
      alert('Si è verificato un errore durante l\'importazione.');
    } finally {
      setIsImporting(false);
    }
  };

  const [searchLang, setSearchLang] = useState<'en' | 'it'>('en');

  // Debounce per Scryfall
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (addQuery.length >= 2) {
        setIsApiLoading(true);
        // Passiamo la lingua scelta al service
        const results = await fetchSearchCards(addQuery, searchLang);
        setApiSuggestions(results);
        setIsApiLoading(false);
      } else {
        setApiSuggestions([]);
      }
    }, 450);
    return () => clearTimeout(timeoutId);
  }, [addQuery, searchLang]);

  const handleAddCard = async (card: ScryfallCard) => {
    setRecentlyAddedId(card.id);
    setTimeout(() => setRecentlyAddedId(null), 600);
    
    setIsApiLoading(true);
    // Usiamo fetchExactCard per essere sicuri dei dati
    const result = await fetchExactCard(card.name);
    if (!result) {
      setIsApiLoading(false);
      return;
    }

    setDraftPool(prev => [result, ...prev]);
    setIsApiLoading(false);
  };

  const removeCard = (index: number) => {
    setDraftPool(prev => prev.filter((_, i) => i !== index));
  };

  // --- AZIONI DI SALVATAGGIO ---
  const saveCube = async () => {
    setSaveStatus('saving');
    const cubeData = {
      name: cubeName,
      cards: draftPool,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      // 1. Salvataggio locale (sempre affidabile)
      localStorage.setItem('mtg_draft_cube', JSON.stringify(cubeData));

      // 2. Sincronizzazione Server
      const API_URL = import.meta.env.VITE_API_URL || 'https://vibrant-warmth-production-7fe3.up.railway.app';
      const res = await fetch(`${API_URL}/api/cubes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cubeData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore durante la sincronizzazione');
      }

      setSaveStatus('saved');
      alert('Cubo salvato correttamente sul server!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) {
      console.error('Errore Sync Server:', e);
      // Feedback con alert come richiesto
      alert(`Errore: ${e.message || 'Connessione fallita'}`);
      setSaveStatus('idle');
    }
  };

  const downloadTxt = () => {
    // Esporta solo i nomi delle carte (in caso di bifronte, solo il primo nome), uno per riga
    const data = draftPool.map(c => c.name.split(' // ')[0]).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cubeName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- LOGICA DI ORDINAMENTO ---
  const COLOR_ORDER = ['W', 'U', 'B', 'R', 'G'];
  const getColorWeight = (card: SimplifiedCard) => {
    const isLand = card.type_line?.toLowerCase().includes('land');
    if (isLand) return 200;
    if (card.color.length === 0) return 150; // Colorless non-land
    if (card.color.length > 1) return 100; // Multicolore
    return COLOR_ORDER.indexOf(card.color[0]);
  };

  // --- FILTRO LOCALE E ORDINAMENTO ---
  const filteredPool = useMemo(() => {
    const filtered = draftPool.filter(card => {
      const matchesName = card.name.toLowerCase().includes(filterQuery.toLowerCase());
      const matchesRarity = filterRarity === 'all' || card.rarity.toLowerCase() === filterRarity.toLowerCase();
      const matchesColor = filterColor.length === 0 || filterColor.some(c => card.color.includes(c));
      const matchesCmc = filterCmc === null || (filterCmc === 6 ? card.cmc >= 6 : card.cmc === filterCmc);
      return matchesName && matchesRarity && matchesColor && matchesCmc;
    });

    return [...filtered].sort((a, b) => {
      const weightA = getColorWeight(a);
      const weightB = getColorWeight(b);
      if (weightA !== weightB) return weightA - weightB;
      if (a.cmc !== b.cmc) return a.cmc - b.cmc;
      return a.name.localeCompare(b.name);
    });
  }, [draftPool, filterQuery, filterRarity, filterColor, filterCmc]);

  const toggleColorFilter = (c: string) => {
    setFilterColor(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  return (
    <>
      <div className="w-full max-w-[1700px] mx-auto p-2 sm:p-6 space-y-6 sm:space-y-12 animate-in fade-in duration-500 min-h-[100dvh] pb-40">
        
        {/* 1. SEZIONE AGGIUNGI (VISUAL SEARCH) */}
        <section className="space-y-4 sm:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
             <div className="space-y-2 sm:space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-4">
                   {onBack && (
                      <button 
                         onClick={onBack}
                         className="p-2 sm:p-3 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl sm:rounded-2xl border border-white/5 transition-all shadow-xl group active:scale-95"
                         title="Torna al Menu"
                      >
                         <Home className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                      </button>
                   )}
                   <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-500/20">
                      <Database className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                   </div>
                    <div className="flex flex-col">
                      <h2 className="text-xl sm:text-4xl font-black text-white uppercase tracking-tighter italic opacity-80">
                        Database Carte
                      </h2>
                      <p className="hidden sm:block text-slate-500 font-bold uppercase tracking-widest text-[10px] ml-1 mt-2">Ricerca carte da aggiungere alla tua pool</p>
                    </div>
                 </div>
              </div>
              
              <div className="w-full md:max-w-xl relative">
                 <div className="relative group">
                   <input 
                     type="text" 
                     value={addQuery}
                     onChange={(e) => setAddQuery(e.target.value)}
                     placeholder={searchLang === 'en' ? "Search..." : "Cerca..."}
                     className="w-full bg-slate-900 border-2 border-slate-800 text-white pl-10 pr-24 sm:pl-12 sm:pr-32 py-3 sm:py-5 rounded-2xl sm:rounded-3xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm sm:text-lg shadow-2xl"
                   />
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-6 sm:h-6 text-indigo-500" />
                   
                   {isApiLoading && (
                     <div className="absolute right-20 sm:right-28 top-1/2 -translate-y-1/2 animate-spin text-indigo-400">
                       <Loader2 className="w-4 h-4 sm:w-5 sm:h-5" />
                     </div>
                   )}
                   
                   {/* Language Toggle */}
                   <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center bg-slate-950 p-1 rounded-xl sm:rounded-2xl border border-white/5 shadow-inner scale-90 sm:scale-100">
                      <button 
                        onClick={() => setSearchLang('en')}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${searchLang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        EN
                      </button>
                      <button 
                        onClick={() => setSearchLang('it')}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${searchLang === 'it' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        IT
                      </button>
                   </div>
                 </div>
              </div>

              {/* Import Button */}
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-5 bg-slate-900/50 hover:bg-slate-800 text-indigo-400 hover:text-white rounded-2xl sm:rounded-3xl border border-white/5 transition-all shadow-xl group active:scale-95"
              >
                 <FileText className="w-4 h-4 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                 <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 sm:mb-1 opacity-60">Bulk</span>
                    <span className="text-xs sm:text-sm font-black uppercase">Importa Testo</span>
                 </div>
              </button>
          </div>

          {/* Visual Search Results */}
          {apiSuggestions.length > 0 && (
            <div className="bg-slate-900/10 p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-slate-800/50 backdrop-blur-3xl animate-in slide-in-from-top-6 duration-700 shadow-2xl overflow-x-auto no-scrollbar">
               <div className="flex items-center gap-3 mb-4 sm:mb-8">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Risultati disponibili</h3>
               </div>
               
               <div className="flex sm:grid flex-nowrap sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-5 pb-2">
                  {apiSuggestions.map((card) => {
                    const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
                    return (
                      <motion.div 
                        key={card.id} 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => handleAddCard(card)} 
                        className="group relative w-32 sm:w-auto shrink-0 aspect-[2.5/3.5] bg-slate-800 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-700/50 select-none shadow-xl cursor-pointer"
                      >
                         <img src={img} alt={card.name} className="w-full h-full object-cover pointer-events-none" />
                         
                         {/* SUCCESS OVERLAY */}
                         <AnimatePresence>
                            {recentlyAddedId === card.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-0 z-30 bg-emerald-500/60 backdrop-blur-sm flex items-center justify-center p-4"
                              >
                                 <motion.div
                                   initial={{ y: 20 }}
                                   animate={{ y: 0 }}
                                   className="bg-white rounded-full p-2 shadow-2xl"
                                 >
                                    <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                                 </motion.div>
                              </motion.div>
                            )}
                         </AnimatePresence>

                         <div className="absolute inset-0 z-10 pointer-events-none">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleAddCard(card); }}
                              className="absolute bottom-2 left-2 w-7 h-7 sm:w-8 sm:h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all shadow-xl pointer-events-auto"
                            >
                               <Plus className="w-4 h-4" />
                            </button>
                         </div>
                      </motion.div>
                    );
                  })}
               </div>
            </div>
          )}
        </section>

        {/* 2. AREA POOL EXPLORER */}
        <section className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-3xl sm:rounded-[3.5rem] shadow-2xl overflow-hidden">
          
          {/* Header con Salvataggio */}
          <div className="p-4 sm:p-8 flex items-center justify-between border-b border-slate-800/50 gap-4">
             <div className="flex items-center gap-3 sm:gap-8 min-w-0">
                 <div className="flex flex-col min-w-0 flex-1">
                    {isEditingName ? (
                       <input 
                          type="text"
                          value={cubeName}
                          onChange={(e) => setCubeName(e.target.value)}
                          onBlur={() => setIsEditingName(false)}
                          onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                          autoFocus
                          className="w-full bg-slate-950 border-2 border-indigo-500/50 text-white px-2 py-0.5 rounded-lg text-lg sm:text-2xl font-black focus:outline-none"
                       />
                    ) : (
                       <h3 className="text-lg sm:text-3xl font-black text-white uppercase tracking-tighter cursor-pointer hover:text-indigo-400 transition-colors truncate italic pr-2" onClick={() => setIsEditingName(true)}>
                          {cubeName}
                       </h3>
                    )}
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mt-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span>{filteredPool.length} Carte trovate</span>
                    </p>
                </div>
             </div>

             {/* Bottoni Salva/Download Compatti - Allineati a Destra */}
             <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 self-start sm:self-center">
                <button 
                  onClick={downloadTxt}
                  title="Scarica Lista Nomi (.txt)"
                  className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 active:scale-95 shadow-lg group"
                >
                   <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <button 
                  onClick={saveCube}
                  disabled={saveStatus === 'saving'}
                  title="Salva Cubo sul Server"
                  className={`w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl transition-all border shadow-xl active:scale-95 ${
                    saveStatus === 'saved' ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' : 
                    saveStatus === 'saving' ? 'bg-indigo-600 border-indigo-500 text-white opacity-80 cursor-wait' :
                    'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 hover:shadow-indigo-500/20'
                  }`}
                >
                   {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Save className={`w-4 h-4 sm:w-5 sm:h-5 ${saveStatus === 'saved' ? 'scale-110' : ''} transition-transform`} />}
                </button>
             </div>
          </div>

          {/* Content Explorer */}
          <div className="p-3 sm:p-8 space-y-4 sm:space-y-10">
             {/* Filtri Bar */}
             <div className="flex flex-col xl:flex-row gap-3 sm:gap-8 items-start xl:items-center bg-slate-950/40 p-3 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-slate-800/50 shadow-inner">
                <div className="relative flex-1 w-full xl:max-w-md group">
                   <input 
                      type="text" 
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="Cerca..."
                      className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2.5 sm:pl-12 sm:pr-6 sm:py-4 rounded-xl sm:rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-xs sm:text-base placeholder-slate-600 shadow-inner"
                   />
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-700 group-focus-within:text-indigo-400 transition-colors" />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                   <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl sm:rounded-2xl border border-slate-800">
                      {['W','U','B','R','G'].map(c => (
                        <button 
                          key={c}
                          onClick={() => toggleColorFilter(c)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all p-1.5 ${filterColor.includes(c) ? 'bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'opacity-40 grayscale hover:grayscale-0'}`}
                        >
                           <img src={manaSymbols[c]} alt={c} className="w-full h-full" />
                        </button>
                      ))}
                   </div>

                   <div className="flex flex-wrap items-center gap-1 bg-slate-900/80 p-1 rounded-xl sm:rounded-2xl border border-slate-800">
                      {[0, 1, 2, 3, 4, 5, 6].map(val => (
                         <button 
                            key={val}
                            onClick={() => setFilterCmc(filterCmc === val ? null : val)}
                            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-sm transition-all border ${filterCmc === val ? 'bg-white text-slate-950 border-white' : 'text-slate-500 border-slate-800 hover:text-white'}`}
                         >
                            {val === 6 ? '6+' : val}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-1 bg-slate-900/80 p-1 rounded-xl sm:rounded-2xl border border-slate-800 w-full xl:w-auto">
                  {['all', 'common', 'uncommon', 'rare', 'mythic'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setFilterRarity(r)}
                      className={`flex-1 sm:flex-none px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[7px] sm:text-[9px] uppercase font-black transition-all whitespace-nowrap ${filterRarity === r ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}
                    >
                      {r.substring(0, 3)}
                    </button>
                  ))}
                </div>
             </div>
             {/* Griglia Carte Locale */}
             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {filteredPool.map((card, i) => {
                  const isFlipped = flippedIndices.has(i);
                  const displayImage = (isFlipped && card.back_image_url) ? card.back_image_url : card.image_url;
                  
                   return (
                    <div 
                      key={`${card.scryfall_id}-${i}`} 
                      onClick={() => setSelectedPoolIndex(selectedPoolIndex === i ? null : i)}
                      className={`group relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl transition-all duration-300 hover:-translate-y-2 ring-1 ring-inset ${selectedPoolIndex === i ? 'ring-indigo-500 ring-2 translate-y-[-8px]' : 'ring-white/5 hover:shadow-indigo-500/20'}`}
                    >
                      <div className="relative aspect-[2.5/3.5] bg-slate-950 overflow-hidden">
                        <img src={displayImage} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 duration-700 pointer-events-none ring-1 ring-white/10" />
                        
                        {/* FLIP INDICATOR / BUTTON */}
                        {card.back_image_url && (
                           <button 
                             onClick={(e) => toggleFlip(e, i)}
                             className={`absolute top-1.5 left-1/2 -translate-x-1/2 z-30 p-1 rounded-lg border border-white/10 transition-all ${isFlipped ? 'bg-indigo-500/60 text-white shadow-lg' : 'bg-black/30 text-white/50 hover:text-white hover:bg-black/60'}`}
                           >
                              <RefreshCw className={`w-3 h-3 ${isFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
                           </button>
                        )}

                        <div 
                          className={`absolute inset-0 bg-slate-950/40 transition-all flex items-center justify-center gap-3 z-20 ${selectedPoolIndex === i ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={() => { setZoomCard(card); setIsZoomFlipped(isFlipped); }} 
                            className="w-10 h-10 rounded-xl bg-white/40 hover:bg-white/60 text-white flex items-center justify-center border border-white/20 shadow-2xl transition-all"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => removeCard(i)} 
                            className="w-10 h-10 rounded-xl bg-red-500/30 hover:bg-red-500/50 text-white flex items-center justify-center border border-red-500/30 shadow-2xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>

          </div>
        </section>
      </div>

      {/* MODAL IMPORT */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
           <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                       <FileText className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Importazione</h3>
                       <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Inserisci un nome per riga</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) setImportText(prev => prev ? prev + '\n' + text : text);
                        } catch (err) {
                          alert("Impossibile accedere agli appunti.");
                        }
                      }}
                      title="Incolla dagli appunti"
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/5 transition-all active:scale-90"
                    >
                      <ClipboardIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setIsImportModalOpen(false); setImportErrors([]); }} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-slate-500" /></button>
                 </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                 <textarea 
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Esempio:&#10;Black Lotus&#10;Ancestral Recall&#10;Time Walk"
                    className="w-full h-64 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-200 font-mono text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none"
                    disabled={isImporting}
                 />

                 {importErrors.length > 0 && (
                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl space-y-4 animate-in slide-in-from-top-4">
                       <div className="flex items-center gap-3 text-red-500">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="text-xs font-black uppercase">Carte non trovate ({importErrors.length})</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                          {importErrors.map((name, i) => (
                             <div key={i} className="text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-red-500/10 truncate font-bold">
                                {name}
                             </div>
                          ))}
                       </div>
                       <p className="text-[9px] text-slate-500 font-medium italic">Le altre carte sono state aggiunte correttamente alla pool.</p>
                    </div>
                 )}
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-950/30 flex gap-4">
                 <button 
                    onClick={() => { setIsImportModalOpen(false); setImportErrors([]); }}
                    className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                 >
                    Annulla
                 </button>
                 <button 
                    onClick={handleImportSubmit}
                    disabled={isImporting || !importText.trim()}
                    className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 ${
                       isImporting ? 'bg-slate-800 text-slate-600 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-95'
                    }`}
                 >
                    {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                    {isImporting ? 'Elaborazione...' : 'Avvia Importazione'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL ZOOM - Mobile Optimized with Flip Support */}
      {zoomCard && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl p-4 sm:p-10 animate-in fade-in duration-300" onClick={() => { setZoomCard(null); setIsZoomFlipped(false); }}>
          {/* Pulsante di chiusura - Spostato in alto a destra fisso */}
          <button className="fixed top-4 right-4 sm:top-8 sm:right-8 text-white/40 hover:text-white transition-all p-3 bg-white/5 rounded-full backdrop-blur-md border border-white/5 z-[1100]">
            <X className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
          
          <div className="relative flex flex-col items-center gap-6">
            <img 
              src={isZoomFlipped && zoomCard.back_image_url ? zoomCard.back_image_url : zoomCard.image_url} 
              alt={zoomCard.name} 
              className="max-h-[75dvh] sm:max-h-[85dvh] w-auto object-contain rounded-[2rem] sm:rounded-[3rem] shadow-[0_40px_150px_rgba(99,102,241,0.3)] border-[4px] sm:border-[6px] border-white/10 animate-in zoom-in-95 duration-500 relative z-10" 
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

      {/* MODAL RESTORE CUBE */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-6 animate-in fade-in duration-500">
           <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center text-center p-10 space-y-8">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-inner">
                 <AlertTriangle className="w-10 h-10 text-indigo-400" />
              </div>
              
              <div className="space-y-3">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Cubo Salvato</h2>
                 <p className="text-slate-400 font-bold text-sm leading-relaxed px-4">
                    Abbiamo trovato un cubo salvato localmente: <span className="text-indigo-400">"{tempCubeData?.name}"</span> con <span className="text-white">{tempCubeData?.cards?.length} carte</span>.
                 </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-4">
                 <button 
                   onClick={handleRestore}
                   className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3 group"
                 >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Ripristina Sessione
                 </button>
                 <button 
                   onClick={handleStartFresh}
                   className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/5 active:scale-95"
                 >
                    Inizia da zero
                 </button>
              </div>
              
              <p className="text-slate-600 text-[9px] uppercase font-black tracking-widest pt-2">Note: "Inizia da zero" cancellerà i dati salvati in locale</p>
           </div>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white rounded-full flex items-center justify-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 hover:bg-slate-800 transition-all sm:w-14 sm:h-14"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};
