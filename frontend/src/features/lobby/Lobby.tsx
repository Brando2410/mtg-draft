import { Users, Info, Play, X, Copy, CheckCircle2, Loader2, UserX, Pencil, Swords, BookOpen, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraftStore } from '../../store/useDraftStore';
import { PageLayout } from '../../components/shared/PageLayout';

interface Player {
  id: string;
  playerId: string;
  name: string;
  avatar?: string;
  online?: boolean;
  isBot?: boolean;
  deck?: any;
}

interface LobbyProps {
  roomCode: string;
  players: Player[];
  rules: any;
  isHost: boolean;
  onStart: () => void;
  onClose?: () => void;
  onKick: (playerId: string) => void;
  onChangeAvatar: (avatar: string) => void;
  onAddBot?: () => void;
  isNormalMatch?: boolean;
}

export const Lobby = ({ 
  roomCode, 
  players, 
  rules, 
  isHost, 
  onStart, 
  onClose,
  onKick,
  onChangeAvatar,
  onAddBot,
  isNormalMatch = false
}: LobbyProps) => {
  const { avatarList, fetchAssets, playerId: PLAYER_ID_STORE, selectDeck, selectedDeck } = useDraftStore();
  const PLAYER_ID = PLAYER_ID_STORE;
  
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [deckSelectorOpen, setDeckSelectorOpen] = useState(false);
  const [savedDecks, setSavedDecks] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isNormalMatch) {
      const fetchDecks = async (retries = 5) => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || '';
          const res = await fetch(`${API_URL}/api/decks`);
          if (res.ok) {
            const decks = await res.json();
            setSavedDecks(decks);
          } else if (retries > 0) {
            setTimeout(() => fetchDecks(retries - 1), 3000);
          }
        } catch (err) {
          console.error('Error fetching decks in lobby:', err);
          if (retries > 0) {
            setTimeout(() => fetchDecks(retries - 1), 3000);
          }
        }
      };
      fetchDecks();
    }
    if (avatarList.length === 0) fetchAssets();
  }, [isNormalMatch]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPlayers = players.length;
  const targetPlayers = rules.playerCount || (isNormalMatch ? 2 : 8);

  const me = players.find(p => p.playerId === PLAYER_ID);
  const opponent = players.find(p => p.playerId !== PLAYER_ID);

  return (
    <PageLayout variant={rules.isSealed ? 'purple' : (isNormalMatch ? 'indigo' : 'default')}>
      <div className="relative flex-1 flex flex-col min-h-0 max-w-7xl mx-auto w-full gap-8 p-4 lg:p-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col landscape:flex-row lg:flex-row items-center justify-between gap-6 bg-slate-900/60 p-4 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shrink-0">
           <div className="flex items-center gap-4 lg:w-1/3">
              <div className="flex flex-col">
                 <h1 className="text-2xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Stanza <span className={rules.isSealed ? "text-purple-500" : (isNormalMatch ? "text-indigo-500" : "text-emerald-500")}>
                      {isNormalMatch ? 'Match' : (rules.isSealed ? 'Sealed' : 'Draft')}
                    </span>
                 </h1>
                 <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">
                    {isNormalMatch ? 'Partita Diretta' : (rules.isSealed ? 'Pool Personale' : (rules.cubeName || 'Cubo Draft'))}
                 </p>
              </div>
              {!isNormalMatch && (
                <div className="hidden lg:flex items-center justify-center gap-2 bg-indigo-600 px-4 h-[50px] rounded-full border border-indigo-400/30 shadow-lg">
                   <Users className="w-4 h-4 text-white" />
                   <span className="text-xs font-black text-white">{currentPlayers}/{targetPlayers}</span>
                </div>
              )}
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
              {!isNormalMatch && (
                <button 
                  onClick={() => setRulesOpen(true)}
                  className="px-6 h-[50px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-white/5 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Regole</span>
                </button>
              )}

              <div className="h-8 w-px bg-white/10 mx-1" />

              {isHost ? (
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    disabled={currentPlayers < 2 || (isNormalMatch && (!selectedDeck || !opponent?.deck))}
                    onClick={onStart}
                    className={`px-10 h-[50px] ${rules.isSealed ? 'bg-purple-600 hover:bg-purple-500' : 'bg-emerald-600 hover:bg-emerald-500'} disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95`}
                  >
                    {isNormalMatch ? 'INIZIA MATCH' : (rules.isSealed ? 'AVVIA EVENTO' : 'AVVIA DRAFT')} <Play className="w-4 h-4 fill-current" />
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

        {/* CONTENT AREA */}
        {isNormalMatch ? (
          /* VERSUS LAYOUT FOR MATCHES */
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative overflow-y-auto">
             {/* ME */}
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
                   <div className={`absolute -bottom-4 -right-4 w-12 h-12 ${me?.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'} rounded-full border-8 border-slate-950 shadow-xl`} />
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

             {/* VS */}
             <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl lg:text-[12rem] font-black text-white/5 italic select-none pointer-events-none">VS</div>
                <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full border-2 border-white/5 flex items-center justify-center backdrop-blur-md shadow-2xl relative z-10 bg-slate-900/50">
                   <Swords className="w-8 h-8 lg:w-12 lg:h-12 text-white animate-bounce-slow" />
                </div>
             </div>

             {/* OPPONENT */}
             <div className="flex flex-col items-center gap-6 group">
                {opponent ? (
                   <div className="relative">
                      <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-[3rem] p-2 bg-slate-800 shadow-2xl transition-all">
                         <div className="w-full h-full bg-slate-950 rounded-[2.6rem] overflow-hidden relative border-4 border-slate-950/50 text-center flex flex-col items-center justify-center gap-2">
                            <img src={`/avatars/${opponent.avatar || 'ajani.png'}`} className="w-full h-full object-cover" />
                         </div>
                         <div className={`absolute -bottom-4 -right-4 w-12 h-12 ${opponent.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'} rounded-full border-8 border-slate-950 shadow-xl`} />
                      </div>
                      {isHost && (
                        <button 
                          onClick={() => onKick(opponent.playerId)}
                          className="absolute -top-4 -right-4 p-4 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-2xl shadow-red-600/40 active:scale-95 transition-all"
                        >
                           <UserX className="w-6 h-6" />
                        </button>
                      )}
                   </div>
                ) : (
                   <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-[3rem] border-4 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5 animate-pulse">
                      <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center px-8">In attesa...</span>
                   </div>
                )}
                <div className="flex flex-col items-center gap-2">
                   <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{opponent?.name || '---'}</span>
                   <div className="flex items-center gap-2">
                      <div className="px-4 py-1.5 bg-slate-800 rounded-full border border-white/10">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SFIDANTE</span>
                      </div>
                      {opponent?.deck && (
                         <div className="px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30 flex items-center gap-2">
                            <Check className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pronto</span>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        ) : (
          /* GRID LAYOUT FOR DRAFT/SEALED */
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
                         className="opacity-0 group-hover:opacity-100 p-2 bg-slate-950 border border-red-500/50 hover:bg-red-600 text-red-500 hover:text-white rounded-full transition-all absolute top-2 right-2 z-30 shadow-xl"
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
                           <span className="text-[10px] font-black text-indigo-400 group-hover:text-indigo-300 uppercase tracking-widest transition-colors">+ BOT</span>
                        )}
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">In Attesa...</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* RULES MODAL */}
        {rulesOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRulesOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8 shrink-0">
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Regole <span className={rules.isSealed ? "text-purple-500" : "text-indigo-500"}>{rules.isSealed ? 'Sealed' : 'Draft'}</span></h3>
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

        {/* DECK SELECTOR */}
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
                      <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Nessun mazzo trovato</span>
                         <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-[10px] font-black uppercase rounded-lg">Aggiorna</button>
                      </div>
                   ) : (
                      savedDecks.map((deck, i) => (
                         <button 
                            key={i} 
                            onClick={async () => {
                              try {
                                const API_URL = import.meta.env.VITE_API_URL || '';
                                const res = await fetch(`${API_URL}/api/decks/${deck.id}`);
                                const fullDeck = await res.json();
                                selectDeck(fullDeck);
                                setDeckSelectorOpen(false);
                              } catch(e) {}
                            }}
                            className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between group ${selectedDeck?.name === deck.name ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-950 border-white/5 hover:border-indigo-500/50'}`}
                         >
                            <div className="flex items-center gap-4">
                               <BookOpen className="w-6 h-6 text-slate-600" />
                               <div className="flex flex-col items-start">
                                  <span className="text-lg font-black uppercase italic text-white">{deck.name}</span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{deck.cardCount} CARTE</span>
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

        {/* AVATAR SELECTOR */}
        {selectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectorOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3rem] p-12 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-10 shrink-0">
                   <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Avatar</h3>
                   <button onClick={() => setSelectorOpen(false)} className="p-4 bg-slate-800 text-slate-400 hover:text-white rounded-2xl">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar grid grid-cols-6 gap-6">
                   {avatarList.map((avatar, i) => (
                      <button key={i} onClick={() => { onChangeAvatar(avatar); setSelectorOpen(false); }} className="aspect-square bg-slate-950 rounded-2xl border-4 border-transparent hover:border-indigo-500 overflow-hidden">
                         <img src={`/avatars/${avatar}`} className="w-full h-full object-cover" />
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
      `}</style>
    </PageLayout>
  );
};
