import { useState, useEffect, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../../services/socket';
import { DeckReviewView } from '../deck/DeckReviewView';
import { DraftHeader } from './DraftHeader.tsx';
import { PackGrid } from './PackGrid';
import { SelectionSidebar } from './SelectionSidebar';
import { TableViewModal } from './TableViewModal';
import { DraftPausedOverlay } from './DraftPausedOverlay';
import { DraftCompletedOverlay } from './DraftCompletedOverlay';
import { BotPoolsModal } from './BotPoolsModal';
import type { Room, Card, Player } from '@shared/types';

interface DraftPackViewProps {
  room: Room;
  playerId: string | null;
  onBack?: () => void;
}

export const DraftPackView = ({ room, playerId, onBack }: DraftPackViewProps) => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [preSelectedId, setPreSelectedId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [zoomCard, setZoomCard] = useState<Card | null>(null);
  const [isZoomFlipped, setIsZoomFlipped] = useState(false);
  const [isBotReviewOpen, setIsBotReviewOpen] = useState(false);

  const isCompleted = room?.status === 'completed';
  const [isPreloading, setIsPreloading] = useState(!isCompleted);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  useEffect(() => {
    if (room?.serverTime) {
      const offset = room.serverTime - Date.now();
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
    room.draftState.queues?.forEach((q: Card[][]) => {
      q.forEach((pack: Card[]) => pack.forEach((c: Card) => {
        const url = c.image_uris?.normal || (c as any).image_url;
        if (url) urls.add(url);
        if (c.back_image_url) urls.add(c.back_image_url);
      }));
    });
    room.draftState.unopenedPacks?.forEach((playerPacks: Card[][]) => {
      playerPacks.forEach((pack: Card[]) => pack.forEach((c: Card) => {
        const url = c.image_uris?.normal || (c as any).image_url;
        if (url) urls.add(url);
        if (c.back_image_url) urls.add(c.back_image_url);
      }));
    });
    room.players?.forEach((p: Player) => {
      p.pool?.forEach((c: Card) => {
        const url = c.image_uris?.normal || (c as any).image_url;
        if (url) urls.add(url);
        if (c.back_image_url) urls.add(c.back_image_url);
      });
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

  const playerIndex = room?.players.findIndex((p: Player) => p.playerId === playerId);
  const currentPlayer = room?.players[playerIndex];
  const currentPack = room?.draftState?.queues?.[playerIndex]?.[0] || [];
  const pool = currentPlayer?.pool || [];
  const round = room?.draftState?.round || 1;
  const isPaused = room?.draftState?.isPaused || false;

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
  }, [room?.draftState?.playerTimers, playerId, isPaused, isCompleted, serverTimeOffset]);

  useEffect(() => {
    if (!isPaused && preSelectedId) {
      socket.emit('select_card', { roomId: room.id, playerId, cardId: preSelectedId });
    }
  }, [preSelectedId, isPaused, room.id, playerId]);

  useEffect(() => {
    if (selectedCardId && !currentPack.find((c: Card) => c.id === selectedCardId)) {
      setSelectedCardId(null);
    }
    if (preSelectedId && !currentPack.find((c: Card) => c.id === preSelectedId)) {
      setPreSelectedId(null);
    }
  }, [currentPack, selectedCardId, preSelectedId]);

  const prevPackCountRef = useRef(0);

  const hasAutoClosedRef = useRef(false);
  const hasSavedRef = useRef(false);

  // Salvataggio nello storico locale a fine draft
  useEffect(() => {
    if (isCompleted && !hasSavedRef.current && currentPlayer?.pool && currentPlayer.pool.length > 0) {
      const draftRecord = {
        id: `draft-${room.id}-${Date.now()}`,
        roomId: room.id,
        date: new Date().toISOString(),
        cubeName: room.rules.cubeName || 'Cubo Senza Nome',
        playerPool: currentPlayer.pool.map((c: any) => ({
          ...c,
          image_url: c.image_url || c.image_uris?.normal || '',
          scryfall_id: c.scryfall_id || c.id || ''
        })),
        playerCount: room.players.length,
        stats: {}
      };

      const saved = localStorage.getItem('mtg_draft_history');
      let history = [];
      if (saved) {
        try {
          history = JSON.parse(saved);
        } catch (e) {}
      }
      
      // Evitiamo duplicati per la stessa stanza nello storico recente
      if (!history.some((r: any) => r.roomId === room.id && Math.abs(new Date(r.date).getTime() - Date.now()) < 10000)) {
        history.unshift(draftRecord);
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem('mtg_draft_history', JSON.stringify(history));
        hasSavedRef.current = true;
      }
    }
  }, [isCompleted, room, currentPlayer]);

  // Auto-exit review at 10 seconds - Only once per pack
  useEffect(() => {
    if (currentPack.length === 0) {
      hasAutoClosedRef.current = false;
    }

    if (timeLeft !== null && timeLeft <= 10 && !isPaused && isReviewOpen && !hasAutoClosedRef.current) {
      setIsReviewOpen(false);
      hasAutoClosedRef.current = true;
    }
  }, [timeLeft, isPaused, isReviewOpen, currentPack.length]);

  // Auto-exit review when new pack arrives
  useEffect(() => {
    if (currentPack.length > 0 && prevPackCountRef.current === 0 && isReviewOpen) {
      setIsReviewOpen(false);
    }
    prevPackCountRef.current = currentPack.length;
  }, [currentPack.length, isReviewOpen]);

  const handlePick = () => {
    const cardToPick = preSelectedId;
    if (!cardToPick || isPaused) return;

    socket.emit('pick_card', {
      roomId: room.id,
      playerId,
      cardId: cardToPick
    });

    setSelectedCardId(null);
    setPreSelectedId(null);
  };

  const selectedCard = currentPack.find((c: Card) => c.id === selectedCardId);

  return (
    <div className="portrait:min-h-[100dvh] landscape:h-[100dvh] lg:h-[100dvh] bg-slate-950 text-slate-200 flex flex-col portrait:overflow-y-auto landscape:overflow-hidden lg:overflow-hidden">
      <AnimatePresence mode="wait">
        {isPreloading ? (
          <motion.div
            key="preloader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-8"
          >
            <div className="relative w-32 h-32 mb-8">
              <motion.div
                className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-white/5"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray="377"
                  initial={{ strokeDashoffset: 377 }}
                  animate={{ strokeDashoffset: 377 - (377 * (preloadProgress / 100)) }}
                  className="text-indigo-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-white">{preloadProgress}%</span>
              </div>
            </div>
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-black text-white uppercase tracking-[0.3em] mb-2"
            >
              Caricamento Deck...
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-center max-w-xs leading-relaxed"
            >
              Stiamo ottimizzando le immagini delle carte per una fluidità totale durante la draft.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="main-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col h-full portrait:overflow-visible landscape:overflow-hidden lg:overflow-hidden"
          >
            <DraftHeader
              room={room}
              playerId={playerId!}
              timeLeft={timeLeft}
              isPaused={isPaused}
              onTogglePause={() => socket.emit('toggle_pause', { roomId: room.id, playerId })}
              onOpenTable={() => setIsTableOpen(true)}
              onOpenReview={() => setIsReviewOpen(true)}
              currentPlayer={currentPlayer}
              queuedCount={room.draftState?.queues?.[playerIndex!]?.length || 0}
            />

            <div className="flex-1 flex flex-col landscape:flex-row lg:flex-row overflow-visible md:overflow-hidden relative portrait:pt-[100px]">
              <PackGrid
                currentPack={currentPack}
                selectedCardId={selectedCardId}
                preSelectedId={preSelectedId}
                isPaused={isPaused}
                queuedCount={room.draftState?.queues?.[playerIndex!]?.length || 0}
                onSelectCard={(id) => {
                  const isMobileLandscape = window.matchMedia("(orientation: landscape) and (max-width: 1023px)").matches;
                  const isMobilePortrait = window.matchMedia("(orientation: portrait) and (max-width: 1023px)").matches;
                  if (!isMobileLandscape && !isMobilePortrait) {
                    setSelectedCardId(id);
                  }
                }}
                onPreSelect={setPreSelectedId}
                onPickCard={handlePick}
              />

              <AnimatePresence>
                {selectedCard && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedCardId(null)}
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 landscape:hidden lg:hidden"
                    />
                    <SelectionSidebar
                      selectedCard={selectedCard}
                      isPaused={isPaused}
                      currentIndex={currentPack.findIndex((c: Card) => c.id === selectedCardId)}
                      totalCards={currentPack.length}
                      onClose={() => setSelectedCardId(null)}
                      onPickCard={handlePick}
                      onNext={() => {
                        const idx = currentPack.findIndex((c: Card) => c.id === selectedCardId);
                        const nextIdx = (idx + 1) % currentPack.length;
                        const nextId = currentPack[nextIdx].id;
                        setSelectedCardId(nextId);
                        setPreSelectedId(nextId);
                        socket.emit('select_card', { roomId: room.id, playerId, cardId: nextId });
                      }}
                      onPrev={() => {
                        const idx = currentPack.findIndex((c: Card) => c.id === selectedCardId);
                        const prevIdx = (idx - 1 + currentPack.length) % currentPack.length;
                        const prevId = currentPack[prevIdx].id;
                        setSelectedCardId(prevId);
                        setPreSelectedId(prevId);
                        socket.emit('select_card', { roomId: room.id, playerId, cardId: prevId });
                      }}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {isTableOpen && (
                <TableViewModal
                  room={room}
                  playerId={playerId}
                  round={round}
                  timeLeft={timeLeft}
                  onClose={() => setIsTableOpen(false)}
                />
              )}

              {isReviewOpen && (
                <DeckReviewView
                  pool={pool.map((c: any) => ({
                    ...c,
                    image_url: c.image_url || c.image_uris?.normal || '',
                    scryfall_id: c.scryfall_id || c.id || ''
                  }))}
                  onClose={() => setIsReviewOpen(false)}
                  onUpdatePool={() => { }}
                  timeLeft={timeLeft}
                  isPaused={isPaused}
                  isHost={room?.hostPlayerId === playerId}
                  onTogglePause={() => socket.emit('toggle_pause', { roomId: room?.id, playerId, forcePause: false })}
                />
              )}

              {isPaused && !isReviewOpen && (
                <DraftPausedOverlay
                  room={room}
                  playerId={playerId}
                  onOpenReview={() => setIsReviewOpen(true)}
                  onResume={() => socket.emit('toggle_pause', { roomId: room.id, playerId, forcePause: false })}
                />
              )}

              {isCompleted && !isReviewOpen && (
                <DraftCompletedOverlay
                  onOpenReview={() => setIsReviewOpen(true)}
                  onBack={onBack!}
                  onViewBots={room?.hostPlayerId === playerId ? () => setIsBotReviewOpen(true) : undefined}
                />
              )}

              {isBotReviewOpen && (
                <BotPoolsModal
                  room={room}
                  onClose={() => setIsBotReviewOpen(false)}
                />
              )}

              {/* MODAL ZOOM - Draft Packing View */}
              {zoomCard && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl p-4 sm:p-10 animate-in fade-in duration-300" onClick={() => { setZoomCard(null); setIsZoomFlipped(false); }}>
                  {/* Pulsante di chiusura - Spostato in alto a destra fisso */}
                  <button className="fixed top-4 right-4 sm:top-8 sm:right-8 text-white/40 hover:text-white transition-all p-3 bg-white/5 rounded-full backdrop-blur-md border border-white/5 z-[2100]">
                    <X className="w-8 h-8 sm:w-10 sm:h-10" />
                  </button>

                  <div className="relative flex flex-col items-center gap-6">
                    <img
                      src={isZoomFlipped && zoomCard.back_image_url ? zoomCard.back_image_url : (zoomCard.image_uris?.normal || (zoomCard as any).image_url)}
                      alt={zoomCard.name}
                      className="max-h-[75vh] sm:max-h-[85vh] w-auto object-contain rounded-[2rem] sm:rounded-[3rem] shadow-[0_40px_150px_rgba(99,102,241,0.3)] border-[4px] sm:border-[6px] border-white/10 animate-in zoom-in-95 duration-500 relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {zoomCard.back_image_url && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsZoomFlipped(!isZoomFlipped); }}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3 active:scale-95 group z-20"
                      >
                        <RefreshCw className={`w-5 h-5 ${isZoomFlipped ? 'rotate-180' : ''} transition-transform duration-500`} />
                        Gira Carta
                      </button>
                    )}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
