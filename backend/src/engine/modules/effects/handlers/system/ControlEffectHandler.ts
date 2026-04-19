import { ActionType, DurationType, EffectType, GameObject, GameState, PlayerId, PlayerState, ResolutionContext, StackObject } from '@shared/engine_types';
import { ActionProcessor } from '../../../actions/ActionProcessor';
import { TriggerProcessor } from '../../triggers/TriggerProcessor';


/**
 * Strategy for CR 601: Casting Spells and CR 701: Keyword Actions (System/Control)
 */
export class ControlEffectHandler {

    public static handle(
        state: GameState,
        effect: any,
        log: (m: string) => void,
        context: ResolutionContext,
        findObject?: any
    ) {
        const { sourceId, controllerId, targets, stackObject, parentContext } = context;
        switch (effect.type) {
            case 'EndTurn':
                log(`[END-TURN] Ending the turn. Exiling stack...`);
                state.stack = [];
                state.pendingAction = undefined;
                break;

            case EffectType.Shuffle:
                const playerToShuffle = state.players[targets[0] as PlayerId] || state.players[controllerId];
                if (playerToShuffle) {
                    ActionProcessor.shuffle(playerToShuffle.library);
                    log(`[SHUFFLE] ${playerToShuffle.name} shuffled library.`);
                }
                break;

            case EffectType.Log:
                log(effect.message || "");
                break;

            case EffectType.CopySpellOnStack:
                targets.forEach((tid: string) => {
                    let stackObj = state.stack.find((s: StackObject) => s.id === tid || s.sourceId === tid);

                    // LKI: If spell is gone, use the snapshot provided in the trigger context
                    if (!stackObj && (stackObject?.data?.event?.payload?.stackSnapshot || stackObject?.data?.eventData?.stackSnapshot)) {
                        stackObj = stackObject?.data?.event?.payload?.stackSnapshot || stackObject?.data?.eventData?.stackSnapshot;
                        log(`[COPY] Original spell ${tid} not found on stack, using Last Known Information.`);
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

                    state.stack.push(copy);
                    log(`[COPY] Created copy of ${stackObj.card?.definition.name || 'spell'}.`);

                    // Emit copy event for Magecraft
                    TriggerProcessor.onEvent(state, {
                        type: 'ON_COPY_SPELL',
                        playerId: controllerId,
                        data: {
                            originalId: tid,
                            copyId: copy.id,
                            card: copy.card,
                            sourceId: copy.id,
                            isInstantOrSorcery: copy.card?.definition.types.some((t: string) => t.toLowerCase() === 'instant' || t.toLowerCase() === 'sorcery')
                        }
                    }, log);

                    if (effect.chooseNewTargets && copy.targets && copy.targets.length > 0) {
                        const targetDef = copy.data?.targetDefinition || copy.targetDefinition;
                        if (targetDef) {
                            const { TargetingProcessor } = require('../../../actions/TargetingProcessor');
                            const pool = [
                                ...Object.keys(state.players),
                                ...state.battlefield.map((o: GameObject) => o.id),
                                ...Object.values(state.players).flatMap((p: PlayerState) => p.graveyard.map((c: GameObject) => c.id))
                            ];
                            const legalTargetIds = pool.filter((tid: string) => TargetingProcessor.isLegalTarget(state, {
                                sourceId: copy.id,
                                controllerId: copy.controllerId,
                                targetDef
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
                                        targetDefinition: targetDef,
                                        targets: legalTargetIds,
                                        selectedTargets: [],
                                        optional: true,
                                        originalTargets: [...copy.targets]
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
                        log(`[TURN] ${p.name} gained ${amount} extra turn(s).`);
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
                            log(`[COIN-FLIP] Flipping ${effect.flipCoins} coins... ${heads} heads!`);
                        }

                        if (amount > 0) {
                            p.turnsToSkip += amount;
                            log(`[TURN] ${p.name} will skip their next ${amount} turn(s).`);
                        } else {
                            log(`[TURN] No turns skipped for ${p.name}.`);
                        }
                    }
                });
                break;

            case 'PhasedOut':
                targets.forEach((tid: string) => {
                    const obj = findObject(state, tid, stackObject, parentContext);
                    if (obj) {
                        obj.isPhasedOut = effect.value !== false;
                        log(`${obj.definition.name} phased ${obj.isPhasedOut ? 'out' : 'in'}.`);
                    }
                });
                break;

            case 'AddMana': {
                const { ManaProcessor: MP } = require('../../../magic/ManaProcessor');
                const { ChoiceGenerator: CG } = require('../../ChoiceGenerator');
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

                        state.pendingAction = CG.createModalChoice({
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
                                    log(`[MANA] Produced {${s}} x ${total} (Restricted: ${restrictionList.join(', ')})`);
                                }
                            });
                            if (res.generic > 0) {
                                const total = res.generic * amount;
                                newRestricted.push({ color: 'C', amount: total, restrictions: restrictionList });
                                log(`[MANA] Produced {C} x ${total} (Restricted: ${restrictionList.join(', ')})`);
                            }
                            p.restrictedMana = newRestricted;
                        } else {
                            // Update manaPool with a new object reference to ensure UI/Socket change detection
                            const newPool = { ...p.manaPool };
                            Object.entries(res.colored).forEach(([s, a]) => {
                                const total = (a as number) * amount;
                                if (total > 0) {
                                    (newPool as any)[s] += total;
                                    log(`[MANA] Produced {${s}} x ${total}`);
                                }
                            });
                            const genericTotal = res.generic * amount;
                            if (genericTotal > 0) {
                                newPool.C += genericTotal;
                                log(`[MANA] Produced {C} x ${genericTotal}`);
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



