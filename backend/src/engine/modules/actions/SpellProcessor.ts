import { GameState, PlayerId, Zone, Phase, GameObject, AbilityType, AbilityCost, EffectType } from '@shared/engine_types';
import { m21 } from '../../data/m21';
import { ManaProcessor } from '../magic/ManaProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { TriggerProcessor } from '../effects/TriggerProcessor';
import { ActionProcessor } from './ActionProcessor';

/**
 * Casting Spells and Activating Abilities (Chapters 601 & 602)
 */
export class SpellProcessor {

    public static playCard(
        state: GameState,
        playerId: PlayerId,
        cardInstanceId: string,
        declaredTargets: string[],
        log: (m: string) => void,
        engine: {
            tapForMana: (p: PlayerId, c: string) => void;
            passPriority: (p: PlayerId) => void;
            checkAutoPass: (p: PlayerId) => void;
            checkStateBasedActions: () => void;
        },
        bypassTargeting = false
    ): boolean {
        const activeId = String(state.activePlayerId).trim();
        const callerId = String(playerId).trim();

        // 1. Priority Error (Rule 117.1)
        if (!bypassTargeting && String(state.priorityPlayerId) !== String(playerId)) {
            log(`Tried to play card without priority.`);
            return false;
        }

        if (state.pendingAction && !bypassTargeting) {
            log(`Cannot cast: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        const player = state.players[playerId];
        if (player && player.pendingDiscardCount > 0) {
            log(`Player must finish discarding before playing cards.`);
            return false;
        }

        let cardToPlay: any;
        const { PriorityProcessor } = require('./../core/PriorityProcessor');
        const { TargetingProcessor } = require('./TargetingProcessor');

        // 1. Search in Hand
        const cardInHand = player.hand.find((c: any) => c.id === cardInstanceId);
        if (cardInHand) {
            cardToPlay = cardInHand;
        } else {
            // 2. Search in Non-hand zones with Permission Check
            const obj = TargetingProcessor.findObjectInAnyZone(state, cardInstanceId);
            if (obj && obj.controllerId === playerId) {
                let permissionType: string | undefined;
                if (obj.zone === Zone.Graveyard) permissionType = EffectType.AllowCastFromGraveyard;
                else if (obj.zone === Zone.Exile) permissionType = EffectType.AllowPlayExiled;
                else if (obj.zone === Zone.Library) permissionType = EffectType.AllowPlayFromTop;

                if (permissionType) {
                    const hasPermission = PriorityProcessor.findPermissionEffect(state, playerId, permissionType, obj.id);
                    if (hasPermission) {
                        cardToPlay = obj;
                    } else {
                        log(`[DEBUG] No ${permissionType} permission found for ${obj.definition.name} in ${obj.zone}.`);
                    }
                } else {
                    log(`[DEBUG] No permission type for zone ${obj.zone}.`);
                }
            } else if (obj) {
                log(`[DEBUG] Player ${playerId} does not control object ${cardInstanceId} (controller: ${obj.controllerId}).`);
            } else {
                log(`[DEBUG] Object ${cardInstanceId} not found in any zone.`);
            }
        }

        if (!cardToPlay) {
            log(`Card not found in hand or current zone is restricted (Zone: ${TargetingProcessor.findObjectInAnyZone(state, cardInstanceId)?.zone || 'N/A'}).`);
            return false;
        }

        // --- X-VALUE RESET FAIL-SAFE ---
        // If this is a fresh attempt to play the card (not a resume from a modal/X-choice),
        // we must clear any stale xValue to ensure the player isn't "locked" into a previous choice.
        if (!bypassTargeting && cardToPlay.xValue !== undefined) {
             cardToPlay.xValue = undefined;
        }

        const typeLine = (cardToPlay.definition.type_line || '').toLowerCase();
        const isLand = typeLine.includes('land');
        const isInstantOrFlash = typeLine.includes('instant') || (cardToPlay.definition.oracleText || '').includes('Flash');

        // 2. Timing/Speed (Rule 305/307)
        if (!isInstantOrFlash) {
            if (activeId !== callerId || (state.currentPhase !== Phase.PreCombatMain && state.currentPhase !== Phase.PostCombatMain) || state.stack.length > 0) {
                log(`Illegal Play: Cannot cast sorcery speed spell/land right now.`);
                return false;
            }
        }

        // 3. Land Handling (Rule 305)
        if (isLand) {
            let maxLands = 1;
            // Support for cards like Azusa that add additional land plays
            state.ruleRegistry.continuousEffects.forEach(effect => {
                if ((effect as any).type === 'AdditionalLandPlays' && effect.targetMapping === 'CONTROLLER' && effect.controllerId === playerId) {
                    maxLands += ((effect as any).amount as number) || 0;
                }
            });

            const currentLandsPlayed = state.turnState.landsPlayedThisTurn[playerId] || 0;

            if (currentLandsPlayed >= maxLands) {
                log(`Illegal Play: Already reached land play limit of ${maxLands} this turn.`);
                return false;
            }
            
            // Rule 305: Playing a land is a special action, not a spell.
            // ActionProcessor.moveCard handles entersTapped, registerAbilities, and ON_ETB triggers.
            ActionProcessor.moveCard(state, cardToPlay, Zone.Battlefield, playerId, log);

            state.turnState.landsPlayedThisTurn[playerId] = currentLandsPlayed + 1;
            player.hasPlayedLandThisTurn = true; // Kept for legacy compatibility if needed
            log(`Played Land: ${cardToPlay.definition.name} (${currentLandsPlayed + 1}/${maxLands})`);
            engine.checkStateBasedActions();
            return true;
        }

        // 4. Extract logic and effects
        const logic = m21[cardToPlay.definition.name];
        const targetDefinition = (logic as any)?.targetDefinition || (logic as any)?.abilities?.find((a: any) => a.type === 'Spell')?.targetDefinition;
        const spellEffects = (logic as any)?.effects || (logic as any)?.abilities?.find((a: any) => a.type === 'Spell')?.effects || [];
        const choiceEffectIndex = spellEffects.findIndex((e: any) => e.type === 'Choice' && e.choices);
        const hasPreSelectedChoice = (state as any).lastChoiceIndex !== undefined;

        // Step 0.5: Check for X in cost
        const costStr = cardToPlay.definition.manaCost;
        if (costStr.includes('{X}') && cardToPlay.xValue === undefined) {
             const { ActionType } = require('@shared/engine_types');
             state.pendingAction = {
                 type: ActionType.ChooseX,
                 playerId: playerId,
                 sourceId: cardToPlay.id,
                 data: {
                     label: `Choose a value for X for ${cardToPlay.definition.name}`,
                     declaredTargets: declaredTargets || [],
                 }
             };
             log(`[CHOOSE_X] ${state.players[playerId].name} is choosing X for ${cardToPlay.definition.name}...`);
             return true;
        }

        // CR 601.2f: Determine total cost
        const { totalMana, additionalCosts } = this.getEffectiveCosts(state, cardToPlay, declaredTargets);

        // --- SETUP SEQUENCE: TARGETING -> CHOICE -> FINALIZATION ---

        // Step 1: Check Targeting
        if (targetDefinition && (!declaredTargets || declaredTargets.length === 0)) {
            if (!ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana)) {
                log(`Illegal Play: Not enough mana available to even start casting ${cardToPlay.definition.name}.`);
                cardToPlay.xValue = undefined; // Cleanup for next attempt
                return false;
            }

            const { TargetingProcessor } = require('./TargetingProcessor');
            const precalculatedTargets = [
                ...Object.keys(state.players),
                ...state.battlefield.map(o => o.id),
                ...state.exile.map(o => o.id),
                ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
            ].filter(tid => TargetingProcessor.isLegalTarget(state, cardToPlay.id, tid, targetDefinition));

            const isSingleOpponentTarget = targetDefinition.type === 'Player' && 
                                           targetDefinition.restrictions?.some((r: any) => typeof r === 'string' && r.toLowerCase() === 'opponent') &&
                                           precalculatedTargets.length === 1 &&
                                           state.playerOrder.length === 2;

            if (isSingleOpponentTarget) {
                declaredTargets = precalculatedTargets;
                log(`[AUTO-TARGET] Automatically targeting the only opponent for ${cardToPlay.definition.name}.`);
            } else {
                if (precalculatedTargets.length === 0) {
                    if (targetDefinition.optional) {
                        log(`No legal targets found, auto-skipping optional target selection.`);
                        return this.playCard(state, playerId, cardInstanceId, [], log, engine, true);
                    } else {
                        log(`Illegal Play: No valid targets available for ${cardToPlay.definition.name}.`);
                        return false;
                    }
                    }

                state.pendingAction = {
                    type: 'TARGETING',
                    playerId: playerId,
                    sourceId: cardToPlay.id,
                    data: { targetDefinition, targets: precalculatedTargets, isSpellCasting: true }
                };
                log(`[TARGETING] ${state.players[playerId].name} is selecting targets for ${cardToPlay.definition.name}...`);
                return true;
            }
        }

        // Step 1.5: Check Additional Costs (e.g. Goremand's sacrifice)
        log(`[DEBUG] Additional costs found: ${additionalCosts.length} -> ${JSON.stringify(additionalCosts)}`);
        const costRequiresTarget = additionalCosts.find(c => c.type === 'Sacrifice' && !c.targetMapping);
        const hasChosenSacrifice = (state as any).lastChosenSacrificeId !== undefined;
        const discardCost = additionalCosts.find(c => (c.type as string).toLowerCase() === 'discard');
        const hasChosenDiscard = (state as any).lastChosenDiscardId !== undefined;

        if (discardCost) log(`[DEBUG] Discard cost found. hasChosenDiscard: ${hasChosenDiscard}`);

        if (costRequiresTarget && !hasChosenSacrifice) {
            const { TargetingProcessor } = require('./TargetingProcessor');
            const legalSacrificeIds = state.battlefield
                .filter(o => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, costRequiresTarget.restrictions || [], playerId, cardToPlay.id))
                .map(o => o.id);

            if (legalSacrificeIds.length === 0) {
                log(`Illegal Play: No valid objects to pay the additional cost for ${cardToPlay.definition.name}.`);
                return false;
            }

            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: "Sacrifice a creature to cast " + cardToPlay.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Sacrifice',
                    declaredTargets: declaredTargets || [],
                    choices: legalSacrificeIds.map(id => {
                        const obj = state.battlefield.find(o => o.id === id);
                        return {
                            label: `Sacrifice ${obj?.definition.name || id}`,
                            value: id,
                            cardData: obj,
                            selectable: true
                        }
                    })
                }
            };
            log(`[SACRIFICE] ${state.players[playerId].name} must choose an object to sacrifice to cast ${cardToPlay.definition.name}.`);
            return true;
        }

        if (discardCost && !hasChosenDiscard) {
            const { TargetingProcessor } = require('./TargetingProcessor');
            const legalDiscardIds = player.hand
                .filter(c => c.id !== cardInstanceId && TargetingProcessor.matchesRestrictions(state, c, discardCost.restrictions || [], playerId, cardToPlay.id))
                .map(c => c.id);

            if (legalDiscardIds.length === 0) {
                log(`Illegal Play: No valid cards to discard for ${cardToPlay.definition.name}.`);
                return false;
            }

            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: "Discard a card to cast " + cardToPlay.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Discard',
                    minChoices: 1,
                    maxChoices: 1,
                    declaredTargets: declaredTargets || [],
                    choices: legalDiscardIds.map(id => {
                        const c = player.hand.find(o => o.id === id)!;
                        return {
                            label: `Discard ${c.definition.name}`,
                            value: c.id,
                            cardData: c,
                            selectable: true
                        }
                    })
                }
            };
            log(`[DISCARD] ${state.players[playerId].name} must choose a card to discard to cast ${cardToPlay.definition.name}.`);
            return true;
        }

        // Step 2: Check Modal Choice
        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            // Trigger choice phase (targets are already in declaredTargets if we are here)
            const choiceEffect = spellEffects[choiceEffectIndex];
            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: choiceEffect.label || 'Choose an option',
                    choices: choiceEffect.choices,
                    isSpellCasting: true,
                    declaredTargets: declaredTargets || []
                }
            };
            log(`[CHOICE] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        // Step 3: Finalization
        const preSelectedChoice = (state as any).lastChoiceIndex;
        delete (state as any).lastChoiceIndex;

        if (!ManaProcessor.canPayManaCost(player, totalMana)) {
            if (ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana)) {
                log(`Auto-tapping lands to pay ${totalMana}...`);
                ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, log, engine.tapForMana);
            } else {
                log(`Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Effective Cost: ${totalMana})`);
                return false;
            }
        }

        if (cardToPlay.definition.name === "Teferi, Master of Time") {
            log(`[DEBUG] Playing Teferi, Master of Time: ${JSON.stringify(cardToPlay.definition, null, 2)}`);
        }
        log(`Paying ${totalMana} for ${cardToPlay.definition.name}...`);
        ManaProcessor.deductManaCost(player, totalMana);

        // Pay additional costs (CR 601.2h)
        additionalCosts.forEach(cost => {
            if (cost.type === 'Sacrifice') {
                const chosenId = (state as any).lastChosenSacrificeId;
                const obj = state.battlefield.find(o => o.id === (chosenId || cardToPlay.id));
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: 'ON_SACRIFICE', playerId, sourceId: obj.id, data: { object: obj } }, log);
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId, log);
                    log(`Paid additional cost: Sacrificed ${obj.definition.name}.`);
                }
            } else if (cost.type === 'Discard') {
                const chosenId = (state as any).lastChosenDiscardId;
                const obj = player.hand.find(o => o.id === chosenId);
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId, data: { card: obj, sourceId: cardToPlay.id } }, log);
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId, log);
                    log(`Paid additional cost: Discarded ${obj.definition.name}.`);
                }
            } else if (cost.type === 'PayLife') {
                const lifeVal = parseInt(cost.value as string) || 0;
                player.life -= lifeVal;
                TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId, amount: lifeVal }, log);
                log(`Paid additional cost: ${lifeVal} life.`);
            }
        });

        // Cleanup temporary selection
        delete (state as any).lastChosenSacrificeId;
        delete (state as any).lastChosenDiscardId;

        // 5. Remove from current zone and move to stack
        const lastZone = cardToPlay.zone;
        ActionProcessor.removeFromCurrentZone(state, cardToPlay);
        cardToPlay.zone = Zone.Stack;
        cardToPlay.lastNonStackZone = lastZone;
        (cardToPlay as any).paidCost = totalMana;

        const isInstantOrSorcery = cardToPlay.definition.types.some((t: string) => t.toLowerCase() === 'instant' || t.toLowerCase() === 'sorcery');
        const isFirstInstantOrSorcery = isInstantOrSorcery && !state.turnState.instantOrSorceryCastThisTurn[playerId];
        if (isInstantOrSorcery) {
            state.turnState.instantOrSorceryCastThisTurn[playerId] = true;
        }

        state.turnState.spellsCastThisTurn[playerId] = (state.turnState.spellsCastThisTurn[playerId] || 0) + 1;
        if (state.turnState.spellsCastThisTurn[playerId] === 2) {
            TriggerProcessor.onEvent(state, { type: 'ON_SECOND_SPELL_CAST', playerId: playerId, data: {} }, log);
        }

        const exileOnResolution = state.ruleRegistry.continuousEffects.some(e => 
            e.exileOnMoveToGraveyard && 
            (e.targetIds?.includes(cardToPlay.id) || (e.targetMapping === 'CONTROLLER' && e.controllerId === playerId))
        );
        
        const stackObj = {
            id: `spell_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            controllerId: playerId,
            sourceId: cardToPlay.id,
            type: 'Spell' as const,
            targets: declaredTargets || [],
            card: cardToPlay,
            xValue: cardToPlay.xValue,
            exileOnResolution: exileOnResolution,
            data: {
                effects: spellEffects,
                targetDefinition: targetDefinition,
                preSelectedChoice
            }
        };

        state.stack.push(stackObj);

        // CR 601.2i: Fire Targeting Triggers
        (declaredTargets || []).forEach(tid => {
            TriggerProcessor.onEvent(state, {
                type: 'ON_BECOME_TARGET',
                playerId: playerId,
                targetId: tid,
                data: {
                    sourceId: stackObj.id,
                    sourceCard: cardToPlay
                }
            }, log);
        });

        state.consecutivePasses = 0;

        // CR 601.2i: Fire cast triggers
        TriggerProcessor.onEvent(state, {
            type: 'ON_CAST_SPELL',
            playerId: playerId,
            data: {
                card: cardToPlay,
                sourceId: cardToPlay.id,
                stackSnapshot: JSON.parse(JSON.stringify(stackObj))
            }
        }, log);

        if (isFirstInstantOrSorcery) {
            TriggerProcessor.onEvent(state, { 
                type: 'ON_CAST_FIRST_INSTANT_SORCERY', 
                playerId: playerId, 
                data: { 
                    card: cardToPlay, 
                    sourceId: cardToPlay.id,
                    stackSnapshot: JSON.parse(JSON.stringify(stackObj))
                } 
            }, log);
        }

        const isNonCreature = !cardToPlay.definition.types.some((t: string) => t.toLowerCase() === 'creature');
        if (isNonCreature) {
            TriggerProcessor.onEvent(state, {
                type: 'ON_CAST_NON_CREATURE',
                playerId: playerId,
                data: {
                    card: cardToPlay,
                    sourceId: cardToPlay.id
                }
            }, log);
        }

        log(`--------------------------------------------------`);
        log(`[STACK] + ${state.players[playerId].name} cast ${cardToPlay.definition.name}${declaredTargets?.length ? ' targeting ' + declaredTargets.join(', ') : ''}`);
        log(`--------------------------------------------------`);

        engine.checkAutoPass(playerId);
        return true;
    }

    public static getEffectiveCosts(state: GameState, card: GameObject, targets: string[] = []): { totalMana: string, additionalCosts: AbilityCost[] } {
        let baseCost = card.definition.manaCost;
        
        // Handle X cost substitution (Rule 107.3)
        if (baseCost.includes('{X}') && card.xValue !== undefined) {
            baseCost = baseCost.replace(/\{X\}/g, `{${card.xValue}}`);
        }

        const parsed = ManaProcessor.parseManaCost(baseCost);
        let extraGeneric = 0;
        let additionalCosts: AbilityCost[] = [];
        let effectiveCost: string | null = null;

        // 0. Check for Free Cast permissions (Alternative Costs)
        const isFree = state.ruleRegistry.continuousEffects.find(e =>
            (e.isFreeCast || (e as any).value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING") &&
            (e.targetIds?.includes(card.id) || (e.targetMapping === 'CONTROLLER' && e.controllerId === card.controllerId))
        );
        
        if (isFree) {
            if ((isFree as any).value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING" && card.zone !== Zone.Hand) {
                // Keep looking
            } else {
                effectiveCost = "{0}";
            }
        }

        if (effectiveCost !== null) return { totalMana: effectiveCost, additionalCosts };

        // 1. Gather global modifiers
        const { TargetingProcessor } = require('./TargetingProcessor');
        const modifiers = state.ruleRegistry.continuousEffects.filter(e => {
            if (!['SpellTax', 'CostReduction', 'AdditionalCost', 'AllowCastFromGraveyard', 'AllowPlayFromTop', 'AllowPlayExiled'].includes((e as any).type)) return false;
            
            const source = TargetingProcessor.findObjectInAnyZone(state, e.sourceId);
            if (source && e.activeZones && !e.activeZones.includes(source.zone)) return false;
            return true;
        });

        // 2. Add the card's OWN static additional costs (e.g. Goremand) OR inherent spell costs (e.g. Village Rites)
        const cardLogic = m21[card.definition.name];
        if (cardLogic && cardLogic.abilities) {
            cardLogic.abilities.forEach((a: any) => {
                // Case A: Static abilities that apply costs to the card itself (creatures)
                if (a.type === AbilityType.Static && a.activeZone === Zone.Hand) {
                    a.effects?.forEach((e: any) => {
                        if ((e.type === 'AdditionalCost' || e.type === 'CostReduction') && e.targetMapping === 'SELF') {
                            modifiers.push({ ...e, sourceId: card.id, controllerId: card.controllerId } as any);
                        }
                    });
                }
                // Case B: Inherent Costs inside the Spell ability itself (Instants/Sorceries)
                if (a.type === AbilityType.Spell && a.costs) {
                    additionalCosts = [...additionalCosts, ...a.costs];
                }
            });
        }

        for (const mod of modifiers) {
            const type = (mod as any).type;
            const impacts = (mod.targetMapping === 'EACH_PLAYER') ||
                (mod.targetMapping === 'EACH_OPPONENT' && mod.controllerId !== card.controllerId) ||
                (mod.targetMapping === 'SELF' && mod.sourceId === card.id) ||
                (mod.targetMapping === 'CONTROLLER' && mod.controllerId === card.controllerId);

            if (!impacts) continue;

            const restrictions = (mod as any).restrictions || [];
            const { ConditionProcessor } = require('./../core/ConditionProcessor');
            
            const matches = TargetingProcessor.matchesRestrictions(state, card, (restrictions as any[] || []), card.controllerId, mod.sourceId);
            const conditionMatches = !mod.condition || ConditionProcessor.matchesCondition(state, mod.condition, mod.sourceId, card.controllerId, { data: { targets } } as any);

            if (!matches || !conditionMatches) continue;

            if (type === 'SpellTax') extraGeneric += (mod as any).amount || 0;
            if (type === 'CostReduction') {
                extraGeneric -= (mod as any).amount || 0;
                if ((mod as any).manaReduction) {
                    const red = ManaProcessor.parseManaCost((mod as any).manaReduction);
                    extraGeneric -= red.generic;
                    for (const [s, c] of Object.entries(red.colored)) {
                        parsed.colored[s] = Math.max(0, (parsed.colored[s] || 0) - (c as number));
                    }
                }
            }
            if (type === 'AdditionalCost' || type === 'AllowCastFromGraveyard' || type === 'AllowPlayExiled') {
                const extra = (mod as any).additionalCosts || (mod as any).costs || [];
                additionalCosts = [...additionalCosts, ...extra];
            }
        }

        const finalGeneric = Math.max(0, parsed.generic + extraGeneric);
        let costStr = '';
        Object.entries(parsed.colored).forEach(([symbol, count]) => {
            for (let i = 0; i < count; i++) costStr += `{${symbol}}`;
        });

        if (finalGeneric > 0 || (costStr === '' && finalGeneric === 0)) {
            costStr = `{${finalGeneric}}` + costStr;
        }

        return { totalMana: costStr, additionalCosts };
    }

    public static activateAbility(
        state: GameState,
        playerId: PlayerId,
        cardId: string,
        abilityIndex: number,
        declaredTargets: string[],
        log: (m: string) => void,
        engine: {
            tapForMana: (p: PlayerId, c: string) => void;
            passPriority: (p: PlayerId) => void;
            checkAutoPass: (p: PlayerId) => void;
        },
        bypassTargeting = false
    ): boolean {
        const obj = state.battlefield.find(o => o.id === cardId);
        if (!obj) return false;

        const player = state.players[playerId];
        if (!player) return false;

        if (!bypassTargeting && String(state.priorityPlayerId) !== String(playerId)) {
            log(`Tried to activate ability without priority.`);
            return false;
        }

        if (state.pendingAction) {
            log(`Cannot activate ability: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        const cardLogic = m21[obj.definition.name];
        if (!cardLogic || !cardLogic.abilities || !cardLogic.abilities[abilityIndex]) return false;
        if (obj.definition.name === "Teferi, Master of Time") {
            const ability = cardLogic.abilities[abilityIndex];
            log(`[DEBUG] Activating Teferi ability index ${abilityIndex} (${ability.id}): ${JSON.stringify(obj.definition, null, 2)}`);
        }

        const ability = cardLogic.abilities[abilityIndex];
        if (ability.type !== AbilityType.Activated) return false;

        // Step 1: Preliminary Cost & Rule Check (including Summoning Sickness via CostProcessor)
        if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) {
            log(`Illegal Activation: Cannot pay costs for ${obj.definition.name}'s ability.`);
            return false;
        }

        // Requirement Check (Rule 602.5b)
        if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) {
            log(`Illegal Activation: Activation requirements for ${obj.definition.name} are not met.`);
            return false;
        }

        const isPlaneswalker = obj.definition.types.includes('Planeswalker');
        const isSorceryOnly = ability.activatedOnlyAsSorcery || (ability as any).isSorcerySpeed;

        if (isPlaneswalker || isSorceryOnly) {
            const activeId = String(state.activePlayerId).trim();
            const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
            const stackEmpty = state.stack.length === 0;
            const isSorcerySpeed = String(playerId) === activeId && isMainPhase && stackEmpty;
            const canActivateAnyTime = (cardLogic.abilities || []).some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));

            if (!canActivateAnyTime && !isSorcerySpeed) {
                log(`Illegal Activation: This ability can only be activated at sorcery speed.`);
                return false;
            }

            if (isPlaneswalker && obj.abilitiesUsedThisTurn > 0) {
                log(`Illegal Activation: This permanent's activated abilities have already been used this turn.`);
                return false;
            }
        }

        let precalculatedTargets: string[] | undefined;
        if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && !bypassTargeting) {
            const { TargetingProcessor } = require('./TargetingProcessor');
            const pool = [
                ...Object.keys(state.players),
                ...state.battlefield.map(o => o.id),
                ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id)),
                ...state.exile.map(o => o.id),
                ...state.stack.map(o => o.id)
            ];
            precalculatedTargets = pool.filter(tid => TargetingProcessor.isLegalTarget(state, obj.id, tid, ability.targetDefinition));

            if (precalculatedTargets.length === 0) {
                log(`Illegal Activation: No valid targets available for ${obj.definition.name}'s ability.`);
                return false;
            }
        }

        // Step 1.6: Check Additional Costs for Ability (e.g. Discard for Niambi)
        const additionalCosts = ability.costs || [];
        const discardCost = additionalCosts.find(c => c.type === 'Discard');
        const hasChosenDiscard = (state as any).lastChosenDiscardId !== undefined;
        
        if (discardCost) log(`[DEBUG] activateAbility: discardCost present. hasChosenDiscard: ${hasChosenDiscard} (${(state as any).lastChosenDiscardId})`);

        if (discardCost && !hasChosenDiscard) {
            const { TargetingProcessor } = require('./TargetingProcessor');
            const legalDiscardIds = player.hand
                .filter(c => TargetingProcessor.matchesRestrictions(state, c, discardCost.restrictions || [], playerId, obj.id))
                .map(c => c.id);

            if (legalDiscardIds.length === 0) {
                log(`Illegal Activation: No valid cards to discard for ${obj.definition.name}.`);
                return false;
            }

            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    label: "Discard a card to activate " + obj.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Discard',
                    abilityIndex: abilityIndex,
                    minChoices: 1,
                    maxChoices: 1,
                    declaredTargets: declaredTargets || [],
                    choices: legalDiscardIds.map(id => {
                        const c = player.hand.find(o => o.id === id)!;
                        return {
                            label: `Discard ${c.definition.name}`,
                            value: id,
                            cardData: c,
                            selectable: true
                        }
                    })
                }
            };
            log(`[DISCARD] ${player.name} must choose a card to discard to activate ${obj.definition.name}.`);
            return true;
        }

        // Rule 601.2h: Pay costs
        const manaCost = (ability.costs || []).find(c => c.type === 'Mana');
        if (manaCost && !ManaProcessor.canPayManaCost(player, manaCost.value, state)) {
             if (ManaProcessor.canPayWithTotal(player, state.battlefield, manaCost.value)) {
                  log(`Auto-tapping lands to pay ability cost ${manaCost.value}...`);
                  ManaProcessor.autoTapLandsForCost(state, playerId, manaCost.value, log, engine.tapForMana);
             }
        }

        CostProcessor.pay(state, ability.costs || [], obj.id, playerId, (m) => log(m));

        obj.abilitiesUsedThisTurn++;

        const stackId = `ability_${Date.now()}`;
        const stackObj = {
            id: stackId,
            controllerId: playerId,
            sourceId: obj.id,
            type: AbilityType.Activated,
            name: `${obj.definition.name} Ability`,
            image_url: obj.definition.image_url,
            targets: declaredTargets || [],
            abilityIndex: abilityIndex,
            data: {
                effects: (ability as any).effects || [],
                targetDefinition: ability.targetDefinition
            }
        };

        if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && precalculatedTargets && !bypassTargeting) {
            const isSingleOpponentTarget = ability.targetDefinition?.type === 'Player' && 
                                           ability.targetDefinition?.restrictions?.some((r: any) => typeof r === 'string' && r.toLowerCase() === 'opponent') &&
                                           precalculatedTargets.length === 1 &&
                                           state.playerOrder.length === 2;

            if (isSingleOpponentTarget) {
                return this.activateAbility(state, playerId, cardId, abilityIndex, precalculatedTargets, log, engine, true);
            }

            state.pendingAction = {
                type: 'TARGETING',
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    stackId: stackId,
                    stackObj: stackObj,
                    abilityIndex: abilityIndex,
                    targetDefinition: ability.targetDefinition,
                    targets: precalculatedTargets
                }
            };
            log(`[TARGETING] Player must choose targets for ${obj.definition.name}'s ability.`);
            return true;
        }

        if (ability.isManaAbility) {
            const { EffectProcessor } = require('../effects/EffectProcessor');
            (ability as any).effects.forEach((eff: any) => {
                EffectProcessor.executeEffect(state, eff, obj.id, [], (m: string) => log(m), stackObj, null);
            });
            log(`Activated mana ability of ${obj.definition.name}`);
            return true;
        }

        state.stack.push(stackObj);
        log(`Activated ability of ${obj.definition.name}: ${ability.id}`);

        // CR 601.2i: Fire Targeting Triggers
        (declaredTargets || []).forEach(tid => {
            TriggerProcessor.onEvent(state, {
                type: 'ON_BECOME_TARGET',
                playerId: playerId,
                targetId: tid,
                data: {
                    sourceId: stackId,
                    sourceCard: obj
                }
            }, log);
        });

        state.consecutivePasses = 0;
        engine.passPriority(playerId);
        return true;
    }
}
