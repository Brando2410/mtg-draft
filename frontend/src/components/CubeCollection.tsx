import { useState, useEffect } from 'react';
import { Home, Database, Trash2, ExternalLink, Calendar, Layers, Search, Loader2 } from 'lucide-react';

interface SavedCube {
  id: string;
  name: string;
  cardCount: number;
  lastUpdated: string;
}

interface CubeCollectionProps {
  onBack: () => void;
  onSelectCube: (cubeData: any) => void;
}

export const CubeCollection = ({ onBack, onSelectCube }: CubeCollectionProps) => {
  const [cubes, setCubes] = useState<SavedCube[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCubes = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/cubes`);
      const data = await res.json();
      setCubes(data);
    } catch (e) {
      console.error('Error fetching cubes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCubes();
  }, []);

  const handleLoadCube = async (id: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/cubes/${id}`);
      const data = await res.json();
      onSelectCube(data);
    } catch (e) {
      console.error('Error loading cube:', e);
    }
  };

  const handleDeleteCube = async (id: string, name: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il cubo "${name}"? L'azione è irreversibile.`)) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_URL}/api/cubes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCubes();
    } catch (e) {
      console.error('Error deleting cube:', e);
    }
  };

  const filteredCubes = cubes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
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
              Collezione <span className="text-indigo-500">Cubes</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Gestisci i tuoi progetti salvati sul server</p>
          </div>
        </div>

        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca un cubo..."
            className="w-full bg-slate-900/50 border border-white/5 text-white pl-12 pr-6 py-4 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">Caricamento database...</p>
        </div>
      ) : cubes.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-slate-900/50 rounded-[3rem] border border-white/5 flex items-center justify-center">
            <Database className="w-10 h-10 text-slate-700" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Nessun Cubo Trovato</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">Non hai ancora salvato nessun cubo sul server. Vai nel Builder per iniziare il tuo primo progetto!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCubes.map(cube => (
            <div 
              key={cube.id}
              className="group relative bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-8 hover:bg-slate-900/50 hover:border-indigo-500/20 transition-all duration-500 shadow-xl overflow-hidden"
            >
              {/* Sfondo Astratto Card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="relative space-y-6">
                <div className="flex justify-between items-start">
                  <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Last Sync</span>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Calendar className="w-3 h-3" />
                      {new Date(cube.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">{cube.name}</h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/50 rounded-lg border border-white/5">
                    <span className="text-indigo-400 font-black text-sm">{cube.cardCount}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Carte Totali</span>
                  </div>
                </div>

                <div className="pt-6 flex items-center gap-3">
                  <button 
                    onClick={() => handleLoadCube(cube.id)}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Carica Cubo
                  </button>
                  <button 
                    onClick={() => handleDeleteCube(cube.id, cube.name)}
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
