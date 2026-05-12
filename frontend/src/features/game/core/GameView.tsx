import { type Room, type TournamentMatch } from '@shared/types';
import { Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Battlefield } from '../arena/battlefield/Battlefield';
import { PlayerHand } from '../arena/players/PlayerHand';
import { OpponentHand } from '../arena/players/OpponentHand';
import { DebugConsole } from '../modals/DebugConsole';
import { ActionButton } from './ActionButton';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameObject, ActionType } from '@shared/engine_types';
import { useDraftStore } from '../../../store/useDraftStore';
import { GameCard } from '../arena/objects/GameCard';
import battlefieldBg from '../../../assets/syd-roberts-portfolio-dsk-battlefield-lightsoff.jpg';
import { ZoneInspector } from '../modals/ZoneInspector';
import { Ordering } from '../modals/Ordering';
import { EscMenu } from '../modals/EscMenu';
import { GameOver } from '../modals/GameOver';
import { RestartMatch } from '../modals/RestartMatch';
import { TurnTransitionOverlay } from '../arena/battlefield/TurnTransitionOverlay';
import { useCardZoom } from '../../../hooks/game/useCardZoom';
import { useGameActions } from '../../../hooks/game/useGameActions';
import { useKeyboardControls } from '../../../hooks/game/useKeyboardControls';
import { useSpectatorPresence } from '../../../hooks/game/useSpectatorPresence';
import { GameHeader } from './GameHeader';

interface GameViewProps {
  room: Room;
  playerId: string;
  customGameState?: any;
  onLeave?: () => void;
  onBack?: () => void;
}

