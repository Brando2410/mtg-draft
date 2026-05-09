import { useMemo, useState } from 'react';
import { Phase, ActionType, Step } from '@shared/engine_types';
import { getActionMeta } from '@shared/utils/ActionUtils';

interface ActionButtonLogicProps {
  hasPriority: boolean;
  pendingAction?: any;
  currentPhase?: Phase;
  currentStep?: Step;
  stackLength: number;
  isMyTurn: boolean;
  effectivePlayerId: string;
  attackerCount: number;
  blockerCount: number;
}

export const useActionButtonLogic = ({
  hasPriority,
  pendingAction,
  currentPhase,
  currentStep,
  stackLength,
  isMyTurn,
  effectivePlayerId,
  attackerCount,
  blockerCount
}: ActionButtonLogicProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const logic = useMemo(() => {
    let text = isMyTurn ? "Next" : "Pass";
    let sub = "";
    let orange = true;
    let disabled = !hasPriority;
    let cancel = false;

    if (!isMyTurn && !hasPriority) {
      return { buttonText: "Opponent's Turn", subLabel: "", isOrange: false, isDisabled: true, isCancel: false };
    }

    if (pendingAction) {
      const isActionForMe = pendingAction.playerId === effectivePlayerId;
      const meta = getActionMeta(pendingAction);

      if (!isActionForMe) {
        return {
          buttonText: "Waiting",
          subLabel: "Opponent's Action",
          isOrange: false,
          isDisabled: true,
          isCancel: false
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
      } else if (pendingAction.type === ActionType.Choice || pendingAction.type === ActionType.ModalSelection || pendingAction.type === ActionType.ResolutionChoice) {
        const isContextual = pendingAction.data?.isContextual;
        text = isContextual ? "Waiting" : "Confirm";
        sub = isContextual ? "Choice required" : "Make a choice";
        orange = !isContextual;
        disabled = isContextual;
      } else if (pendingAction.type === ActionType.Discard) {
        const isOptional = pendingAction.data?.isOptionalDiscard || meta.discardAmount === 'ANY';
        if (isOptional) {
          text = "Done Discarding";
          sub = "Click to finish";
          orange = true;
          disabled = false;
        } else {
          text = "Pending Discard";
          const count = pendingAction.data?.count ?? pendingAction.count ?? 1;
          sub = `${count} CARD${count > 1 ? 'S' : ''} LEFT`;
          orange = false;
          disabled = true;
        }
      } else if (pendingAction.type === ActionType.Targeting || (pendingAction.type as any) === 'TARGETING') {
        const selected = pendingAction.data?.selectedTargets || [];
        const targetDef = pendingAction.data?.targetDefinition;
        const isOptional = targetDef?.optional || targetDef?.minCount === 0;
        const minCount = pendingAction.data?.minCount ?? (targetDef?.minCount ?? (isOptional ? 0 : (targetDef?.count ?? 1)));
        const totalCount = pendingAction.data?.count ?? (targetDef?.count ?? 1);
        const isSpellCasting = meta.isSpellCasting;
        const isAbility = meta.abilityIndex !== undefined;
        const isInteractive = isSpellCasting || isAbility;

        const canConfirm = selected.length >= minCount;

        if (canConfirm) {
          text = "Confirm";
          orange = true;
          disabled = false;
        } else {
          text = isInteractive ? "Cancel" : "Waiting";
          orange = false;
          disabled = !isInteractive;
          if (isInteractive) {
            cancel = true;
          }
        }

        sub = `SELECT TARGETS: ${selected.length} / ${totalCount}`;
      }
    } else {
      switch (currentStep) {
        case Step.Upkeep: sub = "To Draw"; break;
        case Step.Draw: sub = "To Main"; break;
        case Step.Main: sub = currentPhase === Phase.PreCombatMain ? "To Combat" : "End Turn"; break;
        case Step.BeginningOfCombat: sub = "To Attackers"; break;
        case Step.DeclareAttackers: sub = "To Blockers"; break;
        case Step.DeclareBlockers: sub = "To Damage"; break;
        case Step.FirstStrikeDamage: sub = "To Damage"; break;
        case Step.CombatDamage: sub = "To End of Combat"; break;
        case Step.EndOfCombat: sub = "To Main"; break;
        case Step.End: sub = "End Turn"; break;
      }

      if (stackLength > 0 && hasPriority) {
        text = "Resolve";
        sub = "Next on stack";
      } else if (!hasPriority) {
        text = "Waiting";
        orange = false;
      } else if (currentStep === Step.End || (currentStep === Step.Main && currentPhase === Phase.PostCombatMain)) {
        text = isMyTurn ? "End Turn" : "My Turn";
        sub = isMyTurn ? "" : "End Turn";
      }
    }

    return { buttonText: text, subLabel: sub, isOrange: orange, isDisabled: disabled, isCancel: cancel };
  }, [hasPriority, pendingAction, currentStep, currentPhase, stackLength, isMyTurn, effectivePlayerId, attackerCount, blockerCount, isHovered, JSON.stringify(pendingAction?.data?.selectedTargets)]);

  return {
    ...logic,
    isHovered,
    setIsHovered
  };
};
