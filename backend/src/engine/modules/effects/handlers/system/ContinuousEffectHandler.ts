import { ContinuousEffectDefinition, DurationType, EffectDefinition, EffectDuration, GameObject, GameState, PlayerId, ResolutionContext, Zone } from '@shared/engine_types';
import { TargetingProcessor } from '../../../actions/targeting/TargetingProcessor';

/**
 * Strategy for CR 611: Continuous Effects from Spells and Abilities
 */
export class ContinuousEffectHandler {

  public static handle(
    state: GameState,
    effect: EffectDefinition,
    log: (m: string) => void,
    context: ResolutionContext
  ) {
    const { EffectProcessor } = require('../EffectProcessor');
    const ceDef = effect as ContinuousEffectDefinition;
    const { sourceId, targets: resolvedTargetIds, controllerId, stackObject } = context;
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
            finalTargetIds = TargetingProcessor.resolveTargetMapping(state, mapping, context, effect);
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
        if (ceDef.abilitiesToAdd || ceDef.abilitiesToRemove || ceDef.removeAllAbilities) {
            layer = 6;
        } else if ((effect as any).typesToAdd || (effect as any).subtypesToAdd || (effect as any).colorSet || (effect as any).colorsToAdd) {
            layer = ((effect as any).typesToAdd || (effect as any).subtypesToAdd) ? 4 : 5;
        } else if (ceDef.powerModifier !== undefined || ceDef.toughnessModifier !== undefined || ceDef.powerSet !== undefined || ceDef.toughnessSet !== undefined) {
            layer = 7;
        } else {
            layer = 7;
        }
    }

    let targetControllerId = (effect as any).targetControllerId || controllerId;
    if (effect.targetControllerMapping) {
        const { TargetingProcessor } = require('../../../actions/TargetingProcessor');
        const controllerIds = TargetingProcessor.resolveTargetMapping(state, effect.targetControllerMapping, resolvedTargetIds, sourceId, controllerId, stackObject, effect);
        if (controllerIds.length > 0) {
            targetControllerId = controllerIds[0] as PlayerId;
        }
    }

    const continuousEff: any = {
        id: effId,
        sourceId,
        controllerId,
        layer: layer,
        sublayer: effect.sublayer,
        timestamp: Date.now(),
        activeZones: [Zone.Battlefield],
        duration: duration,
        targetMapping: mapping,
        targetIds: finalTargetIds,
        abilitiesToAdd: ceDef.abilitiesToAdd,
        abilitiesToRemove: ceDef.abilitiesToRemove,
        powerModifier: ceDef.powerModifier !== undefined ? EffectProcessor.resolveAmount(state, ceDef.powerModifier, context) : undefined,
        toughnessModifier: ceDef.toughnessModifier !== undefined ? EffectProcessor.resolveAmount(state, ceDef.toughnessModifier, context) : undefined,
        powerSet: ceDef.powerSet !== undefined ? EffectProcessor.resolveAmount(state, ceDef.powerSet, context) : undefined,
        toughnessSet: ceDef.toughnessSet !== undefined ? EffectProcessor.resolveAmount(state, ceDef.toughnessSet, context) : undefined,
        canPlayExiled: (effect as any).canPlayExiled,
        isFreeCast: (effect as any).isFreeCast,
        limitPerTurn: (effect as any).limitPerTurn,
        value: effect.value,
        condition: effect.condition,
        typesToAdd: (effect as any).typesToAdd,
        subtypesToAdd: (effect as any).subtypesToAdd,
        subtypesSet: (effect as any).subtypesSet,
        colorsToAdd: (effect as any).colorsToAdd,
        colorSet: (effect as any).colorSet,
        removeAllAbilities: ceDef.removeAllAbilities,
        flashbackCostOverride: (effect as any).flashbackCostOverride,
        spendAnyMana: (effect as any).spendAnyMana,
        exileOnMoveToGraveyard: (effect as any).exileOnMoveToGraveyard || (effect as any).redirectConditions?.onLeaveZone === Zone.Graveyard,
        playerModifier: (effect as any).playerModifier,
        targetControllerId: targetControllerId,
        // 'restrictions' on the definition is used by isTarget for filtering.
        // 'restrictionsToAdd' is used to define the rules added by the effect.
        restrictions: ceDef.restrictionsToAdd ? ceDef.restrictionsToAdd.map((r: any) => ({
            id: `rest_${effId}`,
            sourceId,
            type: typeof r === 'string' ? r as any : r.type,
            targetControllerId: targetControllerId,
            duration: duration
        })) : (effect.restrictions && !(["MATCHING_PERMANENTS", "MATCHING_CARDS", "MATCHING_PERMANENTS_YOU_CONTROL"].includes(effect.targetMapping)) ? effect.restrictions.map((r: any) => ({
            id: `rest_${effId}`,
            sourceId,
            type: typeof r === 'string' ? r as any : r.type,
            targetControllerId: targetControllerId,
            duration: duration
        })) : undefined)
    };

    if (continuousEff.targetControllerId) {
        continuousEff.duration.untilTurnOfPlayerId = continuousEff.targetControllerId;
    }

    if (effect.copyFromIdMapping) {
        const { TargetingProcessor } = require('../../../actions/TargetingProcessor');
        const ids = TargetingProcessor.resolveTargetMapping(state, effect.copyFromIdMapping, resolvedTargetIds, sourceId, controllerId, stackObject, effect, context);
        if (ids.length > 0) {
            continuousEff.copyFromId = ids[0];
        }
    }

    // --- NAMED CARD SUPPORT (Academic Probation / Necromentia) ---
    const chosenName = (effect as any).chosenName || stackObject?.data?.chosenName;
    if (chosenName) {
        if (!state.turnState.namedCards) state.turnState.namedCards = {};
        state.turnState.namedCards[sourceId] = chosenName;
        continuousEff.value = chosenName; // Also store in effect for redundancy
    }

    state.ruleRegistry.continuousEffects.push(continuousEff);
    log(`[CE_HANDLER] Registered Layer ${layer} effect on ${finalTargetIds.join(', ')}. Duration: ${duration.type}. Abilities: ${continuousEff.abilitiesToAdd || 'none'}`);
    log(`[DEBUG] Registry size: ${state.ruleRegistry.continuousEffects.length}`);
  }
}



