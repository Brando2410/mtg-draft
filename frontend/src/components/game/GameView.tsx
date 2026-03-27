import { type Room } from '@shared/types';
import { Terminal, Layers } from 'lucide-react';
import { useState } from 'react';
import { PhaseBar } from './PhaseBar';
import { Battlefield } from './Battlefield';
import { PlayerHand } from './PlayerHand';
import { DebugConsole } from './DebugConsole';
import { socket } from '../../services/socket';

interface GameViewProps {
  room: Room;
  playerId: string;
  onBack: () => void;
}

export const GameView = ({ room, playerId, onBack }: GameViewProps) => {
  const [showDebug, setShowDebug] = useState(true);
  const [effectivePlayerId, setEffectivePlayerId] = useState(playerId);
  
  const gameState = room.gameState;
  const me = gameState?.players[effectivePlayerId];
  const opponentId = Object.keys(gameState?.players || {}).find(id => id !== effectivePlayerId);
  const opponent = opponentId ? gameState?.players[opponentId] : null;

  const handlePlayCard = (cardInstanceId: string) => {
    socket.emit('play_card', { 
       roomId: room.id, 
       playerId: effectivePlayerId, 
       cardInstanceId 
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
          hasPriority={gameState.priorityPlayerId === effectivePlayerId}
          onPassPriority={() => socket.emit('pass_priority', { roomId: room.id, playerId: effectivePlayerId })}
          onBack={onBack}
        />

        <Battlefield 
          me={me} 
          opponent={opponent} 
          battlefield={gameState.battlefield}
        />

        <PlayerHand hand={me?.hand || []} onPlayCard={handlePlayCard} />

      </div>

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

    </div>
  );
};
