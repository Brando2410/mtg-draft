
import { useState, useEffect } from 'react';
import { Home, Trash2, ExternalLink, Calendar, Search, Loader2, Sword, LayoutGrid, Plus } from 'lucide-react';

interface SavedItem {
  id: string;
  name: string;
  cardCount: number;
  lastUpdated: string;
  type: 'cube' | 'deck';
}

interface CollectionProps {
  onBack: () => void;
  onSelectCube: (cubeData: any) => void;
  onSelectDeck: (deckData: any) => void;
  onCreateNewCube: () => void;
  onCreateNewDeck: () => void;
}

export const Collection = ({ onBack, onSelectCube, onSelectDeck, onCreateNewCube, onCreateNewDeck }: CollectionProps) => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'cube' | 'deck'>('cube');

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const cubeRes = await fetch(`${API_URL}/api/cubes`);
      let mappedCubes: SavedItem[] = [];
      if (cubeRes.ok) {
        const cubes = await cubeRes.json();
        mappedCubes = Array.isArray(cubes) ? cubes.map((c: any) => ({ ...c, type: 'cube' })) : [];
      }
      const deckRes = await fetch(`${API_URL}/api/decks`);
      let mappedDecks: SavedItem[] = [];
      if (deckRes.ok) {
        const decks = await deckRes.json();
        mappedDecks = Array.isArray(decks) ? decks.map((d: any) => ({ ...d, type: 'deck' })) : [];
      }
      setItems([...mappedCubes, ...mappedDecks]);
    } catch (e) {
      console.error('Error fetching collection:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoadItem = async (id: string, type: 'cube' | 'deck') => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const endpoint = type === 'cube' ? 'cubes' : 'decks';
      const res = await fetch(`${API_URL}/api/${endpoint}/${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (type === 'cube') onSelectCube(data); else onSelectDeck(data);
    } catch (e) {
      console.error(`Error loading ${type}:`, e);
      alert(`Error loading ${type === 'cube' ? 'cube' : 'deck'}`);
    }
  };

  const handleDeleteItem = async (id: string, name: string, type: 'cube' | 'deck') => {
    if (!window.confirm(`Are you sure you want to delete the ${type === 'cube' ? 'cube' : 'deck'} "${name}"? This action cannot be undone.`)) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const endpoint = type === 'cube' ? 'cubes' : 'decks';
      const res = await fetch(`${API_URL}/api/${endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(`Error deleting ${type}:`, e);
    }
  };

  const filteredItems = items.filter(item =>
    item.type === activeTab && (item.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-[clamp(1rem,4vw,3rem)] space-y-[clamp(2rem,6vh,4rem)] animate-in fade-in slide-in-from-bottom-6 duration-1000 selection:bg-indigo-500/30">

      {/* HEADER SECTION - Fluid proportions */}
      <div className="flex flex-col lg:flex-row items-center justify-between py-[clamp(2rem,6vh,4rem)] border-b border-white/5 gap-[clamp(2rem,4vw,4rem)]">
        <div className="flex items-center gap-[clamp(1.5rem,4vw,3rem)] w-full lg:w-auto">
          <button
            onClick={onBack}
            className="p-[clamp(1rem,2.5vw,1.5rem)] bg-slate-900/60 backdrop-blur-xl hover:bg-indigo-600 text-slate-500 hover:text-white rounded-[clamp(1rem,2vw,2rem)] border border-white/10 transition-all shadow-2xl group active:scale-95 shrink-0"
          >
            <Home className="w-[clamp(1.25rem,2vw,1.75rem)] h-[clamp(1.25rem,2vw,1.75rem)] group-hover:scale-110 transition-transform" />
          </button>
          <div className="space-y-[clamp(0.25rem,0.5vw,0.5rem)]">
            <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-black text-white uppercase tracking-tighter italic leading-none">
              Your <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]">Collection</span>
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-[clamp(1rem,2vw,2rem)] w-full lg:max-w-3xl">
          {/* SWITCHER TABS - Premium style */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/5 w-full sm:w-auto shadow-inner shrink-0">
            <button
              onClick={() => setActiveTab('cube')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'cube' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-y-[-2px]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid size={16} />
              Draft Cubes
            </button>
            <button
              onClick={() => setActiveTab('deck')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'deck' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 translate-y-[-2px]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Sword size={16} />
              Decks
            </button>
          </div>

          <div className="relative w-full group min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeTab === 'cube' ? 'a cube' : 'a deck'}...`}
              className="w-full bg-slate-900/40 backdrop-blur-md border border-white/5 text-white pl-12 pr-6 py-3 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-[clamp(5rem,15vh,10rem)] flex flex-col items-center justify-center space-y-6">
          <Loader2 className="w-[clamp(2.5rem,6vw,4rem)] h-[clamp(2.5rem,6vw,4rem)] text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Archive...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(1.5rem,3vw,2.5rem)]">
          {/* NEW ITEM CARD - Premium Design */}
          <button
            onClick={activeTab === 'cube' ? onCreateNewCube : onCreateNewDeck}
            className="group relative bg-slate-900/10 border-2 border-dashed border-white/10 rounded-[clamp(2rem,4vw,3.5rem)] p-[clamp(2rem,5vw,3rem)] hover:bg-slate-900/30 hover:border-indigo-500/40 transition-all duration-500 flex flex-col items-center justify-center gap-[clamp(1.5rem,3vh,2rem)] min-h-[clamp(250px,40vh,350px)] overflow-hidden shadow-xl"
          >
            <div className={`p-[clamp(1.5rem,3vw,2.5rem)] rounded-[clamp(1.5rem,2.5vw,2.5rem)] ${activeTab === 'cube' ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500' : 'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500'} group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-lg`}>
              <Plus className="w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)]" />
            </div>
            <div className="text-center space-y-[clamp(0.25rem,0.5vh,0.75rem)]">
              <h4 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black text-white uppercase tracking-tight italic group-hover:scale-105 transition-transform">
                New {activeTab === 'cube' ? ' Cube' : 'Deck'}
              </h4>
            </div>
          </button>

          {filteredItems.map(item => (
            <div
              key={item.id}
              className="group relative bg-slate-900/30 backdrop-blur-sm border border-white/5 rounded-[clamp(2rem,4vw,3.5rem)] p-[clamp(2rem,5vw,3rem)] hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all duration-500 shadow-3xl overflow-hidden hover:-translate-y-2"
            >
              <div className={`absolute top-0 right-0 w-[clamp(8rem,20vw,12rem)] h-[clamp(8rem,20vw,12rem)] ${item.type === 'cube' ? 'bg-indigo-500/5' : 'bg-violet-500/5'} rounded-full blur-3xl transition-colors group-hover:bg-opacity-20`} />

              <div className="relative space-y-[clamp(1.5rem,4vh,2.5rem)]">
                <div className="flex justify-between items-start">
                  <div className={`p-[clamp(1rem,2vw,1.25rem)] rounded-[clamp(1rem,1.5vw,1.5rem)] ${item.type === 'cube' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-violet-500/10 text-violet-400'} shadow-lg`}>
                    {item.type === 'cube' ? <LayoutGrid className="w-[clamp(1.25rem,2vw,1.5rem)] h-[clamp(1.25rem,2vw,1.5rem)]" /> : <Sword className="w-[clamp(1.25rem,2vw,1.5rem)] h-[clamp(1.25rem,2vw,1.5rem)]" />}
                  </div>
                  <div className="text-right">
                    <span className="text-[clamp(8px,1vw,10px)] font-black text-slate-600 uppercase tracking-widest block mb-1">Last Update</span>
                    <div className="flex items-center gap-2 text-slate-400 text-[clamp(10px,1.2vw,12px)] font-bold uppercase">
                      <Calendar className="w-3 h-3 text-indigo-500/50" />
                      {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '---'}
                    </div>
                  </div>
                </div>

                <div className="space-y-[clamp(0.5rem,1vh,1rem)]">
                  <h4 className={`text-[clamp(1.5rem,3.5vw,2.25rem)] font-black text-white uppercase tracking-tight transition-colors truncate italic ${item.type === 'cube' ? 'group-hover:text-indigo-400' : 'group-hover:text-violet-400'}`}>
                    {item.name}
                  </h4>
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-950/80 rounded-[clamp(0.5rem,1vw,0.75rem)] border border-white/5 shadow-inner">
                    <span className={`${item.type === 'cube' ? 'text-indigo-400' : 'text-violet-400'} font-black text-[clamp(14px,1.5vw,16px)]`}>{item.cardCount}</span>
                    <span className="text-[clamp(8px,1vw,10px)] font-black text-slate-500 uppercase tracking-widest">Cards</span>
                  </div>
                </div>

                <div className="pt-[clamp(1rem,3vh,2rem)] flex items-center gap-4">
                  <button
                    onClick={() => handleLoadItem(item.id, item.type)}
                    className={`flex-1 py-[clamp(0.75rem,2vh,1.25rem)] text-white rounded-[clamp(0.75rem,1.5vw,1.25rem)] font-black uppercase tracking-[0.2em] text-[clamp(9px,1vw,11px)] flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-105 active:scale-95 ${item.type === 'cube' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30' : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30'}`}
                  >
                    <ExternalLink className="w-[clamp(14px,1.5vw,18px)] h-[clamp(14px,1.5vw,18px)]" />
                    Show {item.type === 'cube' ? 'Cube' : 'Deck'}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name, item.type)}
                    className="p-[clamp(0.75rem,2vh,1.25rem)] bg-slate-800/40 hover:bg-red-500/20 text-slate-600 hover:text-red-500 rounded-[clamp(0.75rem,1.5vw,1.25rem)] transition-all border border-white/5 hover:border-red-500/40 shadow-xl active:scale-95"
                  >
                    <Trash2 className="w-[clamp(14px,1.5vw,18px)] h-[clamp(14px,1.5vw,18px)]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
