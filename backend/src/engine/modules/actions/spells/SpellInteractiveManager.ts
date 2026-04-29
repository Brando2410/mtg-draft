import { AbilityCost, ActionType, CostType, GameObject, GameState, PlayerId, ResolutionContext, TargetType, Zone, AbilityType, AbilityDefinition, DiscardCost, ExileCost, SacrificeCost, TapSelectionCost } from '@shared/engine_types';
import { ManaProcessor } from '../../magic/ManaProcessor';

import { SpellProcessor } from './SpellProcessor';

/**
 * SpellInteractiveManager - Creates and injects pendingAction modals for player input.
 *
 * Responsibilities:
 *   - Prompting for X value selection (Rule 107.3b).
 *   - Building targeting UI state for spell and ability targets.
 *   - Constructing interactive cost selection modals (sacrifice, discard, exile, tap).
 *   - Auto-targeting single-opponent scenarios to reduce clicks.
 *
 * Design: Each method either returns true (meaning a pendingAction was injected and
 * the cast flow is paused waiting for UI input), false (illegal / no targets), or
 * a value to continue the cast pipeline. These methods write to state.pendingAction
 * but never finalize the spell on the stack.
 */
export class SpellInteractiveManager {
    /**
     * Injects a ChooseX pendingAction modal when a spell's cost contains {X}.
     * The player must choose a numeric value before mana can be calculated (Rule 107.3b).
     * @returns Always true (flow is paused for UI input).
     */
    public static handleXValueChoice(state: GameState, playerId: PlayerId, cardToPlay: GameObject, declaredTargets: string[], log: (m: string) => void, parentContext?: ResolutionContext, isFreeCast?: boolean, exileOnResolution?: boolean): boolean {
        state.pendingAction = {
            type: ActionType.ChooseX,
            playerId: playerId,
            sourceId: cardToPlay.id,
            data: {
                label: `Choose a value for X for ${cardToPlay.definition.name}`,
                declaredTargets: declaredTargets || [],
                parentContext,
                isFreeCast,
                exileOnResolution
            }
        };
        log(`[CHOOSE_X] ${state.players[playerId].name} is choosing X for ${cardToPlay.definition.name}...`);
        return true;
    }

    /**
     * Builds the interactive targeting UI for spell casting (Rule 601.2c).
     *
     * Handles three outcomes:
     *   - Single opponent auto-select: If the first target is "opponent" and there's
     *     only one legal opponent, it auto-selects and either returns the targets array
     *     or continues to secondary targeting.
     *   - No legal targets: Returns false (illegal) or empty array (optional targets).
     *   - Normal targeting: Injects a TARGETING pendingAction with the legal target pool.
     *
     * Also validates mana affordability before even entering the targeting flow.
     *
     * @returns true (pendingAction injected), false (illegal), or string[] (resolved targets).
     */
    public static handleTargetingChoice(
        state: GameState,
        playerId: PlayerId,
        cardToPlay: GameObject,
        targetDefinition: any,
        totalMana: string,
        cardInstanceId: string,
        log: (m: string) => void,
        engine: any,
        parentContext?: ResolutionContext,
        isFreeCast?: boolean,
        exileOnResolution?: boolean
    ): boolean | string[] {
        const { TargetingProcessor } = require('../targeting/TargetingProcessor');
        const player = state.players[playerId];
        cardToPlay.controllerId = cardToPlay.controllerId || playerId;

        if (!ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana)) {
            log(`Illegal Play: Not enough mana available to even start casting ${cardToPlay.definition.name}.`);
            cardToPlay.xValue = undefined; // Cleanup for next attempt
            return false;
        }

