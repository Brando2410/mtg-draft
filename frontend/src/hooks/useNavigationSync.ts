import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDraftStore, type DraftState } from '../store/useDraftStore';

export const useNavigationSync = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeView, room } = useDraftStore();

  useEffect(() => {
    switch (activeView) {
      case 'menu': navigate('/'); break;
      case 'collection': navigate('/collection'); break;
      case 'deck_builder': navigate('/deck-builder'); break;
      case 'builder': navigate('/cube-builder'); break;
      case 'draft_setup': navigate('/play'); break;
      case 'draft_config': navigate('/play/draft'); break;
      case 'sealed_config': navigate('/play/sealed'); break;
      case 'draft_join': navigate('/join'); break;
      case 'draft_lobby': if (room) navigate(`/lobby/${room.id}`); break;
      case 'drafting': navigate('/game'); break;
      case 'history': navigate('/history'); break;
    }
  }, [activeView, navigate, room?.id]);

  // Reverse sync: URL -> Store (Handles browser back/forward and direct navigation)
  useEffect(() => {
    const path = location.pathname;
    const { activeView, setActiveView } = useDraftStore.getState();

    let targetView: DraftState['activeView'] = activeView;
    if (path === '/') targetView = 'menu';
    else if (path === '/collection') targetView = 'collection';
    else if (path === '/deck-builder') targetView = 'deck_builder';
    else if (path === '/cube-builder') targetView = 'builder';
    else if (path === '/play') targetView = 'draft_setup';
    else if (path === '/play/draft') targetView = 'draft_config';
    else if (path === '/play/sealed') targetView = 'sealed_config';
    else if (path === '/join') targetView = 'draft_join';
    else if (path.startsWith('/lobby/')) targetView = 'draft_lobby';
    else if (path === '/game') targetView = 'drafting';
    else if (path === '/history') targetView = 'history';

    if (targetView !== activeView) {
      setActiveView(targetView);
    }
  }, [location.pathname]);
};
