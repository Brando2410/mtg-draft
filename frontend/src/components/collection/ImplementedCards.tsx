import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export const ImplementedCards = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'IMPLEMENTED' | 'NOT_IMPLEMENTED'>('ALL');

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

  const filteredCards = cards.filter(card => {
    const matchesSearch = (card.name || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'IMPLEMENTED') return card.engineStatus === 'IMPLEMENTED';
    if (filter === 'NOT_IMPLEMENTED') return card.engineStatus === 'DATA_ONLY';

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
          <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                  MTG <span className="text-indigo-500">Registry</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium tracking-wide uppercase mt-1">
                  M21 Card Implementation Progress
              </p>
          </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="p-1.5 bg-slate-950/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-4 p-4 lg:items-center">
            
            <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cerca carta per nome..."
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
                    className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black' : 'text-slate-400 hover:bg-white/5'}`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
            </div>
        </div>
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredCards.map(card => (
          <div 
            key={card.name} 
            className="group relative bg-slate-900/40 border border-white/5 transition-all rounded-3xl overflow-hidden hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-white leading-tight">
                        {card.name}
                    </h3>
                    <div className="bg-slate-950 p-2 rounded-xl border border-white/10">
                        {getStatusIcon(card.engineStatus)}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Oracle
                        </p>
                        <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed italic">
                            {card.oracleText || 'Nessun testo oracle'}
                        </p>
                    </div>
                </div>
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