export const GameView = ({ room, playerId, customGameState, onLeave, onBack }: GameViewProps) => {
  const [showDebug, setShowDebug] = useState(false);
  const gameState = customGameState || room.gameState;
  const initialPlayerId = gameState?.players[playerId] ? playerId : Object.keys(gameState?.players || {})[0];
  const [effectivePlayerId, setEffectivePlayerId] = useState(initialPlayerId || playerId);
  const [showEscMenu, setShowEscMenu] = useState(false);
  const [inspectingZone, setInspectingZone] = useState<{ cards: GameObject[], label: string, type: 'graveyard' | 'exile', isMe: boolean } | null>(null);

  const { leaveRoom } = useDraftStore();
  const { hoveredCard, setHoveredCard, startZoom, stopZoom } = useCardZoom();
  const actions = useGameActions(room.id, effectivePlayerId);
  
  const currentMatch = room.matches?.find((m: TournamentMatch) => m.players.includes(effectivePlayerId) && m.status === 'active');
  const restartRequestedBy = currentMatch?.restartRequestedBy;
  const isRequestingRestart = restartRequestedBy === effectivePlayerId;
  const requesterName = restartRequestedBy ? room.players.find(p => p.playerId === restartRequestedBy)?.name : undefined;

  const { spectatorCount, spectators, lastSpectatorName } = useSpectatorPresence({ room, playerId, effectivePlayerId });

  // Point 6: Automatic POV Fallback
  useEffect(() => {
    if (gameState && !gameState.players[effectivePlayerId]) {
      const remainingPlayerId = Object.keys(gameState.players)[0];
      if (remainingPlayerId) {
        setEffectivePlayerId(remainingPlayerId);
      }
    }
  }, [gameState?.players, effectivePlayerId]);

  useKeyboardControls({
    onToggleFullControl: actions.toggleFullControl,
    onToggleEscMenu: () => setShowEscMenu(prev => !prev),
    onPassPriority: actions.passPriority,
    isEscMenuOpen: showEscMenu
  });

  const isSpectator = !gameState?.players[playerId];
  
  const handleSwapPOV = () => {
    const playerIds = Object.keys(gameState.players);
    if (playerIds.length < 2) return;
    const currentIndex = playerIds.indexOf(effectivePlayerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    setEffectivePlayerId(playerIds[nextIndex]);
  };

  const me = gameState?.players[effectivePlayerId];
  const opponentId = Object.keys(gameState?.players || {}).find(id => id !== effectivePlayerId);
  const opponent = opponentId ? gameState?.players[opponentId] : null;

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-10">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter animate-pulse">Initializing...</h2>
      </div>
    );
  }

  const hasPriority = gameState.priorityPlayerId === effectivePlayerId || gameState.pendingAction?.playerId === effectivePlayerId;

  const handleOrderClick = (type: string, list?: string[]) => {
    if (type === 'CONFIRM' && list) {
      actions.resolveCombatOrdering(list);
    }
  };

  const handleAllAttack = () => {
    if (!gameState || !me) return;
    actions.allAttack(gameState.battlefield, gameState.combat?.attackers);
  };

  const handleSwapZone = () => {
    if (!inspectingZone) return;
    const nextIsMe = !inspectingZone.isMe;
    const type = inspectingZone.type;

    if (type === 'exile') {
      const nextCards = (gameState.exile || []).filter((o: any) => o.ownerId === (nextIsMe ? effectivePlayerId : opponentId));
      setInspectingZone({
        label: nextIsMe ? "Your Exile" : "Enemy Exile",
        cards: nextCards,
        type: 'exile',
        isMe: nextIsMe
      });
    } else {
      const nextPlayer = nextIsMe ? me : opponent;
      setInspectingZone({
        label: nextIsMe ? "Your Graveyard" : "Enemy Graveyard",
        cards: nextPlayer?.graveyard || [],
        type: 'graveyard',
        isMe: nextIsMe
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#07080a] text-slate-200 flex flex-col overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* CINEMATIC BATTLEFIELD BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={battlefieldBg}
          className="w-full h-full object-cover scale-105 brightness-90"
          alt="Battlefield Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-black/20" />
      </div>

      <TurnTransitionOverlay activePlayerId={gameState.activePlayerId} playerId={effectivePlayerId} />

      {/* GLOBAL UI CONTROLS (Top Left) */}
      <GameHeader
        onOpenDebug={() => setShowDebug(true)}
        onOpenMenu={() => setShowEscMenu(true)}
        spectators={spectators}
        spectatorCount={spectatorCount}
      />

      {/* Spectator Notification Toast */}
      {lastSpectatorName && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 px-6 py-3 bg-indigo-600/90 backdrop-blur-xl border border-indigo-400/50 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.4)]">
            <div className="p-1 bg-white/20 rounded-full">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-bold text-white whitespace-nowrap">
              <span className="text-indigo-200">{lastSpectatorName}</span> is now spectating
            </p>
          </div>
        </div>
      )}

      <OpponentHand
        hand={[...(opponent?.hand || []), ...(opponent?.virtualHand || [])]}
        stateVersion={gameState.stateVersion}
        onHoverStart={startZoom}
        onHoverEnd={stopZoom}
      />

      {/* CENTRAL BATTLEFIELD */}
      <div className="flex-1 relative flex flex-col p-0 overflow-hidden gap-0">
        <Battlefield
          me={me} opponent={opponent} battlefield={gameState.battlefield}
          stack={gameState.stack || []} combat={gameState.combat}
          pendingAction={gameState.pendingAction} exile={gameState.exile || []}
          currentStep={gameState.currentStep}
          currentPhase={gameState.currentPhase}
          scrySurveilResult={gameState.turnState.lastScrySurveilResult}
          activePlayerId={gameState.activePlayerId}
          priorityPlayerId={gameState.priorityPlayerId}
          onToggleStop={actions.toggleStop}
          onAvatarClick={(isOpponent) => {
            const targetId = isOpponent ? opponentId : effectivePlayerId;
            if (targetId && gameState.pendingAction?.type === ActionType.Targeting && gameState.pendingAction.data?.targets?.includes(targetId)) {
              actions.resolveTarget(targetId);
            }
          }}
          onTapCard={(id) => {
            if (id.startsWith('ORDER_')) {
              actions.resolveCombatOrdering(id.replace('ORDER_', '').split(','));
              return;
            }
            if (id.startsWith('CHOICE_')) {
              const choiceRaw = id.replace('CHOICE_', '');
              const choiceIndex = (choiceRaw === 'undo' || choiceRaw.includes('|') || choiceRaw.startsWith('{')) ? choiceRaw : parseInt(choiceRaw);
              actions.resolveChoice(choiceIndex);
              return;
            }
            const pType = gameState.pendingAction?.type as any;
            if (pType === 'TARGETING' || pType === ActionType.Targeting) {
              actions.resolveTarget(id);
              return;
            }
            if ((pType === 'DECLARE_BLOCKERS' || pType === ActionType.DeclareBlockers) && gameState.pendingAction?.sourceId === id) {
              actions.resolveTarget('undo');
              return;
            }
            actions.tapPermanent(id);
          }}
          onChoiceResolve={actions.resolveChoice}
          hoveredCardId={hoveredCard?.id}
          onHoverStart={startZoom}
          onHoverEnd={stopZoom}
          onInspectZone={setInspectingZone}
        />

        <ActionButton
          hasPriority={hasPriority}
          pendingAction={gameState.pendingAction}
          currentPhase={gameState.currentPhase}
          currentStep={gameState.currentStep}
          onPass={() => {
            const currentPending = room.gameState?.pendingAction;
            const pendingType = currentPending?.type as any;
            const isTargeting = pendingType === 'TARGETING' || pendingType === ActionType.Targeting;

            if (isTargeting) {
              const selected = currentPending?.data?.selectedTargets || [];
              const targetDef = currentPending?.data?.targetDefinition;
              const isOptional = targetDef?.optional || targetDef?.minCount === 0;
              const rawMin = currentPending?.data?.minCount ?? (targetDef?.minCount ?? (isOptional ? 0 : (targetDef?.count ?? 1)));
              const min = typeof rawMin === 'number' ? rawMin : (typeof rawMin === 'object' && rawMin !== null && 'min' in rawMin ? (rawMin as any).min : 1);
              const canConfirm = selected.length >= min;
              actions.resolveTarget(canConfirm ? 'skip' : 'undo');
            } else {
              actions.passPriority();
            }
          }}
          onClear={() => actions.resolveTarget('clear')}
          onUndo={() => actions.resolveTarget('undo')}
          onToggleStop={actions.toggleStop}
          stackLength={gameState.stack?.length || 0}
          isMyTurn={gameState.activePlayerId === effectivePlayerId}
          stops={me?.stops}
          effectivePlayerId={effectivePlayerId}
          attackerCount={gameState.combat?.attackers?.length || 0}
          blockerCount={gameState.combat?.blockers?.filter((b: any) => gameState.battlefield.find((o: any) => o.id === b.blockerId)?.controllerId === effectivePlayerId).length || 0}
          onAllAttack={handleAllAttack}
          onCancelAttacks={actions.clearAttackers}
          onCancelBlocks={actions.clearBlockers}
          passUntilEndOfTurn={me?.passUntilEndOfTurn}
          onTogglePassTurn={actions.togglePassTurn}
          fullControl={me?.fullControl}
          onChoiceResolve={actions.resolveChoice}
        />
      </div>

      <PlayerHand
        hand={me?.hand || []}
        virtualHand={me?.virtualHand || []}
        stateVersion={gameState.stateVersion}
        onPlayCard={(cardId) => {
          if (me?.pendingDiscardCount && me.pendingDiscardCount > 0) {
            actions.discardCard(cardId);
          } else {
            actions.playCard(cardId);
          }
        }}
        onHoverStart={startZoom}
        onHoverEnd={stopZoom}
        pendingAction={gameState.pendingAction}
      />

      {/* ZOOM OVERLAY */}
      <AnimatePresence>
        {hoveredCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed left-[calc(var(--u)*6.6)] bottom-[calc(var(--u)*6.6)] z-[3000] pointer-events-none"
          >
            <GameCard obj={hoveredCard} variant="zoom" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDebug && (
          <div className="fixed inset-0 z-[1000] flex justify-start pointer-events-none">
            <DebugConsole
              gameState={gameState} playerId={playerId} effectivePlayerId={effectivePlayerId}
              opponentId={opponentId} roomId={room.id}
              onClose={() => setShowDebug(false)} onSwapControl={(newId) => setEffectivePlayerId(newId)}
              room={room}
            />
          </div>
        )}
      </AnimatePresence>

      <EscMenu
        isOpen={showEscMenu}
        onClose={() => setShowEscMenu(false)}
        onResetMatch={actions.requestMatchRestart}
        onConcede={() => {
          actions.concede();
          setShowEscMenu(false);
        }}
        onLeave={() => {
          onBack?.();
          setShowEscMenu(false);
        }}
        isSpectator={isSpectator}
        onSwapPOV={handleSwapPOV}
      />

      <AnimatePresence>
        {inspectingZone && (
          <ZoneInspector
            inspectingZone={inspectingZone}
            onClose={() => setInspectingZone(null)}
            onTapCard={(id) => {
              if (gameState.pendingAction?.type === ActionType.Targeting) {
                actions.resolveTarget(id);
              }
            }}
            targetableIds={new Set(gameState.pendingAction?.data?.targets || [])}
            onHoverStart={setHoveredCard}
            onHoverEnd={() => setHoveredCard(null)}
            onSwap={handleSwapZone}
          />
        )}
      </AnimatePresence>

      <Ordering
        pendingAction={gameState.pendingAction}
        me={me}
        battlefield={gameState.battlefield}
        onOrderClick={handleOrderClick}
      />

      <RestartMatch
        isOpen={!!restartRequestedBy}
        isRequesting={isRequestingRestart}
        requesterName={requesterName}
        onAccept={actions.acceptMatchRestart}
        onDecline={actions.declineMatchRestart}
      />

      <AnimatePresence>
        {gameState.status === 'completed' && (
          <GameOver
            winnerId={gameState.winner}
            playerId={effectivePlayerId}
            winnerName={gameState.winner ? (gameState.players[gameState.winner]?.name || 'Unknown') : 'Draw'}
            onLeave={onLeave || leaveRoom}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
