import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TurnTransitionOverlayProps {
  activePlayerId: string;
  playerId: string;
}

export const TurnTransitionOverlay = ({ activePlayerId, playerId }: TurnTransitionOverlayProps) => {
  const [turnTransition, setTurnTransition] = useState<{ label: string; isMe: boolean } | null>(null);
  const prevActivePlayerId = useRef<string | null>(null);

  useEffect(() => {
    if (prevActivePlayerId.current === null) {
      prevActivePlayerId.current = activePlayerId;
      return;
    }

    if (activePlayerId !== prevActivePlayerId.current) {
      const isMe = activePlayerId === playerId;
      setTurnTransition({
        label: isMe ? "Your Turn" : "Opponent's Turn",
        isMe
      });
      prevActivePlayerId.current = activePlayerId;
      
      const timer = setTimeout(() => {
        setTurnTransition(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activePlayerId, playerId]);

  return (
    <AnimatePresence>
      {turnTransition && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[5000] flex items-center justify-center pointer-events-none"
        >
          <motion.div 
            initial={{ scale: 0.8, letterSpacing: '0.2em', opacity: 0, y: 10 }}
            animate={{ scale: 1, letterSpacing: '0.1em', opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
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
  );
};
