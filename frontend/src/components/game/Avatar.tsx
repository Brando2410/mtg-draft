import { memo } from 'react';
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

  // Determine if this is the CURRENT step AND this player is the active player
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
              <motion.div 
                id={`player-avatar-${player.id}`}
                onClick={onClick}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  boxShadow: isPriority ? '0 0 40px rgba(99, 102, 241, 0.4)' : '0 0 20px rgba(0,0,0,0.5)'
                }}
                className={`w-20 h-20 rounded-full border-2 overflow-hidden transition-all cursor-pointer relative
                  ${isPriority ? 'border-indigo-400 shadow-lg' : 'border-white/20'}
                  ${targetable ? 'ring-4 ring-red-500 animate-pulse border-red-500' : ''}
                  bg-slate-950 flex items-center justify-center`}
              >
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative bg-slate-900">
                      <img 
                        src={`/avatars/${player.avatar || 'ajani.png'}`} 
                        alt={player.name}
                        className="w-full h-full object-cover scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm py-1 flex items-center justify-center border-t border-white/10 z-20">
                      <span className="text-xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] leading-none">
                          {player.life}
                      </span>
                  </div>

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
