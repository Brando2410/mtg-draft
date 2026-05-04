import { memo } from 'react';
import { motion } from 'framer-motion';
import { Step, Phase } from '@shared/engine_types';

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

export const Stopper = memo(({ id, label, isOpponent, stops, onToggleStop, isActive, currentStep, currentPhase }: StopperProps) => {
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
          className={`w-[1.5vh] h-[1.5vh] rotate-45 border-2 transition-all cursor-pointer relative z-10
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
