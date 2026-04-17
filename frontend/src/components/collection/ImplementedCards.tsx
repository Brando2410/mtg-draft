import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle, HelpCircle, Layers, Zap } from 'lucide-react';

export const ImplementedCards = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'IMPLEMENTED' | 'NOT_IMPLEMENTED'>('ALL');
  const [selectedSet, setSelectedSet] = useState<string>('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const isDev = window.location.port === '5173';
      const API_URL = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:4000' : window.location.origin);
      const res = await fetch(`${API_URL}/api/implemented`);
      const data = await res.json();
      setCards(data);
    } catch (e) {
      console.error('Error fetching registry data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sets = ['ALL', ...new Set(cards.map(c => c.set).filter(Boolean))];

  const filteredCards = cards.filter(card => {
    const matchesSearch = (card.name || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'IMPLEMENTED' && card.engineStatus !== 'IMPLEMENTED') return false;
    if (filter === 'NOT_IMPLEMENTED' && card.engineStatus !== 'DATA_ONLY') return false;

    if (selectedSet !== 'ALL' && card.set !== selectedSet) return false;

    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IMPLEMENTED':
      case 'VERIFIED': return <CheckCircle2 className="w-5 h-5 text-emerald-500 shadow-sm" />;
      case 'DATA_ONLY':
      case 'MISSING': return <AlertCircle className="w-5 h-5 text-slate-500 opacity-30" />;
      default: return <HelpCircle className="w-5 h-5 text-slate-500 opacity-30" />;
    }
  };

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
            Caricamento Registro...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic">
                  MTG <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Registry</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase mt-2">
                  Multi-Set Engine Implementation Status • {cards.length} Cards
              </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <div className="bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-white uppercase">{cards.filter(c => c.engineStatus === 'IMPLEMENTED').length} Implementate</span>
             </div>
             <div className="bg-slate-900/50 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-black text-white uppercase">{cards.filter(c => c.engineStatus !== 'IMPLEMENTED').length} In Attesa</span>
             </div>
          </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            
            <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cerca per nome..."
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {(['ALL', 'IMPLEMENTED', 'NOT_IMPLEMENTED'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5'}`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 pt-4">
            <Layers className="w-4 h-4 text-slate-500 ml-2" />
            <div className="flex flex-wrap gap-2">
                {sets.map(s => (
                  <button 
                    key={s}
                    onClick={() => setSelectedSet(s)}
                    className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${selectedSet === s ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {s}
                  </button>
                ))}
            </div>
        </div>
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map(card => (
          <div 
            key={card.name} 
            className="group relative bg-slate-900/40 border border-white/5 transition-all rounded-3xl overflow-hidden hover:scale-[1.02] hover:bg-slate-900/60 hover:border-indigo-500/20"
          >
            {card.image_url && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-slate-950 text-indigo-400 text-[8px] font-black rounded border border-indigo-500/20 uppercase tracking-tighter">{card.set}</span>
                           {card.manaCost && <span className="text-[10px] text-slate-400 font-bold">{card.manaCost}</span>}
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight truncate">
                            {card.name}
                        </h3>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-white/10 shrink-0 shadow-inner">
                        {getStatusIcon(card.engineStatus)}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide truncate">{card.typeLine}</p>
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 group-hover:border-indigo-500/10 transition-colors h-32 overflow-y-auto custom-scrollbar">
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            {card.oracleText || 'Nessun testo oracle'}
                        </p>
                    </div>
                </div>
                
                {card.image_url && (
                   <div className="pt-2 flex justify-end">
                      <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity text-indigo-400">
                         <Zap className="w-3 h-3" />
                         <span className="text-[8px] font-black uppercase tracking-widest">Asset Ready</span>
                      </div>
                   </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredCards.length === 0 && (
         <div className="py-40 text-center space-y-4 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-white/5">
            <Search className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-slate-600 font-black uppercase text-xs tracking-widest">Nessuna carta trovata con i filtri attuali</p>
         </div>
      )}
    </div>
  );
};
