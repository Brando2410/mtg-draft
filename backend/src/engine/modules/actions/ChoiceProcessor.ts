import { GameState, PlayerId, Zone } from '@shared/engine_types';
import { M21_LOGIC } from '../../data/m21_logic';
import { ValidationProcessor } from '../state/ValidationProcessor';

/**
 * Handles interactive player choices (Targeting, Modal Choices)
 */
export class ChoiceProcessor {

  public static resolveChoice(
    state: GameState,
    playerId: string,
    choiceIndex: number | string,
    log: (m: string) => void,
    engine: {
        resetPriorityToActivePlayer: () => void;
        activateAbility: (p: PlayerId, c: string, idx: number, targets: string[], bypass?: boolean) => boolean;
    }
  ): boolean {
    if (state.pendingAction?.type !== 'CHOICE' || state.pendingAction.playerId !== playerId) return false;

    // Handle "Back/Undo" from choice
    if (String(choiceIndex) === 'undo' || choiceIndex === -1) {
        const sourceId = state.pendingAction.sourceId;
        const obj = state.battlefield.find(o => o.id === sourceId);
        if (obj) {
            if (obj.abilitiesUsedThisTurn > 0) obj.abilitiesUsedThisTurn--;
        }
        log(`Action cancelled.`);
        state.pendingAction = undefined;
        engine.resetPriorityToActivePlayer();
        return true;
    }

    const idx = typeof choiceIndex === 'string' ? parseInt(choiceIndex) : choiceIndex;
    const sourceId = state.pendingAction.sourceId;
    const choice = state.pendingAction.data?.choices[idx];
    
    if (!choice || !sourceId) return false;

    const obj = state.battlefield.find(o => o.id === sourceId);
    if (obj && obj.definition.types.includes('Planeswalker')) {
      const abilityIndex = choice.value;
      const ability = M21_LOGIC[obj.definition.name].abilities[abilityIndex];

      if (ability.targetDefinition) {
         const targetDef = ability.targetDefinition;
         const legalTargetIds = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id)
         ].filter(tid => ValidationProcessor.isLegalTarget(state, sourceId, tid, targetDef));
            
         if (legalTargetIds.length === 0) {
             if (targetDef.optional) {
                  log(`No legal targets found, auto-skipping target selection for ${obj.definition.name}.`);
                  state.pendingAction = undefined;
                  return engine.activateAbility(playerId, sourceId, abilityIndex, [], true);
             } else {
                 log(`No legal targets available. Activation invalid.`);
                 return false;
             }
         }
         
         state.pendingAction = {
            type: 'TARGETING',
            playerId,
            sourceId,
            data: { abilityIndex, legalTargetIds, optional: targetDef.optional, targetDefinition: targetDef }
         };
         log(`Select target for ${obj.definition.name}'s ability.`);
         return true;
      }

       state.pendingAction = undefined;
       return engine.activateAbility(playerId, sourceId, abilityIndex, [], true);
    }

    state.pendingAction = undefined;
    engine.resetPriorityToActivePlayer();
    return true;
  }

  public static resolveTargeting(
    state: GameState,
    playerId: PlayerId,
    targetId: string,
    log: (m: string) => void,
    engine: {
        resetPriorityToActivePlayer: () => void;
        finaliseTargeting: (p: PlayerId, targets: string[]) => boolean;
    }
  ): boolean {
    if (state.pendingAction?.type !== 'TARGETING' || state.pendingAction.playerId !== playerId) return false;

    const actionData = state.pendingAction.data;
    const isOptional = actionData?.optional;
    const isSkipping = targetId === 'skip' || targetId === 'none';
    const isUndoing = targetId === 'undo' || targetId === 'back';
    const targetDef = actionData?.targetDefinition;
    const targetCount = targetDef?.count || 1;
    
    actionData.selectedTargets = actionData.selectedTargets || [];

    if (isUndoing) {
        if (actionData.selectedTargets.length > 0) {
            const removed = actionData.selectedTargets.pop();
            log(`Removed last target: ${removed}`);
            return true;
        } else {
            log(`Targeting cancelled.`);
            const sourceId = state.pendingAction.sourceId;
            const stackId = actionData.stackId;

            if (stackId) {
                const stackObj = state.stack.find(s => s.id === stackId);
                if (stackObj && stackObj.card) {
                    // Move card back to hand if it was a spell
                    const player = state.players[stackObj.controllerId];
                    if (player) {
                        stackObj.card.zone = Zone.Hand;
                        player.hand.push(stackObj.card);
                    }
                }
                state.stack = state.stack.filter(s => s.id !== stackId);
            }

            const sourceOnField = state.battlefield.find(o => o.id === sourceId);
            if (sourceOnField) {
                if (sourceOnField.abilitiesUsedThisTurn > 0) sourceOnField.abilitiesUsedThisTurn--;
            }

            state.pendingAction = undefined;
            engine.resetPriorityToActivePlayer();
            return true;
        }
    }

    if (isSkipping) {
        if (!isOptional && actionData.selectedTargets.length === 0) {
            log(`Targeting is required, cannot skip.`);
            return false;
        }
        return engine.finaliseTargeting(playerId, actionData.selectedTargets);
    }

    const legalTargetIds = actionData.legalTargetIds || [];
    if (!legalTargetIds.includes(targetId)) {
        log(`Invalid target selected.`);
        return false;
    }

    if (actionData.selectedTargets.includes(targetId)) {
        log(`Target already selected.`);
        return false;
    }

    actionData.selectedTargets.push(targetId);
    log(`Target ${actionData.selectedTargets.length}/${targetCount} selected: ${targetId}`);

    if (actionData.selectedTargets.length >= targetCount) {
        return engine.finaliseTargeting(playerId, actionData.selectedTargets);
    }

    return true;
  }
}
