import { AbilityType, ActionType, CopyEffect, DurationType, EffectDefinition, EffectType, ExtraTurnsEffect, GameObject, GameState, LogEffect, PhaseOutEffect, PlayerId, PlayerState, PreventionEffectDefinition, EngineFrame, SkipTurnsEffect, StackObject, TriggerAbilityEffect, Zone } from '@shared/engine_types';
import { IdUtils } from '@shared/utils/IdUtils';
import { LogCategory } from '../../../../utils/EngineLogger';
import { RuleUtils } from '../../../../utils/RuleUtils';
import { getProcessors } from '../../../ProcessorRegistry';


/**
 * Strategy for CR 601: Casting Spells and CR 701: Keyword Actions (System/Control)
 */
export class ControlEffectHandler {

    public static handle(
        state: GameState,
        effect: EffectDefinition,
        context: EngineFrame
    ) {
        const { logger, action: AP, trigger: TrP, effect: EP } = getProcessors(state);
        const { sourceId, controllerId, targets, stackObject, parentContext } = context;
        switch (effect.type) {
            case EffectType.EndTurn:
                logger.info(state, LogCategory.ACTION, `[END-TURN] Ending the turn. Exiling stack...`);
                state.stack = [];
                state.pendingAction = undefined;
                break;

            case EffectType.Shuffle:
                const playerToShuffle = state.players[targets[0] as PlayerId] || state.players[controllerId];
                if (playerToShuffle) {
                    AP.shuffle(playerToShuffle.library);
                    logger.info(state, LogCategory.ACTION, `[SHUFFLE] ${playerToShuffle.name} shuffled library.`);
                }
                break;

            case EffectType.Log:
                logger.info(state, LogCategory.ACTION, (effect as LogEffect).message || "");
                break;

            case EffectType.CopySpellOnStack:
                targets.forEach((tid: string) => {
                    let stackObj = state.stack.find((s: StackObject) => s.id === tid || s.sourceId === tid);

                    // LKI: If spell is gone, use LKI
                    if (!stackObj) {
                        const processors = getProcessors(state);
                        stackObj = processors.lki.getLki(state, tid, Zone.Stack) as StackObject;
                        if (stackObj) logger.info(state, LogCategory.ACTION, `[COPY] Original spell ${tid} not found on stack, using Last Known Information.`);
                    }

                    if (!stackObj) return;
                    const copy = JSON.parse(JSON.stringify(stackObj)) as StackObject;
                    copy.id = IdUtils.generateCopyId();
                    copy.isCopy = true;
                    copy.controllerId = controllerId;

                    // Ensure the card instance itself gets a unique ID to avoid collision during zone movements
                    if (copy.sourceObject) {
                        copy.sourceObject.id = IdUtils.generateCardCopyId();
                        copy.sourceId = copy.sourceObject.id;

                        // Allow overriding legend status (Double Major)
                        if ((effect as CopyEffect).isLegendary === false) {
                            copy.sourceObject.definition = {
                                ...copy.sourceObject.definition,
                                supertypes: (copy.sourceObject.definition.supertypes || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                                types: (copy.sourceObject.definition.types || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                                typeLine: copy.sourceObject.definition.typeLine?.replace(/Legendary /i, '')
                            };
                        }
                    }

                    const copyEffect = effect as CopyEffect;
                    if (copyEffect.abilitiesToAdd && copy.sourceObject) {
                        copy.sourceObject.definition = {
                            ...copy.sourceObject.definition,
                            abilities: [...(copy.sourceObject.definition.abilities || []), ...copyEffect.abilitiesToAdd]
                        };
                    }
                    if (copyEffect.keywordsToAdd && copy.sourceObject) {
                        copy.sourceObject.definition = {
                            ...copy.sourceObject.definition,
                            keywords: [...(copy.sourceObject.definition.keywords || []), ...copyEffect.keywordsToAdd]
                        };
                    }

                    // PRE-CLEAR TARGETS if choosing new ones (prevents UI arrows during re-selection)
                    let backupTargets: string[] = [];
                    if ((effect as CopyEffect).chooseNewTargets && copy.targets) {
                        backupTargets = [...copy.targets];
                        copy.targets = [];
                        copy.targetsControllers = [];
                    }

                    copy.name = `Copy of ${stackObj.name || stackObj.sourceObject?.definition.name || 'Spell'}`;

                    state.stack.push(copy);
                    logger.info(state, LogCategory.ACTION, `[COPY] Created copy of ${stackObj.sourceObject?.definition.name || 'spell'}.`);

                    // Emit copy event for Magecraft
                    TrP.onEvent(state, {
                        type: 'ON_COPY_SPELL',
                        playerId: controllerId,
                        payload: {
                            originalId: tid,
                            copyId: copy.id,
                            object: copy.sourceObject,
                            sourceId: copy.id,
                            isInstantOrSorcery: copy.sourceObject && (RuleUtils.isType(copy.sourceObject, 'instant') || RuleUtils.isType(copy.sourceObject, 'sorcery'))
                        }
                    });

                    if ((effect as CopyEffect).chooseNewTargets) {
                        const targetDefinitions = copy.targetDefinitions;
                        if (targetDefinitions) {
                            const { targeting: TP } = getProcessors(state);
                            const pool = [
                                ...Object.keys(state.players),
                                ...state.battlefield.map((o: GameObject) => o.id),
                                ...Object.values(state.players).flatMap((p: PlayerState) => p.graveyard.map((c: GameObject) => c.id))
                            ];
                            const legalTargetIds = pool.filter((tid: string) => TP.isLegalTarget(state, {
                                sourceId: copy.id,
                                controllerId: copy.controllerId,
                                stackObject: copy,
                                targetDefinitions: targetDefinitions,
                                targetIndex: 0,
                                effects: [],
                                targets: []
                            }, tid));

                            if (legalTargetIds.length > 0) {
                                state.pendingAction = {
                                    type: ActionType.Targeting,
                                    playerId: controllerId,
                                    sourceId: copy.id,
                                    data: {
                                        label: "ChooseNewTargets",
                                        metadata: {
                                            isCopyTargeting: true,
                                            stackObj: copy,
                                            parentContext: context
                                        },
                                        stackId: copy.id,
                                        targetDefinitions: targetDefinitions,
                                        targets: legalTargetIds,
                                        selectedTargets: [],
                                        declaredTargets: [], // Ensure this is also empty
                                        optional: true,
                                        _backupTargets: backupTargets, // Internal prefix to hide from UI
                                    }
                                };
                            }
                        }
                    }
                });
                break;

            case EffectType.AddTriggeredAbility: {
                const trigEffect = effect as TriggerAbilityEffect;
                const { duration: trigDuration, ...rest } = trigEffect;
                state.ruleRegistry.triggeredAbilities.push({
                    id: IdUtils.generateId('delayed'),
                    sourceId: sourceId,
                    controllerId: controllerId,
                    eventMatch: rest.eventMatch || "",
                    activeZone: Zone.Any,
                    targetIds: targets, // Store targets for condition matching
                    duration: typeof trigDuration === 'string'
                        ? { type: trigDuration as DurationType }
                        : (trigDuration || { type: DurationType.UntilEndOfTurn }),
                    ...rest,
                    type: AbilityType.Triggered,
                    effects: rest.effects || [],
                    targets: []
                });
                break;
            }

            case EffectType.AddPreventionEffect: {
                const prevEffect = effect as PreventionEffectDefinition;
                const { duration: prevDuration, ...rest } = prevEffect;
                if (!state.ruleRegistry.preventionEffects) state.ruleRegistry.preventionEffects = [];
                state.ruleRegistry.preventionEffects.push({
                    id: IdUtils.generateId('prevention'),
                    sourceId,
                    controllerId,
                    damageType: (rest.damageType === 'AllDamage' ? 'AllDamage' : 'CombatDamage') as 'CombatDamage' | 'AllDamage',
                    targetMapping: rest.targetMapping || "",
                    duration: typeof prevDuration === 'string'
                        ? { type: prevDuration as DurationType }
                        : (prevDuration || { type: DurationType.UntilEndOfTurn })
                });
                break;
            }

            case EffectType.ExtraTurns:
                targets.forEach((tid: string) => {
                    const p = state.players[tid as PlayerId];
                    if (p) {
                        const amount = RuleUtils.resolveAmount(state, (effect as ExtraTurnsEffect).amount, context);
                        p.extraTurns += amount;
                        logger.info(state, LogCategory.ACTION, `[TURN] ${p.name} gained ${amount} extra turn(s).`);
                    }
                });
                break;

            case EffectType.SkipTurns:
                targets.forEach((tid: string) => {
                    const p = state.players[tid as PlayerId];
                    if (p) {
                        const skipEffect = effect as SkipTurnsEffect;
                        let amount = RuleUtils.resolveAmount(state, skipEffect.amount, context) || 1;

                        // Ral Zarek support: Flip coins
                        if (skipEffect.flipCoins) {
                            let heads = 0;
                            for (let i = 0; i < skipEffect.flipCoins; i++) {
                                if (Math.random() < 0.5) heads++;
                            }
                            amount = heads;
                            logger.info(state, LogCategory.ACTION, `[COIN-FLIP] Flipping ${skipEffect.flipCoins} coins... ${heads} heads!`);
                        }

                        if (amount > 0) {
                            p.turnsToSkip += amount;
                            logger.info(state, LogCategory.ACTION, `[TURN] ${p.name} will skip their next ${amount} turn(s).`);
                        } else {
                            logger.info(state, LogCategory.ACTION, `[TURN] No turns skipped for ${p.name}.`);
                        }
                    }
                });
                break;

            case EffectType.PhaseOut:
                targets.forEach((tid: string) => {
                    const obj = EP.findObject(state, tid, stackObject, parentContext);
                    if (obj && 'zone' in obj) {
                        obj.isPhasedOut = (effect as PhaseOutEffect).isPhasedOut !== false;
                        logger.info(state, LogCategory.ACTION, `${obj.definition.name} phased ${obj.isPhasedOut ? 'out' : 'in'}.`);
                    }
                });
                break;
        }
    }
}




