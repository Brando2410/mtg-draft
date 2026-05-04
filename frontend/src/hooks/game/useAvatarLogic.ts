import { useState, useEffect, useRef, useMemo } from 'react';
import { type PlayerState } from '@shared/engine_types';

export const useAvatarLogic = (player: PlayerState, scrySurveilResult: any) => {
  const [impacts, setImpacts] = useState<{ id: string, amount: number, rotation: number }[]>([]);
  const [showPulse, setShowPulse] = useState<'gain' | 'loss' | null>(null);
  const [scryNotice, setScryNotice] = useState<{ top: number, bottom: number, graveyard: number, type: string } | null>(null);
  
  const prevLife = useRef(player.life);
  const prevScryTime = useRef(0);

  useEffect(() => {
    if (scrySurveilResult && scrySurveilResult.playerId === player.id && scrySurveilResult.timestamp > prevScryTime.current) {
        setScryNotice({
            top: scrySurveilResult.top,
            bottom: scrySurveilResult.bottom,
            graveyard: scrySurveilResult.graveyard,
            type: scrySurveilResult.type
        });
        prevScryTime.current = scrySurveilResult.timestamp;

        const timer = setTimeout(() => {
            setScryNotice(null);
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [scrySurveilResult, player.id]);

  useEffect(() => {
    if (player.life !== prevLife.current) {
        const diff = player.life - prevLife.current;
        const newImpact = { 
            id: Math.random().toString(), 
            amount: diff,
            rotation: (Math.random() - 0.5) * 20
        };
        
        setImpacts(prev => [...prev.slice(-3), newImpact]);
        setShowPulse(diff > 0 ? 'gain' : 'loss');
        prevLife.current = player.life;

        setTimeout(() => {
            setImpacts(prev => prev.filter(i => i.id !== newImpact.id));
        }, 1200);

        setTimeout(() => setShowPulse(null), 600);
    }
  }, [player.life]);

  const isLosingLife = useMemo(() => impacts.some(i => i.amount < 0), [impacts]);

  return { impacts, showPulse, scryNotice, isLosingLife };
};
