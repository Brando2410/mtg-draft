import { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PlayerState, Step, Phase } from '@shared/engine_types';
import { ManaPoolView } from './ManaPoolView';

interface AvatarProps {
  player: PlayerState;
  isOpponent?: boolean;
  isActive?: boolean;
  isPriority?: boolean;
  onToggleStop?: (step: string) => void;
  viewerStops?: Record<string, boolean>;
  targetable?: boolean;
  onClick?: () => void;
  currentStep?: Step;
  currentPhase?: Phase;
}

interface StopperProps {
  id: string;
  label: string;
  isOpponent: boolean;
  stops: Record<string, boolean>;
  onToggleStop?: (step: string) => void;
  isActive: boolean;
  currentStep?: Step;
  currentPhase?: Phase;
}

const Stopper = memo(({ id, label, isOpponent, stops, onToggleStop, isActive, currentStep, currentPhase }: StopperProps) => {
  const internalId = isOpponent ? `opp_${id.toLowerCase()}` : `my_${id.toLowerCase()}`;
  const isSet = stops[internalId];

  const isBeginningGroup = id === 'beginning' && (currentStep === Step.Upkeep || currentStep === Step.Draw);
  const isMain1 = id === 'main1' && currentStep === Step.Main && currentPhase === Phase.PreCombatMain;
  const isMain2 = id === 'main2' && currentStep === Step.Main && currentPhase === Phase.PostCombatMain;
  const isEnd = id === 'end' && currentStep === Step.End;
  
  const isCurrent = isActive && (isBeginningGroup || isMain1 || isMain2 || isEnd);

  const activeColor = isOpponent 
      ? 'bg-blue-500 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,1)]' 
      : 'bg-orange-500 border-orange-200 shadow-[0_0_15px_rgba(249,115,22,1)]';

  const glowId = isOpponent ? 'opp-phase-glow' : 'my-phase-glow';
  const underlineId = isOpponent ? 'opp-phase-underline' : 'my-phase-underline';

  return (
    <div className="flex flex-col items-center gap-1.5 group relative">
        <div 
          onClick={(e) => { e.stopPropagation(); onToggleStop?.(internalId); }}
          className={`w-3.5 h-3.5 rotate-45 border-2 transition-all cursor-pointer relative z-10
            ${isSet ? activeColor : 'bg-slate-900/90 border-white/20 hover:border-white/50'}
            ${isCurrent ? 'ring-2 ring-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : ''}`}
        />
        
        {isCurrent && (
          <motion.div 
            layoutId={glowId}
            className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md -z-0"
          />
        )}

        {isCurrent && (
          <motion.div 
            layoutId={underlineId}
            className="absolute -bottom-3 w-full h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          />
        )}

        <span className="text-[7px] font-black text-white uppercase tracking-[0.2em] italic oblique opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute top-full mt-2 whitespace-nowrap z-50">
            {label}
        </span>
    </div>
  );
});


