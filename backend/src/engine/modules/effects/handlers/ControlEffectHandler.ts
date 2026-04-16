import { ActionType, ContinuousEffect, DurationType, EffectDefinition, EffectType, GameObjectId, GameState, PlayerId, Zone } from '@shared/engine_types';
import { ActionProcessor } from '../../actions/ActionProcessor';
import { TriggerProcessor } from '../TriggerProcessor';

/**
 * Strategy for CR 601: Casting Spells and CR 701: Keyword Actions (System/Control)
 */
export class ControlEffectHandler {

  public static handle(
    state: GameState,
    effect: any,
    sourceId: string,
    targets: string[],
    log: (m: string) => void,
    controllerId: PlayerId,
    stackObject?: any,
    parentContext?: any,
    findObject?: any
  ) {
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
        targets.forEach(tid => {
            let stackObj = state.stack.find(s => s.id === tid || s.sourceId === tid);
            
            // LKI: If spell is gone, use the snapshot provided in the trigger context
            if (!stackObj && stackObject?.data?.eventData?.stackSnapshot) {
                stackObj = stackObject.data.eventData.stackSnapshot;
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
                    const { TargetingProcessor } = require('../../actions/TargetingProcessor');
                    const pool = [
                        ...Object.keys(state.players),
                        ...state.battlefield.map(o => o.id),
                        ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
                    ];
                    const legalTargetIds = pool.filter(tid => TargetingProcessor.isLegalTarget(state, copy.id, tid, targetDef));
                    
                    if (legalTargetIds.length > 0) {
                        state.pendingAction = {
                            type: ActionType.Targeting,
                            playerId: controllerId,
                            sourceId: copy.id,
                            data: {
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
        targets.forEach(tid => {
            const p = state.players[tid as PlayerId];
            if (p) {
                const amount = effect.amount || 1;
                p.extraTurns += amount;
                log(`[TURN] ${p.name} gained ${amount} extra turn(s).`);
            }
        });
        break;

      case 'SkipTurns':
        targets.forEach(tid => {
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
        targets.forEach(tid => {
            const obj = findObject(state, tid, stackObject, parentContext);
            if (obj) {
                obj.isPhasedOut = effect.value !== false;
                log(`${obj.definition.name} phased ${obj.isPhasedOut ? 'out' : 'in'}.`);
            }
        });
        break;

      case 'AddMana':
        const { ManaProcessor: MP } = require('../../magic/ManaProcessor');
        const { ChoiceGenerator: CG } = require('../ChoiceGenerator');
        const effectiveTargets = (targets && targets.length > 0) ? targets : [controllerId];
        
        let manaStr = effect.value || effect.amount || effect.manaType || effect.mana || 'C';
        const isFlexible = String(manaStr).toUpperCase() === 'ANY' || String(manaStr).toUpperCase() === '{ANY}';

        if (isFlexible) {
            // CR 605: If mana of any color is added, the player chooses which color.
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
                        amount: effect.amount || 1 // Ensure we keep the amount if it was like "Add two mana of any one color"
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

        effectiveTargets.forEach(tid => {
            const p = state.players[tid as PlayerId];
            if (p) {
                const res = MP.parseManaCost(manaStr.startsWith('{') ? manaStr : `{${manaStr}}`);
                
                if (effect.manaRestrictions) {
                    if (!p.restrictedMana) p.restrictedMana = [];
                    // Handle colored mana in restrictions
                    Object.entries(res.colored).forEach(([s, a]) => {
                        p.restrictedMana!.push({ color: s as any, amount: a as number, restrictions: effect.manaRestrictions });
                    });
                    if (res.generic > 0) {
                        p.restrictedMana!.push({ color: 'C', amount: res.generic, restrictions: effect.manaRestrictions });
                    }
                } else {
                    Object.entries(res.colored).forEach(([s, a]) => (p.manaPool as any)[s] += (a as number));
                    p.manaPool['C'] += res.generic;
                }
            }
        });
        break;
    }
  }
}