        const pool = [...new Set([
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id),
            ...state.exile.map(o => o.id),
            ...state.stack.map(o => o.id),
            ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
        ])];

        const firstDef = TargetingProcessor.getDefinitionForIndex(targetDefinition, 0);
        const legalForFirst = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
            sourceId: cardToPlay.id,
            controllerId: cardToPlay.controllerId || playerId,
            targetDef: targetDefinition,
            targetIndex: 0
        }, tid));
        log(`[DEBUG] Found ${legalForFirst.length} legal targets for ${cardToPlay.definition.name}: [${legalForFirst.join(', ')}]`);

        const firstType = (firstDef.type || '').toLowerCase();
        const firstRestrictions = (firstDef.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);
        const isOpponentTarget = firstType === 'opponent' || (firstType === 'player' && firstRestrictions.includes('opponent'));

        const isSingleOpponentTarget = isOpponentTarget && legalForFirst.length === 1;

        if (isSingleOpponentTarget) {
            const opponentId = legalForFirst[0];
            log(`[AUTO-TARGET] Automatically targeting the only opponent for ${cardToPlay.definition.name}.`);

            const totalCounts = TargetingProcessor.calculateTotalCounts(targetDefinition, cardToPlay.xValue || 0);

            if (totalCounts.maxCount === 1) {
                return [opponentId];
            }

            // More than 1 target total: auto-select the first and continue
            const autoSelected = [opponentId];
            const nextIndex = autoSelected.length;
            const nextDef = TargetingProcessor.getDefinitionForIndex(targetDefinition, nextIndex);
            const secondaryPool = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                sourceId: cardToPlay.id,
                controllerId: cardToPlay.controllerId || playerId,
                targetDef: targetDefinition,
                targetIndex: nextIndex
            }, tid));
            log(`[DEBUG] Found ${secondaryPool.length} legal secondary targets for ${cardToPlay.definition.name}: [${secondaryPool.join(', ')}]`);
            const prompt = TargetingProcessor.generateTargetPrompt(targetDefinition, nextIndex, cardToPlay.xValue || 0, true);

            state.pendingAction = {
                type: ActionType.Targeting,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    targetDefinition,
                    targets: secondaryPool,
                    selectedTargets: autoSelected,
                    label: nextDef?.label,
                    isSpellCasting: true,
                    xValue: cardToPlay.xValue,
                    maxCount: totalCounts.maxCount,
                    minCount: totalCounts.minCount,
                    count: totalCounts.count,
                    prompt,
                    isOptional: totalCounts.minCount === 0,
                    canSkip: totalCounts.minCount === 0 || autoSelected.length >= totalCounts.minCount,
                    isFreeCast,
                    exileOnResolution,
                    parentContext
                }
            };
            return true;
        }

        const precalculatedTargets = legalForFirst; // Default view for first selection step

        if (precalculatedTargets.length === 0) {
            if (targetDefinition.optional || firstDef.optional || firstDef.minCount === 0) {
                log(`No legal targets found for first requirement, auto-skipping.`);
                return [];
            } else {
                log(`Illegal Play: No valid targets available for ${cardToPlay.definition.name}.`);
                return false;
            }
        }

        const { maxCount, minCount, count } = TargetingProcessor.calculateTotalCounts(targetDefinition, cardToPlay.xValue || 0);
        const prompt = TargetingProcessor.generateTargetPrompt(targetDefinition, 0, cardToPlay.xValue || 0, true);

        // --- ENHANCEMENT: Graveyard/Exile Targeting Modal ---
        // If targeting solely from graveyard or exile, use ModalSelection UI for better UX (requested by user)
        const isOffBattlefieldTargeting = 
            firstDef.type === TargetType.CardInGraveyard || 
            firstDef.type === TargetType.CardInExile;

        if (isOffBattlefieldTargeting) {
            const choices = precalculatedTargets.map(id => {
                const obj = TargetingProcessor.findObjectInAnyZone(state, id);
                return {
                    label: obj?.definition?.name || id,
                    value: id,
                    cardData: obj,
                    selectable: true
                };
            });

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: firstDef.label || `Choose ${count > 1 ? count + ' cards' : 'a card'} from your graveyard for ${cardToPlay.definition.name}`,
                    hideUndo: false,
                    isSpellCasting: true,
                    isTargetingModal: true,
                    xValue: cardToPlay.xValue,
                    minChoices: minCount,
                    maxChoices: maxCount,
                    choices: choices,
                    isFreeCast,
                    exileOnResolution,
                    parentContext
                }
            };
            log(`[GRAVEYARD_MODAL] ${state.players[playerId].name} is selecting graveyard targets for ${cardToPlay.definition.name}...`);
            return true;
        }

        state.pendingAction = {
            type: ActionType.Targeting,
            playerId: playerId,
            sourceId: cardToPlay.id,
            data: {
                targetDefinition,
                targets: precalculatedTargets,
                label: firstDef.label || `Select target for ${cardToPlay.definition.name}`,
                isSpellCasting: true,
                xValue: cardToPlay.xValue,
                maxCount,
                minCount,
                count,
                prompt,
                isOptional: minCount === 0,
                canSkip: minCount === 0,
                isFreeCast,
                exileOnResolution,
                parentContext
            }
        };
        log(`[TARGETING] ${state.players[playerId].name} is selecting targets for ${cardToPlay.definition.name}...`);
        return true;
    }

    /**
     * Processes interactive additional cost selection for spell casting (CR 601.2f).
     *
     * Handles four cost types in priority order:
     *   1. Choice costs (e.g., "Pay {2} or sacrifice a creature").
     *   2. Sacrifice costs (builds modal for controllable permanents).
     *   3. Discard costs (builds modal for hand cards matching restrictions).
     *   4. Exile costs (builds modal for cards in specified zones).
     *
     * Each cost type checks if a selection has already been made (via lastChosenXxx
     * state flags) before prompting. This allows the cast pipeline to re-enter
     * after the player makes their selection.
     *
     * @returns true if a pendingAction was injected, false if costs can't be paid.
     */
    public static handleInteractiveCosts(
        state: GameState,
        playerId: PlayerId,
        cardToPlay: GameObject,
        additionalCosts: AbilityCost[],
        declaredTargets: string[],
        cardInstanceId: string,
        log: (m: string) => void,
        parentContext?: ResolutionContext,
        isFreeCast?: boolean,
        exileOnResolution?: boolean
    ): boolean | null {
        const { TargetingProcessor } = require('../targeting/TargetingProcessor');

        log(`[DEBUG] Additional costs found: ${additionalCosts.length} -> ${JSON.stringify(additionalCosts)}`);

        // 1. Choice Cost
        const choiceCost = additionalCosts.find(c => c.type === CostType.Choice);
        const hasChosenCostChoice = state.interaction?.lastChosenCostChoiceIndex !== undefined;

        if (choiceCost && !hasChosenCostChoice) {
            const { CostProcessor } = require('../../magic/CostProcessor');
            const choices = choiceCost.choices?.map((c: any, idx: number) => {
                const isPayable = CostProcessor.canPay(state, c.costs, cardToPlay.id, playerId);
                return {
                    label: c.label || `Option ${idx + 1}`,
                    value: `COST_CHOICE_${idx}`,
                    selectable: isPayable
                };
            }) || [];

            state.pendingAction = {
                type: ActionType.Choice,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: choiceCost.label || "Choose an additional cost",
                    hideUndo: false,
                    isCostChoice: true,
                    isSpellCasting: true,
                    sourceObject: cardToPlay,
                    choices: choices
                }
            };
            log(`[COST_CHOICE] ${state.players[playerId].name} must choose an additional cost for ${cardToPlay.definition.name}.`);
            return true;
        }

        // 2. Sacrifice Cost
        const sacrificeCost = additionalCosts.find(c => c.type === CostType.Sacrifice && !c.targetMapping);
        const hasChosenSacrifice = state.interaction?.lastChosenSacrificeId !== undefined;

        if (sacrificeCost && !hasChosenSacrifice) {
            const legalSacrificeIds = state.battlefield
                .filter(o => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, (sacrificeCost as SacrificeCost).restrictions || [], {
                    sourceId: cardToPlay.id,
                    controllerId: playerId
                }))
                .map(o => o.id);

            const amount = (sacrificeCost as SacrificeCost).amount || 1;
            if (legalSacrificeIds.length < amount) {
                log(`Illegal Play: No valid objects to sacrifice for ${cardToPlay.definition.name}.`);
                return null; // FAILURE
            }

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
                    minChoices: amount,
                    maxChoices: amount,
                    choices: legalSacrificeIds.map(id => {
                        const obj = state.battlefield.find(o => o.id === id)!;
                        return { label: `Sacrifice ${obj.definition.name}`, value: id, cardData: obj, selectable: true }
                    }),
                    isFreeCast,
                    parentContext
                }
            };
            log(`[SACRIFICE] ${state.players[playerId].name} must choose an object to sacrifice.`);
            return true;
        }

        // 3. Discard Cost
        const discardCost = additionalCosts.find(c => c.type === CostType.Discard);
        const hasChosenDiscard = state.interaction?.lastChosenDiscardId !== undefined;

        if (discardCost && !hasChosenDiscard) {
            const player = state.players[playerId];
            const legalDiscardIds = player.hand
                .filter(c => c.id !== cardInstanceId && TargetingProcessor.matchesRestrictions(state, c, (discardCost as DiscardCost).restrictions || [], {
                    sourceId: cardToPlay.id,
                    controllerId: playerId
                }))
                .map(c => c.id);

            const amount = discardCost.amount || 1;
            if (legalDiscardIds.length < amount) {
                log(`Illegal Play: No valid cards to discard for ${cardToPlay.definition.name}.`);
                return null; // FAILURE
            }

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: "Discard a card to cast " + cardToPlay.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Discard',
                    minChoices: amount,
                    maxChoices: amount,
                    declaredTargets: declaredTargets || [],
                    choices: legalDiscardIds.map(id => {
                        const c = player.hand.find(o => o.id === id)!;
                        return { label: `Discard ${c.definition.name}`, value: id, cardData: c, selectable: true }
                    }),
                    isFreeCast,
                    parentContext
                }
            };
            log(`[DISCARD] ${state.players[playerId].name} must choose a card to discard.`);
            return true;
        }

        // 4. Exile Cost
        const exileCost = additionalCosts.find(c => c.type === CostType.Exile && !c.targetMapping);
        const hasChosenExile = state.interaction?.lastChosenExileIds !== undefined;

        if (exileCost && !hasChosenExile) {
            const player = state.players[playerId];
            const zones: Zone[] = (exileCost as ExileCost).sourceZones || [Zone.Battlefield];
            const pool = zones.flatMap((z: Zone) => {
                if (z === Zone.Battlefield) return state.battlefield.filter(o => o.controllerId === playerId);
                if (z === Zone.Graveyard) return player.graveyard;
                if (z === Zone.Hand) return player.hand;
                return [];
            });

            const legalExileIds = pool
                .filter((c: GameObject) => TargetingProcessor.matchesRestrictions(state, c, (exileCost as ExileCost).restrictions || [], {
                    sourceId: cardToPlay.id,
                    controllerId: playerId
                }))
                .map((c: GameObject) => c.id);

            const amount = (exileCost as ExileCost).amount || 1;
            if (legalExileIds.length < amount) {
                log(`Illegal Play: Not enough valid objects to exile for ${cardToPlay.definition.name}.`);
                return null; // FAILURE
            }

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: `Exile ${amount} card(s) to cast ` + cardToPlay.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Exile',
                    minChoices: amount,
                    maxChoices: amount,
                    declaredTargets: declaredTargets || [],
                    choices: legalExileIds.map((id: string) => {
                        const obj = pool.find((o: GameObject) => o.id === id);
                        return { label: `Exile ${obj?.definition?.name || id}`, value: id, cardData: obj, selectable: true }
                    }),
                    isFreeCast,
                    parentContext
                }
            };
            log(`[EXILE] ${state.players[playerId].name} must choose objects to exile.`);
            return true;
        }
        
        // 5. TapSelection Cost
        const tapSelectionCost = additionalCosts.find(c => c.type === CostType.TapSelection);
        const hasChosenTapSelection = state.interaction?.lastChosenTapSelectionIds !== undefined;

        if (tapSelectionCost && !hasChosenTapSelection) {
            const legalTapIds = state.battlefield.filter(o => 
                o.controllerId === playerId && 
                !o.isTapped && 
                TargetingProcessor.matchesRestrictions(state, o, tapSelectionCost.restrictions || [], {
                    sourceId: cardToPlay.id,
                    controllerId: playerId
                })
            ).map(o => o.id);

            const amount = Number((tapSelectionCost as TapSelectionCost).value || (tapSelectionCost as TapSelectionCost).amount || 1);
            if (legalTapIds.length < amount) {
                log(`Illegal Play: Not enough valid permanents to tap for ${cardToPlay.definition.name}.`);
                return null; // FAILURE
            }

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: `Tap ${amount} permanents to cast ` + cardToPlay.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'TapSelection',
                    minChoices: amount,
                    maxChoices: amount,
                    declaredTargets: declaredTargets || [],
                    choices: legalTapIds.map(id => {
                        const sObj = state.battlefield.find(o => o.id === id);
                        return { label: `Tap ${sObj?.definition.name || id}`, value: id, cardData: sObj, selectable: true }
                    }),
                    isFreeCast,
                    parentContext
                }
            };
            log(`[TAP] ${state.players[playerId].name} must choose ${amount} objects to tap.`);
            return true;
        }

        return false;
    }

    /**
     * Handles X value selection for ability activation.
     * Similar to handleXValueChoice but for activated abilities rather than spells.
     * Also assigns the selected X value to the object after the player chooses.
     * @returns true if a ChooseX pendingAction was injected, false if X is not needed or already set.
     */
    public static handleAbilityXChoice(state: GameState, playerId: PlayerId, obj: GameObject, abilityIndex: number, declaredTargets: string[] | undefined, log: (m: string) => void, parentContext?: ResolutionContext): boolean {
        const ability = (obj.definition.abilities as AbilityDefinition[])?.[abilityIndex];
        if (!ability) return false;
        const needsX = (ability.effects || []).some((e: any) => e.value === 'X' || e.amount === 'X' || (e.costs && e.costs.some((c: any) => c.value === 'X')));
        const xValue = state.interaction?.lastChoiceX;

        if (needsX && xValue === undefined) {
            state.pendingAction = {
                type: ActionType.ChooseX,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    abilityIndex: abilityIndex,
                    label: `Choose a value for X for ${obj.definition.name}'s ability`,
                    declaredTargets: declaredTargets || [],
                    parentContext
                }
            };
            log(`[CHOOSE_X] ${state.players[playerId].name} is choosing X for ${obj.definition.name}'s ability...`);
            return true;
        }

        if (xValue !== undefined) {
            obj.xValue = xValue;
            if (state.interaction) delete state.interaction.lastChoiceX;
        }
        return false;
    }

    /**
     * Processes interactive cost selection for ability activation (Rule 602.2b).
     *
     * Covers five cost types: Sacrifice, Discard, TapSelection, Exile, plus
     * auto-resolution shortcuts (e.g., self-sacrifice, single-option sacrifice).
     *
     * @returns true (pendingAction injected), false (can't pay), or null (no interactive costs needed).
     */
    public static handleAbilityInteractiveCosts(state: GameState, playerId: PlayerId, obj: GameObject, ability: AbilityDefinition, abilityIndex: number, declaredTargets: string[] | undefined, log: (m: string) => void, parentContext?: ResolutionContext): boolean | null {
        const { TargetingProcessor } = require('../targeting/TargetingProcessor');
        const player = state.players[playerId];
        const additionalCosts = ability.costs || [];

        // Sacrifice Cost
        const sacrificeCost = additionalCosts.find((cost) => cost.type === CostType.Sacrifice);
        const hasChosenSacrifice = state.interaction?.lastChosenSacrificeId !== undefined;
        if (sacrificeCost && !hasChosenSacrifice) {
            const isSelfSac = (sacrificeCost as SacrificeCost).targetMapping === 'SELF' || ((sacrificeCost as SacrificeCost).restrictions || []).some((r: any) => typeof r === 'string' && r.toLowerCase() === 'self');
            const legalSacrificeIds = state.battlefield.filter(o => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, (sacrificeCost as SacrificeCost).restrictions || [], {
                sourceId: obj.id,
                controllerId: playerId
            })).map(o => o.id);

            if (legalSacrificeIds.length === 0 && !isSelfSac) {
                log(`Illegal Activation: No valid objects to sacrifice for ${obj.definition.name}.`);
                return false;
            }

            if (isSelfSac) {
                if (state.interaction) state.interaction.lastChosenSacrificeId = obj.id;
            } else if (legalSacrificeIds.length === 1) {
                if (state.interaction) state.interaction.lastChosenSacrificeId = legalSacrificeIds[0];
            } else {
                state.pendingAction = {
                    type: ActionType.ModalSelection,
                    playerId: playerId,
                    sourceId: obj.id,
                    data: {
                        label: "Sacrifice a creature to activate " + obj.definition.name,
                        hideUndo: false,
                        isCostChoice: true,
                        costType: 'Sacrifice',
                        abilityIndex: abilityIndex,
                        declaredTargets: declaredTargets || [],
                        choices: legalSacrificeIds.map(id => {
                            const sObj = state.battlefield.find(o => o.id === id);
                            return { label: `Sacrifice ${sObj?.definition.name || id}`, value: id, cardData: sObj, selectable: true }
                        })
                    }
                };
                log(`[SACRIFICE] ${player.name} must choose an object to sacrifice to activate ${obj.definition.name}.`);
                return true;
            }
        }

        // Discard Cost
        const discardCost = additionalCosts.find((cost) => cost.type === CostType.Discard);
        const hasChosenDiscard = state.interaction?.lastChosenDiscardId !== undefined;
        if (discardCost && !hasChosenDiscard) {
            const legalDiscardIds = player.hand.filter(c => TargetingProcessor.matchesRestrictions(state, c, (discardCost as DiscardCost).restrictions || [], {
                sourceId: obj.id,
                controllerId: playerId
            })).map(c => c.id);
            if (legalDiscardIds.length === 0) {
                log(`Illegal Activation: No valid cards to discard for ${obj.definition.name}.`);
                return false;
            }
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
                        return { label: `Discard ${c.definition.name}`, value: id, cardData: c, selectable: true }
                    })
                }
            };
            log(`[DISCARD] ${player.name} must choose a card to discard to activate ${obj.definition.name}.`);
            return true;
        }

        // TapSelection Cost
        const tapSelectionCost = additionalCosts.find((cost) => cost.type === CostType.TapSelection);
        const hasChosenTapSelection = state.interaction?.lastChosenTapSelectionIds !== undefined;
        if (tapSelectionCost && !hasChosenTapSelection) {
            const legalTapIds = state.battlefield.filter(o => o.controllerId === playerId && !o.isTapped && TargetingProcessor.matchesRestrictions(state, o, (tapSelectionCost as TapSelectionCost).restrictions || [], {
                sourceId: obj.id,
                controllerId: playerId
            })).map(o => o.id);
            const amount = Number((tapSelectionCost as TapSelectionCost).value || (tapSelectionCost as TapSelectionCost).amount || 1);
            if (legalTapIds.length < amount) {
                log(`Illegal Activation: Not enough valid permanents to tap for ${obj.definition.name}.`);
                return false;
            }
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    label: `Tap ${amount} creatures to activate ` + obj.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'TapSelection',
                    abilityIndex: abilityIndex,
                    minChoices: amount,
                    maxChoices: amount,
                    declaredTargets: declaredTargets || [],
                    choices: legalTapIds.map(id => {
                        const sObj = state.battlefield.find(o => o.id === id);
                        return { label: `Tap ${sObj?.definition.name || id}`, value: id, cardData: sObj, selectable: true }
                    })
                }
            };
            log(`[TAP] ${player.name} must choose ${amount} objects to tap to activate ${obj.definition.name}.`);
            return true;
        }

        // Exile Cost
        const exileCost = additionalCosts.find((cost) => cost.type === CostType.Exile);
        const hasChosenExile = state.interaction?.lastChosenExileIds !== undefined;
        if (exileCost && !hasChosenExile) {
            const zones: Zone[] = (exileCost as ExileCost).sourceZones || [Zone.Battlefield];
            const pool = zones.flatMap((z: Zone) => {
                if (z === Zone.Battlefield) return state.battlefield.filter((o: GameObject) => o.controllerId === playerId);
                if (z === Zone.Graveyard) return player.graveyard;
                if (z === Zone.Hand) return player.hand;
                if (z === Zone.Exile) return state.exile;
                if (z === Zone.Library) return player.library;
                return [];
            });
            const legalExileIds = pool.filter((o: GameObject) => TargetingProcessor.matchesRestrictions(state, o, (exileCost as ExileCost).restrictions || [], {
                sourceId: obj.id,
                controllerId: playerId
            })).map((o: GameObject) => o.id);
            if (legalExileIds.length === 0) {
                log(`Illegal Activation: No valid cards to exile for ${obj.definition.name}.`);
                return false;
            }
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    label: "Exile a card to activate " + obj.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Exile',
                    abilityIndex: abilityIndex,
                    minChoices: 1,
                    maxChoices: 1,
                    declaredTargets: declaredTargets || [],
                    choices: legalExileIds.map((id: string) => {
                        const c = pool.find((o: GameObject) => o.id === id)!;
                        return { label: `Exile ${c.definition.name}`, value: id, cardData: c, selectable: true }
                    }),
                    parentContext
                }
            };
            log(`[EXILE] ${player.name} must choose a card to exile to activate ${obj.definition.name}.`);
            return true;
        }

        return null;
    }

    /**
     * Builds the interactive targeting UI for ability activation (Rule 602.2b).
     *
     * Functions identically to handleTargetingChoice but for abilities. Also handles
     * the special case where a single-opponent auto-target can directly finalize the
     * ability activation (short-circuiting through SpellProcessor.finalizeAbilityActivation).
     *
     * @returns true if targeting was handled (either pendingAction or direct finalization).
     */
    public static handleAbilityTargeting(state: GameState, playerId: PlayerId, cardId: string, obj: GameObject, ability: AbilityDefinition, abilityIndex: number, log: (m: string) => void, engine: any, preSelectedChoice?: number, parentContext?: ResolutionContext, exileOnResolution?: boolean): boolean {
        const { TargetingProcessor } = require('../targeting/TargetingProcessor');
        const pool = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id),
            ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id)),
            ...state.exile.map(o => o.id),
            ...state.stack.map(o => o.id)
        ];
        const firstDef = TargetingProcessor.getDefinitionForIndex(ability.targetDefinition, 0);
        const legalForFirst = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
            sourceId: obj.id,
            controllerId: obj.controllerId || playerId,
            targetDef: ability.targetDefinition,
            targetIndex: 0
        }, tid));
        log(`[DEBUG] Found ${legalForFirst.length} legal targets for ${obj.definition.name} ability: [${legalForFirst.join(', ')}]`);

        const firstType = (firstDef.type || '').toLowerCase();
        const firstRestrictions = (firstDef.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);
        const isOpponentTarget = firstType === 'opponent' || (firstType === 'player' && firstRestrictions.includes('opponent'));

        const isSingleOpponentTarget = isOpponentTarget &&
            legalForFirst.length === 1;

        const { maxCount, minCount, count } = TargetingProcessor.calculateTotalCounts(ability.targetDefinition, obj.xValue || 0);

        if (isSingleOpponentTarget) {
            const opponentId = legalForFirst[0];
            log(`[AUTO-TARGET] Automatically targeting the only opponent for ${obj.definition.name}.`);

            if (maxCount === 1) {
                return SpellProcessor.finalizeAbilityActivation(state, log, engine, {
                    playerId,
                    obj,
                    ability,
                    abilityIndex,
                    declaredTargets: [opponentId],
                    preSelectedChoice
                });
            }

            const autoSelected = [opponentId];
            const nextIndex = autoSelected.length;
            const nextDef = TargetingProcessor.getDefinitionForIndex(ability.targetDefinition, nextIndex);
            const prompt = TargetingProcessor.generateTargetPrompt(ability.targetDefinition, nextIndex, obj.xValue || 0, false);

            state.pendingAction = {
                type: ActionType.Targeting,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    abilityIndex: abilityIndex,
                    targetDefinition: ability.targetDefinition,
                    targets: pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                        sourceId: obj.id,
                        controllerId: obj.controllerId || playerId,
                        targetDef: ability.targetDefinition,
                        targetIndex: nextIndex
                    }, tid)),
                    selectedTargets: autoSelected,
                    label: nextDef.label,
                    xValue: obj.xValue,
                    maxCount,
                    minCount,
                    count,
                    prompt,
                    preSelectedChoice,
                    isOptional: minCount === 0,
                    canSkip: minCount === 0 || autoSelected.length >= minCount,
                    exileOnResolution
                }
            };
            return true;
        }

        if (legalForFirst.length === 0) {
            if (firstDef.optional || firstDef.minCount === 0) {
                log(`No legal targets found, skipping.`);
                return SpellProcessor.finalizeAbilityActivation(state, log, engine, {
                    playerId,
                    obj,
                    ability,
                    abilityIndex,
                    declaredTargets: [],
                    preSelectedChoice,
                    exileOnResolution
                });
            } else {
                log(`Illegal Play: No valid targets available for ${obj.definition.name}'s ability.`);
                return false;
            }
        }

        const prompt = TargetingProcessor.generateTargetPrompt(ability.targetDefinition, 0, obj.xValue || 0, false);

        // --- ENHANCEMENT: Graveyard/Exile Targeting Modal ---
        const isOffBattlefieldTargeting = 
            firstDef.type === TargetType.CardInGraveyard || 
            firstDef.type === TargetType.CardInExile;

        if (isOffBattlefieldTargeting) {
            const choices = legalForFirst.map(id => {
                const cObj = TargetingProcessor.findObjectInAnyZone(state, id);
                return {
                    label: cObj?.definition?.name || id,
                    value: id,
                    cardData: cObj,
                    selectable: true
                };
            });

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    abilityIndex: abilityIndex,
                    label: firstDef.label || `Choose a card from your graveyard for ${obj.definition.name}`,
                    hideUndo: false,
                    isSpellCasting: true,
                    isTargetingModal: true,
                    xValue: obj.xValue,
                    minChoices: minCount,
                    maxChoices: maxCount,
                    choices: choices,
                    preSelectedChoice
                }
            };
            log(`[GRAVEYARD_MODAL] Player is selecting graveyard targets for ${obj.definition.name}'s ability...`);
            return true;
        }

        state.pendingAction = {
            type: ActionType.Targeting,
            playerId: playerId,
            sourceId: obj.id,
            data: {
                abilityIndex: abilityIndex,
                targetDefinition: ability.targetDefinition,
                targets: legalForFirst,
                label: firstDef.label || `Select target for ${obj.definition.name}`,
                xValue: obj.xValue,
                maxCount,
                minCount,
                count,
                prompt,
                isOptional: minCount === 0,
                canSkip: minCount === 0,
                parentContext
            }
        };
        log(`[TARGETING] Player must choose targets for ${obj.definition.name}'s ability.`);
        return true;
    }
}
