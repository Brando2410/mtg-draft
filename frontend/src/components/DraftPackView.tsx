import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  LayoutPanelLeft, 
  Loader2, 
  Table, 
  PauseCircle, 
  PlayCircle,
  Home,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DeckReviewView } from './DeckReviewView';
// Card types if needed

const AVATARS = [
  'ajani.png', 'alena_halana.png', 'angrath.png', 'aragorn.png', 'ashiok.png',
  'astarion.png', 'atraxa.png', 'aurelia.png', 'basri.png', 'baylen.png',
  'beckett.png', 'borborygmos.png', 'braids.png', 'chandra.png', 'cruelclaw.png',
  'davriel.png', 'dina.png', 'domri.png', 'dovin.png', 'elesh_norn.png'
];



interface DraftPackViewProps {
  room: any;
  socket: any;
  playerId: string | null;
  onBack?: () => void;
}

export const DraftPackView = ({ room, socket, playerId, onBack }: DraftPackViewProps) => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [preSelectedId, setPreSelectedId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTableOpen, setIsTableOpen] = useState(false);

  const isCompleted = room?.status === 'completed';
  const [isPreloading, setIsPreloading] = useState(!isCompleted);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  useEffect(() => {
    if (room?.serverTime) {
      const offset = room.serverTime - Date.now();
      // Solo se l'offset è significativo (> 500ms) o è il primo update
      if (Math.abs(offset - serverTimeOffset) > 500 || serverTimeOffset === 0) {
        setServerTimeOffset(offset);
      }
    }
  }, [room?.serverTime]);

  useEffect(() => {
    if (isCompleted || !room?.draftState) {
      setIsPreloading(false);
      return;
    }
    
    const urls = new Set<string>();
    room.draftState.queues?.forEach((q: any) => {
      q.forEach((pack: any) => pack.forEach((c: any) => c.image_url && urls.add(c.image_url)));
    });
    room.draftState.unopenedPacks?.forEach((playerPacks: any) => {
      playerPacks.forEach((pack: any) => pack.forEach((c: any) => c.image_url && urls.add(c.image_url)));
    });
    room.players?.forEach((p: any) => {
       p.pool?.forEach((c: any) => c.image_url && urls.add(c.image_url));
    });

    const urlArray = Array.from(urls);
    if (urlArray.length === 0) {
      setIsPreloading(false);
      return;
    }

    let loaded = 0;
    const fallbackTimer = setTimeout(() => setIsPreloading(false), 15000);

    urlArray.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loaded++;
        setPreloadProgress(Math.round((loaded / urlArray.length) * 100));
        if (loaded === urlArray.length) {
          clearTimeout(fallbackTimer);
          setTimeout(() => setIsPreloading(false), 500);
        }
      };
    });

    return () => clearTimeout(fallbackTimer);
  }, [room?.id, room?.draftState, isCompleted]);

  const currentPlayer = room?.players.find((p: any) => p.playerId === playerId);
  const currentPack = room?.draftState?.queues?.[room?.players.indexOf(currentPlayer)]?.[0] || [];
  const pool = currentPlayer?.pool || [];
  const round = room?.draftState?.currentRound || 1;
  const isAnonymous = room?.rules?.anonymousMode;
  const isPaused = room?.draftState?.isPaused || room?.status === 'paused';

  useEffect(() => {
    const timerEnd = room?.draftState?.playerTimers?.[playerId || ''];
    if (!timerEnd || isPaused || isCompleted) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now() + serverTimeOffset;
      const remaining = Math.max(0, Math.floor((timerEnd - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [room?.draftState?.playerTimers, playerId, isPaused, isCompleted]);

  // AUTO-RETURN: Quando la draft RIPRENDE da una pausa (e ho carte da pickare), chiudi il mazzo
  const prevIsPausedRef = useRef(isPaused);

  useEffect(() => {
    const transitionedToUnpaused = prevIsPausedRef.current && !isPaused;
    
    if (transitionedToUnpaused && currentPack.length > 0 && isReviewOpen) {
      setIsReviewOpen(false);
    }
    
    prevIsPausedRef.current = isPaused;
  }, [isPaused, currentPack.length, isReviewOpen]);

  // Sincronizza la PRESELEZIONE con il server (per auto-pick)
  // IMPORTANTE: Inviamo solo preSelectedId. Guardare una carta (selectedCardId) NON cambia la scelta sul server.
  useEffect(() => {
    if (!isPaused && socket) {
      socket.emit('select_card', { roomId: room.id, playerId, cardId: preSelectedId });
    }
  }, [preSelectedId, isPaused, socket, room.id, playerId]);

  // AUTO-RETURN @ 10s: Forza il giocatore a vedere il pick se scade il tempo
  const autoReturnTriggeredRef = useRef(false);
  const lastPoolSizeRef = useRef(pool.length);

  useEffect(() => {
    // Resetta il trigger quando cambia il numero di carte nel pool (nuovo pick effettuato)
    if (pool.length !== lastPoolSizeRef.current) {
      autoReturnTriggeredRef.current = false;
      lastPoolSizeRef.current = pool.length;
    }
  }, [pool.length]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 10 && timeLeft > 0 && !autoReturnTriggeredRef.current) {
      if (isReviewOpen || isTableOpen) {
        setIsReviewOpen(false);
        setIsTableOpen(false);
        autoReturnTriggeredRef.current = true; // Segna come eseguito per questo pick
      }
    }
  }, [timeLeft, isReviewOpen, isTableOpen]);

  useEffect(() => {
    if (selectedCardId && !currentPack.find((c: any) => c.id === selectedCardId)) {
      setSelectedCardId(null);
    }
    // Also clear pre-selection if the card is no longer in pack
    if (preSelectedId && !currentPack.find((c: any) => c.id === preSelectedId)) {
      setPreSelectedId(null);
    }
  }, [currentPack, selectedCardId, preSelectedId]);

  const handlePick = () => {
    // Il pick deve prioritizzare la pre-selezione (bordo giallo)
    const cardToPick = preSelectedId;
    if (!cardToPick || isPaused) return;

    socket.emit('pick_card', {
      roomId: room.id,
      playerId,
      cardId: cardToPick
    });
    
    // Pulizia stati locali
    setSelectedCardId(null);
    setPreSelectedId(null);
  };

  if (isPreloading) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="relative w-32 h-32 mb-8">
           <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
           <div 
             className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" 
             style={{ clipPath: `conic-gradient(transparent 0%, white ${preloadProgress}%)` }}
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-white">{preloadProgress}%</span>
           </div>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] mb-2 animate-pulse">Caricamento Deck...</h2>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-center max-w-xs leading-relaxed">
           Stiamo ottimizzando le immagini delle carte per una fluidità totale durante la draft.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col overflow-y-auto sm:overflow-hidden">
      {/* Header View */}
      <div className="bg-slate-900/50 border-b border-white/5 p-2 sm:p-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-lg font-black text-indigo-500 uppercase tracking-tighter italic leading-none hidden sm:block">DRAFTING</span>
             </div>

             {timeLeft !== null && (
               <div 
                 onClick={() => {
                   const isHost = room?.hostId === playerId;
                   if (isHost && socket) {
                     socket.emit('toggle_pause', { roomId: room.id });
                   }
                 }}
                 className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${room?.hostId === playerId ? 'cursor-pointer hover:bg-slate-700/50 group/timer' : ''} ${timeLeft < 10 && !isPaused ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'bg-slate-800/50 border-white/5'}`}
               >
                  {isPaused ? (
                    <PauseCircle className="w-5 h-5 text-amber-500 animate-pulse" />
                  ) : (
                    <Clock className={`w-5 h-5 ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'} group-hover/timer:scale-110 transition-transform`} />
                  )}
                  <div className="flex flex-col">
                     <span className={`text-xl font-black tabular-nums leading-none ${isPaused ? 'text-amber-500' : (timeLeft < 10 ? 'text-rose-500' : 'text-white')}`}>
                        {isPaused ? 'PAUSA' : <>{timeLeft}<span className="text-[10px] ml-0.5 opacity-50 italic">s</span></>}
                     </span>
                  </div>
               </div>
             )}
          </div>

          <div className="flex items-center gap-4">
             <button
               onClick={() => setIsTableOpen(true)}
               className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-white/5 flex items-center gap-3 transition-all active:scale-95 group relative"
             >
                <Table className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Tavolo</span>
                {(room.draftState.queues[room?.players.indexOf(currentPlayer)]?.length || 0) > 1 && (
                   <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center animate-bounce-slow">
                      <span className="text-[9px] font-black text-slate-950">!</span>
                   </div>
                )}
             </button>
             <button
               onClick={() => setIsReviewOpen(true)}
               className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
             >
                <LayoutPanelLeft className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Mazzo ({pool.length})</span>
             </button>
          </div>
      </div>

      {/* Main Experience */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-visible md:overflow-hidden relative">

         {/* Pack View Area */}
         <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar relative">
            <div className="max-w-7xl mx-auto space-y-10">
               <div className="flex items-center justify-between">
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                      Pack {round} <span className="text-indigo-500 px-2">/</span> Pick {pool.length + 1}
                   </h2>

                  {/* INDICATORE DI CODA - Appare quando si accumulano pacchetti */}
                  {(room.draftState.queues[room?.players.indexOf(currentPlayer)]?.length || 0) > 1 && (
                     <div className="flex items-center gap-4 bg-amber-500/10 px-5 py-2.5 rounded-[1.5rem] border border-amber-500/30 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-2">
                           <LayoutPanelLeft className="w-4 h-4 text-amber-500" />
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Coda di Pick</span>
                              <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-widest mt-0.5">Hai pacchetti in attesa</span>
                           </div>
                        </div>
                        <div className="h-6 w-px bg-amber-500/20" />
                        <span className="text-lg font-black text-white leading-none">+{room.draftState.queues[room?.players.indexOf(currentPlayer)].length - 1}</span>
                     </div>
                  )}
                  {currentPack.length === 0 && !isCompleted && (
                    <div className="flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-2xl border border-indigo-500/20">
                       <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">In attesa del pacchetto...</span>
                    </div>
                  )}
               </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                   {currentPack.map((card: any) => (
                     <div 
                      key={card.id}
                      onClick={() => {
                         if (!isPaused) {
                            setSelectedCardId(card.id);
                         }
                      }}
                      onDoubleClick={() => {
                         if (!isPaused) {
                            // Se raddoppi il click, lo prendiamo come un'intento di pick immediato se era già pre-selezionata
                            if (preSelectedId === card.id) {
                               handlePick();
                            } else {
                               // Altrimenti la pre-selezioniamo e basta (aprendo comunque il dettaglio)
                               setPreSelectedId(card.id);
                               setSelectedCardId(card.id);
                            }
                         }
                      }}
                      className={`group relative aspect-[7/10] rounded-2xl cursor-pointer transition-all duration-300 ${isPaused ? 'opacity-50 cursor-not-allowed' : ''} 
                        ${selectedCardId === card.id ? 'scale-105 z-10 shadow-[0_0_40px_rgba(79,70,229,0.4)]' : 'hover:scale-[1.02] hover:-translate-y-2'} 
                        ${preSelectedId === card.id ? 'ring-4 ring-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.6)] animate-pulse-slow' : ''}`}
                    >
                       <img 
                          src={card.image_url} 
                          alt={card.name}
                          className={`w-full h-full object-cover rounded-2xl border-2 transition-all duration-500 
                            ${selectedCardId === card.id ? 'border-indigo-400' : (preSelectedId === card.id ? 'border-amber-400' : 'border-transparent group-hover:border-indigo-500/30')}`}
                       />
                       
                       <div className={`absolute inset-0 bg-indigo-600/20 rounded-2xl transition-opacity duration-300 pointer-events-none 
                         ${selectedCardId === card.id ? 'opacity-100' : (preSelectedId === card.id ? 'opacity-30 bg-amber-600/30' : 'opacity-0')}`} />
                      </div>
                    ))}
                 </div>
             </div>
          </div>
          {/* Selection Sidebar (Visible only when a card is selected) */}
          {selectedCardId && (
             <div className="w-full lg:w-96 bg-slate-900/80 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 p-4 sm:p-8 flex flex-col z-40 fixed lg:relative bottom-0 lg:bottom-auto h-[90vh] lg:h-auto animate-in slide-in-from-bottom lg:slide-in-from-right duration-500 rounded-t-[2.5rem] lg:rounded-none">
                <div className="flex-1 overflow-y-auto custom-scrollbar pt-14 lg:pt-0">
                   {/* Header Row - Only on desktop */}
                   <div className="hidden lg:flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">SELEZIONE</span>
                      </div>
                      <button onClick={() => setSelectedCardId(null)} className="p-3 bg-slate-800 text-slate-500 hover:text-white rounded-2xl transition-colors">
                         <X className="w-4 h-4" />
                      </button>
                   </div>
                   {(() => {
                      const idx = currentPack.findIndex((c: any) => c.id === selectedCardId);
                      const sc = currentPack[idx];
                      if (!sc) return null;
                      return (
                         <div className="space-y-4 lg:space-y-8">
                            <div className="aspect-[7/10] w-[90%] mx-auto rounded-[2rem] overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-600/10 active:scale-[0.98] transition-transform">
                               <img src={sc.image_url} alt={sc.name} className="w-full h-full object-cover" />
                            </div>
                         </div>
                      );
                   })()}
                </div>

                {/* Mobile Floating Overlay Controls - Outside the scrollable area */}
                {(() => {
                   const idx = currentPack.findIndex((c: any) => c.id === selectedCardId);
                   if (idx === -1) return null;
                   
                   return (
                      <div className="lg:hidden">
                         {/* Close button */}
                         <button 
                           onClick={() => setSelectedCardId(null)}
                           className="absolute top-4 right-4 p-4 bg-slate-900/40 backdrop-blur-md shadow-2xl rounded-3xl text-white/70 border border-white/5 active:scale-95 z-[100]"
                         >
                            <X className="w-6 h-6" />
                         </button>
 
                         {/* Navigation Arrows */}
                         <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex items-center justify-between px-2 pointer-events-none z-[100]">
                            <button 
                              onClick={() => {
                                const prevIdx = (idx - 1 + currentPack.length) % currentPack.length;
                                setSelectedCardId(currentPack[prevIdx].id);
                              }}
                              className="p-3 bg-slate-900/20 backdrop-blur-md rounded-full border border-white/5 text-white/50 pointer-events-auto active:scale-95 transition-all shadow-2xl"
                            >
                               <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                const nextIdx = (idx + 1) % currentPack.length;
                                setSelectedCardId(currentPack[nextIdx].id);
                              }}
                              className="p-3 bg-slate-900/20 backdrop-blur-md rounded-full border border-white/5 text-white/50 pointer-events-auto active:scale-95 transition-all shadow-2xl"
                            >
                               <ChevronRight className="w-5 h-5" />
                            </button>
                         </div>
                      </div>
                   );
                })()}

                <div className="pt-8 border-t border-white/5 mt-auto">
                   <button 
                     disabled={isPaused}
                     onClick={() => {
                        const idx = currentPack.findIndex((c: any) => c.id === selectedCardId);
                        const sc = currentPack[idx];
                        if (!sc) return;

                        // Se è già preselezione, allora conferma il pick
                        if (preSelectedId === sc.id) {
                           handlePick();
                        } else {
                           setPreSelectedId(sc.id);
                           // Forza l'invio immediato al server
                           socket.emit('select_card', { roomId: room.id, playerId, cardId: sc.id });
                        }
                     }}
                     className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 group"
                   >
                      {(() => {
                         const sc = currentPack.find((c: any) => c.id === selectedCardId);
                         return (preSelectedId && sc && preSelectedId === sc.id) ? 'CONFERMA PICK' : 'PRESELEZIONA';
                      })()}
                      <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
                   </button>
               </div>
            </div>
         )}
      </div>

      {/* MODALE TAVOLO CIRCOLARE (Table View) */}
      {isTableOpen && (() => {
          // const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
          const isSmallHeight = typeof window !== 'undefined' && window.innerHeight < 600;
          const isVerySmallHeight = typeof window !== 'undefined' && window.innerHeight < 420;
          
          const baseRadius = isVerySmallHeight ? 75 : (isSmallHeight ? 100 : 180);
          const avatarSize = isVerySmallHeight ? 'w-10 h-10' : (isSmallHeight ? 'w-14 h-14' : 'w-20 h-20');
          const centerSize = isVerySmallHeight ? 'w-16 h-16' : (isSmallHeight ? 'w-24 h-24' : 'w-32 h-32');

          return (
            <div className="fixed inset-0 z-[550] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-2 sm:p-6 animate-in fade-in duration-300" onClick={() => setIsTableOpen(false)}>
               <div className="relative w-full max-w-4xl bg-slate-900/40 border border-white/5 sm:rounded-[3rem] rounded-3xl shadow-2xl overflow-hidden h-full max-h-[95vh] sm:h-auto p-4 sm:p-10 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setIsTableOpen(false)} className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-slate-800/50 hover:bg-red-500/20 rounded-full transition-all text-slate-400 hover:text-red-500 z-[560]">
                    <X className="w-5 h-5 sm:w-6 h-6" />
                  </button>
                  
                  <div className="text-center mb-4 sm:mb-12 shrink-0">
                     <h3 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1 sm:mb-2">Stato del <span className="text-amber-500">Tavolo</span></h3>
                     <p className="text-slate-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.3em]">Pack #{round} • {round % 2 !== 0 ? 'Orario' : 'Antiorario'}</p>
                  </div>
  
                  <div className="relative w-full aspect-square flex items-center justify-center grow shrink min-h-0">
                     <div className={`absolute border-2 sm:border-4 border-dashed border-indigo-500/10 rounded-full ${round % 2 !== 0 ? 'animate-spin-slow' : 'animate-reverse-spin-slow'}`} 
                          style={{ width: `${baseRadius * 2}px`, height: `${baseRadius * 2}px` }} 
                     />
                     
                     {room?.players?.map((p: any, idx: number) => {
                        const totalPlayers = room.players.length;
                        const angle = (idx / totalPlayers) * 2 * Math.PI - Math.PI / 2;
                        const x = Math.cos(angle) * baseRadius;
                        const y = Math.sin(angle) * baseRadius;
                        
                        const qCount = room.draftState.queues[idx]?.length || 0;
                        const isMe = p.playerId === playerId;
                        const isThinking = !!room.draftState.playerTimers?.[p.playerId];
  
                        return (
                          <div 
                             key={p.playerId} 
                             className="absolute transition-all duration-700 flex flex-col items-center gap-1 sm:gap-2"
                             style={{ transform: `translate(${x}px, ${y}px)` }}
                          >
                             <div className={`relative ${avatarSize} rounded-full flex items-center justify-center border-2 sm:border-4 transition-all overflow-hidden ${
                                isMe ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 
                                isThinking ? 'bg-slate-800 border-amber-500/50' : 'bg-slate-900 border-slate-700'
                             }`}>
                                {isAnonymous && !isMe ? (
                                   <img src={`/avatars/${AVATARS[idx % AVATARS.length]}`} alt="Avatar" className="w-full h-full object-cover opacity-60 grayscale-[0.5]" />
                                ) : p.avatar ? (
                                   <img src={`/avatars/${p.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                   <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-tighter">
                                      {p.name.substring(0,2)}
                                   </span>
                                )}
                              </div>
                              
                              {qCount > 0 && (
                                 <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 h-8 bg-amber-500 rounded-lg flex flex-col items-center justify-center shadow-lg animate-bounce-slow z-20 border border-slate-950/20">
                                    <span className="text-[10px] sm:text-[12px] font-black text-slate-950 leading-none">{qCount}</span>
                                    <span className="text-[5px] sm:text-[6px] font-black text-slate-950/70 uppercase leading-none hidden sm:block mt-0.5">Packs</span>
                                 </div>
                              )}

                              {isThinking && (
                                 <div className="absolute -bottom-1 -left-1 z-20">
                                    <Clock className={`w-4 h-4 sm:w-5 h-5 ${timeLeft !== null && timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-500'} bg-slate-950 rounded-full p-0.5 sm:p-1 shadow-md border border-white/5`} />
                                 </div>
                              )}
                             
                             <div className="text-center px-2 sm:px-3 py-0.5 sm:py-1 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-md max-w-[80px] sm:max-w-none truncate">
                                <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-widest block truncate ${isMe ? 'text-indigo-400' : 'text-slate-400'}`}>
                                   {isAnonymous && !isMe ? '???' : p.name}
                                </span>
                             </div>
                          </div>
                        );
                     })}
  
                     <div className={`absolute inset-x-0 inset-y-0 m-auto ${centerSize} bg-slate-950/50 rounded-full border border-slate-800/50 backdrop-blur-md flex flex-col items-center justify-center z-10 shadow-inner shrink-0`}>
                        <span className="text-[6px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Pack</span>
                        <span className="text-xl sm:text-5xl font-black text-white leading-tight">{round}</span>
                        <div className="hidden sm:flex items-center gap-1 mt-1">
                           <div className={`w-2 h-2 rounded-full ${round%2!==0 ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                           <span className="text-[8px] font-black text-slate-400 uppercase">{round%2!==0 ? 'Sinistra' : 'Destra'}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          );
      })()}



      {isReviewOpen && (
        <DeckReviewView 
          pool={pool} 
          onClose={() => setIsReviewOpen(false)}
          onUpdatePool={() => {
            // Logica per aggiornare il pool se necessario
          }}
          timeLeft={timeLeft}
          isPaused={isPaused}
          isHost={room?.hostPlayerId === playerId}
          onTogglePause={() => socket.emit('toggle_pause', { roomId: room.id, playerId, forcePause: false })}
        />
      )}

      {isPaused && !isReviewOpen && (
         <div className="fixed inset-0 z-[800] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300 w-full h-full">
            <div className="text-center space-y-6 p-6">
               <PauseCircle className="w-20 h-20 text-amber-500 mx-auto animate-pulse" />
               <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter">Partita in <span className="text-amber-500">Pausa</span></h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-sm max-w-md mx-auto leading-relaxed">
                  La draft è stata sospesa. Le carte e il timer sono bloccati per tutti i partecipanti.
               </p>
               <div className="flex flex-col items-center gap-6 mt-8 w-full max-w-md mx-auto">
                  <div className="w-full bg-slate-900/60 border border-indigo-500/20 rounded-3xl p-4 flex flex-col gap-2 shadow-inner">
                     <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stato Giocatori</h3>
                        <span className="text-[8px] font-black text-indigo-400/80 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">Lobby Globale</span>
                     </div>
                     <div className="flex flex-col gap-1.5 max-h-[35vh] overflow-y-auto pr-1">
                        {room?.players?.map((p: any) => (
                           <div key={p.playerId} className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 rounded-xl border border-white/5 group transition-colors hover:bg-slate-900">
                              <div className="flex items-center gap-3">
                                 <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                                   <img src={`/avatars/${p.avatar || 'ajani.png'}`} alt="Avatar" className="w-full h-full object-cover" />
                                 </div>
                                 <span className="text-[11px] font-black text-white uppercase tracking-tight">{p.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className={`w-2 h-2 rounded-full ${p.online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p.online ? 'Connesso' : 'Disconnesso'}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mx-auto">
                   <button 
                     onClick={() => setIsReviewOpen(true)}
                     className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all border border-white/5 shadow-xl active:scale-95 group"
                   >
                      VEDI MAZZO <LayoutPanelLeft className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                   </button>

                   {room?.hostPlayerId === playerId && (
                      <button 
                        onClick={() => socket.emit('toggle_pause', { roomId: room.id, playerId, forcePause: false })}
                        className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-600/20 active:scale-95 group"
                      >
                         RIPRENDI DRAFT <PlayCircle className="w-5 h-5 fill-current" />
                      </button>
                   )}
                </div>
               </div>
            </div>
         </div>
      )}
       {isCompleted && !isReviewOpen && (
         <div className="fixed inset-0 z-[900] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="max-w-2xl w-full text-center space-y-12">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
                  <CheckCircle2 className="w-32 h-32 text-indigo-500 mx-auto relative animate-bounce-slow" />
               </div>
               <div className="space-y-4">
                  <h2 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter italic">Draft <span className="text-indigo-500">Completata!</span></h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-sm">Tutte le carte sono state scelte. Il tuo mazzo finale è pronto.</p>
               </div>
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button 
                    onClick={() => setIsReviewOpen(true)}
                    className="w-full sm:w-auto px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 group"
                  >
                     VEDI MAZZO FINALE <LayoutPanelLeft className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </button>
                  <button 
                    onClick={onBack}
                    className="w-full sm:w-auto px-12 py-6 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 transition-all border border-white/5 active:scale-95"
                  >
                     TORNA ALLA HOME <Home className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
