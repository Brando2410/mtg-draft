import { useState, useRef, useCallback } from 'react';
import { type GameObject } from '@shared/engine_types';

export const useCardZoom = (delay = 400) => {
  const [hoveredCard, setHoveredCard] = useState<GameObject | null>(null);
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startZoom = useCallback((obj: GameObject) => {
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    
    zoomTimerRef.current = setTimeout(() => {
      setHoveredCard(obj);
    }, delay);
  }, [delay]);

  const stopZoom = useCallback((id?: string) => {
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    
    setHoveredCard(prev => {
      if (!id || (prev && prev.id === id)) {
        return null;
      }
      return prev;
    });
  }, []);

  return {
    hoveredCard,
    setHoveredCard,
    startZoom,
    stopZoom
  };
};
