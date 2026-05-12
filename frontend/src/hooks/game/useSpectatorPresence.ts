import { useEffect, useMemo, useState, useRef } from 'react';
import { type Room, type TournamentMatch } from '@shared/types';
import { socket } from '../../services/socket';

interface UseSpectatorPresenceProps {
  room: Room;
  playerId: string;
  effectivePlayerId: string;
}

export const useSpectatorPresence = ({ room, playerId, effectivePlayerId }: UseSpectatorPresenceProps) => {
  const [lastSpectatorName, setLastSpectatorName] = useState<string | null>(null);
  const prevSpecsRef = useRef<string[]>([]);

  const currentMatchIndex = useMemo(() => 
    room.matches?.findIndex((m: TournamentMatch) => m.players.includes(effectivePlayerId) && m.status === 'active') ?? -1
  , [room.matches, effectivePlayerId]);

  const spectators = useMemo(() => 
    room.players.filter(p => 
      p.watchingMatchIndex === currentMatchIndex && 
      currentMatchIndex !== -1 &&
      !room.matches![currentMatchIndex].players.includes(p.playerId)
    )
  , [room.players, room.matches, currentMatchIndex]);

  const spectatorCount = spectators.length;

  useEffect(() => {
    const currentSpecs = spectators.map(s => s.playerId);
    const newSpecs = spectators.filter(s => !prevSpecsRef.current.includes(s.playerId));
    
    if (newSpecs.length > 0) {
      setLastSpectatorName(newSpecs[0].name);
      setTimeout(() => setLastSpectatorName(null), 4000);
    }
    
    prevSpecsRef.current = currentSpecs;
  }, [spectators]);

  useEffect(() => {
    if (currentMatchIndex !== -1) {
      socket.emit('update_watching_match', { roomId: room.id, playerId, matchIndex: currentMatchIndex });
    }
    return () => {
      socket.emit('update_watching_match', { roomId: room.id, playerId, matchIndex: null });
    };
  }, [currentMatchIndex, room.id, playerId]);

  return {
    currentMatchIndex,
    spectators,
    spectatorCount,
    lastSpectatorName
  };
};
