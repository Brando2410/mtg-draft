import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { DraftPoolBuilder } from '../features/collection/DraftPoolBuilder';
import { DraftPackView } from '../features/game/draft/DraftPackView';
import { Collection } from '../features/collection/Collection';
import { MainMenu } from '../features/menu/MainMenu';
import { GameModeSelection } from '../features/menu/GameModeSelection';
import { DraftSetup } from '../features/lobby/DraftSetup';
import { JoinRoom } from '../features/lobby/JoinRoom';
import { Lobby } from '../features/lobby/Lobby';
import { TournamentBracket } from '../features/lobby/TournamentBracket';
import { SealedSetup } from '../features/lobby/SealedSetup';
import { DeckBuilder } from '../features/deck-builder/DeckBuilder';
import { GameView } from '../features/game/core/GameView';
import { PageLayout } from '../components/shared/PageLayout';
import { useDraftStore } from '../store/useDraftStore';
import { socket } from '../services/socket';
import { DraftHistory } from '../features/history/DraftHistory';
import { LimitedEventOver } from '../features/game/modals/LimitedEventOver';

interface AppRouterProps {
  setIsAdminOpen: (val: boolean) => void;
  setIsAssetOpen: (val: boolean) => void;
  skipRestore: boolean;
  setSkipRestore: (val: boolean) => void;
  selectedDeck: any;
  setSelectedDeck: (val: any) => void;
  setIsSealedMode: (val: boolean) => void;
  spectatedMatchIndex: number | null;
  setSpectatedMatchIndex: (val: number | null) => void;
}

