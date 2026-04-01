import { type Room } from '@shared/types';
import { Terminal, Layers, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PhaseBar } from './PhaseBar';
import { Battlefield } from './Battlefield';
import { PlayerHand } from './PlayerHand';
import { DebugConsole } from './DebugConsole';
import { socket } from '../../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameObject } from '@shared/engine_types';

interface GameViewProps {
  room: Room;
  playerId: string;
  onBack: () => void;
}

export const GameView = ({ room, playerId, onBack }: GameViewProps) => {
  const [showDebug, setShowDebug] = useState(true);
  const [effectivePlayerId, setEffectivePlayerId] = useState(playerId);
  const [hoveredCard, setHoveredCard] = useState<GameObject | null>(null);
  const [zoomTimer, setZoomTimer] = useState<any>(null);

  const startZoom = (obj: GameObject) => {
    if (zoomTimer) clearTimeout(zoomTimer);
    const timer = setTimeout(() => {
        setHoveredCard(obj);
    }, 800);
    setZoomTimer(timer);
  };

  const stopZoom = () => {
    if (zoomTimer) clearTimeout(zoomTimer);
    setHoveredCard(null);
  };
  
  const gameState = room.gameState;
  const me = gameState?.players[effectivePlayerId];
  const opponentId = Object.keys(gameState?.players || {}).find(id => id !== effectivePlayerId);
  const opponent = opponentId ? gameState?.players[opponentId] : null;

  // ARENA-STYLE: Toggle Full Control with Ctrl Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // MTG Arena uses Ctrl to toggle/hold full control
      if (e.key === 'Control') {
        socket.emit('toggle_full_control', { roomId: room.id, playerId: effectivePlayerId });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room.id, effectivePlayerId]);

  const handlePlayCard = (cardInstanceId: string) => {
    if (me && me.pendingDiscardCount > 0) {
      socket.emit('discard_card', { 
        roomId: room.id, 
        playerId: effectivePlayerId, 
        cardId: cardInstanceId 
      });
      return;
    }

    socket.emit('play_card', { 
       roomId: room.id, 
       playerId: effectivePlayerId, 
       cardInstanceId 
    });
  };

  const handleTapCard = (cardId: string) => {
    socket.emit('tap_permanent', { 
       roomId: room.id, 
       playerId: effectivePlayerId, 
       cardId 
    });
  };

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-10">
        <Layers className="w-12 h-12 text-indigo-500 animate-pulse mb-6" />
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Inizializzazione Motore di Gioco...</h2>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617] text-slate-200 flex overflow-hidden font-sans">
      
      {/* MAIN BATTLEFIELD AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        <PhaseBar 
          currentPhase={gameState.currentPhase}
          currentStep={gameState.currentStep}
          turnNumber={gameState.turnNumber}
          hasPriority={gameState.priorityPlayerId === effectivePlayerId || gameState.pendingAction?.playerId === effectivePlayerId}
          pendingAction={gameState.pendingAction}
          onPassPriority={() => socket.emit('pass_priority', { roomId: room.id, playerId: effectivePlayerId })}
          onSkipAction={() => {
            if (gameState.pendingAction?.type === 'TARGETING') {
              socket.emit('resolve_target', { 
                roomId: room.id, 
                playerId: effectivePlayerId, 
                targetId: 'skip'
              });
            }
          }}
          onUndo={() => {
            if (gameState.pendingAction?.type === 'TARGETING') {
              socket.emit('resolve_target', { 
                roomId: room.id, 
                playerId: effectivePlayerId, 
                targetId: 'undo'
              });
            } else if (gameState.pendingAction?.type === 'CHOICE') {
              socket.emit('resolve_choice', { 
                roomId: room.id, 
                playerId: effectivePlayerId, 
                choiceIndex: 'undo'
              });
            }
          }}
          onBack={onBack}
        />

        <Battlefield 
          me={me} 
          opponent={opponent} 
          battlefield={gameState.battlefield}
          stack={gameState.stack || []}
          combat={gameState.combat}
          pendingAction={gameState.pendingAction}
          exile={gameState.exile || []}
          onTapCard={(id) => {
            if (id.startsWith('ORDER_')) {
              const order = id.replace('ORDER_', '').split(',');
              socket.emit('resolve_combat_ordering', { 
                roomId: room.id, 
                playerId: effectivePlayerId, 
                order 
              });
              return;
            }

            if (id.startsWith('CHOICE_')) {
              const choiceRaw = id.split('_')[1];
              const choiceIndex = choiceRaw === 'undo' ? 'undo' : parseInt(choiceRaw);
              socket.emit('resolve_choice', { 
                roomId: room.id, 
                playerId: effectivePlayerId, 
                choiceIndex 
              });
              return;
            }
            
            if (gameState.pendingAction?.type === 'TARGETING') {
              socket.emit('resolve_target', { 
                roomId: room.id, 
                playerId: effectivePlayerId, 
                targetId: id 
              });
              return;
            }

            handleTapCard(id);
          }}
          onHoverStart={startZoom}
          onHoverEnd={stopZoom}
        />

        <PlayerHand 
          hand={me?.hand || []} 
          onPlayCard={handlePlayCard} 
          onHoverStart={startZoom}
          onHoverEnd={stopZoom}
        />

      </div>

      {/* FULL CONTROL INDICATOR (Arena Style) */}
      {me?.fullControl && (
        <div className="fixed bottom-32 left-10 flex items-center gap-3 z-50 pointer-events-none group">
           <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse">
                <Zap className="w-6 h-6 text-black fill-black" />
              </div>
              <div className="mt-2 bg-black/80 backdrop-blur-md border border-amber-500/50 px-3 py-1 rounded text-[10px] font-black uppercase italic tracking-widest text-amber-500 shadow-2xl">
                Full Control
              </div>
           </div>
        </div>
      )}

      {/* DEBUG CONSOLE SIDEBAR */}
      {showDebug && (
        <DebugConsole 
          gameState={gameState}
          playerId={playerId}
          effectivePlayerId={effectivePlayerId}
          opponentId={opponentId}
          roomId={room.id}
          onClose={() => setShowDebug(false)}
          onSwapControl={(newId) => setEffectivePlayerId(newId)}
          room={room}
        />
      )}

      {/* FLOATING DEBUG TOGGLE (WHEN CONSOLE HIDDEN) */}
      {!showDebug && (
        <button 
          onClick={() => setShowDebug(true)}
          className="fixed top-20 right-0 p-3 bg-indigo-600 text-white rounded-l-2xl shadow-2xl shadow-indigo-600/40 hover:pr-5 transition-all active:scale-90 z-[35]"
        >
          <Terminal className="w-5 h-5" />
        </button>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>

      {/* GLOBAL CARD ZOOM OVERLAY */}
      <AnimatePresence>
          {hoveredCard && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: -30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -30 }}
                className="fixed left-6 top-6 z-[300] pointer-events-none"
              >
                  <div className="w-[340px] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.95)] rounded-[2rem] overflow-hidden border-2 border-white/10 bg-slate-900 ring-1 ring-white/5">
                      <img 
                        src={hoveredCard.definition.image_url} 
                        alt={hoveredCard.definition.name}
                        className="w-full h-auto"
                      />

                      {/* BATTLEFIELD-ONLY DEBUG INFO */}
                      {hoveredCard.zone === 'Battlefield' && (
                        <div className="bg-slate-950/90 p-5 border-t border-white/10 flex flex-col gap-4 backdrop-blur-xl">
                            
                            {/* Counters & Keywords */}
                            <div className="flex flex-col gap-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">Stato Permanente</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {/* Keywords (Deduplicated) */}
                                    {(() => {
                                        const seen = new Set<string>();
                                        return (hoveredCard.effectiveStats?.keywords || []).filter(k => {
                                            const lowerK = k.toLowerCase();
                                            if (seen.has(lowerK)) return false;
                                            seen.add(lowerK);
                                            return true;
                                        }).map(k => (
                                            <span key={k} className="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-500/30 capitalize">
                                                {k}
                                            </span>
                                        ));
                                    })()}
                                    {/* Markers/Counters */}
                                    {Object.entries(hoveredCard.counters || {}).map(([type, val]) => (
                                        val > 0 && (
                                            <span key={type} className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                                                {val}x {type}
                                            </span>
                                        )
                                    ))}
                                </div>
                            </div>

                            {/* Technical Debug Info */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-500 mb-0.5">Colori</p>
                                    <p className="text-[11px] font-bold text-slate-300 uppercase">
                                        {hoveredCard.definition.colors.length > 0 ? hoveredCard.definition.colors.join(', ') : 'Incolore'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-500 mb-0.5">Costo Mana</p>
                                    <p className="text-[11px] font-bold text-slate-300 tracking-wider">
                                        {hoveredCard.definition.manaCost || 'N/A'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[8px] font-black uppercase text-slate-500 mb-0.5">Linea di Tipo</p>
                                    <p className="text-[11px] font-bold text-slate-300">
                                        {hoveredCard.definition.type_line}
                                    </p>
                                </div>
                            </div>
                        </div>
                      )}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
};
