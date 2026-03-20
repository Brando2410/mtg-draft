import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Plus, X, Layers, Trash2, Maximize2, Database, Save, Edit3, Download, CheckCircle, Home } from 'lucide-react';
import { fetchSearchCards, fetchExactCard } from '../services/scryfall';
import type { SimplifiedCard, ScryfallCard } from '../services/scryfall';

interface DraftPoolBuilderProps {
  onBack?: () => void;
}

export const DraftPoolBuilder = ({ onBack }: DraftPoolBuilderProps) => {
  // --- STATO DEL CUBO ---
  const [cubeName, setCubeName] = useState('Il mio Cubo Personalizzato');
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftPool, setDraftPool] = useState<SimplifiedCard[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- STATO PER AGGIUNTA CARTE (API Scryfall) ---
  const [addQuery, setAddQuery] = useState('');
  const [apiSuggestions, setApiSuggestions] = useState<ScryfallCard[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // --- STATO PER FILTRO POOL ATTUALE (Locale) ---
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

  // Caricamento iniziale da localStorage
  useEffect(() => {
    const savedCube = localStorage.getItem('mtg_draft_cube');
    if (savedCube) {
      try {
        const parsed = JSON.parse(savedCube);
        setCubeName(parsed.name || 'Il mio Cubo Personalizzato');
        setDraftPool(parsed.cards || []);
      } catch (e) {
        console.error('Errore durante il caricamento del cubo:', e);
      }
    }
  }, []);

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
      const res = await fetch('http://localhost:4000/api/cubes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cubeData)
      });

      if (!res.ok) throw new Error('Sync fallito');

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error('Errore Sync Server:', e);
      // Feedback visivo dell'errore (opzionale, per ora torniamo a idle o mostriamo errore)
      alert("Cubo salvato in locale, ma sincronizzazione server fallita. Controlla la connessione backend.");
      setSaveStatus('idle');
    }
  };

  const downloadJson = () => {
    const cubeData = { name: cubeName, cards: draftPool };
    const blob = new Blob([JSON.stringify(cubeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cubeName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- FILTRO LOCALE ---
  const filteredPool = useMemo(() => {
    return draftPool.filter(card => {
      const matchesName = card.name.toLowerCase().includes(filterQuery.toLowerCase());
      const matchesRarity = filterRarity === 'all' || card.rarity.toLowerCase() === filterRarity.toLowerCase();
      const matchesColor = filterColor.length === 0 || filterColor.some(c => card.color.includes(c));
      const matchesCmc = filterCmc === null || (filterCmc === 6 ? card.cmc >= 6 : card.cmc === filterCmc);
      return matchesName && matchesRarity && matchesColor && matchesCmc;
    });
  }, [draftPool, filterQuery, filterRarity, filterColor, filterCmc]);

  const toggleColorFilter = (c: string) => {
    setFilterColor(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  return (
    <>
      <div className="w-full max-w-[1700px] mx-auto p-4 sm:p-6 space-y-12 animate-in fade-in duration-500 min-h-screen pb-40">
        
        {/* 1. SEZIONE AGGIUNGI (VISUAL SEARCH) */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4">
                   {onBack && (
                      <button 
                         onClick={onBack}
                         className="p-3 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-2xl border border-white/5 transition-all shadow-xl group active:scale-95"
                         title="Torna al Menu"
                      >
                         <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                   )}
                   <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-3 rounded-2xl shadow-xl shadow-indigo-500/20">
                      <Database className="w-8 h-8 text-white" />
                   </div>
                    <div className="flex flex-col">
                      <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter italic opacity-80">
                        Database Carte
                      </h2>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] ml-1 mt-2">Ricerca carte da aggiungere alla tua pool</p>
                    </div>
                 </div>
              </div>
              
              <div className="w-full md:max-w-xl relative">
                 <div className="relative group">
                   <input 
                     type="text" 
                     value={addQuery}
                     onChange={(e) => setAddQuery(e.target.value)}
                     placeholder={searchLang === 'en' ? "Search card (English)..." : "Cerca carta (Italiano)..."}
                     className="w-full bg-slate-900 border-2 border-slate-800 text-white pl-12 pr-32 py-5 rounded-3xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-lg shadow-2xl"
                   />
                   <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500" />
                   
                   {/* Language Toggle */}
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center bg-slate-950 p-1 rounded-2xl border border-white/5 shadow-inner">
                      <button 
                        onClick={() => setSearchLang('en')}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${searchLang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        EN
                      </button>
                      <button 
                        onClick={() => setSearchLang('it')}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${searchLang === 'it' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        IT
                      </button>
                   </div>

                   {isApiLoading && <div className="absolute right-28 top-1/2 -translate-y-1/2 animate-spin text-indigo-400"><Loader2 className="w-5 h-5" /></div>}
                 </div>
              </div>
          </div>

          {/* Visual Search Results */}
          {apiSuggestions.length > 0 && (
            <div className="bg-slate-900/10 p-4 sm:p-8 rounded-[3rem] border border-slate-800/50 backdrop-blur-3xl animate-in slide-in-from-top-6 duration-700 shadow-2xl">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Risultati disponibili</h3>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-5">
                  {apiSuggestions.map((card) => {
                    const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
                    return (
                      <div key={card.id} className="group relative aspect-[2.5/3.5] bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-indigo-500 transition-all shadow-xl hover:-translate-y-2">
                         <img src={img} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                         <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-3 gap-4 z-10 backdrop-blur-[2px]">
                            <button 
                              onClick={() => handleAddCard(card)}
                              className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                               <Plus className="w-5 h-5" />
                               <span className="text-xs uppercase font-black">Aggiungi</span>
                            </button>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          )}
        </section>

        {/* 2. AREA POOL EXPLORER */}
        <section className="bg-slate-900/20 backdrop-blur-md border border-slate-800 rounded-[3.5rem] shadow-2xl overflow-hidden">
          
          {/* Header con Salvataggio */}
          <div className="p-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-800/50 gap-6">
             <div className="flex items-center gap-8">
                <div className="relative">
                   <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border transition-all duration-500 ${draftPool.length > 0 ? 'bg-indigo-600 border-indigo-500 shadow-indigo-500/20 shadow-xl rotate-3' : 'bg-slate-800 border-slate-700'}`}>
                      <Layers className={`w-7 h-7 ${draftPool.length > 0 ? 'text-white' : 'text-slate-600'}`} />
                   </div>
                   {draftPool.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                         {draftPool.length}
                      </span>
                   )}
                </div>
                 <div className="flex flex-col">
                    {isEditingName ? (
                       <div className="flex items-center gap-2">
                          <input 
                             type="text"
                             value={cubeName}
                             onChange={(e) => setCubeName(e.target.value)}
                             onBlur={() => setIsEditingName(false)}
                             onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                             autoFocus
                             className="bg-slate-950 border-2 border-indigo-500/50 text-white px-3 py-1 rounded-lg text-2xl font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                          />
                          <button onClick={() => setIsEditingName(false)} className="text-emerald-400 hover:scale-110 transition-transform"><CheckCircle className="w-6 h-6" /></button>
                       </div>
                    ) : (
                       <div className="flex items-center gap-3 group">
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter cursor-pointer hover:text-indigo-400 transition-colors underline decoration-indigo-500/30 decoration-4 underline-offset-8" onClick={() => setIsEditingName(true)}>
                             {cubeName}
                          </h3>
                          <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"><Edit3 className="w-5 h-5" /></button>
                       </div>
                    )}
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span>{filteredPool.length} Carte caricate</span>
                    </p>
                </div>
             </div>

             {/* Bottoni Salva/Download */}
             <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={downloadJson}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-700 group ring-4 ring-slate-800/0 hover:ring-slate-800/50"
                >
                   <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                   Download JSON
                </button>
                <button 
                  onClick={saveCube}
                  disabled={saveStatus === 'saving'}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-xl ring-4 ${
                    saveStatus === 'saved' ? 'bg-emerald-500 border-emerald-400 text-white ring-emerald-500/30' : 
                    saveStatus === 'saving' ? 'bg-indigo-600 border-indigo-500 text-white opacity-80 cursor-wait' :
                    'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 ring-indigo-500/0 hover:ring-indigo-600/30'
                  }`}
                >
                   {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   {saveStatus === 'saved' ? 'Salvato!' : saveStatus === 'saving' ? 'Salvataggio...' : 'Salva Cubo'}
                </button>
             </div>
          </div>

          {/* Content Explorer */}
          <div className="p-8 space-y-10">
             {/* Filtri Bar (Senza Label) */}
             <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center bg-slate-950/40 p-6 rounded-[2.5rem] border border-slate-800/50 ring-1 ring-inset ring-white/5 shadow-inner">
                <div className="relative flex-1 w-full xl:max-w-md group">
                   <input 
                      type="text" 
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      placeholder="Filtra nel cubo..."
                      className="w-full bg-slate-900 border border-slate-800 text-white pl-12 pr-6 py-4 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all font-bold placeholder-slate-600 shadow-inner"
                   />
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-indigo-400 transition-colors" />
                </div>

                <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
                   <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
                      {['W','U','B','R','G'].map(c => (
                        <button 
                          key={c}
                          onClick={() => toggleColorFilter(c)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all p-1.5 ${filterColor.includes(c) ? 'bg-indigo-500 scale-110 shadow-lg shadow-indigo-500/20 active:scale-95' : 'hover:scale-105 opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}
                        >
                           <img src={manaSymbols[c]} alt={c} className="w-full h-full drop-shadow-md" />
                        </button>
                      ))}
                   </div>

                   <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
                      {[0, 1, 2, 3, 4, 5, 6].map(val => (
                         <button 
                            key={val}
                            onClick={() => setFilterCmc(filterCmc === val ? null : val)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all border ${filterCmc === val ? 'bg-white text-slate-950 border-white shadow-lg scale-110 font-black' : 'text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'}`}
                         >
                            {val === 6 ? '6+' : val}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar max-w-full">
                  {['all', 'common', 'uncommon', 'rare', 'mythic'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setFilterRarity(r)}
                      className={`px-4 py-2.5 rounded-xl text-[9px] uppercase font-black transition-all whitespace-nowrap ${filterRarity === r ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-300 font-bold'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
             </div>

             {/* Griglia Carte Locale */}
             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {filteredPool.map((card, i) => (
                  <div key={`${card.scryfall_id}-${i}`} className="group relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl transition-all duration-300 hover:-translate-y-4 hover:shadow-indigo-500/40 ring-1 ring-inset ring-white/5">
                    <div className="relative aspect-[2.5/3.5] bg-slate-950 overflow-hidden">
                      <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 duration-700 pointer-events-none ring-1 ring-white/10" />
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 z-20">
                        <button onClick={() => setZoomImage(card.image_url)} className="w-12 h-12 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"><Maximize2 className="w-5 h-5" /></button>
                        <button onClick={() => removeCard(i)} className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </div>

      {/* MODAL ZOOM - Spostato fuori per evitare stacking context issues e margini top */}
      {zoomImage && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 backdrop-blur-[80px] p-4 sm:p-10 animate-in fade-in duration-300" onClick={() => setZoomImage(null)}>
          <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-all transform hover:rotate-90 p-4 bg-white/5 rounded-full backdrop-blur-md border border-white/5 z-10"><X className="w-10 h-10" /></button>
          <img src={zoomImage} alt="Card Zoom" className="max-h-[90vh] w-auto object-contain rounded-[4rem] shadow-[0_40px_150px_rgba(99,102,241,0.6)] border-[6px] border-white/10 animate-in zoom-in-95 duration-700 relative z-0" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
};
