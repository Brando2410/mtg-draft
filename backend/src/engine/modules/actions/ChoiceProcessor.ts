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
        finaliseTargeting?: (p: PlayerId, targets: string[]) => boolean;
        tapForMana?: (p: PlayerId, c: string) => void;
        checkAutoPass?: (p: PlayerId) => void;
    }
  ): boolean {
    if (state.pendingAction?.type !== 'CHOICE' || state.pendingAction.playerId !== playerId) return false;

    // Handle "Back/Undo" from choice
    if (String(choiceIndex) === 'undo' || choiceIndex === -1) {
        if (state.pendingAction.data?.hideUndo) {
            log(`Undo not available for this mandatory action.`);
            return false;
        }
        const sourceId = state.pendingAction.sourceId;
        const savedActionData = state.pendingAction.data;

        // 1. Revert Battlefield source (Activated Ability/Planeswalker)
        const objOnBattlefield = state.battlefield.find(o => o.id === sourceId);
        if (objOnBattlefield) {
            if (objOnBattlefield.abilitiesUsedThisTurn > 0) objOnBattlefield.abilitiesUsedThisTurn--;
            
            // Refund Loyalty if applicable
            const abilityIndex = savedActionData?.abilityIndex;
            if (abilityIndex !== undefined) {
                const logic = M21_LOGIC[objOnBattlefield.definition.name];
                const ability = logic?.abilities[abilityIndex];
                const lCost = ability?.costs?.find((c: any) => c.type === 'Loyalty')?.value;
                if (lCost !== undefined) {
                    objOnBattlefield.counters['loyalty'] = (objOnBattlefield.counters['loyalty'] || 0) - lCost;
                    log(`Refunded loyalty for ${objOnBattlefield.definition.name}: ${lCost > 0 ? '+' : ''}${lCost}`);
                }
            }
        }

        // 2. Revert Stack source (Resolving Spell/Ability)
        const stackObj = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
        if (stackObj && stackObj.card) {
            const card = stackObj.card;
            const player = state.players[card.ownerId];
            if (player) {
                // Move card back to hand
                card.zone = Zone.Hand;
                player.hand.push(card);
                state.stack = state.stack.filter(s => s.id !== stackObj.id);
                
                // Refund Mana
                const { ManaProcessor } = require('../magic/ManaProcessor');
                ManaProcessor.refundManaCost(player, card.definition.manaCost);
                
                log(`Undo Choice: ${card.definition.name} returned to hand.`);
            }
        }

        log(`Action cancelled.`);
        state.pendingAction = undefined;
        state.priorityPlayerId = playerId; 
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
                   state.priorityPlayerId = playerId;
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
         state.priorityPlayerId = playerId;
         log(`Select target for ${obj.definition.name}'s ability.`);
         return true;
      }

        state.pendingAction = undefined;
        state.priorityPlayerId = playerId; // Restore priority
        return engine.activateAbility(playerId, sourceId, abilityIndex, [], true);
    }

        // --- MODAL SPELL OR COST HANDLING (Casting Phase choice) ---
        if (state.pendingAction.data?.isSpellCasting || state.pendingAction.data?.isCostChoice) {
             const savedTargets = state.pendingAction.data.declaredTargets || [];
             const costType = state.pendingAction.data.costType;
             
             state.pendingAction = undefined; // Clear choice action
             
             if (costType === 'Sacrifice') {
                 (state as any).lastChosenSacrificeId = choice.value;
             } else {
                 // Temporarily store the choice so SpellProcessor can pick it up
                 (state as any).lastChoiceIndex = choiceIndex;
             }
             
             log(`Selected ${costType ? costType + ' item' : 'choice'}: ${choice.label}`);
             
             // RE-CALL playCard to finalize (it will now see hasPreSelectedChoice or lastChosenSacrificeId)
             const { SpellProcessor } = require('./SpellProcessor');
             return SpellProcessor.playCard(
                 state, 
                 playerId, 
                 sourceId, 
                 savedTargets, 
                 log, 
                 {
                     tapForMana: (p: any, c: any) => engine.tapForMana ? engine.tapForMana(p, c) : true,
                     checkAutoPass: (p: any) => engine.checkAutoPass ? engine.checkAutoPass(p) : engine.resetPriorityToActivePlayer()
                 },
                 true // Finalizing
             );
        }

    // --- GENERIC CHOICE EFFECTS (Rule 608.2d) ---
    if (choice.effects) {
        log(`Option selected: ${choice.label}`);
        const savedActionData = state.pendingAction.data;
        const stackObj = savedActionData?.stackObj;
        
        // If the choice had a value (e.g. card selection), we use it as the target for the resolution of sub-effects
        const targetsForResolution = choice.value ? [choice.value] : (savedActionData?.targets || []);
        
        state.pendingAction = undefined; // Clear first to allow sub-effects to set another PENDING_ACTION if needed
        
        const { EffectProcessor } = require('../effects/EffectProcessor');
        log(`[CHOICE] Resolving sub-effects for ${choice.label}. Targets for resolution: ${targetsForResolution.join(', ')}`);
        EffectProcessor.resolveEffects(state, choice.effects, sourceId, targetsForResolution, log, 0, stackObj, savedActionData);
    
    // --- RESUME PARENT CONTEXTS ---
    let currentCtx = savedActionData;
    while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex < currentCtx.effects.length) {
        log(`[RESOLVING] Resuming parent resolution context for ${sourceId}...`);
        const nextIdx = currentCtx.nextEffectIndex;
        const effs = currentCtx.effects;
        const parentTargets = currentCtx.targets || [];
        const parentCtx = currentCtx.parentContext;
        
        // Advance currentCtx to parent before call (in case resolveEffects sets a new suspension)
        currentCtx = parentCtx; 
        EffectProcessor.resolveEffects(state, effs, sourceId, parentTargets, log, nextIdx, stackObj, parentCtx);
    }

        if (!state.pendingAction) {
           engine.resetPriorityToActivePlayer(); 
        } else {
           state.priorityPlayerId = (state as any).pendingAction.playerId || null;
        }
        return true;
    }

    state.pendingAction = undefined;
    state.priorityPlayerId = playerId; // Restore priority
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
            const stackObj = actionData.stackObj; // Get the hidden stack object

            if (stackObj) {
                if (stackObj.card) {
                    // Move card back to hand if it was a spell
                    const player = state.players[stackObj.controllerId];
                    if (player) {
                        stackObj.card.zone = Zone.Hand;
                        player.hand.push(stackObj.card);
                        
                        // Refund mana
                        const costStr = stackObj.card.definition.manaCost;
                        const { ManaProcessor } = require('../magic/ManaProcessor');
                        ManaProcessor.refundManaCost(player, costStr);
                        log(`Refunding mana for ${stackObj.card.definition.name}: ${costStr}`);
                    }
                }
            }
            
            // Clean up stack effectively (though it shouldn't be in state.stack if hidden)
            state.stack = state.stack.filter(s => s.id !== stackId);

            const sourceOnField = state.battlefield.find(o => o.id === sourceId);
            if (sourceOnField) {
                if (sourceOnField.abilitiesUsedThisTurn > 0) sourceOnField.abilitiesUsedThisTurn--;
                
                // Refund Loyalty if applicable
                const abilityIndex = actionData.abilityIndex;
                if (abilityIndex !== undefined) {
                    const { M21_LOGIC } = require('../../data/m21_logic');
                    const logic = M21_LOGIC[sourceOnField.definition.name];
                    const ability = logic?.abilities[abilityIndex];
                    const lCost = ability?.costs?.find((c: any) => c.type === 'Loyalty')?.value;
                    if (lCost !== undefined) {
                        sourceOnField.counters['Loyalty'] = (sourceOnField.counters['Loyalty'] || 0) - lCost;
                        log(`Refunding loyalty for ${sourceOnField.definition.name}: ${lCost > 0 ? '+' : ''}${lCost}`);
                    }
                }
            }

            state.pendingAction = undefined;
            state.priorityPlayerId = playerId; 
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
