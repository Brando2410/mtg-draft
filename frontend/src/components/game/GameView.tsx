import { type Room } from '@shared/types';
import { Settings, RefreshCw, LogOut, Trash2, ShieldAlert, Play, ChevronRight, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Battlefield } from './Battlefield';
import { PlayerHand } from './PlayerHand';
import { OpponentHand } from './OpponentHand';
import { DebugConsole } from './DebugConsole';
import { Avatar } from './Avatar';
import { ActionButton } from './ActionButton';
import { ZonePile } from './ZonePile';
import { socket } from '../../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameObject, ActionType } from '@shared/engine_types';
import { useDraftStore } from '../../store/useDraftStore';
import { GameCard } from './GameCard';
import battlefieldBg from '../../assets/syd-roberts-portfolio-dsk-battlefield-lightsoff.jpg';
import { ZoneInspector } from './modals/ZoneInspector';

interface GameViewProps {
  room: Room;
  playerId: string;
  onBack: () => void;
}

export const GameView = ({ room, playerId, onBack }: GameViewProps) => {
  const [showDebug, setShowDebug] = useState(false);
  const [effectivePlayerId, setEffectivePlayerId] = useState(playerId);
  const [hoveredCard, setHoveredCard] = useState<GameObject | null>(null);
  const [zoomTimer, setZoomTimer] = useState<any>(null);
  const [showEscMenu, setShowEscMenu] = useState(false);
  const [turnTransition, setTurnTransition] = useState<{ label: string; isMe: boolean } | null>(null);
  const prevActivePlayerId = useRef<string | null>(null);

  const { resetMatch, backToLobby } = useDraftStore();
  const [inspectingZone, setInspectingZone] = useState<{ cards: GameObject[], label: string, type: 'graveyard' | 'exile', isMe: boolean } | null>(null);
  
  const gameState = room.gameState;
  const me = gameState?.players[effectivePlayerId];
  const opponentId = Object.keys(gameState?.players || {}).find(id => id !== effectivePlayerId);
  const opponent = opponentId ? gameState?.players[opponentId] : null;

  const startZoom = (obj: GameObject) => {
    if (zoomTimer) clearTimeout(zoomTimer);
    const timer = setTimeout(() => {
        setHoveredCard(obj);
    }, 400); 
    setZoomTimer(timer);
  };

  const stopZoom = () => {
    if (zoomTimer) clearTimeout(zoomTimer);
    setHoveredCard(null);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        socket.emit('toggle_full_control', { roomId: room.id, playerId: effectivePlayerId });
      }
      if (e.key === 'Escape') {
        setShowEscMenu(prev => !prev);
      }
      if (e.key === ' ' && !showEscMenu) {
         socket.emit('pass_priority', { roomId: room.id, playerId: effectivePlayerId });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room.id, effectivePlayerId, showEscMenu]);

  // Turn Change Detection
  useEffect(() => {
    if (!gameState) return;
    
    // Initialize first turn
    if (prevActivePlayerId.current === null) {
        prevActivePlayerId.current = gameState.activePlayerId;
        return;
    }

    if (gameState.activePlayerId !== prevActivePlayerId.current) {
        const isMe = gameState.activePlayerId === effectivePlayerId;
        setTurnTransition({
            label: isMe ? "Your Turn" : "Opponent's Turn",
            isMe
        });
        prevActivePlayerId.current = gameState.activePlayerId;
        
        const timer = setTimeout(() => {
            setTurnTransition(null);
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [gameState?.activePlayerId, effectivePlayerId]);

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-10">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter animate-pulse">Inizializzazione...</h2>
      </div>
    );
  }

  const hasPriority = gameState.priorityPlayerId === effectivePlayerId || gameState.pendingAction?.playerId === effectivePlayerId;

  const handleToggleStop = (step: string) => {
    socket.emit('toggle_stop', { roomId: room.id, playerId: effectivePlayerId, step });
  };

  const handleAllAttack = () => {
    if (!gameState || !me) return;
    const creatures = gameState.battlefield.filter(obj => {
      const isMyCreature = obj.controllerId === effectivePlayerId && 
                          (obj.definition.types.includes('Creature') || (obj.definition.type_line || '').toLowerCase().includes('creature'));
      const alreadyAttacking = gameState.combat?.attackers?.some(a => a.attackerId === obj.id);
      
      // Rule 302.6: Haste bypasses summoning sickness. Power check is not strictly required but good for Arena feel.
      const hasHaste = (obj.definition.keywords || []).includes('Haste') || (obj.effectiveStats?.keywords || []).includes('Haste');
      const canAttack = !obj.isTapped && (!obj.summoningSickness || hasHaste);
      
      return isMyCreature && !alreadyAttacking && canAttack;
    });

    creatures.forEach(c => {
      socket.emit('tap_permanent', { roomId: room.id, playerId: effectivePlayerId, cardId: c.id });
    });
  };

  const handleCancelAttacks = () => {
    socket.emit('clear_attackers', { roomId: room.id, playerId: effectivePlayerId });
  };

  const handleCancelBlocks = () => {
    socket.emit('clear_blockers', { roomId: room.id, playerId: effectivePlayerId });
  };

  const handleSwapZone = () => {
    if (!inspectingZone) return;
    const nextIsMe = !inspectingZone.isMe;
    const type = inspectingZone.type;
    
    if (type === 'exile') {
        const nextCards = (gameState.exile || []).filter(o => o.ownerId === (nextIsMe ? effectivePlayerId : opponentId));
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

      {/* TURN TRANSITION OVERLAY */}
      <AnimatePresence>
          {turnTransition && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[5000] flex items-center justify-center pointer-events-none"
              >
                  <motion.div 
                    initial={{ scale: 0.5, letterSpacing: '0.5em', opacity: 0, y: 20 }}
                    animate={{ scale: 1, letterSpacing: '0.1em', opacity: 1, y: 0 }}
                    exit={{ scale: 1.2, opacity: 0, filter: 'blur(20px)' }}
                    transition={{ type: "spring", damping: 15, stiffness: 100 }}
                    className="relative"
                  >
                      {/* Ambient Glow */}
                      <div className={`absolute inset-0 blur-[80px] opacity-40 rounded-full
                        ${turnTransition.isMe ? 'bg-cyan-400' : 'bg-orange-500'}`} 
                      />
                      
                      <div className="relative flex flex-col items-center">
                          <h1 className={`text-7xl font-black uppercase italic tracking-tight drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]
                            ${turnTransition.isMe ? 'text-cyan-400' : 'text-slate-100'}`}
                          >
                            {turnTransition.label.split(' ')[0]}
                            <span className={turnTransition.isMe ? 'text-white' : 'text-orange-500'}>
                                {turnTransition.label.split(' ')[1] ? ` ${turnTransition.label.split(' ')[1]}` : ''}
                            </span>
                          </h1>
                          <div className={`h-1 w-full mt-4 bg-gradient-to-r from-transparent via-current to-transparent opacity-50
                            ${turnTransition.isMe ? 'text-cyan-400' : 'text-orange-500'}`} 
                          />
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* GLOBAL UI CONTROLS (Top Left) */}
      <div className="fixed top-6 left-6 flex items-center gap-4 z-[400]">
          <button 
            onClick={() => setShowDebug(true)}
            className="p-3 bg-white/5 hover:bg-indigo-500/20 rounded-2xl border border-white/5 transition-all group"
            title="Open Debug Console (Key: D)"
          >
              <ShieldAlert className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => setShowEscMenu(true)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
            title="Game Menu (Key: ESC)"
          >
              <Settings className="w-5 h-5 text-white/40 group-hover:text-white transition-colors rotate-90" />
          </button>
      </div>

      {/* TOP: Opponent HUD & Hand */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[500]">
          <Avatar 
                player={opponent!} 
                isOpponent isActive={gameState.activePlayerId === opponentId}
                isPriority={gameState.priorityPlayerId === opponentId}
                onToggleStop={handleToggleStop}
                viewerStops={me?.stops}
                currentStep={gameState.currentStep}
                currentPhase={gameState.currentPhase}
                targetable={gameState.pendingAction?.type === ActionType.Targeting && gameState.pendingAction.data?.targets?.includes(opponentId)}
                onClick={() => {
                   if (gameState.pendingAction?.type === ActionType.Targeting && gameState.pendingAction.data?.targets?.includes(opponentId)) {
                        socket.emit('resolve_target', { roomId: room.id, playerId: effectivePlayerId, targetId: opponentId });
                   }
                }}
          />
      </div>

      <OpponentHand 
          hand={opponent?.hand || []} 
          onHoverStart={startZoom}
          onHoverEnd={stopZoom}
      />

      {/* ZONE PILES: OPPONENT (Top Right) */}
      <div className="fixed top-8 right-8 flex flex-row gap-6 z-[800]">
          {(gameState.exile || []).filter(o => o.ownerId === opponentId).length > 0 && (
             <ZonePile 
                label="Exile" 
                count={(gameState.exile || []).filter(o => o.ownerId === opponentId).length} 
                type="exile" 
                onClick={() => setInspectingZone({ 
                    label: "Enemy Exile", 
                    cards: (gameState.exile || []).filter(o => o.ownerId === opponentId),
                    type: 'exile',
                    isMe: false
                })}
             />
          )}
          <ZonePile 
            label="Graveyard" 
            count={opponent?.graveyard.length || 0} 
            topCard={opponent?.graveyard[opponent.graveyard.length-1]} 
            type="graveyard" 
            onClick={() => setInspectingZone({ 
                label: "Enemy Graveyard", 
                cards: opponent?.graveyard || [],
                type: 'graveyard',
                isMe: false
            })}
          />
          <ZonePile label="Library" count={opponent?.library.length || 0} type="library" />
      </div>

      {/* CENTRAL BATTLEFIELD */}
      <div className="flex-1 relative flex flex-col pt-36 pb-48 px-10 overflow-hidden">
        
        {/* GAME STATE LABEL (Arena-style instruction text) */}
        <AnimatePresence>
            {gameState.pendingAction && (
                <motion.div 
                    key={gameState.pendingAction.type + (gameState.pendingAction.playerId === effectivePlayerId ? 'me' : 'opp')}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="absolute top-[42%] left-0 right-0 z-[150] pointer-events-none flex flex-col items-center"
                >
                    {/* HIDE FOR SELECTOR (they have the modal), SHOW FOR OPPONENT */}
                    {gameState.pendingAction.playerId !== effectivePlayerId ? (
                        <div className="flex flex-col items-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/60 to-transparent h-12 top-1/2 -translate-y-1/2 blur-md" />
                            <h2 className="relative text-3xl font-black text-white/40 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight italic uppercase">
                                {gameState.pendingAction.type === ActionType.Discard ? 'Opponent is discarding...' : 'Opponent is making a choice...'}
                            </h2>
                            {gameState.pendingAction.data?.label && (
                                <span className="relative text-sm text-indigo-400 font-bold uppercase tracking-widest mt-2">{gameState.pendingAction.data.label}</span>
                            )}
                        </div>
                    ) : (
                        /* MY ACTION (Only if NOT a modal choice) */
                        !([ActionType.Choice, ActionType.ResolutionChoice, ActionType.ModalSelection, ActionType.OptionalAction, ActionType.Scry, ActionType.Surveil, ActionType.ChooseX] as any[]).includes(gameState.pendingAction.type) && (
                            <div className="flex flex-col items-center">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/60 to-transparent h-12 top-1/2 -translate-y-1/2 blur-md" />
                                <h2 className="relative text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight italic uppercase">
                                    {gameState.pendingAction.type === ActionType.DeclareAttackers ? 'Declare Attackers' :
                                     gameState.pendingAction.type === ActionType.DeclareBlockers ? 'Declare Blockers' :
                                     gameState.pendingAction.type === ActionType.OrderAttackers ? 'Order Blockers' :
                                     gameState.pendingAction.type === ActionType.Discard ? `Discard ${gameState.pendingAction.count || 1} card${(gameState.pendingAction.count || 1) > 1 ? 's' : ''}` :
                                     gameState.pendingAction.type === ActionType.Targeting ? (gameState.pendingAction.data?.prompt || 'Select targets') :
                                     (gameState.pendingAction.data?.label || 'Make a choice')}
                                </h2>
                            </div>
                        )
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        <Battlefield 
          me={me} opponent={opponent} battlefield={gameState.battlefield}
          stack={gameState.stack || []} combat={gameState.combat} 
          pendingAction={gameState.pendingAction} exile={gameState.exile || []}
          currentStep={gameState.currentStep}
          onTapCard={(id) => {
            if (id.startsWith('ORDER_')) {
              const order = id.replace('ORDER_', '').split(',');
              socket.emit('resolve_combat_ordering', { roomId: room.id, playerId: effectivePlayerId, order });
              return;
            }
            if (id.startsWith('CHOICE_')) {
              const choiceRaw = id.replace('CHOICE_', '');
              const choiceIndex = (choiceRaw === 'undo' || choiceRaw.includes('|') || choiceRaw.startsWith('{')) ? choiceRaw : parseInt(choiceRaw);
              socket.emit('resolve_choice', { roomId: room.id, playerId: effectivePlayerId, choiceIndex });
              return;
            }
            const pType = gameState.pendingAction?.type as any;
            if (pType === 'TARGETING' || pType === ActionType.Targeting) {
              socket.emit('resolve_target', { roomId: room.id, playerId: effectivePlayerId, targetId: id });
              return;
            }
            socket.emit('tap_permanent', { roomId: room.id, playerId: effectivePlayerId, cardId: id });
          }}
          onChoiceResolve={(payload) => {
            socket.emit('resolve_choice', { roomId: room.id, playerId: effectivePlayerId, choiceIndex: payload });
          }}
          hoveredCardId={hoveredCard?.id}
          onHoverStart={startZoom}
          onHoverEnd={stopZoom}
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
            
            console.log(`[ACTION-BUTTON] onPass called. pendingType: ${pendingType}, isTargeting: ${isTargeting}`);
            
            if (isTargeting) {
              const selected = currentPending?.data?.selectedTargets || [];
              const targetDef = currentPending?.data?.targetDefinition;
              const isOptional = targetDef?.optional || targetDef?.minCount === 0;
              const min = targetDef?.minCount ?? (isOptional ? 0 : (targetDef?.count ?? 1));
              const canConfirm = selected.length >= min;
              
              console.log(`[ACTION-BUTTON] Targeting confirmed: ${canConfirm}. Selected: ${selected.length}, Min: ${min}`);

              socket.emit('resolve_target', { 
                roomId: room.id, 
                playerId: effectivePlayerId, 
                targetId: canConfirm ? 'skip' : 'undo' 
              });
            } else {
              socket.emit('pass_priority', { roomId: room.id, playerId: effectivePlayerId });
            }
          }}
          onClear={() => socket.emit('resolve_target', { roomId: room.id, playerId: effectivePlayerId, targetId: 'clear' })}
          onToggleStop={handleToggleStop}
          stackLength={gameState.stack?.length || 0}
          isMyTurn={gameState.activePlayerId === effectivePlayerId}
          stops={me?.stops}
          effectivePlayerId={effectivePlayerId}
          attackerCount={gameState.combat?.attackers?.length || 0}
          blockerCount={gameState.combat?.blockers?.filter(b => gameState.battlefield.find(o => o.id === b.blockerId)?.controllerId === effectivePlayerId).length || 0}
          onAllAttack={handleAllAttack}
          onCancelAttacks={handleCancelAttacks}
          onCancelBlocks={handleCancelBlocks}
          passUntilEndOfTurn={me?.passUntilEndOfTurn}
          onTogglePassTurn={() => socket.emit('toggle_pass_turn', { roomId: room.id, playerId: effectivePlayerId })}
          fullControl={me?.fullControl}
        />
      </div>

      {/* ZONE PILES: PLAYER (Bottom Left) */}
      <div className="fixed bottom-8 left-8 flex flex-row gap-6 z-[800]">
          <ZonePile 
            label="Library" 
            count={me?.library.length || 0} 
            type="library" 
          />
          <ZonePile 
            label="Graveyard" 
            count={me?.graveyard.length || 0} 
            topCard={me?.graveyard[me.graveyard.length-1]} 
            type="graveyard" 
            onClick={() => setInspectingZone({ 
                label: "Your Graveyard", 
                cards: me?.graveyard || [],
                type: 'graveyard',
                isMe: true
            })}
          />
          {(gameState.exile || []).filter(o => o.ownerId === effectivePlayerId).length > 0 && (
              <ZonePile 
                label="Exile" 
                count={(gameState.exile || []).filter(o => o.ownerId === effectivePlayerId).length} 
                type="exile" 
                onClick={() => setInspectingZone({ 
                    label: "Your Exile", 
                    cards: (gameState.exile || []).filter(o => o.ownerId === effectivePlayerId),
                    type: 'exile',
                    isMe: true
                })}
              />
          )}
      </div>

      {/* BOTTOM: Player HUD & Hand */}
      <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-[500]">
          <Avatar 
                player={me!} 
                isActive={gameState.activePlayerId === effectivePlayerId}
                isPriority={gameState.priorityPlayerId === effectivePlayerId}
                onToggleStop={handleToggleStop}
                viewerStops={me?.stops}
                currentStep={gameState.currentStep}
                currentPhase={gameState.currentPhase}
                targetable={gameState.pendingAction?.type === ActionType.Targeting && gameState.pendingAction.data?.targets?.includes(effectivePlayerId)}
                onClick={() => {
                   if (gameState.pendingAction?.type === ActionType.Targeting && gameState.pendingAction.data?.targets?.includes(effectivePlayerId)) {
                        socket.emit('resolve_target', { roomId: room.id, playerId: effectivePlayerId, targetId: effectivePlayerId });
                   }
                }}
          />
      </div>
      <PlayerHand 
          hand={me?.hand || []} 
          virtualHand={me?.virtualHand || []}
          onPlayCard={(cardId) => {
            if (me?.pendingDiscardCount && me.pendingDiscardCount > 0) {
              socket.emit('discard_card', { roomId: room.id, playerId: effectivePlayerId, cardId });
            } else {
              socket.emit('play_card', { roomId: room.id, playerId: effectivePlayerId, cardInstanceId: cardId });
            }
          }} 
          onHoverStart={startZoom}
          onHoverEnd={stopZoom}
      />

      {/* ZOOM OVERLAY */}
      <AnimatePresence>
          {hoveredCard && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed left-12 bottom-12 z-[3000] pointer-events-none"
              >
                  <GameCard obj={hoveredCard} variant="zoom" />
              </motion.div>
          )}
      </AnimatePresence>

      {/* DEBUG CONSOLE Overlay */}
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

      {/* PREMIUM ESC MENU Overlay */}
      <AnimatePresence>
        {showEscMenu && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setShowEscMenu(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0f1e]/90 border border-white/10 rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group"
              onClick={e => e.stopPropagation()}
            >
              {/* Decorative Accent Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full" />
              
              <div className="flex flex-col items-center text-center gap-2 mb-10 relative">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 mb-2 shadow-inner">
                      <Settings className="w-8 h-8 text-indigo-400 animate-[spin_10s_linear_infinite]" />
                  </div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                      Game <span className="text-indigo-500">Menu</span>
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Options & Session Management</p>
              </div>

              <div className="flex flex-col gap-3 relative">
                {/* PRIMARY ACTION: RESUME */}
                <button 
                    onClick={() => setShowEscMenu(false)} 
                    className="flex justify-between items-center bg-emerald-500 group/btn hover:bg-emerald-400 p-5 rounded-3xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-95"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                        <span className="text-lg font-black uppercase italic tracking-tight text-white">Resume Game</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <div className="grid grid-cols-2 gap-3 mt-2">
                    {/* RESTART MATCH */}
                    <button 
                        onClick={() => { resetMatch(); setShowEscMenu(false); }} 
                        className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 rounded-3xl transition-all group/sub active:scale-95"
                    >
                        <RefreshCw className="w-6 h-6 text-slate-500 group-hover/sub:text-indigo-400 group-hover/sub:rotate-180 transition-all duration-700" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/sub:text-white">Restart Match</span>
                    </button>

                    {/* LOBBY EXIT */}
                    <button 
                        onClick={() => backToLobby()} 
                        className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-3xl transition-all group/sub active:scale-95"
                    >
                        <LogOut className="w-6 h-6 text-slate-500 group-hover/sub:text-amber-400 group-hover/sub:translate-x-1 transition-all" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/sub:text-white">Exit to Lobby</span>
                    </button>
                </div>

                {/* DANGER ZONE: LEAVE GAME */}
                <div className="flex flex-col gap-2 mt-4">
                    <button 
                        onClick={() => {
                            socket.emit('toggle_auto_order', { roomId: room.id, playerId: effectivePlayerId });
                        }} 
                        className={`flex items-center justify-between p-5 rounded-2xl transition-all border ${me?.autoOrderTriggers ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-400'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Auto-order Triggers</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-all ${me?.autoOrderTriggers ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${me?.autoOrderTriggers ? 'left-6' : 'left-1'}`} />
                        </div>
                    </button>

                    <button 
                        onClick={() => onBack()} 
                        className="flex items-center justify-center gap-3 p-5 group/danger hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20 active:scale-95"
                    >
                        <Trash2 className="w-4 h-4 text-red-500/40 group-hover/danger:text-red-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/50 group-hover/danger:text-red-500">Concede & Leave Game</span>
                    </button>
                </div>
              </div>

              {/* CLOSE ICON (Top Right) */}
              <button 
                onClick={() => setShowEscMenu(false)}
                className="absolute top-6 right-6 p-2 text-slate-700 hover:text-white hover:bg-white/5 rounded-full transition-all"
              >
                 <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inspectingZone && (
          <ZoneInspector 
            inspectingZone={inspectingZone}
            onClose={() => setInspectingZone(null)}
            onTapCard={(id) => {
              if (gameState.pendingAction?.type === ActionType.Targeting) {
                  socket.emit('resolve_target', { roomId: room.id, playerId: effectivePlayerId, targetId: id });
              }
            }}
            targetableIds={new Set(gameState.pendingAction?.data?.targets || [])}
            onHoverStart={setHoveredCard}
            onHoverEnd={() => setHoveredCard(null)}
            onSwap={handleSwapZone}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
