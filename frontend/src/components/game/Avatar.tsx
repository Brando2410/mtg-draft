import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerState, Step, Phase } from '@shared/engine_types';
import { ManaPoolView } from './ManaPoolView';
import { Stopper } from './avatar/Stopper';
import { ScryBubble } from './avatar/ScryBubble';
import { useAvatarLogic } from '../../hooks/game/useAvatarLogic';

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
  scrySurveilResult?: {
    playerId: string;
    top: number;
    bottom: number;
    graveyard: number;
    type: string;
    timestamp: number;
  };
}

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
  currentPhase,
  scrySurveilResult
}: AvatarProps) => {
  const { impacts, showPulse, scryNotice, isLosingLife } = useAvatarLogic(player, scrySurveilResult);
  const stops = viewerStops || player.stops || {};

  const commonProps = {
    isOpponent,
    stops,
    onToggleStop,
    isActive,
    currentStep,
    currentPhase
  };

  return (
    <div className={`flex flex-col items-center gap-0 relative z-[200]`}>
      <AnimatePresence>
        {(player.manaPool && Object.values(player.manaPool).some(c => c > 0) || (player.restrictedMana && player.restrictedMana.length > 0)) && (
          <ManaPoolView pool={player.manaPool} restrictedMana={player.restrictedMana} isOpponent={isOpponent} />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-[calc(var(--u)*6.6)] relative h-[calc(var(--u)*9.9)]">
          <div className="flex gap-[var(--sp-4)] items-center">
              <Stopper {...commonProps} id="beginning" label="Beginning" />
              <Stopper {...commonProps} id="main1" label="Main 1" />
              <div className="w-[var(--sp-8)] h-px bg-gradient-to-r from-transparent to-white/10 mx-[var(--sp-1)]" />
          </div>

          <div className="relative group/avatar w-[calc(var(--u)*13.2)] h-[calc(var(--u)*13.2)]">
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
                        className={`absolute left-1/2 -translate-x-1/2 font-black italic text-[var(--fs-3xl)] z-[300] pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]
                            ${impact.amount > 0 ? 'text-emerald-400' : 'text-red-500'}
                        `}
                    >
                        {impact.amount > 0 ? `+${impact.amount}` : impact.amount}
                        <div className={`absolute inset-0 blur-lg opacity-50 -z-10 text-white`}>
                           {impact.amount > 0 ? `+${impact.amount}` : impact.amount}
                        </div>
                    </motion.div>
                ))}
              </AnimatePresence>

              {/* DYNAMIC PRIORITY HALO */}
              <AnimatePresence>
                {(isPriority || isActive) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: isPriority ? [0.4, 0.8, 0.4] : 0.4,
                      scale: isPriority ? [1.02, 1.15, 1.02] : 1.05,
                      boxShadow: isPriority 
                        ? [
                            '0 0 40px rgba(99, 102, 241, 0.4)',
                            '0 0 70px rgba(99, 102, 241, 0.8)',
                            '0 0 40px rgba(99, 102, 241, 0.4)'
                          ]
                        : '0 0 30px rgba(255, 255, 255, 0.2)'
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className={`absolute inset-[calc(var(--u)*-0.6)] rounded-full z-0 pointer-events-none border-[calc(var(--u)*0.3)]
                        ${isPriority ? 'border-indigo-400/30' : 'border-white/10'}
                    `}
                  />
                )}
              </AnimatePresence>

              <motion.div 
                id={`player-avatar-${player.id}`}
                onClick={onClick}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  x: isLosingLife ? [-2, 2, -2, 2, 0] : 0,
                  filter: isLosingLife ? 'contrast(1.2) brightness(1.1)' : 'contrast(1) brightness(1)',
                  boxShadow: isPriority 
                    ? '0 0 60px rgba(99, 102, 241, 0.6), inset 0 0 20px rgba(99, 102, 241, 0.4)' 
                    : (isActive ? '0 0 30px rgba(99, 102, 241, 0.2)' : '0 0 20px rgba(0,0,0,0.5)')
                }}
                transition={{ duration: 0.1 }}
                className={`w-full h-full rounded-full border-[calc(var(--u)*0.3)] overflow-hidden transition-all cursor-pointer relative z-10
                  ${isPriority ? 'border-indigo-400' : (isActive ? 'border-white/40' : 'border-white/20')}
                  ${targetable ? 'ring-[calc(var(--u)*0.6)] ring-red-500 animate-pulse border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : ''}
                  bg-slate-950 flex items-center justify-center`}
              >
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative bg-slate-900">
                      <img 
                        src={`/avatars/${player.avatar || 'ajani.png'}`} 
                        alt={player.name}
                        className="w-full h-full object-cover scale-110"
                      />
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
                    className="absolute inset-x-0 bottom-0 py-[var(--sp-1)] flex items-center justify-center border-t border-white/10 z-20 backdrop-blur-sm transition-all"
                  >
                      <span className={`text-[var(--fs-xl)] font-black italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] leading-none transition-colors
                        ${showPulse === 'gain' ? 'text-emerald-400' : showPulse === 'loss' ? 'text-red-400' : 'text-white'}
                      `}>
                          {player.life}
                      </span>
                  </motion.div>
              </motion.div>

              <ScryBubble scryNotice={scryNotice} isOpponent={isOpponent} />
          </div>

          <div className="flex gap-[var(--sp-4)] items-center">
              <div className="w-[var(--sp-8)] h-px bg-gradient-to-l from-transparent to-white/10 mx-[var(--sp-1)]" />
              <Stopper {...commonProps} id="main2" label="Main 2" />
              <Stopper {...commonProps} id="end" label="End Step" />
          </div>
      </div>
    </div>
  );
});
