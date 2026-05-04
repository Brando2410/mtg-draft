import { ActionType, DurationType, EffectType, GameObject, GameState, PlayerId, PlayerState, ResolutionContext, StackObject, Zone } from '@shared/engine_types';
import { LogCategory } from '../../../../utils/EngineLogger';
import { RuleUtils } from '../../../../utils/RuleUtils';
import { getProcessors } from '../../../ProcessorRegistry';


/**
 * Strategy for CR 601: Casting Spells and CR 701: Keyword Actions (System/Control)
 */
export class ControlEffectHandler {

    public static handle(
        state: GameState,
        effect: any,
        context: ResolutionContext
    ) {
        const { logger, action: AP, trigger: TrP, effect: EP } = getProcessors(state);
        const { sourceId, controllerId, targets, stackObject, parentContext } = context;
        switch (effect.type) {
            case 'EndTurn':
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
                logger.info(state, LogCategory.ACTION, effect.message || "");
                break;

            case EffectType.CopySpellOnStack:
                targets.forEach((tid: string) => {
                    let stackObj = state.stack.find((s: StackObject) => s.id === tid || s.sourceId === tid);

                    // LKI: If spell is gone, use LKI
                    if (!stackObj) {
                        const processors = getProcessors(state);
                        stackObj = processors.lki.getLki(state, tid, Zone.Stack);
                        if (stackObj) logger.info(state, LogCategory.ACTION, `[COPY] Original spell ${tid} not found on stack, using Last Known Information.`);
                    }

                    if (!stackObj) return;
                    const copy = JSON.parse(JSON.stringify(stackObj));
                    copy.id = `copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                    (copy as any).isCopy = true;
                    copy.controllerId = controllerId;

                    // Ensure the card instance itself gets a unique ID to avoid collision during zone movements
                    if (copy.card) {
                        copy.card.id = `card_copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                        copy.sourceId = copy.card.id;

                        // Allow overriding legend status (Double Major)
                        if (effect.isLegendary === false) {
                            copy.card.definition = {
                                ...copy.card.definition,
                                supertypes: (copy.card.definition.supertypes || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                                types: (copy.card.definition.types || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                                type_line: copy.card.definition.type_line?.replace(/Legendary /i, '')
                            };
                        }
                    }

                    if (effect.abilitiesToAdd && copy.card) {
                        copy.card.definition = {
                            ...copy.card.definition,
                            abilities: [...(copy.card.definition.abilities || []), ...effect.abilitiesToAdd]
                        };
                    }
                    if (effect.keywordsToAdd && copy.card) {
                        copy.card.definition = {
                            ...copy.card.definition,
                            keywords: [...(copy.card.definition.keywords || []), ...effect.keywordsToAdd]
                        };
                    }

                    // PRE-CLEAR TARGETS if choosing new ones (prevents UI arrows during re-selection)
                    let backupTargets: string[] = [];
                    if (effect.chooseNewTargets && copy.targets) {
                        backupTargets = [...copy.targets];
                        copy.targets = [];

                        // Aggressively clear any target-related metadata in copy.data
                        if (copy.data) {
                            copy.data.targets = [];
                            copy.data.selectedTargets = [];
                            copy.data.declaredTargets = [];
                            copy.data.targetsControllers = [];
                        }

                        // Also clear card-level data if it exists
                        if (copy.card && copy.card.data) {
                            copy.card.data.targets = [];
                            copy.card.data.selectedTargets = [];
                        }
                    }

                    copy.name = `Copy of ${stackObj.name || stackObj.card?.definition.name || 'Spell'}`;

                    state.stack.push(copy);
                    logger.info(state, LogCategory.ACTION, `[COPY] Created copy of ${stackObj.card?.definition.name || 'spell'}.`);

                    // Emit copy event for Magecraft
                    TrP.onEvent(state, {
                        type: 'ON_COPY_SPELL',
                        playerId: controllerId,
                        payload: {
                            originalId: tid,
                            copyId: copy.id,
                            object: copy.card,
                            sourceId: copy.id,
                            isInstantOrSorcery: copy.card && (RuleUtils.isType(copy.card, 'instant') || RuleUtils.isType(copy.card, 'sorcery'))
                        }
                    });

                    if (effect.chooseNewTargets) {
                        const targetDefinitions = copy.data?.targetDefinitions || copy.targetDefinitions;
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
                                targetIndex: 0
                            }, tid));

                            if (legalTargetIds.length > 0) {
                                state.pendingAction = {
                                    type: ActionType.Targeting,
                                    playerId: controllerId,
                                    sourceId: copy.id,
                                    data: {
                                        label: "ChooseNewTargets",
                                        isCopyTargeting: true,
                                        stackId: copy.id,
                                        targetDefinitions: targetDefinitions,
                                        targets: legalTargetIds,
                                        selectedTargets: [],
                                        declaredTargets: [], // Ensure this is also empty
                                        optional: true,
                                        _backupTargets: backupTargets, // Internal prefix to hide from UI
                                        stackObj: copy
                                    }
                                };
                            }
                        }
                    }
                });
                break;

            case 'AddTriggeredAbility':
                state.ruleRegistry.triggeredAbilities.push({
                    id: `delayed_${Date.now()}`,
                    sourceId: sourceId,
                    controllerId: controllerId,
                    eventMatch: effect.eventMatch || effect.on,
                    activeZone: 'Any',
                    targetIds: targets, // Store targets for condition matching
                    duration: { type: (effect.duration || DurationType.UntilEndOfTurn) as any },
                    ...effect
                });
                break;

            case 'AddPreventionEffect':
                if (!state.ruleRegistry.preventionEffects) state.ruleRegistry.preventionEffects = [];
                state.ruleRegistry.preventionEffects.push({
                    id: `prevention_${Date.now()}`,
                    sourceId,
                    controllerId,
                    damageType: effect.damageType || 'CombatDamage',
                    targetMapping: effect.targetMapping,
                    duration: effect.duration || DurationType.UntilEndOfTurn
                });
                break;

            case 'ExtraTurns':
                targets.forEach((tid: string) => {
                    const p = state.players[tid as PlayerId];
                    if (p) {
                        const amount = effect.amount || 1;
                        p.extraTurns += amount;
                        logger.info(state, LogCategory.ACTION, `[TURN] ${p.name} gained ${amount} extra turn(s).`);
                    }
                });
                break;

            case 'SkipTurns':
                targets.forEach((tid: string) => {
                    const p = state.players[tid as PlayerId];
                    if (p) {
                        let amount = effect.amount || 1;

                        // Ral Zarek support: Flip coins
                        if (effect.flipCoins) {
                            let heads = 0;
                            for (let i = 0; i < effect.flipCoins; i++) {
                                if (Math.random() < 0.5) heads++;
                            }
                            amount = heads;
                            logger.info(state, LogCategory.ACTION, `[COIN-FLIP] Flipping ${effect.flipCoins} coins... ${heads} heads!`);
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

            case 'PhasedOut':
                targets.forEach((tid: string) => {
                    const obj = EP.findObject(state, tid, stackObject, parentContext);
                    if (obj && 'zone' in obj) {
                        obj.isPhasedOut = effect.value !== false;
                        logger.info(state, LogCategory.ACTION, `${obj.definition.name} phased ${obj.isPhasedOut ? 'out' : 'in'}.`);
                    }
                });
                break;

            case 'AddMana': {
                const { mana: MP, choiceGenerator: CG } = getProcessors(state);
                const effectiveTargets = (targets && targets.length > 0) ? targets : [controllerId];

                // Prioritize manaType/mana over amount/value for symbol resolution
                let manaStr = effect.manaType || effect.mana || effect.value || (effect.amount && !isNaN(parseInt(effect.amount)) ? effect.amount.toString() : null) || 'C';
                const isFlexible = String(manaStr).toUpperCase() === 'ANY' || String(manaStr).toUpperCase() === '{ANY}';

                if (isFlexible) {
                    const tid = effectiveTargets[0];
                    const p = state.players[tid as PlayerId];
                    if (p) {
                        const colors = ['W', 'U', 'B', 'R', 'G'];
                        const choices = colors.map(c => ({
                            label: `{${c}}`,
                            value: c,
                            effects: [{
                                ...effect,
                                manaType: c,
                                value: c,
                                mana: c,
                                amount: effect.amount || 1
                            }]
                        }));

                        state.pendingAction = CG.createModalChoice(state, {
                            label: "Choose a color of mana to add",
                            playerId: tid,
                            sourceId: sourceId,
                            stackObj: stackObject,
                            parentContext: parentContext
                        }, choices);
                    }
                    return;
                }

                effectiveTargets.forEach((tid: string) => {
                    const p = state.players[tid as PlayerId];
                    if (p) {
                        const amount = effect.amount || 1;
                        // Ensure braces if missing
                        const formattedMana = String(manaStr).startsWith('{') ? String(manaStr) : `{${manaStr}}`;
                        const res = MP.parseManaCost(formattedMana);

                        const rawRestrictions = effect.manaRestrictions || effect.restriction || effect.restrictions;
                        const restrictionList = rawRestrictions ? (Array.isArray(rawRestrictions) ? rawRestrictions : [rawRestrictions]) : null;

                        if (restrictionList) {
                            const newRestricted = [...(p.restrictedMana || [])];
                            Object.entries(res.colored).forEach(([s, a]) => {
                                const total = (a as number) * amount;
                                if (total > 0) {
                                    newRestricted.push({ color: s as any, amount: total, restrictions: restrictionList });
                                    logger.info(state, LogCategory.ACTION, `[MANA] Produced {${s}} x ${total} (Restricted: ${restrictionList.join(', ')})`);
                                }
                            });
                            if (res.generic > 0) {
                                const total = res.generic * amount;
                                newRestricted.push({ color: 'C', amount: total, restrictions: restrictionList });
                                logger.info(state, LogCategory.ACTION, `[MANA] Produced {C} x ${total} (Restricted: ${restrictionList.join(', ')})`);
                            }
                            p.restrictedMana = newRestricted;
                        } else {
                            // Update manaPool with a new object reference to ensure UI/Socket change detection
                            const newPool = { ...p.manaPool };
                            Object.entries(res.colored).forEach(([s, a]) => {
                                const total = (a as number) * amount;
                                if (total > 0) {
                                    (newPool as any)[s] += total;
                                    logger.info(state, LogCategory.ACTION, `[MANA] Produced {${s}} x ${total}`);
                                }
                            });
                            const genericTotal = res.generic * amount;
                            if (genericTotal > 0) {
                                newPool.C += genericTotal;
                                logger.info(state, LogCategory.ACTION, `[MANA] Produced {C} x ${genericTotal}`);
                            }
                            p.manaPool = newPool;
                        }
                    }
                });
                break;
            }
        }
    }
}



