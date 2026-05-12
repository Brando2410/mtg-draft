import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { DraftPoolBuilder } from '../features/collection/DraftPoolBuilder';
import { DraftPackView } from '../features/game/DraftPackView';
import { Collection } from '../features/collection/Collection';
import { MainMenu } from '../features/menu/MainMenu';
import { GameModeSelection } from '../features/menu/GameModeSelection';
import { DraftSetup } from '../features/lobby/DraftSetup';
import { JoinRoom } from '../features/lobby/JoinRoom';
import { Lobby } from '../features/lobby/Lobby';
import { TournamentBracket } from '../features/lobby/TournamentBracket';
import { SealedSetup } from '../features/lobby/SealedSetup';
import { DeckBuilder } from '../features/deck-builder/DeckBuilder';
import { GameView } from '../features/game/GameView';
import { PageLayout } from '../components/shared/PageLayout';
import { useDraftStore } from '../store/useDraftStore';
import { socket } from '../services/socket';
import { DraftHistory } from '../features/history/DraftHistory';
import { LimitedEventOver } from '../features/game/LimitedEventOver';

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
  const [pendingRedirects, setPendingRedirects] = useState<Array<{to: string, label: string}>>([]);
  const [dismissedTargets, setDismissedTargets] = useState<Set<string>>(new Set());

  const handleSelectCubeFromCollection = (cubeData: any) => {
    localStorage.setItem('mtg_draft_cube', JSON.stringify(cubeData));
    setSkipRestore(true);
    setActiveView('builder');
  };

  const handleSelectDeckFromCollection = (deckData: any) => {
    setSelectedDeck(deckData);
    setActiveView('deck_builder');
  };

  useEffect(() => {
    if (!rooms || Object.keys(rooms).length === 0) return;

    const currentPathNormalized = location.pathname.replace(/\/$/, '').toLowerCase();
    const suggestions: Array<{to: string, label: string}> = [];

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
              if (view === 'draft_join') {
                const savedRoomId = localStorage.getItem('mtg_room_id');
                const savedPlayerName = localStorage.getItem('mtg_player_name');
                if (savedRoomId && savedPlayerName) {
                  joinRoom(savedRoomId, savedPlayerName);
                  return;
                }
              }
              const viewPaths: any = { builder: '/cube-builder', draft_setup: '/play', draft_join: '/join', collection: '/collection', history: '/history' };
              navigate(viewPaths[view] || '/');
            }} 
          />
        } />

        {/* CUBE BUILDER */}
        <Route path="/cube-builder" element={
          <PageLayout>
            <DraftPoolBuilder skipRestore={skipRestore} onBack={() => navigate('/')} />
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
                  hostName: localStorage.getItem('mtg_player_name') || 'Giocatore'
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
            <p className="text-slate-500 uppercase tracking-widest font-bold mb-8">Percorso non trovato: {location.pathname}</p>
            <button onClick={() => navigate('/')} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest">Torna alla Home</button>
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
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Eventi in Corso</h3>
                  <p className="text-sm font-medium text-slate-400">Ci sono più eventi che richiedono la tua attenzione. Dove vuoi andare?</p>
                </div>

                <div className="w-full max-h-[300px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
                  {pendingRedirects.map((redir) => (
                    <div 
                      key={`redir-${redir.to}`}
                      className="bg-slate-950/50 rounded-3xl p-4 border border-white/5 flex items-center justify-between gap-4 group hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{redir.label}</span>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter tabular-nums">Codice: {redir.to.split('/').pop()}</span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          navigate(redir.to, { replace: true });
                          setPendingRedirects([]); // Clear to avoid flickering
                        }}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest text-[9px] shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                      >
                        Vai ora <ArrowRight className="w-3 h-3" />
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
                    Rimani qui per ora
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
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Sincronizzazione Arena...</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Stanza: {roomId}</p>
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
  const room = roomId ? rooms[roomId?.toUpperCase()] : null;

  // If we are on an event path but the room is missing from our collection, go home
  if (roomId && !room) {
    return <Navigate to="/" replace />;
  }

  if (!room) {
    return (
      <PageLayout variant="slate" className="flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Caricamento Evento...</h2>
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
      {room.status === 'deckbuilding' || (room.rules.isSealed && room.status === 'drafting') || isEditingDeck ? (
        <DeckBuilder 
          onBack={() => setIsEditingDeck(false)}
          pool={room.players.find((p: any) => p.playerId === playerId || '')?.pool}
          initialDeck={room.players.find((p: any) => p.playerId === playerId || '')?.deck}
          onConfirm={(deckData) => {
            socket?.emit('ready_with_deck', { roomId: room.id, playerId, deck: deckData });
            setIsEditingDeck(false);
          }}
        />
      ) : (room.status === 'tournament' || showBracket) ? (
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
        />
      ) : (
        <DraftPackView
          room={room}
          playerId={playerId}
          onBack={() => setActiveView('menu')}
        />
      )}
    </div>
  );
};

// --- UTILS ---
const getFriendlyPathName = (path: string) => {
  if (path.includes('/lobby/sealed/')) return 'Lobby Sealed Event';
  if (path.includes('/lobby/draft/')) return 'Lobby Draft Event';
  if (path.includes('/lobby/match/')) return 'Lobby Partita Rapida';
  if (path.includes('/sealed-event/')) return 'Evento Sealed: Deck Building';
  if (path.includes('/draft-event/')) return 'Evento Draft: In Corso';
  if (path.includes('/quick-match/')) return 'Partita in Corso';
  if (path === '/history') return 'Cronologia Eventi';
  if (path === '/collection') return 'Collezione';
  if (path === '/deck-builder') return 'Costruzione Mazzo';
  return 'Nuova Fase Evento';
};
