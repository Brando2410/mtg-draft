import { GameState, EffectDefinition, GameObjectId, PlayerId, GameObject, ContinuousEffect, DurationType } from '@shared/engine_types';
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
    amountResolver: (amt: any) => number
  ) {
    log(`[CE] Resolving continuous effect. ControllerId=${controllerId}`);
    
    // 1. Resolve Duration
    const rawDuration = (effect as any).duration;
    let duration: any = { type: DurationType.UntilEndOfTurn };

    if (typeof rawDuration === 'string') {
        const upper = rawDuration.toUpperCase();
        if (Object.values(DurationType).includes(upper as any)) {
            duration.type = upper as DurationType;
        } else {
            duration.type = DurationType.Static;
        }
    } else if (rawDuration && typeof rawDuration === 'object') {
        duration = { ...rawDuration };
    }

    // 2. Resolve Targets (Rule 611.2a: Snap targets at resolution)
    let finalTargetIds = resolvedTargetIds.length > 0 ? [...resolvedTargetIds] : undefined;
    const mapping = (effect as any).targetMapping;

    if (!finalTargetIds && mapping) {
        if (mapping === 'ALL_PERMANENTS_YOU_CONTROL') {
            finalTargetIds = state.battlefield.filter(o => o.controllerId === controllerId).map(o => o.id);
        } else if (mapping === 'ALL_CREATURES_YOU_CONTROL') {
            finalTargetIds = state.battlefield.filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature')).map(o => o.id);
        } else if (mapping === 'MATCHING_PERMANENTS_YOU_CONTROL') {
            finalTargetIds = state.battlefield.filter(o => o.controllerId === controllerId && TargetingProcessor.matchesRestrictions(state, o, effect.restrictions || [], controllerId, sourceId)).map(o => o.id);
        } else if (mapping === 'MATCHING_PERMANENTS') {
            finalTargetIds = state.battlefield.filter(o => TargetingProcessor.matchesRestrictions(state, o, effect.restrictions || [], controllerId, sourceId)).map(o => o.id);
        } else if (mapping === 'SELF') {
            finalTargetIds = [sourceId];
        }
    }

    // 3. Register Floating Effect
    const effId = `floating_${sourceId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const continuousEff: ContinuousEffect = {
        id: effId,
        sourceId,
        controllerId,
        layer: (effect as any).layer || 7,
        timestamp: Date.now(),
        activeZones: ['Battlefield' as any],
        duration: duration,
        targetMapping: finalTargetIds ? undefined : mapping,
        targetIds: finalTargetIds,
        abilitiesToAdd: (effect as any).abilitiesToAdd,
        abilitiesToRemove: (effect as any).abilitiesToRemove,
        powerModifier: (effect as any).powerModifier !== undefined ? amountResolver((effect as any).powerModifier) : undefined,
        toughnessModifier: (effect as any).toughnessModifier !== undefined ? amountResolver((effect as any).toughnessModifier) : undefined,
        powerSet: (effect as any).powerSet !== undefined ? amountResolver((effect as any).powerSet) : undefined,
        toughnessSet: (effect as any).toughnessSet !== undefined ? amountResolver((effect as any).toughnessSet) : undefined,
        canPlayExiled: (effect as any).canPlayExiled || (effect as any).value === 'MAY_PLAY_EXILED',
        isFreeCast: (effect as any).isFreeCast || (effect as any).value === 'MAY_CAST_WITHOUT_PAYING',
        condition: (effect as any).condition,
        typesToAdd: (effect as any).typesToAdd,
        subtypesToAdd: (effect as any).subtypesToAdd,
        colorsToAdd: (effect as any).colorsToAdd,
        colorSet: (effect as any).colorSet,
        removeAllAbilities: (effect as any).removeAllAbilities
    } as any;

    log(`[CE] Pushing effect with ${continuousEff.targetIds?.length || 0} targets and ${continuousEff.abilitiesToAdd?.length || 0} abilities.`);
    state.ruleRegistry.continuousEffects.push(continuousEff);
    log(`Applied continuous effect [${duration.type}] to ${finalTargetIds?.length || mapping} target(s).`);
  }
}