export const AppRouter = ({
  setIsAdminOpen,
  setIsAssetOpen,
  skipRestore,
  setSkipRestore,
  selectedDeck,
  setSelectedDeck,
  setIsSealedMode,
  spectatedMatchIndex,
  setSpectatedMatchIndex
}: AppRouterProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const {
    room,
    playerId,
    joinError,
    isJoining,
    activeView,
    setActiveView,
    joinRoom,
    createRoom,
    startDraft,
    closeRoom,
    kickPlayer,
    changeAvatar,
    addBot,
    setRoom
  } = useDraftStore();

  const { rooms } = useDraftStore();
  const [pendingRedirects, setPendingRedirects] = useState<Array<{ to: string, label: string }>>([]);
  const [dismissedTargets, setDismissedTargets] = useState<Set<string>>(new Set());

  const handleSelectCubeFromCollection = (cubeData: any) => {
    localStorage.setItem('mtg_draft_cube', JSON.stringify(cubeData));
    setSkipRestore(true);
    setActiveView('builder');
    navigate('/cube-builder');
  };

  const handleSelectDeckFromCollection = (deckData: any) => {
    setSelectedDeck(deckData);
    setActiveView('deck_builder');
    navigate('/deck-builder');
  };

  useEffect(() => {
    if (!rooms || Object.keys(rooms).length === 0) return;

    const currentPathNormalized = location.pathname.replace(/\/$/, '').toLowerCase();
    const suggestions: Array<{ to: string, label: string }> = [];

    Object.values(rooms).forEach(r => {
      const isLobby = r.status === 'waiting';
      const isEvent = ['drafting', 'deckbuilding', 'active', 'tournament'].includes(r.status);
      const roomId = r.id;

      let targetPath = '';
      if (isLobby) {
        if (r.isNormalMatch) targetPath = `/lobby/match/${roomId}`;
        else if (r.rules?.isSealed) targetPath = `/lobby/sealed/${roomId}`;
        else targetPath = `/lobby/draft/${roomId}`;
      } else if (isEvent) {
        if (r.isNormalMatch) targetPath = `/quick-match/${roomId}`;
        else if (r.rules?.isSealed) targetPath = `/sealed-event/${roomId}`;
        else targetPath = `/draft-event/${roomId}`;
      }

      if (targetPath) {
        const targetPathNormalized = targetPath.toLowerCase();
        if (currentPathNormalized !== targetPathNormalized && !dismissedTargets.has(targetPathNormalized)) {
          suggestions.push({
            to: targetPath,
            label: getFriendlyPathName(targetPath)
          });
        }
      }
    });

    const isAllowedOverride = location.pathname.startsWith('/collection') ||
      location.pathname.startsWith('/deck-builder') ||
      isEditingDeck;

    const isCurrentlyOnMenu = ['/', '/play', '/play/draft', '/play/sealed', '/join'].includes(currentPathNormalized);
    const isCurrentlyOnRoomPath = currentPathNormalized.includes('/lobby/') ||
      currentPathNormalized.includes('-event/') ||
      currentPathNormalized.includes('/quick-match/');

    if (suggestions.length > 0 && !isAllowedOverride) {
      // --- SMART AUTO-NAVIGATE ---

      // 1. If we are on a menu page and have only 1 suggestion, go for it
      if (isCurrentlyOnMenu && suggestions.length === 1) {
        navigate(suggestions[0].to, { replace: true });
        return;
      }

      // 2. If the suggestion is for the SAME room we are currently viewing, auto-navigate
      // This handles Lobby -> Game transitions without a modal
      const currentRoomId = currentPathNormalized.split('/').pop()?.toUpperCase();
      const sameRoomSuggestion = suggestions.find(s => s.to.toUpperCase().endsWith(currentRoomId || ''));

      if (sameRoomSuggestion && isCurrentlyOnRoomPath) {
        console.log(`[Router] Auto-transitioning within room: ${currentRoomId}`);
        navigate(sameRoomSuggestion.to, { replace: true });
        return;
      }

      // Otherwise, show the selection hub
      setPendingRedirects(suggestions);
    } else if (isCurrentlyOnRoomPath && suggestions.length === 0 && !isAllowedOverride) {
      // If we are on a room path but have no active rooms/suggestions matching, 
      // it means the room was closed or we left it.
      const currentRoomId = currentPathNormalized.split('/').pop()?.toUpperCase();
      if (currentRoomId && !rooms[currentRoomId]) {
        console.log(`[Router] Room ${currentRoomId} is no longer active. Returning to menu.`);
        navigate('/', { replace: true });
      }
    } else {
      setPendingRedirects([]);
    }
  }, [rooms, location.pathname, isEditingDeck, dismissedTargets, navigate]);

  // --- REVERSE SYNC (URL -> STORE) ---
  useEffect(() => {
    const path = location.pathname;
    let targetView: any = activeView;

    if (path === '/') targetView = 'menu';
    else if (path === '/collection') targetView = 'collection';
    else if (path === '/deck-builder') targetView = 'deck_builder';
    else if (path === '/cube-builder') targetView = 'builder';
    else if (path === '/play' || path.startsWith('/play/')) targetView = 'draft_setup';
    else if (path === '/join') targetView = 'draft_join';
    else if (path === '/history') targetView = 'history';
    else if (path.includes('/lobby/')) targetView = 'draft_lobby';
    else if (path.includes('-event/') || path.includes('/quick-match/')) targetView = 'drafting';

    // IMPORTANT: Sync the focused 'room' pointer with the URL roomId
    const urlRoomId = path.split('/').pop()?.toUpperCase();
    const targetRoom = (urlRoomId && rooms) ? rooms[urlRoomId] : null;

    // If we are on a room path but the room is missing, we should go to menu
    if (urlRoomId && !targetRoom && (path.includes('/lobby/') || path.includes('-event/') || path.includes('/quick-match/'))) {
      targetView = 'menu';
    }

    if (targetView && targetView !== activeView) {
      setActiveView(targetView);
    }

    if (targetRoom && room?.id !== targetRoom.id) {
      setRoom(targetRoom);
    }
  }, [location.pathname, activeView, setActiveView, rooms, room?.id, setRoom]);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location}>
          {/* MAIN MENU */}
          <Route path="/" element={
            <MainMenu
              onShowAdmin={() => setIsAdminOpen(true)}
              onShowAssets={() => setIsAssetOpen(true)}
              onSelect={(view) => {
                setSkipRestore(false);
                const viewPaths: any = { builder: '/cube-builder', draft_setup: '/play', draft_join: '/join', collection: '/collection', history: '/history' };
                navigate(viewPaths[view] || '/');
              }}
            />
          } />

          {/* CUBE BUILDER */}
          <Route path="/cube-builder" element={
            <PageLayout>
              <DraftPoolBuilder skipRestore={skipRestore} onBack={() => navigate('/collection')} />
            </PageLayout>
          } />

          {/* GAME MODE SELECTION */}
          <Route path="/play" element={
            <GameModeSelection
              onBack={() => navigate('/')}
              onSelectMode={(mode) => {
                if (mode === 'draft') {
                  setIsSealedMode(false);
                  navigate('/play/draft');
                } else if (mode === 'sealed') {
                  setIsSealedMode(true);
                  navigate('/play/sealed');
                } else {
                  createRoom({
                    playerCount: 2,
                    isNormalMatch: true,
                    hostName: localStorage.getItem('mtg_player_name') || 'Player'
                  });
                }
              }}
            />
          } />

          {/* DRAFT CONFIG */}
          <Route path="/play/draft" element={
            <DraftSetup
              onBack={() => navigate('/play')}
              onCreateRoom={createRoom}
              isSealed={false}
            />
          } />

          {/* SEALED CONFIG */}
          <Route path="/play/sealed" element={
            <SealedSetup
              onBack={() => navigate('/play')}
              onCreateRoom={createRoom}
            />
          } />

          {/* JOIN ROOM */}
          <Route path="/join" element={
            <JoinRoom
              onBack={() => navigate('/')}
              onJoin={joinRoom}
              error={joinError}
              loading={isJoining}
            />
          } />

          {/* LOBBY VARIANTS */}
          <Route path="/lobby/:roomId" element={
            <LobbyWrapper
              rooms={rooms}
              playerId={playerId}
              onStart={startDraft}
              onClose={closeRoom}
              onKick={kickPlayer}
              onChangeAvatar={changeAvatar}
              onAddBot={addBot}
            />
          } />
          <Route path="/lobby/draft/:roomId" element={
            <LobbyWrapper
              rooms={rooms}
              playerId={playerId}
              onStart={startDraft}
              onClose={closeRoom}
              onKick={kickPlayer}
              onChangeAvatar={changeAvatar}
              onAddBot={addBot}
            />
          } />
          <Route path="/lobby/sealed/:roomId" element={
            <LobbyWrapper
              rooms={rooms}
              playerId={playerId}
              onStart={startDraft}
              onClose={closeRoom}
              onKick={kickPlayer}
              onChangeAvatar={changeAvatar}
              onAddBot={addBot}
            />
          } />
          <Route path="/lobby/match/:roomId" element={
            <LobbyWrapper
              rooms={rooms}
              playerId={playerId}
              onStart={startDraft}
              onClose={closeRoom}
              onKick={kickPlayer}
              onChangeAvatar={changeAvatar}
              onAddBot={addBot}
            />
          } />

          {/* EVENT VARIANTS */}
          <Route path="/draft-event/:roomId" element={
            <EventWrapper
              rooms={rooms}
              playerId={playerId}
              isEditingDeck={isEditingDeck}
              setIsEditingDeck={setIsEditingDeck}
              spectatedMatchIndex={spectatedMatchIndex}
              setSpectatedMatchIndex={setSpectatedMatchIndex}
              setActiveView={setActiveView}
            />
          } />
          <Route path="/sealed-event/:roomId" element={
            <EventWrapper
              rooms={rooms}
              playerId={playerId}
              isEditingDeck={isEditingDeck}
              setIsEditingDeck={setIsEditingDeck}
              spectatedMatchIndex={spectatedMatchIndex}
              setSpectatedMatchIndex={setSpectatedMatchIndex}
              setActiveView={setActiveView}
            />
          } />
          <Route path="/quick-match/:roomId" element={
            <EventWrapper
              rooms={rooms}
              playerId={playerId}
              isEditingDeck={isEditingDeck}
              setIsEditingDeck={setIsEditingDeck}
              spectatedMatchIndex={spectatedMatchIndex}
              setSpectatedMatchIndex={setSpectatedMatchIndex}
              setActiveView={setActiveView}
            />
          } />

          {/* COLLECTION */}
          <Route path="/collection" element={
            <PageLayout variant="slate">
              <Collection
                onBack={() => navigate('/')}
                onSelectCube={handleSelectCubeFromCollection}
                onSelectDeck={handleSelectDeckFromCollection}
                onCreateNewCube={() => {
                  setSkipRestore(true);
                  navigate('/cube-builder');
                }}
                onCreateNewDeck={() => {
                  setSelectedDeck(null);
                  navigate('/deck-builder');
                }}
              />
            </PageLayout>
          } />

          {/* DECK BUILDER (FREESTANDING) */}
          <Route path="/deck-builder" element={
            <DeckBuilder
              onBack={() => navigate('/collection')}
              initialDeck={selectedDeck}
            />
          } />

          {/* HISTORY */}
          <Route path="/history" element={
            <PageLayout>
              <DraftHistory onBack={() => navigate('/')} />
            </PageLayout>
          } />

          {/* FALLBACK */}
          <Route path="*" element={
            <PageLayout variant="slate" className="flex flex-col items-center justify-center p-20">
              <h1 className="text-6xl font-black text-white italic mb-4">404</h1>
              <p className="text-slate-500 uppercase tracking-widest font-bold mb-8">Path not found: {location.pathname}</p>
              <button onClick={() => navigate('/')} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest">Back to Home</button>
            </PageLayout>
          } />
        </Routes>

      </AnimatePresence>

      {/* SYNC PROMPT MODAL - Moved outside main transition to avoid conflict with 'wait' mode */}
      <AnimatePresence>
        {pendingRedirects.length > 0 && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)' }}
            >
              {/* DECORATION */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-600 rounded-full blur-[40px] opacity-20" />

              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  <AlertTriangle className="w-8 h-8 text-indigo-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Ongoing Events</h3>
                </div>

                <div className="w-full max-h-[300px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
                  {pendingRedirects.map((redir) => (
                    <div
                      key={`redir-${redir.to}`}
                      className="bg-slate-950/50 rounded-3xl p-4 border border-white/5 flex items-center justify-between gap-4 group hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{redir.label}</span>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter tabular-nums">Code: {redir.to.split('/').pop()}</span>
                      </div>

                      <button
                        onClick={() => {
                          navigate(redir.to, { replace: true });
                          setPendingRedirects([]); // Clear to avoid flickering
                        }}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest text-[9px] shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                      >
                        Go now <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="w-full pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      // Dismiss ALL current suggestions
                      const newDismissed = new Set(dismissedTargets);
                      pendingRedirects.forEach(p => newDismissed.add(p.to.toLowerCase()));
                      setDismissedTargets(newDismissed);
                      setPendingRedirects([]);
                    }}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-black rounded-2xl uppercase tracking-widest text-[10px] transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- HELPER WRAPPERS (To handle loading states and avoid home-redirect loop on refresh) ---

const LobbyWrapper = ({ rooms, playerId, onStart, onClose, onKick, onChangeAvatar, onAddBot }: any) => {
  const { roomId } = useParams();
  const room = roomId ? rooms[roomId?.toUpperCase()] : null;

  // If we are on a lobby path but the room is missing from our collection, go home
  if (roomId && !room) {
    return <Navigate to="/" replace />;
  }

  if (!room) {
    return (
      <PageLayout variant="slate" className="flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Syncing Lobby...</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Lobby: {roomId}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <Lobby
      roomCode={room.id}
      players={room.players}
      rules={room.rules}
      isHost={room.hostPlayerId === playerId}
      onStart={onStart}
      onClose={onClose}
      onKick={onKick}
      onChangeAvatar={onChangeAvatar}
      onAddBot={onAddBot}
      isNormalMatch={room.isNormalMatch}
    />
  );
};

const EventWrapper = ({ rooms, playerId, isEditingDeck, setIsEditingDeck, spectatedMatchIndex, setSpectatedMatchIndex, setActiveView }: any) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [showBracket, setShowBracket] = useState(false);
  const [joiningMatchIndex, setJoiningMatchIndex] = useState<number | null>(null);
  const room = roomId ? rooms[roomId?.toUpperCase()] : null;
  const currentPlayer = room?.players?.find((p: any) => p.playerId === playerId);
  const isReady = !!currentPlayer?.isReady;

  // Auto-transition to game if the match we are joining becomes active
  // MOVED TO TOP to avoid Hook Violation during early returns
  useEffect(() => {
    if (joiningMatchIndex !== null && room?.matches?.[joiningMatchIndex]?.status === 'active') {
      setSpectatedMatchIndex(joiningMatchIndex);
      setJoiningMatchIndex(null);
    }
  }, [room?.matches, joiningMatchIndex, setSpectatedMatchIndex]);

  // If we are on an event path but the room is missing from our collection, go home
  if (roomId && !room) {
    return <Navigate to="/" replace />;
  }

  if (!room) {
    return (
      <PageLayout variant="slate" className="flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Loading Event...</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">ID: {roomId}</p>
        </div>
      </PageLayout>
    );
  }

  // EVENT OVER VIEW
  if (room.status === 'completed' && !showBracket) {
    return (
      <LimitedEventOver
        room={room}
        playerId={playerId}
        onBack={() => navigate('/')}
        onViewTournament={(room.status === 'tournament' || room.matches?.length > 0) ? () => setShowBracket(true) : undefined}
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-700 h-full">
      {(room.status === 'deckbuilding' || (room.rules.isSealed && room.status === 'drafting') || isEditingDeck) && (!isReady || isEditingDeck) ? (
        <DeckBuilder
          onBack={() => {
            if (isEditingDeck) setIsEditingDeck(false);
            else navigate('/');
          }}
          pool={currentPlayer?.pool}
          initialDeck={currentPlayer?.deck}
          onConfirm={(deckData) => {
            socket?.emit('ready_with_deck', { roomId: room.id, playerId, deck: deckData });
            setIsEditingDeck(false);
          }}
        />
      ) : (room.status === 'tournament' || room.status === 'deckbuilding' || showBracket) ? (
        spectatedMatchIndex !== null || (room.matches?.some((m: any) => m.players.includes(playerId)) && spectatedMatchIndex !== null) ? (
          <GameView
            room={room}
            playerId={playerId}
            customGameState={spectatedMatchIndex !== null ? room.matches?.[spectatedMatchIndex]?.engineState : room.matches?.find((m: any) => m.players.includes(playerId))?.engineState}
            onLeave={() => setSpectatedMatchIndex(null)}
            onBack={() => setSpectatedMatchIndex(null)}
          />
        ) : (
          <TournamentBracket
            room={room}
            playerId={playerId}
            onBack={showBracket ? () => setShowBracket(false) : () => navigate('/')}
            onEditDeck={() => setIsEditingDeck(true)}
            onJoinMatch={(idx: number) => {
              const match = room.matches?.[idx];
              if (match?.status === 'pending') {
                socket?.emit('join_tournament_match', { roomId: room.id, playerId, matchIndex: idx });
                setJoiningMatchIndex(idx);
              } else if (match?.status === 'active') {
                setSpectatedMatchIndex(idx);
              }
            }}
            onSpectate={(idx: number) => {
              socket?.emit('spectate_tournament_match', { roomId: room.id, playerId, matchIndex: idx });
              setSpectatedMatchIndex(idx);
            }}
          />
        )
      ) : (room.isNormalMatch || (room.status === 'active' && room.matches?.some((m: any) => m.players.includes(playerId)))) ? (
        <GameView
          room={room}
          playerId={playerId}
          customGameState={room.matches?.find((m: any) => m.players.includes(playerId))?.engineState || room.gameState}
          onBack={() => navigate('/')}
          onLeave={() => navigate('/')}
        />
      ) : (
        <DraftPackView
          room={room}
          playerId={playerId}
          onBack={() => setActiveView('menu')}
        />
      )}

      {/* MATCH WAITING ROOM MODAL */}
      <AnimatePresence>
        {joiningMatchIndex !== null && room.matches?.[joiningMatchIndex] && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]" />
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px]" />

              <div className="relative z-10 flex flex-col items-center text-center gap-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Match Lobby</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Waiting for synchronization</p>
                </div>

                <div className="flex items-center justify-center gap-12 w-full">
                  {/* PLAYER 1 */}
                  {(() => {
                    const pId = room.matches[joiningMatchIndex].players[0];
                    const p = room.players.find((rp: any) => rp.playerId === pId);
                    const isJoined = room.matches![joiningMatchIndex!].joinedPlayers?.includes(pId);
                    return (
                      <div className="flex flex-col items-center gap-6 w-32">
                        <div className={`relative w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all duration-500 ${isJoined ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-white/10'}`}>
                          {p ? <img src={`/avatars/${p.avatar || 'ajani.png'}`} className="w-full h-full object-cover" alt={p?.name} /> : <div className="w-full h-full bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-slate-700 animate-spin" /></div>}
                          <AnimatePresence>{isJoined && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><div className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase">Ready</div></motion.div>}</AnimatePresence>
                        </div>
                        <span className={`text-sm font-black uppercase italic truncate w-full ${isJoined ? 'text-white' : 'text-slate-600'}`}>{p?.name || 'TBD'}</span>
                      </div>
                    );
                  })()}

                  {/* VERSUS DIVIDER */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <span className="text-xl font-black italic text-indigo-500">VS</span>
                    <div className="w-px h-12 bg-gradient-to-t from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* PLAYER 2 */}
                  {(() => {
                    const pId = room.matches[joiningMatchIndex].players[1];
                    const p = room.players.find((rp: any) => rp.playerId === pId);
                    const isJoined = room.matches![joiningMatchIndex!].joinedPlayers?.includes(pId);
                    return (
                      <div className="flex flex-col items-center gap-6 w-32">
                        <div className={`relative w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all duration-500 ${isJoined ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-white/10'}`}>
                          {p ? <img src={`/avatars/${p.avatar || 'ajani.png'}`} className="w-full h-full object-cover" alt={p?.name} /> : <div className="w-full h-full bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-slate-700 animate-spin" /></div>}
                          <AnimatePresence>{isJoined && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><div className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase">Ready</div></motion.div>}</AnimatePresence>
                        </div>
                        <span className={`text-sm font-black uppercase italic truncate w-full ${isJoined ? 'text-white' : 'text-slate-600'}`}>{p?.name || 'TBD'}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="w-full space-y-6">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-[10px] font-black text-indigo-400 tracking-widest animate-pulse">
                      Waiting for Opponent...
                    </span>
                  </div>

                  <button
                    onClick={() => setJoiningMatchIndex(null)}
                    className="w-full py-4 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-white border border-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- UTILS ---
const getFriendlyPathName = (path: string) => {
  if (path.includes('/lobby/sealed/')) return 'Lobby Sealed Event';
  if (path.includes('/lobby/draft/')) return 'Lobby Draft Event';
  if (path.includes('/lobby/match/')) return 'Quick Match Lobby';
  if (path.includes('/sealed-event/')) return 'Sealed Event: Deck Building';
  if (path.includes('/draft-event/')) return 'Draft Event: In Progress';
  if (path.includes('/quick-match/')) return 'Match in Progress';
  if (path === '/history') return 'Event History';
  if (path === '/collection') return 'Collection';
  if (path === '/deck-builder') return 'Deck Building';
  return 'New Event Phase';
};
