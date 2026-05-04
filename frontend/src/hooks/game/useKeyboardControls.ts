import { useEffect } from 'react';

interface UseKeyboardControlsProps {
  onToggleFullControl: () => void;
  onToggleEscMenu: () => void;
  onPassPriority: () => void;
  isEscMenuOpen: boolean;
}

export const useKeyboardControls = ({ 
  onToggleFullControl, 
  onToggleEscMenu, 
  onPassPriority,
  isEscMenuOpen
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        onToggleFullControl();
      }
      if (e.key === 'Escape') {
        onToggleEscMenu();
      }
      if (e.key === ' ' && !isEscMenuOpen) {
        onPassPriority();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleFullControl, onToggleEscMenu, onPassPriority, isEscMenuOpen]);
};
