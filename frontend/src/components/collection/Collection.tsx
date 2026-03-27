import { useState, useEffect } from 'react';
import { Home, Database, Trash2, ExternalLink, Calendar, Search, Loader2, Sword, LayoutGrid, Plus } from 'lucide-react';

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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      // Fetch cubes
      const cubeRes = await fetch(`${API_URL}/api/cubes`);
      const cubes = await cubeRes.json();
      const mappedCubes = Array.isArray(cubes) ? cubes.map((c: any) => ({ ...c, type: 'cube' })) : [];

      // Fetch decks
      const deckRes = await fetch(`${API_URL}/api/decks`);
      const decks = await deckRes.json();
      const mappedDecks = Array.isArray(decks) ? decks.map((d: any) => ({ ...d, type: 'deck' })) : [];

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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const endpoint = type === 'cube' ? 'cubes' : 'decks';
      const res = await fetch(`${API_URL}/api/${endpoint}/${id}`);
      const data = await res.json();
      
      if (type === 'cube') {
        onSelectCube(data);
      } else {
        onSelectDeck(data);
      }
    } catch (e) {
      console.error(`Error loading ${type}:`, e);
    }
  };

  const handleDeleteItem = async (id: string, name: string, type: 'cube' | 'deck') => {
    if (!window.confirm(`Sei sicuro di voler eliminare ${type === 'cube' ? 'il cubo' : 'il mazzo'} "${name}"? L'azione è irreversibile.`)) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const endpoint = type === 'cube' ? 'cubes' : 'decks';
      const res = await fetch(`${API_URL}/api/${endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(`Error deleting ${type}:`, e);
    }
  };

  const filteredItems = items.filter(item => 
    item.type === activeTab &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between py-10 border-b border-indigo-500/10 gap-8">
        <div className="flex items-center gap-8">
          <button 
            onClick={onBack}
            className="p-4 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-3xl border border-white/5 transition-all shadow-2xl group active:scale-95"
          >
            <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter italic opacity-80">
              La tua <span className="text-indigo-500">Collezione</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Cubi per il draft e Mazzi pronti alla battaglia</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:max-w-xl">
           {/* SWITCHER TABS */}
           <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('cube')}
                className={`flex-1 sm:flex-none flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'cube' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                Cube
              </button>
              <button 
                onClick={() => setActiveTab('deck')}
                className={`flex-1 sm:flex-none flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'deck' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Sword className="w-4 h-4" />
                Mazzi
              </button>
           </div>

          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cerca ${activeTab === 'cube' ? 'un cubo' : 'un mazzo'}...`}
              className="w-full bg-slate-900/50 border border-white/5 text-white pl-12 pr-6 py-4 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">Sincronizzazione archivio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* NEW ITEM CARD */}
          <button 
            onClick={activeTab === 'cube' ? onCreateNewCube : onCreateNewDeck}
            className="group relative bg-slate-900/10 border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 hover:bg-slate-900/30 hover:border-indigo-500/30 transition-all duration-500 flex flex-col items-center justify-center gap-6 min-h-[300px]"
          >
            <div className={`p-6 rounded-3xl ${activeTab === 'cube' ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500' : 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500'} group-hover:text-white transition-all duration-500`}>
              <Plus className="w-10 h-10" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-2xl font-black text-white uppercase tracking-tight italic">
                Crea {activeTab === 'cube' ? 'Nuovo Cubo' : 'Nuovo Mazzo'}
              </h4>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                {activeTab === 'cube' ? 'Inizia un nuovo progetto draft' : 'Componi una strategia micidiale'}
              </p>
            </div>
          </button>

          {filteredItems.map(item => (
            <div 
              key={item.id}
              className="group relative bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-8 hover:bg-slate-900/50 hover:border-indigo-500/20 transition-all duration-500 shadow-xl overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${item.type === 'cube' ? 'bg-indigo-500/5' : 'bg-purple-500/5'} rounded-full blur-3xl transition-colors`} />
              
              <div className="relative space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${item.type === 'cube' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-purple-500/10 text-purple-500'}`}>
                    {item.type === 'cube' ? <LayoutGrid className="w-6 h-6" /> : <Sword className="w-6 h-6" />}
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Ultima Modifica</span>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Calendar className="w-3 h-3" />
                      {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '---'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className={`text-2xl font-black text-white uppercase tracking-tight transition-colors truncate ${item.type === 'cube' ? 'group-hover:text-indigo-400' : 'group-hover:text-purple-400'}`}>
                    {item.name}
                  </h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/50 rounded-lg border border-white/5">
                    <span className={`${item.type === 'cube' ? 'text-indigo-400' : 'text-purple-400'} font-black text-sm`}>{item.cardCount}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Carte</span>
                  </div>
                </div>

                <div className="pt-6 flex items-center gap-3">
                  <button 
                    onClick={() => handleLoadItem(item.id, item.type)}
                    className={`flex-1 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg ${item.type === 'cube' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visualizza {item.type === 'cube' ? 'Cubo' : 'Mazzo'}
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id, item.name, item.type)}
                    className="p-4 bg-slate-800/50 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
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
