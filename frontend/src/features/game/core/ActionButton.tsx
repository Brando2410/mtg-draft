import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionType, Step, Phase } from '@shared/engine_types';
import { Sword, Shield, Zap, Diamond, Compass, ChevronsRight } from 'lucide-react';
import { useActionButtonLogic } from '../../../hooks/game/useActionButtonLogic';

interface ActionButtonProps {
  hasPriority: boolean;
  pendingAction?: any;
  currentPhase?: Phase;
  currentStep?: Step;
  onPass: () => void;
  onToggleStop?: (step: string) => void;
  stackLength?: number;
  isMyTurn?: boolean;
  stops?: Record<string, boolean>;
  effectivePlayerId: string;
  attackerCount?: number;
  blockerCount?: number;
  onAllAttack?: () => void;
  onCancelAttacks?: () => void;
  onCancelBlocks?: () => void;
  fullControl?: boolean;
  passUntilEndOfTurn?: boolean;
  onTogglePassTurn?: () => void;
  onClear?: () => void;
  onUndo?: () => void;
  onChoiceResolve?: (choice: number) => void;
}

interface PhaseIndicatorProps {
    id: string;
    icon: any;
    label: string;
    currentStep?: string;
    isMyTurn: boolean;
    stops: Record<string, boolean>;
    onToggleStop?: (step: string) => void;
}
  
const PhaseIndicator = memo(({ id, icon: Icon, label, currentStep, isMyTurn, stops, onToggleStop }: PhaseIndicatorProps) => {
    const internalId = isMyTurn ? `my_${id.toLowerCase()}` : `opp_${id.toLowerCase()}`;
    const isStopped = stops[internalId];
    const isCurrentStep = currentStep === id;
    const highlightColor = isCurrentStep ? 'text-cyan-400' : (isStopped ? 'text-orange-500' : 'text-slate-600');

    return (
        <div 
        onClick={() => onToggleStop?.(internalId)}
        title={label}
        className={`relative cursor-pointer transition-all flex flex-col items-center group px-1
            ${highlightColor} active:scale-90`}
        >
            {isCurrentStep && (
                <motion.div 
                layoutId="phase-glow"
                className="absolute inset-0 bg-cyan-500/15 rounded-full blur-[10px] -z-10"
                />
            )}

            <div className={`p-1.5 rounded-sm border transition-all duration-300
            ${isCurrentStep ? 'border-cyan-400/40 bg-cyan-400/5' : ''}
            ${isStopped ? 'border-orange-500/50 bg-orange-500/10' : 'border-transparent'}
            `}>
                <Icon className={`w-3.5 h-3.5 transition-all
                ${isCurrentStep ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}
                ${isStopped ? 'fill-orange-500/20' : ''}`} 
                />
            </div>
            
            {isCurrentStep && (
                <motion.div 
                layoutId="phase-indicator"
                className="absolute -bottom-1 w-full h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                />
            )}

            <span className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 text-[8.5px] font-black uppercase tracking-wider whitespace-nowrap bg-black/90 text-white px-2 py-1 rounded-md transition-opacity pointer-events-none z-[1000] border border-white/10 italic">
                {label}
            </span>
        </div>
    );
});

