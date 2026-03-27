import { Users, Info, Play, X, Copy, CheckCircle2, Loader2, UserX, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../../store/useDraftStore';

interface Player {
  id: string;
  playerId: string;
  name: string;
  avatar?: string;
  online?: boolean;
  isBot?: boolean;
}

interface DraftLobbyProps {
  roomCode: string;
  players: Player[];
  rules: any;
  isHost: boolean;
  onStart: () => void;
  onClose?: () => void;
  onKick: (playerId: string) => void;
  onChangeAvatar: (avatar: string) => void;
  onAddBot?: () => void;
}

export const DraftLobby = ({ 
  roomCode, 
  players, 
  rules, 
  isHost, 
  onStart, 
  onClose,
  onKick,
  onChangeAvatar,
  onAddBot
}: DraftLobbyProps) => {
  const { avatarList, wallpaperList, fetchAssets, playerId: PLAYER_ID_STORE } = useDraftStore();
  const PLAYER_ID = PLAYER_ID_STORE;
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      if (wallpaperList.length === 0 || avatarList.length === 0) {
        await fetchAssets();
      }
    };
    init();
  }, []);

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

  const currentPlayers = players.length;
  const targetPlayers = rules.playerCount || 8;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-2 portrait:p-6 lg:p-12 overflow-hidden custom-scrollbar">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'} bg-slate-950 z-[4]`} />
        {wallpaper && (
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${isLoaded ? 'opacity-40 scale-100' : 'opacity-0 scale-110'} z-[2]`}
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950 z-[3]" />
      </div>

      <div className="relative flex-1 flex flex-col min-h-0 max-w-7xl mx-auto w-full gap-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col landscape:flex-row lg:flex-row items-center justify-between gap-6 bg-slate-900/60 p-4 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shrink-0">
           <div className="flex items-center gap-4 lg:w-1/3">
              <div className="flex flex-col">
                 <h1 className="text-2xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Stanza <span className="text-indigo-500">Draft</span>
                 </h1>
                 <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">
                    {rules.cubeName || 'Cubo Draft'}
                 </p>
              </div>
              <div className="hidden lg:flex items-center justify-center gap-2 bg-indigo-600 px-4 h-[50px] rounded-full border border-indigo-400/30 shadow-lg">
                 <Users className="w-4 h-4 text-white" />
                 <span className="text-xs font-black text-white">{currentPlayers}/{targetPlayers}</span>
              </div>
           </div>

           <div className="flex items-center gap-3 lg:w-1/4 justify-center">
              <div className="flex items-center gap-3 bg-slate-950/60 px-6 h-[50px] rounded-xl border border-white/20 shadow-xl overflow-hidden">
                 <span className="text-xl font-black text-white tracking-[0.1em] font-mono italic">{roomCode}</span>
                 <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                 </button>
              </div>
           </div>

           <div className="flex items-center gap-3 justify-end lg:flex-1 shrink-0">
              <button 
                onClick={() => setRulesOpen(true)}
                className="px-6 h-[50px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-white/5 transition-all active:scale-95 flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Regole</span>
              </button>

              <div className="h-8 w-px bg-white/10 mx-1" />

              {isHost ? (
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    disabled={currentPlayers < 2}
                    onClick={onStart}
                    className="px-10 h-[50px] bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                  >
                    AVVIA DRAFT <Play className="w-4 h-4 fill-current" />
                  </button>

                  <button 
                    onClick={onClose}
                    className="w-[50px] h-[50px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-indigo-600/10 px-6 py-4 rounded-2xl border border-indigo-500/20">
                   <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                   <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">In attesa dell'Host</span>
                </div>
              )}
           </div>
        </div>

        {/* PLAYERS GRID */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-10">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 content-start">
              {players.map(player => (
                <div 
                  key={player.id} 
                  onClick={player.playerId === PLAYER_ID ? () => setSelectorOpen(true) : undefined}
                  className={`group relative flex items-center bg-slate-900/60 backdrop-blur-md p-4 rounded-[2.5rem] border transition-all ${player.playerId === PLAYER_ID ? 'border-indigo-500/50 bg-indigo-500/10 shadow-xl cursor-pointer hover:border-indigo-500 active:scale-95' : 'border-white/5 hover:border-white/10'}`}
                >
                   <div className="relative w-20 h-20 bg-slate-950 rounded-2xl border border-white/5 overflow-hidden shrink-0">
                      <img src={`/avatars/${player.avatar || 'ajani.png'}`} className="w-full h-full object-cover" />
                      {player.playerId === PLAYER_ID && (
                         <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Pencil className="w-6 h-6 text-white" />
                         </div>
                      )}
                      <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border border-slate-900 shadow-xl ${player.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                   </div>
                   
                   <div className="ml-5 flex-1 min-w-0">
                       <div className="flex flex-col gap-1.5">
                          <span className={`text-lg font-black uppercase tracking-tight leading-none ${player.playerId === PLAYER_ID ? 'text-white' : 'text-slate-200'}`}>{player.name}</span>
                          <div className="flex items-center gap-2">
                             {player.playerId === PLAYER_ID && <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase border border-indigo-400/30 shadow-lg">TU</span>}
                             {player.id === players[0].id && <span className="bg-amber-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase border border-amber-500/30 shadow-lg">HOST</span>}
                          </div>
                       </div>
                   </div>

                   {isHost && player.playerId !== PLAYER_ID && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); onKick(player.playerId); }}
                       className="opacity-0 group-hover:opacity-100 p-2 bg-slate-950 border border-red-500/50 hover:bg-red-600 text-red-500 hover:text-white rounded-full transition-all absolute top-2 right-2 z-30 shadow-xl flex items-center justify-center"
                     >
                        <UserX className="w-4 h-4" />
                     </button>
                   )}
                </div>
              ))}

              {Array.from({ length: Math.max(0, targetPlayers - currentPlayers) }).map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  onClick={isHost && onAddBot ? onAddBot : undefined}
                  className={`flex items-center p-4 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-slate-900/20 group transition-all relative ${isHost ? 'cursor-pointer hover:bg-slate-950/40 hover:border-indigo-500/30' : ''}`}
                >
                   <div className="relative w-20 h-20 bg-slate-950/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Users className="w-8 h-8 text-slate-800" />
                   </div>
                   <div className="ml-5 flex flex-col items-start gap-1">
                      {isHost && onAddBot && (
                         <span className="text-[10px] font-black text-indigo-400 group-hover:text-indigo-300 uppercase tracking-widest transition-colors">+ AGGIUNGI BOT</span>
                      )}
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">In Attesa...</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* RULES MODAL */}
      <AnimatePresence>
        {rulesOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRulesOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8 shrink-0">
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Regole <span className="text-indigo-500">Draft</span></h3>
                   <button onClick={() => setRulesOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="space-y-4">
                   {[
                     { label: 'Packs/Player', value: rules.packsPerPlayer },
                     { label: 'Cards/Pack', value: rules.cardsPerPack },
                     { label: 'Pick Timer', value: rules.timer ? `${rules.timer}s` : 'OFF' },
                     { label: 'Rarity Balance', value: rules.rarityBalance ? 'ATTIVO' : 'OFF' }
                   ].map((rule, i) => (
                     <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{rule.label}</span>
                        <span className="text-sm font-black uppercase text-white">{rule.value}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AVATAR SELECTOR */}
      <AnimatePresence>
        {selectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectorOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3rem] p-12 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Scegli il tuo <span className="text-indigo-500">Avatar</span></h3>
                   <button onClick={() => setSelectorOpen(false)} className="p-4 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-colors">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar grid grid-cols-6 gap-6">
                   {avatarList.map((avatar, i) => (
                      <button 
                        key={i} 
                        onClick={() => { onChangeAvatar(avatar); setSelectorOpen(false); }}
                        className="group relative aspect-square bg-slate-950 rounded-2xl border-4 border-transparent hover:border-indigo-500 transition-all overflow-hidden"
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};
