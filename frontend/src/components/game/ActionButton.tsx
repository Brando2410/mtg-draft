import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phase, ActionType, Step } from '@shared/engine_types';
import { Sword, Shield, Zap, Diamond, Compass } from 'lucide-react';

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
}

/**
 * Arena Action Button with Universal Phase Navigator.
 */
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
  fullControl = false
}: ActionButtonProps) => {

  const [isHovered, setIsHovered] = useState(false);

  const { buttonText, subLabel, isOrange, isDisabled } = useMemo(() => {
    let text = isMyTurn ? "Next" : "Pass";
    let sub = "";
    let orange = true;
    let disabled = !hasPriority;

    if (!isMyTurn && !hasPriority) {
        return { buttonText: "Opponent's Turn", subLabel: "", isOrange: false, isDisabled: true };
    }

    // --- SUB LABEL CALCULATION (Arena Style) ---
    if (pendingAction) {
        const isActionForMe = pendingAction.playerId === effectivePlayerId;
        
        if (!isActionForMe) {
            return { 
                buttonText: "Waiting", 
                subLabel: "Opponent's Action", 
                isOrange: false, 
                isDisabled: true 
            };
        }

        if (pendingAction.type === ActionType.DeclareAttackers) {
            text = attackerCount > 0 ? `${attackerCount} Attacker${attackerCount > 1 ? 's' : ''}` : "No Attacks";
            sub = attackerCount > 0 ? "To Blockers" : (isHovered ? "To End of Combat" : "");
            orange = true;
        } else if (pendingAction.type === ActionType.DeclareBlockers) {
            text = blockerCount > 0 ? `${blockerCount} Blocker${blockerCount > 1 ? 's' : ''}` : "No Blocks";
            sub = "To Damage";
            orange = true;
        } else if (pendingAction.type === ActionType.Choice || pendingAction.type === ActionType.ModalSelection) {
            text = "Submit";
            sub = "Select targets";
        } else if (pendingAction.type === ActionType.Discard) {
            text = "Pending Discard";
            sub = "";
            orange = false;
            disabled = true;
        } else if (pendingAction.type === ActionType.Targeting) {
            text = "Cancel";
            sub = "Choosing targets";
            orange = false;
            disabled = false;
        }
    } else {
        // We calculate sub regardless of priority to let the player know what's coming
        switch(currentStep) {
            case Step.Upkeep: 
              sub = "To Draw"; 
              break;
            case Step.Draw: 
              sub = "To Main 1"; 
              break;
            case Step.Main: 
              sub = currentPhase === Phase.PreCombatMain ? "To Combat" : "End Turn"; 
              break;
            case Step.BeginningOfCombat: 
              sub = "To Attackers"; 
              break;
            case Step.DeclareAttackers: 
              sub = "To Blockers"; 
              break;
            case Step.DeclareBlockers: 
              sub = "To Damage"; 
              break;
            case Step.FirstStrikeDamage: 
              sub = "To Damage"; 
              break;
            case Step.CombatDamage: 
              sub = "To End of Combat"; 
              break;
            case Step.EndOfCombat: 
              sub = "To Main 2"; 
              break;
            case Step.End: 
              sub = "End Turn"; 
              break;
        }

        if (stackLength > 0 && hasPriority) {
            text = "Resolve";
            sub = "Next on stack";
        } else if (!hasPriority) {
            text = "Waiting";
            orange = false;
        } else if (currentStep === Step.End || (currentStep === Step.Main && currentPhase === Phase.PostCombatMain)) {
            // "End Turn" for active player, "My Turn" for responding player
            text = isMyTurn ? "End Turn" : "My Turn";
            sub = isMyTurn ? "" : "End Turn";
        }
    }

    return { buttonText: text, subLabel: sub, isOrange: orange, isDisabled: disabled };
  }, [hasPriority, pendingAction, currentStep, currentPhase, stackLength, isMyTurn, effectivePlayerId, attackerCount, blockerCount, isHovered]);

  const isCombat = currentPhase === Phase.Combat;
  const showCombatNavigator = isCombat || fullControl;

  const PhaseIndicator = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => {
    const internalId = isMyTurn ? `my_${id.toLowerCase()}` : `opp_${id.toLowerCase()}`;
    const isStopped = stops[internalId];
    
    // Check if we are currently in this step
    const isCurrentStep = currentStep === id;
    
    // Determine active styling: Cyan for Current, Orange for Stopped
    const highlightColor = isCurrentStep ? 'text-cyan-400' : (isStopped ? 'text-orange-500' : 'text-slate-600');

    return (
      <div 
        onClick={() => onToggleStop?.(internalId)}
        title={label}
        className={`relative cursor-pointer transition-all flex flex-col items-center group px-1
          ${highlightColor} hover:scale-110 active:scale-90`}
      >
          {/* Active Liquid Glow Backlight (Current Phase Only) */}
          {isCurrentStep && (
              <motion.div 
                layoutId="phase-glow"
                className="absolute inset-0 bg-cyan-500/15 rounded-full blur-[10px] -z-10"
              />
          )}

          <div className={`p-1.5 rounded-sm border transition-all duration-300
            ${isCurrentStep ? 'border-cyan-400/40 bg-cyan-400/5' : ''}
            ${isStopped ? 'border-orange-500/50 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'border-transparent'}
          `}>
              <Icon className={`w-3.5 h-3.5 transition-all
                ${isCurrentStep ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}
                ${isStopped ? 'fill-orange-500/20' : ''}`} 
              />
          </div>
          
          {/* Arena-style Underline (Current Phase Indicator) */}
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
  };

  return (
    <div className="fixed bottom-12 right-12 flex flex-col items-center gap-4 z-[700]">
        
        {/* COMBAT NAVIGATOR BAR (Only during Combat or Full Control) */}
        <AnimatePresence>
            {showCombatNavigator && (
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-0.5 bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-1"
                >
                    <PhaseIndicator id={Step.BeginningOfCombat} icon={Compass} label="Start Combat" />
                    <PhaseIndicator id={Step.DeclareAttackers} icon={Sword} label="Attackers" />
                    <PhaseIndicator id={Step.DeclareBlockers} icon={Shield} label="Blockers" />
                    <PhaseIndicator id={Step.CombatDamage} icon={Zap} label="Damage" />
                    <PhaseIndicator id={Step.EndOfCombat} icon={Diamond} label="End Combat" />
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            <motion.div
                key="action-button-container"
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex flex-col gap-2 w-64"
            >
                {/* PRIMARY ACTION BUTTON */}
                <button
                    onClick={onPass}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isDisabled}
                    className={`
                        relative px-10 py-3 rounded-full font-serif text-2xl font-bold tracking-tight transition-all duration-300 w-full
                        ${isOrange 
                            ? 'bg-gradient-to-b from-[#ff9a44] to-[#ff4b2b] text-white shadow-[0_0_30px_rgba(255,75,43,0.4)] border-t border-white/30' 
                            : 'bg-slate-800 text-slate-500 border border-white/10 shadow-inner'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed saturate-50' : 'hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-orange-500/10'}
                        group
                    `}
                >
                    {isOrange && !isDisabled && (
                        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl animate-pulse -z-10" />
                    )}
                    <span className="drop-shadow-md">{buttonText}</span>
                </button>

                {/* SECONDARY COMBAT ACTION */}
                {(pendingAction?.playerId === effectivePlayerId) && (pendingAction?.type === ActionType.DeclareAttackers || (pendingAction?.type === ActionType.DeclareBlockers && blockerCount > 0)) && (
                   <motion.button
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     onClick={pendingAction.type === ActionType.DeclareAttackers 
                        ? (attackerCount > 0 ? onCancelAttacks : onAllAttack)
                        : onCancelBlocks
                     }
                     className="px-8 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest text-white/70 border border-white/5 transition-all active:scale-95"
                   >
                     {pendingAction.type === ActionType.DeclareAttackers 
                        ? (attackerCount > 0 ? "Cancel Attacks" : "All Attack")
                        : "Cancel Blocks"
                     }
                   </motion.button>
                )}

                {/* SHARED SUB LABEL (Arena Style) */}
                {subLabel && (
                    <div className="flex justify-center w-full mt-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic oblique leading-none text-center">
                            {subLabel}
                        </span>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    </div>
  );
});
