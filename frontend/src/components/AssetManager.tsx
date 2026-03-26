import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Image as ImageIcon, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDraftStore } from '../store/useDraftStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AssetManagerProps {
  onClose: () => void;
}

export const AssetManager = ({ onClose }: AssetManagerProps) => {
  const { avatarList, wallpaperList, fetchAssets } = useDraftStore();
  const [activeTab, setActiveTab] = useState<'avatars' | 'wallpapers'>('avatars');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assets = activeTab === 'avatars' ? avatarList : wallpaperList;

  useEffect(() => {
    const refresh = async () => {
      setLoading(true);
      await fetchAssets();
      setLoading(false);
    };
    refresh();
  }, [activeTab, fetchAssets]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/api/assets/${activeTab}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchAssets();
      } else {
        const err = await response.json();
        alert(`Errore: ${err.error}`);
      }
    } catch (err) {
      console.error('Errore upload:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Sei sicuro di voler eliminare ${filename}?`)) return;

    try {
      const response = await fetch(`${API_BASE}/api/assets/${activeTab}/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAssets();
      }
    } catch (err) {
      console.error('Errore eliminazione:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full h-full sm:h-auto sm:max-h-[90vh] lg:max-w-4xl bg-slate-900 border border-white/10 sm:rounded-[2.5rem] portrait:sm:rounded-[4rem] p-4 portrait:p-8 sm:p-12 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header - Più compatto su schermi piccoli */}
        <div className="flex justify-between items-center mb-6 portrait:mb-8 sm:mb-8 shrink-0">
          <div>
            <h3 className="text-xl portrait:text-4xl sm:text-3xl lg:text-3xl font-black text-white uppercase italic tracking-tighter">
              Gestione <span className="text-indigo-500">Asset</span>
            </h3>
            <p className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Libreria Multimediale</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 portrait:p-4 sm:p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl sm:rounded-2xl transition-all shadow-xl active:scale-95"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Layout Condizionale: Sidebar SOLO su mobile landscape (max-lg), sopra i 1024px rimane standard */}
        <div className="flex flex-col landscape:max-lg:flex-row landscape:max-lg:gap-4 flex-1 min-h-0">
          
          <div className="flex flex-col gap-4 portrait:gap-6 shrink-0 landscape:max-lg:w-48">
            {/* Tabs */}
            <div className="flex landscape:max-lg:flex-col gap-2 p-1 bg-slate-950/50 rounded-2xl mb-2 lg:mb-8 shrink-0">
              <button
                onClick={() => setActiveTab('avatars')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 portrait:py-4 sm:py-3 rounded-xl transition-all font-black uppercase tracking-widest text-[9px] sm:text-xs ${activeTab === 'avatars' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Avatar
              </button>
              <button
                onClick={() => setActiveTab('wallpapers')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 portrait:py-4 sm:py-3 rounded-xl transition-all font-black uppercase tracking-widest text-[9px] sm:text-xs ${activeTab === 'wallpapers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Wallpapers
              </button>
            </div>

            {/* Actions: Compatte su mobile, standard su desktop */}
            <div className="mb-4 landscape:max-lg:mb-0 portrait:mb-6 flex justify-between items-center bg-white/5 border border-white/5 p-3 portrait:p-4 rounded-2xl shrink-0 landscape:max-lg:flex-col landscape:max-lg:gap-3 landscape:max-lg:items-stretch">
              <span className="text-[7px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{assets.length} Elementi</span>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 px-4 portrait:px-8 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] sm:text-xs transition-all shadow-xl active:scale-95"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span className="landscape:max-lg:hidden">Nuovo</span>
                <span className="hidden landscape:max-lg:inline">Upload</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Caricamento in corso...</span>
              </div>
            ) : (
            <div className={`grid ${activeTab === 'avatars' ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5' : 'grid-cols-2 portrait:grid-cols-2 sm:grid-cols-2 md:grid-cols-3'} gap-2 portrait:gap-4 sm:gap-4`}>
                {assets.map((asset) => (
                  <div 
                    key={asset} 
                    className="group relative aspect-square rounded-xl portrait:rounded-2xl overflow-hidden border border-white/5 bg-slate-950 shadow-lg"
                  >
                    <img 
                      src={`/${activeTab}/${asset}`} 
                      alt={asset} 
                      className={`w-full h-full object-cover transition-all group-hover:scale-110 group-hover:opacity-60`} 
                    />
                    
                    {/* Control buttons - Migliorati per il touch su mobile */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(asset)}
                        className="p-2 portrait:p-4 sm:p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-2xl transition-all active:scale-90"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4 portrait:w-6 portrait:h-6 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    
                    {/* Filename badge */}
                    <div className="absolute bottom-1 left-1 right-1 p-1 portrait:p-2 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/5 truncate">
                      <span className="text-[5px] portrait:text-[8px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter block truncate">{asset}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && assets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 opacity-50 text-center">
                 <ImageIcon className="w-12 h-12 mb-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest px-10">Nessun file trovato in questa categoria</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