export const Avatar = memo(({ 
  player, 
  isOpponent = false, 
  isActive = false, 
  isPriority = false,
  onToggleStop,
  viewerStops,
  targetable = false,
  onClick,
  currentStep,
  currentPhase
}: AvatarProps) => {
  
  const [impacts, setImpacts] = useState<{ id: string, amount: number, rotation: number }[]>([]);
  const [showPulse, setShowPulse] = useState<'gain' | 'loss' | null>(null);
  const prevLife = useRef(player.life);
  const stops = viewerStops || player.stops || {};

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

  const commonProps = {
    isOpponent,
    stops,
    onToggleStop,
    isActive,
    currentStep,
    currentPhase
  };

  const isLosingLife = impacts.some(i => i.amount < 0);

  return (
    <div className={`flex flex-col items-center gap-0 relative z-[200]`}>
      <AnimatePresence>
        {player.manaPool && Object.values(player.manaPool).some(c => c > 0) && (
          <ManaPoolView pool={player.manaPool} isOpponent={isOpponent} />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6 relative h-12">
          <div className="flex gap-4 items-center">
              <Stopper {...commonProps} id="beginning" label="Beginning" />
              <Stopper {...commonProps} id="main1" label="Main 1" />
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/10 mx-1" />
          </div>

          <div className="relative group/avatar">
              {/* PREMIUM SHOCKWAVE PULSE */}
              <AnimatePresence>
                {showPulse && (
                    <motion.div 
                        initial={{ opacity: 0.8, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`absolute inset-0 rounded-full border-4 z-0 pointer-events-none
                            ${showPulse === 'gain' ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]' : 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'}
                        `}
                    />
                )}
                {showPulse && (
                   <motion.div 
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 2.2 }}
                        transition={{ duration: 0.8 }}
                        className={`absolute inset-0 rounded-full blur-2xl z-0 pointer-events-none
                            ${showPulse === 'gain' ? 'bg-emerald-500/20' : 'bg-red-500/20'}
                        `}
                    />
                )}
              </AnimatePresence>

              {/* FLOATING LIFE IMPACTS */}
              <AnimatePresence>
                {impacts.map((impact) => (
                    <motion.div
                        key={impact.id}
                        initial={{ opacity: 0, y: isOpponent ? 20 : -20, scale: 0.2, rotate: 0 }}
                        animate={{ 
                            opacity: [0, 1, 1, 0], 
                            y: isOpponent ? 70 : -70, 
                            scale: 1.3, 
                            rotate: impact.rotation 
                        }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className={`absolute left-1/2 -translate-x-1/2 font-black italic text-3xl z-[300] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]
                            ${impact.amount > 0 ? 'text-emerald-400' : 'text-red-500'}
                        `}
                    >
                        {impact.amount > 0 ? `+${impact.amount}` : impact.amount}
                        {/* GLOW LAYER */}
                        <div className={`absolute inset-0 blur-lg opacity-50 -z-10 text-white`}>
                           {impact.amount > 0 ? `+${impact.amount}` : impact.amount}
                        </div>
                    </motion.div>
                ))}
              </AnimatePresence>

              <motion.div 
                id={`player-avatar-${player.id}`}
                onClick={onClick}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  x: isLosingLife ? [-2, 2, -2, 2, 0] : 0,
                  filter: isLosingLife ? 'contrast(1.2) brightness(1.1)' : 'contrast(1) brightness(1)',
                  boxShadow: isPriority ? '0 0 40px rgba(99, 102, 241, 0.4)' : '0 0 20px rgba(0,0,0,0.5)'
                }}
                transition={{ duration: 0.1 }}
                className={`w-20 h-20 rounded-full border-2 overflow-hidden transition-all cursor-pointer relative
                  ${isPriority ? 'border-indigo-400 shadow-lg' : 'border-white/20'}
                  ${targetable ? 'ring-4 ring-red-500 animate-pulse border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : ''}
                  bg-slate-950 flex items-center justify-center`}
              >
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative bg-slate-900">
                      <img 
                        src={`/avatars/${player.avatar || 'ajani.png'}`} 
                        alt={player.name}
                        className="w-full h-full object-cover scale-110"
                      />
                      {/* CHROMATIC RED FLASH */}
                      <AnimatePresence>
                        {isLosingLife && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.6, 0.2, 0.8, 0] }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-red-600/40 mix-blend-color-dodge z-10"
                            />
                        )}
                      </AnimatePresence>
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                  </div>

                  <motion.div 
                    animate={showPulse ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' } : { scale: 1, backgroundColor: 'rgba(0,0,0,0.8)' }}
                    className="absolute inset-x-0 bottom-0 py-1 flex items-center justify-center border-t border-white/10 z-20 backdrop-blur-sm transition-all"
                  >
                      <span className={`text-xl font-black italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] leading-none transition-colors
                        ${showPulse === 'gain' ? 'text-emerald-400' : showPulse === 'loss' ? 'text-red-400' : 'text-white'}
                      `}>
                          {player.life}
                      </span>
                  </motion.div>

                  {isActive && (
                      <div className={`absolute ${isOpponent ? 'top-1' : 'bottom-11'} left-1/2 -translate-x-1/2 w-1.5 h-3.5 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,1)] z-30`} />
                  )}
              </motion.div>
          </div>

          <div className="flex gap-4 items-center">
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/10 mx-1" />
              <Stopper {...commonProps} id="main2" label="Main 2" />
              <Stopper {...commonProps} id="end" label="End Step" />
          </div>
      </div>
    </div>
  );
});
