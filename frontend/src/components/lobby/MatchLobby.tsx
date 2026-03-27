import { Play, X, Copy, CheckCircle2, Loader2, UserX, Pencil, Swords, BookOpen, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../../store/useDraftStore';

interface Player {
  id: string;
  playerId: string;
  name: string;
  avatar?: string;
  online?: boolean;
}

interface MatchLobbyProps {
  roomCode: string;
  players: Player[];
  rules: any;
  isHost: boolean;
  onStart: () => void;
  onClose?: () => void;
  onKick: (playerId: string) => void;
  onChangeAvatar: (avatar: string) => void;
}

export const MatchLobby = ({ 
  roomCode, 
  players, 
  isHost, 
  onStart, 
  onClose,
  onKick,
  onChangeAvatar
}: MatchLobbyProps) => {
  const { avatarList, wallpaperList, fetchAssets, playerId: PLAYER_ID_STORE, selectDeck, selectedDeck } = useDraftStore();
  const PLAYER_ID = PLAYER_ID_STORE;
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [deckSelectorOpen, setDeckSelectorOpen] = useState(false);
  const [savedDecks, setSavedDecks] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>('');

  useEffect(() => {
    // Load decks from Backend API
    const fetchDecks = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const res = await fetch(`${API_URL}/api/decks`);
        if (res.ok) {
          const decks = await res.json();
          setSavedDecks(decks);
        }
      } catch (err) {
        console.error('Error fetching decks in lobby:', err);
      }
    };

    fetchDecks();
    if (avatarList.length === 0 || wallpaperList.length === 0) fetchAssets();
  }, [avatarList, wallpaperList, fetchAssets]);

  useEffect(() => {
    if (wallpaperList.length > 0 && !wallpaper) {
      const wpUrl = `/wallpapers/${wallpaperList[Math.floor(Math.random() * wallpaperList.length)]}`;
      setWallpaper(wpUrl);
      const img = new Image();
      img.src = wpUrl;
      img.onload = () => setIsLoaded(true);
    }
  }, [wallpaperList, wallpaper]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const opponent = players.find(p => p.playerId !== PLAYER_ID);
  const me = players.find(p => p.playerId === PLAYER_ID);

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* BACKGROUND AREA */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'} bg-slate-950 z-[4]`} />
        {wallpaper && (
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${isLoaded ? 'opacity-40 scale-100' : 'opacity-0 scale-110'} z-[2]`}
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950 z-[3]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col gap-12">
        
        {/* HEADER: ROOM CODE & STATUS */}
        <div className="flex flex-col items-center gap-4">
           <div className="flex items-center gap-4 px-8 py-4 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Codice Match</span>
              <div className="h-4 w-px bg-white/10" />
              <button onClick={handleCopy} className="flex items-center gap-3 group">
                 <span className="text-4xl font-black text-white italic tracking-tighter transition-all group-hover:text-indigo-400">{roomCode}</span>
                 {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />}
              </button>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <Swords className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Attesa Concorrenti</span>
           </div>
        </div>

        {/* VERSUS LAYOUT */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative">
           
           {/* PLAYER 1 (ME) */}
           <div className="flex flex-col items-center gap-6 group">
              <div 
                onClick={() => setSelectorOpen(true)}
                className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-[3rem] p-2 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-all cursor-pointer"
              >
                 <div className="w-full h-full bg-slate-950 rounded-[2.6rem] overflow-hidden relative border-4 border-slate-950/50">
                    <img src={`/avatars/${me?.avatar || 'ajani.png'}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Pencil className="w-12 h-12 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                    </div>
                 </div>
                 <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full border-8 border-[#020617] shadow-xl animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                 <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{me?.name}</span>
                 <div className="flex items-center gap-2">
                    <div className="px-4 py-1.5 bg-indigo-600 rounded-full border border-indigo-400/50 shadow-lg">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">TU</span>
                    </div>
                    {selectedDeck && (
                       <div className="px-4 py-1.5 bg-emerald-600/20 rounded-full border border-emerald-500/30 flex items-center gap-2 animate-in zoom-in-90">
                          <BookOpen className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{selectedDeck.name}</span>
                       </div>
                    )}
                 </div>
                 <button 
                   onClick={() => setDeckSelectorOpen(true)}
                   className="mt-4 px-6 py-3 bg-slate-900 border border-white/10 hover:border-indigo-500 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-2"
                 >
                    <BookOpen className="w-4 h-4" /> {selectedDeck ? 'Cambia Mazzo' : 'Seleziona Mazzo'}
                 </button>
              </div>
           </div>

           {/* VS DECORATION */}
           <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl lg:text-[12rem] font-black text-white/5 italic select-none pointer-events-none">VS</div>
              <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full border-2 border-white/5 flex items-center justify-center backdrop-blur-md shadow-2xl relative z-10 bg-slate-900/50">
                 <Swords className="w-8 h-8 lg:w-12 lg:h-12 text-white animate-bounce-slow" />
              </div>
           </div>

           {/* PLAYER 2 (OPPONENT) */}
           <div className="flex flex-col items-center gap-6 group">
              {opponent ? (
                 <div className="relative">
                    <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-[3rem] p-2 bg-slate-800 shadow-2xl transition-all">
                       <div className="w-full h-full bg-slate-950 rounded-[2.6rem] overflow-hidden relative border-4 border-slate-950/50 text-center flex flex-col items-center justify-center gap-2">
                          <img src={`/avatars/${opponent.avatar || 'ajani.png'}`} className="w-full h-full object-cover" />
                       </div>
                       <div className={`absolute -bottom-4 -right-4 w-12 h-12 ${opponent.online ? 'bg-emerald-500 opacity-100 animate-pulse' : 'bg-slate-600 opacity-50'} rounded-full border-8 border-[#020617] shadow-xl`} />
                    </div>
                    {isHost && (
                      <button 
                        onClick={() => onKick(opponent.playerId)}
                        className="absolute -top-4 -right-4 p-4 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-2xl shadow-red-600/40 active:scale-95 transition-all group/kick"
                      >
                         <UserX className="w-6 h-6" />
                      </button>
                    )}
                 </div>
              ) : (
                 <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-[3rem] border-4 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5 animate-pulse">
                    <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center px-8">In attesa dello sfidante...</span>
                 </div>
              )}
              <div className="flex flex-col items-center gap-2">
                 <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{opponent?.name || '---'}</span>
                 <div className="flex items-center gap-2">
                    <div className="px-4 py-1.5 bg-slate-800 rounded-full border border-white/10">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AVVERSARIO</span>
                    </div>
                    {(opponent as any)?.deck && (
                       <div className="px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30 flex items-center gap-2">
                          <Check className="w-3 h-3 text-indigo-400" />
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pronto</span>
                       </div>
                    )}
                 </div>
              </div>
           </div>

        </div>

        {/* HOST CONTROLS */}
        <div className="mt-8 flex flex-col items-center gap-6">
           {isHost ? (
              <div className="flex items-center gap-6">
                 <button 
                   onClick={onClose}
                   className="px-10 py-5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-3xl border border-red-500/20 font-black uppercase tracking-widest transition-all active:scale-95"
                 >
                   Chiudi Stanza
                 </button>
                 <button 
                   disabled={players.length < 2 || !selectedDeck || !(opponent as any)?.deck}
                   onClick={onStart}
                   className="px-20 py-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xl shadow-2xl shadow-emerald-500/20 flex items-center gap-4 transition-all active:scale-95 disabled:scale-100"
                 >
                   Inizia Match <Play className="w-6 h-6 fill-current" />
                 </button>
              </div>
           ) : (
              <div className="bg-white/5 backdrop-blur-xl px-12 py-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl animate-pulse">
                 <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                 <span className="text-lg font-black text-indigo-400 uppercase tracking-widest italic">
                    {!selectedDeck ? 'Seleziona un mazzo per iniziare...' : 'In attesa dell\'Host per iniziare...'}
                 </span>
              </div>
           )}
        </div>

      </div>

      {/* DECK SELECTOR */}
      <AnimatePresence>
        {deckSelectorOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeckSelectorOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-8 shrink-0">
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">I Tuoi <span className="text-indigo-500">Mazzi</span></h3>
                   <button onClick={() => setDeckSelectorOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                   {savedDecks.length === 0 ? (
                      <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Nessun mazzo trovato</span>
                      </div>
                   ) : (
                      savedDecks.map((deck, i) => (
                         <button 
                           key={i}                            onClick={async () => { 
                               try {
                                 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
                                 const res = await fetch(`${API_URL}/api/decks/${deck.id}`);
                                 const fullDeck = await res.json();
                                 selectDeck(fullDeck); 
                                 setDeckSelectorOpen(false); 
                               } catch (err) {
                                 console.error("Errore nel caricamento del mazzo:", err);
                               }
                            }}
                           className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between group ${selectedDeck?.name === deck.name ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-slate-950 border-white/5 hover:border-indigo-500/50'}`}
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedDeck?.name === deck.name ? 'bg-indigo-400/30' : 'bg-slate-900'}`}>
                                  <BookOpen className={`w-6 h-6 ${selectedDeck?.name === deck.name ? 'text-white' : 'text-slate-600 group-hover:text-indigo-400'}`} />
                               </div>
                               <div className="flex flex-col items-start gap-1">
                                  <span className={`text-lg font-black uppercase italic tracking-tight ${selectedDeck?.name === deck.name ? 'text-white' : 'text-slate-300'}`}>{deck.name}</span>
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDeck?.name === deck.name ? 'text-indigo-200' : 'text-slate-600'}`}>{deck.cardCount || deck.cards?.length || deck.mainEntry?.length || 0} CARTE</span>
                               </div>
                            </div>
                            {selectedDeck?.name === deck.name && <Check className="w-6 h-6 text-white" />}
                         </button>
                      ))
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AVATAR SELECTOR */}
      <AnimatePresence>
        {selectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
               onClick={() => setSelectorOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3rem] p-12 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
             >
                <div className="flex justify-between items-center mb-10 shrink-0">
                   <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Scegli il tuo <span className="text-indigo-500">Avatar</span></h3>
                   <button onClick={() => setSelectorOpen(false)} className="p-4 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-colors">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar lg:grid lg:grid-cols-6 lg:gap-6 flex flex-wrap justify-center gap-4">
                   {avatarList.map((avatar, i) => (
                      <button 
                        key={i} 
                        onClick={() => { onChangeAvatar(avatar); setSelectorOpen(false); }}
                        className="group relative w-24 h-24 lg:w-full lg:aspect-square bg-slate-950 rounded-2xl border-4 border-transparent hover:border-indigo-500 transition-all overflow-hidden"
                      >
                         <img src={`/avatars/${avatar}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                         <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5px) rotate(5deg); }
          50% { transform: translateY(5px) rotate(-5deg); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};
