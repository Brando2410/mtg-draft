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
      const randomWallpaper = wallpaperList[Math.floor(Math.random() * wallpaperList.length)];
      const wpUrl = `/wallpapers/${randomWallpaper}`;
      setWallpaper(wpUrl);
      
      const img = new Image();
      img.src = wpUrl;
      img.onload = () => setIsLoaded(true);
    }
  }, [wallpaperList, wallpaper]);
  
  const me = players.find(p => p.playerId === PLAYER_ID);
  const targetPlayers = rules.playerCount || 8;
  const currentPlayers = players.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const takenAvatars = players.map(p => p.avatar).filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-2 portrait:p-6 lg:p-12 overflow-hidden custom-scrollbar">
      
      {/* Sfondo: Nero solido finché non carica, poi l'immagine scelta */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'} bg-slate-950 z-[4]`} />
        
        {wallpaper && (
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} z-[2]`}
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}
        {/* Overlay per Leggibilità */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950 z-[1]" />
        
        {/* Effetto Glow Ambientale */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent z-[2]" />
      </div>

      <div className="relative flex-1 flex flex-col min-h-0 max-w-7xl mx-auto w-full gap-4 portrait:gap-8 lg:gap-12">
        
        {/* Header Section - Modern & Compact */}
        <div className="flex flex-col landscape:flex-row lg:flex-row items-center justify-between gap-2 portrait:gap-6 bg-slate-900/60 p-2 portrait:p-6 landscape:p-3 rounded-2xl portrait:rounded-[3rem] landscape:rounded-[2rem] border border-white/5 backdrop-blur-xl shrink-0">
                     {/* Left: Title & Count */}
           <div className="flex items-center gap-3 portrait:gap-4 lg:w-1/3 px-2 shrink-0">
              <div className="flex flex-col">
                 <h1 className="text-sm sm:text-lg portrait:text-2xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Stanza <span className="text-indigo-500">Draft</span>
                 </h1>
                 <p className="hidden sm:block text-[6px] portrait:text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-[0.2em] portrait:tracking-[0.3em] mt-0.5 portrait:mt-2 line-clamp-1">
                    {rules.cubeName || 'Cubo Draft'}
                 </p>
              </div>              {/* Counter moved here for more space in center */}
              <div className="hidden lg:flex items-center justify-center gap-2 bg-indigo-600 px-4 lg:h-[50px] rounded-full border border-indigo-400/30 shadow-lg shadow-indigo-600/20 shrink-0">
                 <Users className="w-4 h-4 text-white" />
                 <span className="text-xs font-black text-white">{currentPlayers}/{targetPlayers}</span>
              </div>
           </div>

           {/* Center: Code */}
           <div className="flex items-center gap-2 portrait:gap-3 lg:w-1/4 justify-center shrink-0">
              <div className="flex items-center gap-2 portrait:gap-3 bg-slate-950/60 px-2 portrait:px-4 py-1 portrait:py-2.5 lg:px-6 lg:h-[50px] rounded-lg portrait:rounded-xl border border-white/20 shadow-xl overflow-hidden">
                 <div className="flex flex-col items-center justify-center border-r border-white/10 pr-2 portrait:pr-3 lg:pr-5 h-full">
                    <span className="text-sm portrait:text-lg lg:text-xl font-black text-white tracking-[0.1em] portrait:tracking-[0.1em] font-mono italic leading-none">{roomCode}</span>
                 </div>
                 <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors p-1 lg:ml-2">
                    {copied ? <CheckCircle2 className="w-3 h-3 portrait:w-4 portrait:h-4 lg:w-4 lg:h-4 text-emerald-400" /> : <Copy className="w-3 h-3 portrait:w-4 portrait:h-4 lg:w-4 lg:h-4" />}
                 </button>
              </div>
              
              {/* Mobile Counter */}
              <div className="lg:hidden flex items-center gap-2 bg-indigo-600 px-2 portrait:px-4 py-1.5 portrait:py-2.5 rounded-lg portrait:rounded-xl border border-indigo-400/30 shadow-lg">
                 <Users className="w-3 h-3 portrait:w-4 h-4 text-white" />
                 <span className="text-xs portrait:text-lg font-black text-white leading-none">{currentPlayers}/{targetPlayers}</span>
              </div>
           </div>

           {/* Right Actions: Rules / Start / Exit */}
           <div className="flex items-center gap-3 portrait:gap-3 justify-end lg:flex-1 shrink-0">
              <button 
                onClick={() => setRulesOpen(true)}
                className="p-1.5 portrait:px-4 portrait:py-3 lg:px-6 lg:h-[50px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg portrait:rounded-xl border border-white/5 transition-all active:scale-95 shadow-lg flex items-center gap-2"
              >
                <Info className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline portrait:hidden text-[8px] lg:text-xs font-black uppercase tracking-widest">Regole</span>
              </button>

              <div className="h-6 portrait:h-8 lg:h-8 w-px bg-white/10 mx-0.5" />

              {isHost ? (
                <div className="flex items-center gap-2 portrait:gap-3 shrink-0">
                   <button 
                    disabled={currentPlayers < 2}
                    onClick={onStart}
                    className="min-w-[60px] sm:min-w-[80px] portrait:min-w-[100px] px-2 portrait:px-6 portrait:py-3 lg:px-10 lg:h-[50px] bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg portrait:rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[8px] portrait:text-[11px] lg:text-xs flex items-center justify-center gap-1 portrait:gap-2 transition-all shadow-xl active:scale-95"
                  >
                    {rules.isNormalMatch ? 'INIZIA MATCH' : 'AVVIA'} <Play className="w-2 h-2 portrait:w-3.5 h-3.5 lg:w-4 h-4 fill-current" />
                  </button>

                  <button 
                    onClick={onClose}
                    className="p-1.5 portrait:px-3 portrait:py-3 lg:w-[50px] lg:h-[50px] bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg portrait:rounded-xl border border-red-500/20 transition-all active:scale-95 flex items-center justify-center group"
                  >
                    <X className="w-3.5 h-3.5 portrait:w-5 portrait:h-5 lg:w-4 lg:h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 lg:gap-3 bg-indigo-600/10 px-2 lg:px-6 lg:py-4 rounded-lg lg:rounded-2xl border border-indigo-500/20">
                   <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 text-indigo-500 animate-spin" />
                   <span className="text-[7px] portrait:text-[10px] lg:text-xs font-black text-indigo-400 uppercase tracking-widest">Wait</span>
                </div>
              )}
           </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 py-2 portrait:py-4 lg:py-12">
          <div className="flex-1 flex flex-col overflow-y-auto pr-2 portrait:pr-4 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 [@media(max-width:1023px)_and_(orientation:landscape)]:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 portrait:gap-6 lg:gap-8 pb-4 content-center">
               {/* Player Cards */}
               {players.map(player => (
                 <div 
                   key={player.id} 
                   onClick={player.playerId === PLAYER_ID ? () => setSelectorOpen(true) : undefined}
                   className={`group relative flex items-center bg-slate-900/60 backdrop-blur-md p-3.5 portrait:p-6 [@media(max-width:1023px)_and_(orientation:landscape)]:p-2.5 lg:p-4 rounded-2xl portrait:rounded-[2.5rem] border transition-all m-1 ${player.playerId === PLAYER_ID ? 'border-indigo-500/50 bg-indigo-500/10 shadow-xl shadow-indigo-600/10 cursor-pointer hover:border-indigo-500 active:scale-95' : 'border-white/5 hover:border-white/10'}`}
                 >
                    <div className="relative w-12 h-12 portrait:w-20 portrait:h-20 [@media(max-width:1023px)_and_(orientation:landscape)]:w-10 [@media(max-width:1023px)_and_(orientation:landscape)]:h-10 lg:w-20 lg:h-20 bg-slate-950 rounded-xl portrait:rounded-2xl border border-white/5 overflow-hidden shadow-inner group-hover:scale-105 transition-all duration-500 shrink-0">
                       <img src={`/avatars/${player.avatar || 'ajani.png'}`} alt="Avatar" className="w-full h-full object-cover transition-all group-hover:opacity-60" />
                       {player.playerId === PLAYER_ID && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Pencil className="w-4 h-4 portrait:w-8 portrait:h-8 [@media(max-width:1023px)_and_(orientation:landscape)]:w-5 [@media(max-width:1023px)_and_(orientation:landscape)]:h-5 lg:w-5 lg:h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                          </div>
                       )}
                       <div className={`absolute bottom-1 right-1 portrait:bottom-2.5 portrait:right-2.5 w-2 h-2 portrait:w-4 portrait:h-4 rounded-full border border-slate-900 shadow-xl ${player.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    </div>
                    
                    <div className="ml-4 portrait:ml-7 [@media(max-width:1023px)_and_(orientation:landscape)]:ml-3 lg:ml-5 flex-1 min-w-0">
                        <div className="flex flex-col gap-1 portrait:gap-2 lg:gap-1.5">
                           <span className={`text-xs portrait:text-xl [@media(max-width:1023px)_and_(orientation:landscape)]:text-[11px] lg:text-lg font-black uppercase tracking-tight leading-none whitespace-normal break-words ${player.playerId === PLAYER_ID ? 'text-white' : 'text-slate-200'}`}>{player.name}</span>
                           <div className="flex items-center gap-2 lg:gap-2">
                              {player.playerId === PLAYER_ID && <span className="bg-indigo-600 text-white text-[7px] portrait:text-[8px] [@media(max-width:1023px)_and_(orientation:landscape)]:text-[6px] lg:text-[10px] px-2 py-0.5 portrait:px-2.5 portrait:py-1 lg:px-2.5 lg:py-1 rounded-full font-black tracking-widest uppercase border border-indigo-400/30">TU</span>}
                              {player.playerId === players[0].playerId && <span className="bg-amber-600 text-white text-[7px] portrait:text-[8px] [@media(max-width:1023px)_and_(orientation:landscape)]:text-[6px] lg:text-[10px] px-2 py-0.5 portrait:px-2.5 portrait:py-1 lg:px-2.5 lg:py-1 rounded-full font-black tracking-widest uppercase border border-amber-500/30 shadow-lg">HOST</span>}
                           </div>
                        </div>
                    </div>

                    {isHost && player.playerId !== PLAYER_ID && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onKick(player.playerId); }}
                        title={player.isBot ? "Rimuovi Bot" : "Rimuovi Giocatore"}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-slate-950 border border-red-500/50 hover:bg-red-600 text-red-500 hover:text-white rounded-full transition-all active:scale-90 absolute top-2 right-2 z-30 shadow-2xl flex items-center justify-center group/kick"
                      >
                         <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                 </div>
               ))}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, targetPlayers - currentPlayers) }).map((_, i) => (
                  <div 
                    key={`empty-${i}`} 
                    onClick={isHost ? onAddBot : undefined}
                    className={`flex items-center p-3.5 portrait:p-6 [@media(max-width:1023px)_and_(orientation:landscape)]:p-2.5 lg:p-4 rounded-2xl portrait:rounded-[2.5rem] border border-white/20 bg-slate-900/40 border-dashed group transition-all relative m-1 ${isHost ? 'cursor-pointer hover:bg-slate-950/80 hover:border-indigo-500/30 active:scale-[0.98]' : ''}`}
                  >
                     <div className="relative w-12 h-12 portrait:w-20 portrait:h-20 [@media(max-width:1023px)_and_(orientation:landscape)]:w-10 [@media(max-width:1023px)_and_(orientation:landscape)]:h-10 lg:w-20 lg:h-20 bg-slate-950/30 rounded-xl portrait:rounded-2xl border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                        <Loader2 className="w-4 h-4 portrait:w-6 portrait:h-6 lg:w-10 lg:h-10 text-indigo-500 animate-spin absolute" />
                     </div>
                     <div className="ml-3 portrait:ml-6 lg:ml-5 flex flex-col items-start gap-1">
                        {isHost && onAddBot && (
                           <button 
                              className="text-[8px] portrait:text-[11px] lg:text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                           >
                              + AGGIUNGI BOT
                           </button>
                        )}
                     </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* RULES MODAL */}
      <AnimatePresence>
        {rulesOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
               onClick={() => setRulesOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg landscape:max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] portrait:rounded-[3.5rem] p-5 portrait:p-12 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
             >
                <div className="flex justify-between items-center mb-6 portrait:mb-10 shrink-0">
                   <div>
                      <h3 className="text-2xl portrait:text-4xl font-black text-white uppercase italic tracking-tighter">Regole <span className="text-indigo-500">Draft</span></h3>
                      <p className="text-[8px] portrait:text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Configurazione</p>
                   </div>
                   <button onClick={() => setRulesOpen(false)} className="p-3 portrait:p-4 bg-slate-800 text-slate-400 hover:text-white rounded-xl portrait:rounded-[1.5rem] transition-colors shadow-xl">
                      <X className="w-5 h-5 portrait:w-6 portrait:h-6" />
                   </button>
                </div>

                <div className="grid grid-cols-1 landscape:grid-cols-2 gap-3 portrait:gap-6 overflow-y-auto custom-scrollbar pr-1">
                   {[
                     { label: 'Packs/Player', value: rules.packsPerPlayer },
                     { label: 'Cards/Pack', value: rules.cardsPerPack },
                     { label: 'Pick Timer', value: rules.timer ? `${rules.timer}s` : 'OFF' },
                     { label: 'Rarity Balance', value: rules.rarityBalance ? 'ATTIVO' : 'OFF', color: rules.rarityBalance ? 'text-amber-500' : 'text-white' },
                     { label: 'Modalità Anonima', value: rules.anonymousMode ? 'ATTIVO' : 'OFF', color: rules.anonymousMode ? 'text-indigo-400' : 'text-white' }
                   ].map((rule, i) => (
                     <div key={i} className="flex justify-between items-center p-3.5 portrait:p-6 bg-white/5 rounded-xl portrait:rounded-3xl border border-white/5">
                        <span className="text-[9px] portrait:text-[11px] font-black text-slate-500 uppercase tracking-widest">{rule.label}</span>
                        <span className={`text-[11px] portrait:text-sm font-black uppercase ${rule.color || 'text-white'}`}>{rule.value}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AVATAR SELECTOR MODAL */}
      <AnimatePresence>
        {selectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
               onClick={() => setSelectorOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-3xl lg:max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] portrait:rounded-[4rem] p-5 portrait:p-12 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
             >
                <div className="flex justify-between items-center mb-6 portrait:mb-10 shrink-0">
                   <div>
                      <h3 className="text-2xl portrait:text-4xl font-black text-white uppercase italic tracking-tighter">Scegli il tuo <span className="text-indigo-500">Avatar</span></h3>
                      <p className="text-[8px] portrait:text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Personaggi di MTG Arena</p>
                   </div>
                   <button onClick={() => setSelectorOpen(false)} className="p-3 portrait:p-4 bg-slate-800 text-slate-400 hover:text-white rounded-xl portrait:rounded-[1.5rem] transition-colors shadow-xl">
                      <X className="w-5 h-5 portrait:w-6 portrait:h-6" />
                   </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 landscape:grid-cols-8 portrait:grid-cols-4 gap-3 portrait:gap-6 overflow-y-auto p-1 custom-scrollbar">
                   {avatarList.map((avatar: string) => {
                     const isTaken = takenAvatars.includes(avatar);
                     const isCurrent = me?.avatar === avatar;
                     
                     return (
                       <button
                         key={avatar}
                         disabled={isTaken}
                         onClick={() => {
                           onChangeAvatar(avatar);
                           setSelectorOpen(false);
                         }}
                         className={`relative group aspect-square rounded-2xl portrait:rounded-[2rem] overflow-hidden border-2 transition-all ${isTaken ? 'opacity-20 grayscale border-transparent cursor-not-allowed' : (isCurrent ? 'border-indigo-500 scale-105 shadow-xl shadow-indigo-600/20' : 'border-white/5 hover:border-indigo-500 hover:scale-105 active:scale-95')}`}
                       >
                         <img src={`/avatars/${avatar}`} alt={avatar} className="w-full h-full object-cover" />
                         {isCurrent && (
                           <div className="absolute inset-0 border-4 border-indigo-500/50 rounded-2xl portrait:rounded-[2rem] pointer-events-none" />
                         )}
                       </button>
                     );
                   })}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
