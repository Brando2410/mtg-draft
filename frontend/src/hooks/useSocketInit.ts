import { useEffect } from 'react';
import { useDraftStore } from '../store/useDraftStore';

export const useSocketInit = () => {
  const { initSocketListeners, cleanupSocketListeners } = useDraftStore();

  useEffect(() => {
    initSocketListeners();
    return () => cleanupSocketListeners();
  }, [initSocketListeners, cleanupSocketListeners]);
};
