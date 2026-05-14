import { ContinuousEffectDefinition, DurationType, EffectDefinition, EffectDuration, EffectType, GameState, PlayerId, EngineFrame, TargetMapping, Zone } from '@shared/engine_types';
import { IdUtils } from '@shared/utils/IdUtils';
import { LogCategory } from '../../../../utils/EngineLogger';
import { RuleUtils } from '../../../../utils/RuleUtils';
import { getProcessors } from '../../../ProcessorRegistry';

/**
 * Strategy for CR 611: Continuous Effects from Spells and Abilities
 */
export class ContinuousEffectHandler {

    public static handle(
        state: GameState,
        effect: EffectDefinition,
        context: EngineFrame
    ) {
        const { logger, effect: EffectProcessor, targeting: TP_FROM_REG } = getProcessors(state);
        const ceDef = effect as ContinuousEffectDefinition;
        const { sourceId, targets: resolvedTargetIds, controllerId, stackObject } = context;
        logger.info(state, LogCategory.ACTION, `[CE_HANDLER] Resolving effect for source ${sourceId}. Targets: ${resolvedTargetIds.join(', ')}`);

        // 1. Resolve Duration
        const duration: EffectDuration = { ...(effect.duration || { type: DurationType.UntilEndOfTurn }) };

        if (duration.untilTurnOfPlayerId && typeof duration.untilTurnOfPlayerId === 'function') {
            const source = RuleUtils.findObject(state, sourceId);
            duration.untilTurnOfPlayerId = duration.untilTurnOfPlayerId(state, source);
        }

        if (!duration.untilTurnOfPlayerId && (duration.type === DurationType.UntilYourNextTurn || duration.type === DurationType.UntilEndOfYourNextTurn)) {
            duration.untilTurnOfPlayerId = controllerId;
        }

        // 2. Resolve Targets (Rule 611.2a: Snap targets at resolution)
        let finalTargetIds = resolvedTargetIds.length > 0 ? [...resolvedTargetIds] : undefined;
        const mapping = effect.targetMapping;

        if (!finalTargetIds && mapping) {
            if (mapping === TargetMapping.Self) {
                finalTargetIds = [sourceId];
            } else {
                // Re-resolve mapping if not provided (safety fallback)
                finalTargetIds = TP_FROM_REG.resolveTargetMapping(state, mapping, context, effect);
            }
        }

        if (!finalTargetIds || finalTargetIds.length === 0) {
            logger.info(state, LogCategory.ACTION, `[CE_HANDLER] [WARNING] No targets found for continuous effect. Source: ${sourceId}, Mapping: ${mapping}`);
            return;
        }

        // 3. Register Floating Effect

        // CR 613: Intelligent Layer attribution
        let layer = effect.layer;
        if (layer === undefined) {
            if (ceDef.abilitiesToAdd || ceDef.abilitiesToRemove || ceDef.removeAllAbilities) {
                layer = 6;
            } else if (ceDef.typesToAdd || ceDef.subtypesToAdd || ceDef.colorSet || ceDef.colorsToAdd) {
                layer = (ceDef.typesToAdd || ceDef.subtypesToAdd) ? 4 : 5;
            } else if (ceDef.powerModifier !== undefined || ceDef.toughnessModifier !== undefined || ceDef.powerSet !== undefined || ceDef.toughnessSet !== undefined) {
                layer = 7;
            } else {
                layer = 7;
            }
        }

        let targetControllerIds = [effect.targetControllerId || controllerId];
        if (effect.targetControllerMapping) {
            const resolvedIds = TP_FROM_REG.resolveTargetMapping(state, effect.targetControllerMapping, context, effect);
            if (resolvedIds.length > 0) {
                targetControllerIds = resolvedIds as PlayerId[];
            }
        }

        targetControllerIds.forEach((targetCID, index) => {
            // Filter targets by owner for each controller if using owner-specific mapping
            const playerSpecificTargetIds = (effect.targetControllerMapping === 'PARENT_CONTEXT_EXILED_IDS_OWNERS')
                ? finalTargetIds!.filter(tid => {
                    const obj = RuleUtils.findObject(state, tid);
                    return obj?.ownerId === targetCID;
                })
                : finalTargetIds;

            if (!playerSpecificTargetIds || playerSpecificTargetIds.length === 0) return;

            // Ensure duration for UntilEndOfYourNextTurn is associated with the target controller
            const effDuration: EffectDuration = { ...duration };
            if (!effDuration.untilTurnOfPlayerId && (effDuration.type === DurationType.UntilYourNextTurn || effDuration.type === DurationType.UntilEndOfYourNextTurn)) {
                effDuration.untilTurnOfPlayerId = targetCID;
            }

            const effId = IdUtils.generateEffectId(`${sourceId}_${index}`);

            const continuousEff: any = {
                id: effId,
                type: effect.registeredType || effect.type,
                sourceId,
                controllerId,
                layer: layer,
                sublayer: effect.sublayer,
                timestamp: Date.now(),
                activeZones: [Zone.Battlefield],
                duration: effDuration,
                targetMapping: mapping,
                targetIds: playerSpecificTargetIds,
                abilitiesToAdd: ceDef.abilitiesToAdd,
                abilitiesToRemove: ceDef.abilitiesToRemove,
                powerModifier: ceDef.powerModifier !== undefined ? EffectProcessor.resolveAmount(state, ceDef.powerModifier, context) : undefined,
                toughnessModifier: ceDef.toughnessModifier !== undefined ? EffectProcessor.resolveAmount(state, ceDef.toughnessModifier, context) : undefined,
                powerSet: ceDef.powerSet !== undefined ? EffectProcessor.resolveAmount(state, ceDef.powerSet, context) : undefined,
                toughnessSet: ceDef.toughnessSet !== undefined ? EffectProcessor.resolveAmount(state, ceDef.toughnessSet, context) : undefined,
                canPlayExiled: ceDef.canPlayExiled,
                isFreeCast: ceDef.isFreeCast,
                limitPerTurn: ceDef.limitPerTurn,
                condition: ceDef.condition,
                typesToAdd: ceDef.typesToAdd,
                subtypesToAdd: ceDef.subtypesToAdd,
                subtypesSet: ceDef.subtypesSet,
                colorsToAdd: ceDef.colorsToAdd,
                colorSet: ceDef.colorSet,
                removeAllAbilities: ceDef.removeAllAbilities,
                flashbackCostOverride: ceDef.flashbackCostOverride,
                miracleCostOverride: ceDef.miracleCostOverride,
                spendAnyMana: ceDef.spendAnyMana,
                exileOnMoveToGraveyard: ceDef.exileOnMoveToGraveyard,
                playerModifier: ceDef.playerModifier,
                targetControllerId: targetCID,
                multiplier: ceDef.multiplier !== undefined ? EffectProcessor.resolveAmount(state, ceDef.multiplier, context) : undefined,
                reductionAmount: ceDef.reductionAmount !== undefined ? EffectProcessor.resolveAmount(state, ceDef.reductionAmount, context) : undefined,
                taxAmount: ceDef.taxAmount !== undefined ? EffectProcessor.resolveAmount(state, ceDef.taxAmount, context) : undefined,
                restrictions: ceDef.restrictionsToAdd ? ceDef.restrictionsToAdd.map((r: any) => ({
                    id: `rest_${effId}`,
                    sourceId,
                    type: typeof r === 'string' ? r : r.type,
                    targetControllerId: targetCID,
                    duration: effDuration
                })) : (effect.restrictions && !([TargetMapping.MatchingPermanents, TargetMapping.MatchingCards, TargetMapping.MatchingPermanentsYouControl] as string[]).includes(effect.targetMapping as any) ? effect.restrictions.map((r: any) => ({
                    id: `rest_${effId}`,
                    sourceId,
                    type: typeof r === 'string' ? r : r.type,
                    targetControllerId: targetCID,
                    duration: effDuration
                })) : [])
            };

            if (ceDef.copyFromIdMapping) {
                const ids = TP_FROM_REG.resolveTargetMapping(state, ceDef.copyFromIdMapping, { ...context, targets: playerSpecificTargetIds }, effect);
                if (ids.length > 0) {
                    continuousEff.copyFromId = ids[0];
                }
            }

            // Names (Rule 201)
            const chosenName = ceDef.chosenName || stackObject?.chosenName;
            if (chosenName) {
                if (!state.turnState.namedCards) state.turnState.namedCards = {};
                state.turnState.namedCards[sourceId] = chosenName;
                continuousEff.value = chosenName;
            }

            // Rule 613.1: Final assembly of the effect object
            const finalEffect: any = {
                ...ceDef,         // Inherit all properties from standard definition (label, oracleText, etc.)
                ...continuousEff, // Apply resolved values (targets, timestamps, resolved amounts)
            };

            // Use the specific permission type if available (from continuousEff.type)
            if (ceDef.type === EffectType.ApplyContinuousEffect && continuousEff.type) {
                finalEffect.type = continuousEff.type;
            }

            // Ensure floating ID is set
            if (!finalEffect.id?.startsWith('floating_')) {
                finalEffect.id = IdUtils.generateEffectId(`${sourceId}_${index}`);
            }

            state.ruleRegistry.continuousEffects.push(finalEffect);
            
            // Invalidate caches (CR 613 / 603)
            state._statsCache = undefined;
            state._triggerCache = undefined;

            logger.info(state, LogCategory.ACTION, `[CE_HANDLER] Registered Layer ${layer} effect: ${finalEffect.label || finalEffect.type} for ${targetCID}. Duration: ${effDuration.type}.`);
        });
    }
}

