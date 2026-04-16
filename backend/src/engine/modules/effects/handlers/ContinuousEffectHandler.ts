import { ContinuousEffect, DurationType, EffectDefinition, EffectDuration, GameObject, GameObjectId, GameState, PlayerId, Zone } from '@shared/engine_types';
import { TargetingProcessor } from '../../actions/TargetingProcessor';

/**
 * Strategy for CR 611: Continuous Effects from Spells and Abilities
 */
export class ContinuousEffectHandler {

  public static handle(
    state: GameState,
    effect: EffectDefinition,
    sourceId: GameObjectId,
    resolvedTargetIds: string[],
    log: (m: string) => void,
    controllerId: PlayerId,
    amountResolver: (amt: any) => number,
    stackObject?: any
  ) {
    log(`[CE_HANDLER] Resolving effect for source ${sourceId}. Targets: ${resolvedTargetIds.join(', ')}`);
    
    // 1. Resolve Duration
    const rawDuration = effect.duration;
    let duration: EffectDuration = { type: DurationType.UntilEndOfTurn };

    if (typeof rawDuration === 'string') {
        const dStr = rawDuration.toUpperCase();
        if (dStr === 'UNTIL_END_OF_TURN' || dStr === 'UNTILENDOFTURN' || dStr === 'EOT') {
            duration.type = DurationType.UntilEndOfTurn;
        } else if (dStr === 'UNTIL_END_OF_COMBAT' || dStr === 'UNTILENDOFCOMBAT') {
            duration.type = DurationType.UntilEndOfCombat;
        } else if (dStr === 'STATIC') {
            duration.type = DurationType.Static;
        } else if (dStr === 'PERMANENT') {
            duration.type = DurationType.Permanent;
        } else if (dStr === 'UNTILYOURNEXTTURN' || dStr === 'UNTIL_YOUR_NEXT_TURN') {
            duration.type = DurationType.UntilYourNextTurn;
            duration.untilTurnOfPlayerId = controllerId;
        } else if (dStr === 'UNTIL_END_OF_YOUR_NEXT_TURN' || dStr === 'UNTILENDOFYOURNEXTTURN') {
            duration.type = DurationType.UntilEndOfYourNextTurn;
            duration.untilTurnOfPlayerId = controllerId;
        } else {
            duration.type = DurationType.Static;
        }
    } else if (rawDuration && typeof rawDuration === 'object') {
        duration = { ...rawDuration as any };
        if (duration.untilTurnOfPlayerId && typeof duration.untilTurnOfPlayerId === 'function') {
            const source = state.battlefield.find(o => o.id === sourceId) || state.stack.find(o => (o as any).id === sourceId);
            duration.untilTurnOfPlayerId = duration.untilTurnOfPlayerId(state, source);
        }
    }

    // 2. Resolve Targets (Rule 611.2a: Snap targets at resolution)
    let finalTargetIds = resolvedTargetIds.length > 0 ? [...resolvedTargetIds] : undefined;
    const mapping = effect.targetMapping;

    if (!finalTargetIds && mapping) {
        if (mapping === 'SELF') {
            finalTargetIds = [sourceId];
        } else {
            // Re-resolve mapping if not provided (safety fallback)
            finalTargetIds = TargetingProcessor.resolveTargetMapping(state, mapping, [], sourceId, controllerId);
        }
    }

    if (!finalTargetIds || finalTargetIds.length === 0) {
        log(`[CE_HANDLER] [WARNING] No targets found for continuous effect. Source: ${sourceId}, Mapping: ${mapping}`);
        return;
    }

    // 3. Register Floating Effect
    const effId = `floating_${sourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // CR 613: Intelligent Layer attribution
    let layer = effect.layer;
    if (layer === undefined) {
        if (effect.abilitiesToAdd || effect.abilitiesToRemove || effect.removeAllAbilities) {
            layer = 6;
        } else if ((effect as any).typesToAdd || (effect as any).subtypesToAdd || (effect as any).colorSet || (effect as any).colorsToAdd) {
            layer = ((effect as any).typesToAdd || (effect as any).subtypesToAdd) ? 4 : 5;
        } else if (effect.powerModifier !== undefined || effect.toughnessModifier !== undefined || effect.powerSet !== undefined || effect.toughnessSet !== undefined || effect.powerDynamic || effect.toughnessDynamic) {
            layer = 7;
        } else {
            layer = 7;
        }
    }

    const continuousEff: any = {
        id: effId,
        sourceId,
        controllerId,
        layer: layer,
        sublayer: effect.sublayer,
        powerDynamic: effect.powerDynamic,
        toughnessDynamic: effect.toughnessDynamic,
        timestamp: Date.now(),
        activeZones: [Zone.Battlefield],
        duration: duration,
        targetMapping: mapping,
        targetIds: finalTargetIds,
        abilitiesToAdd: effect.abilitiesToAdd,
        abilitiesToRemove: effect.abilitiesToRemove,
        powerModifier: effect.powerModifier !== undefined ? amountResolver(effect.powerModifier) : undefined,
        toughnessModifier: effect.toughnessModifier !== undefined ? amountResolver(effect.toughnessModifier) : undefined,
        powerSet: effect.powerSet !== undefined ? amountResolver(effect.powerSet) : undefined,
        toughnessSet: effect.toughnessSet !== undefined ? amountResolver(effect.toughnessSet) : undefined,
        canPlayExiled: effect.canPlayExiled,
        isFreeCast: effect.isFreeCast,
        condition: effect.condition,
        typesToAdd: (effect as any).typesToAdd,
        subtypesToAdd: effect.subtypesToAdd,
        subtypesSet: effect.subtypesSet,
        colorsToAdd: (effect as any).colorsToAdd,
        colorSet: (effect as any).colorSet,
        removeAllAbilities: effect.removeAllAbilities,
        flashbackCostOverride: effect.flashbackCostOverride,
        spendAnyMana: (effect as any).spendAnyMana,
        exileOnMoveToGraveyard: (effect as any).exileOnMoveToGraveyard || (effect as any).redirectConditions?.onLeaveZone === Zone.Graveyard,
        playerModifier: (effect as any).playerModifier,
        restrictions: (effect as any).restrictions ? (effect as any).restrictions.map((r: any) => ({
            id: `rest_${effId}`,
            sourceId,
            type: typeof r === 'string' ? r as any : r.type,
            targetControllerId: controllerId,
            duration: duration
        })) : undefined
    };

    if (effect.targetControllerMapping) {
        const { TargetingProcessor } = require('../../actions/TargetingProcessor');
        const controllerIds = TargetingProcessor.resolveTargetMapping(state, effect.targetControllerMapping, resolvedTargetIds, sourceId, controllerId, undefined, effect);
        if (controllerIds.length > 0) {
            continuousEff.duration.untilTurnOfPlayerId = controllerIds[0] as PlayerId;
            continuousEff.targetControllerId = controllerIds[0] as PlayerId;
        }
    } else if ((effect as any).targetControllerId) {
         continuousEff.targetControllerId = (effect as any).targetControllerId;
    }

    if (effect.copyFromIdMapping) {
        const { TargetingProcessor } = require('../../actions/TargetingProcessor');
        const ids = TargetingProcessor.resolveTargetMapping(state, effect.copyFromIdMapping, resolvedTargetIds, sourceId, controllerId, stackObject?.data || stackObject, effect);
        if (ids.length > 0) {
            continuousEff.copyFromId = ids[0];
        }
    }

    state.ruleRegistry.continuousEffects.push(continuousEff);
    log(`[CE_HANDLER] Registered Layer ${layer} effect on ${finalTargetIds.join(', ')}. Duration: ${duration.type}. Abilities: ${continuousEff.abilitiesToAdd || 'none'}`);
    log(`[DEBUG] Registry size: ${state.ruleRegistry.continuousEffects.length}`);
  }
}