export const ActionButton = memo(({ 
  hasPriority, 
  pendingAction, 
  currentPhase,
  currentStep,
  onPass,
  onToggleStop,
  stackLength = 0,
  isMyTurn = false,
  stops = {},
  effectivePlayerId,
  attackerCount = 0,
  blockerCount = 0,
  onAllAttack,
  onCancelAttacks,
  onCancelBlocks,
  fullControl = false,
  passUntilEndOfTurn = false,
  onTogglePassTurn,
  onClear,
  onUndo,
  onChoiceResolve
}: ActionButtonProps) => {
  const { 
    buttonText, 
    subLabel, 
    isOrange, 
    isDisabled, 
    isCancel, 
    setIsHovered 
  } = useActionButtonLogic({
    hasPriority,
    pendingAction,
    currentPhase,
    currentStep,
    stackLength,
    isMyTurn,
    effectivePlayerId,
    attackerCount,
    blockerCount
  });

  const handlePass = () => {
    if (pendingAction?.type === ActionType.Mulligan) {
        onChoiceResolve?.(0); // Index 0 is "Keep"
    } else {
        onPass();
    }
  };

  const isCombat = currentPhase === Phase.Combat;
  const showCombatNavigator = isCombat || fullControl;

  return (
    <div className="fixed bottom-[calc(var(--u)*1)] right-[calc(var(--u)*10)] flex flex-col items-center gap-[var(--sp-2)] z-[700]">
        
        <AnimatePresence>
            {showCombatNavigator && (
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-[calc(var(--u)*0.2)] bg-slate-950/80 backdrop-blur-xl px-[var(--sp-4)] py-[var(--sp-2)] rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-[calc(var(--u)*1)]"
                >
                    <PhaseIndicator id={Step.BeginningOfCombat} icon={Compass} label="Start Combat" currentStep={currentStep} isMyTurn={isMyTurn} stops={stops} onToggleStop={onToggleStop} />
                    <PhaseIndicator id={Step.DeclareAttackers} icon={Sword} label="Attackers" currentStep={currentStep} isMyTurn={isMyTurn} stops={stops} onToggleStop={onToggleStop} />
                    <PhaseIndicator id={Step.DeclareBlockers} icon={Shield} label="Blockers" currentStep={currentStep} isMyTurn={isMyTurn} stops={stops} onToggleStop={onToggleStop} />
                    <PhaseIndicator id={Step.CombatDamage} icon={Zap} label="Damage" currentStep={currentStep} isMyTurn={isMyTurn} stops={stops} onToggleStop={onToggleStop} />
                    <PhaseIndicator id={Step.EndOfCombat} icon={Diamond} label="End Combat" currentStep={currentStep} isMyTurn={isMyTurn} stops={stops} onToggleStop={onToggleStop} />
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            <motion.div
                key="action-button-container"
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex flex-col gap-[var(--sp-1)] w-[calc(var(--u)*32)] relative"
            >
                {/* SECONDARY ACTIONS (All Attack, Cancel Blocks, etc) */}
                <div className="flex flex-col gap-[var(--sp-2)] w-full items-center">
                    {(pendingAction?.playerId === effectivePlayerId) && (pendingAction?.type === ActionType.DeclareAttackers || (pendingAction?.type === ActionType.DeclareBlockers && blockerCount > 0)) && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={pendingAction.type === ActionType.DeclareAttackers 
                                ? (attackerCount > 0 ? onCancelAttacks : onAllAttack)
                                : onCancelBlocks
                            }
                            className="btn-premium-secondary w-full max-w-[calc(var(--u)*28)] !h-[calc(var(--u)*4.5)] !text-[var(--fs-sm)]"
                        >
                            {pendingAction.type === ActionType.DeclareAttackers 
                                ? (attackerCount > 0 ? "CANCEL ATTACKS" : "ALL ATTACK")
                                : "CANCEL BLOCKS"
                            }
                        </motion.button>
                    )}

                    {pendingAction?.type === ActionType.Mulligan && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onChoiceResolve?.(1)} // Index 1 is "Mulligan"
                            className="btn-premium-danger w-full max-w-[calc(var(--u)*28)] !h-[calc(var(--u)*4.5)] !text-[var(--fs-sm)]"
                        >
                            MULLIGAN
                        </motion.button>
                    )}

                    {/* TARGETING CANCELLATION */}
                    {pendingAction?.type === ActionType.Targeting && (
                        <div className="flex flex-col gap-[var(--sp-1)] w-full items-center">
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={(pendingAction.data?.selectedTargets || []).length > 0 ? onClear : onUndo}
                                className={(pendingAction.data?.selectedTargets || []).length > 0 ? "btn-premium-secondary" : "btn-premium-danger"}
                                style={{ height: 'calc(var(--u)*4.5)', fontSize: 'var(--fs-sm)' }}
                            >
                                <span>
                                    {(pendingAction.data?.selectedTargets || []).length > 0 
                                        ? "CLEAR SELECTION" 
                                        : (pendingAction.data?.isSpellCasting ? "CANCEL CAST" : (pendingAction.data?.isCopyTargeting ? "CANCEL COPY" : "CANCEL ACTIVATION"))}
                                </span>
                            </motion.button>
                        </div>
                    )}
                </div>

                <div className="flex flex-row items-center gap-[var(--sp-4)] relative">
                    <div className="flex flex-col items-center">
                        {/* MAIN ACTION BUTTON */}
                        <button
                            onClick={handlePass}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            disabled={isDisabled}
                            className={`
                                ${isOrange ? 'btn-premium-primary' : isCancel ? 'btn-premium-cancel' : 'btn-premium-empty'}
                                !w-[calc(var(--u)*32)] !h-[calc(var(--u)*7)] z-10
                            `}
                        >
                            <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase tracking-wider">{buttonText}</span>
                        </button>

                        {/* SUB-LABEL - Fixed height to prevent shifting */}
                        <div className="h-[calc(var(--u)*2)] flex items-center justify-center relative w-full mt-[var(--sp-1)]">
                            {subLabel && (
                                <span className="text-[var(--fs-sm)] font-bold text-white/60 tracking-tight leading-none text-center drop-shadow-md uppercase absolute top-0 left-0 right-0">
                                    {subLabel}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* PASS TURN PILL - Right Side */}
                    <button
                        onClick={onTogglePassTurn}
                        title="Pass Turn (Until End of Turn)"
                        className={`
                            h-[calc(var(--u)*4.5)] px-[var(--sp-4)] rounded-full border border-white/20 transition-all duration-300 shadow-lg flex items-center justify-center min-w-[calc(var(--u)*8)]
                            ${passUntilEndOfTurn 
                                ? 'bg-cyan-500 border-cyan-300 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                                : 'bg-gradient-to-br from-[#ffb347] to-[#b32400] text-white'}
                            active:scale-95
                        `}
                    >
                        <ChevronsRight className={`w-[calc(var(--u)*3.5)] h-[calc(var(--u)*3.5)] ${passUntilEndOfTurn ? 'animate-pulse' : ''}`} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
  );
});
