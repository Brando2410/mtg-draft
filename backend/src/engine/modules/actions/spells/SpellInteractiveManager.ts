import { AbilityCost, AbilityDefinition, ActionType, CostType, DiscardCost, ExileCost, GameObject, GameState, PlayerId, EngineFrame, Restriction, SacrificeCost, TapSelectionCost, TargetMapping, TargetType, Zone, TargetDefinition, TargetRestriction } from '@shared/engine_types';
import { ManaProcessor } from '../../magic/ManaProcessor';
import { RuleUtils } from '../../../utils/RuleUtils';
import { getProcessors } from '../../ProcessorRegistry';
import { LogCategory } from '../../../utils/EngineLogger';
import { SpellProcessor } from './SpellProcessor';
import { TargetingDispatcher } from '../targeting/TargetingDispatcher';
import { ActionBuilder } from '../../../utils/ActionBuilder';

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
    public static handleXValueChoice(state: GameState, playerId: PlayerId, cardToPlay: GameObject, declaredTargets: string[], parentContext?: EngineFrame, isFreeCast?: boolean, isMiracleCast?: boolean, exileOnResolution?: boolean): boolean {
        state.pendingAction = ActionBuilder.chooseX(playerId, cardToPlay.id, `Choose X value for: ${cardToPlay.definition.name}`)
            .withContext({ parentContext, isFreeCast, isMiracleCast, exileOnResolution })
            .withData({ declaredTargets: declaredTargets || [] })
            .build();
        const { logger } = getProcessors(state);
        logger.info(state, LogCategory.ACTION, `[CHOOSE_X] ${state.players[playerId].name} is choosing X for ${cardToPlay.definition.name}...`);
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
        targetDefinitions: TargetDefinition[],
        totalMana: string,
        cardInstanceId: string,
        engine: any,
        parentContext?: EngineFrame,
        isFreeCast?: boolean,
        isMiracleCast?: boolean,
        exileOnResolution?: boolean,
        existingTargets: string[] = []
    ): boolean | string[] {
        const { logger, targeting: TargetingProcessor } = getProcessors(state);
        const player = state.players[playerId];
        cardToPlay.controllerId = cardToPlay.controllerId || playerId;
        logger.debug(state, LogCategory.ACTION, `[INTERACTIVE-TARGETING-START] ${cardToPlay.definition.name} entry. Existing targets: ${existingTargets.length}`);

        if (!ManaProcessor.canPayWithTotal(state, player, state.battlefield, totalMana, cardToPlay)) {
            logger.info(state, LogCategory.ACTION, `Illegal Play: Not enough mana available to even start casting ${cardToPlay.definition.name}.`);
            cardToPlay.xValue = undefined; // Cleanup for next attempt
            return false;
        }

        const result = TargetingDispatcher.dispatchTargetingStep({
            state,
            playerId,
            sourceObj: cardToPlay,
            targetDefinitions,
            existingTargets,
            xValue: cardToPlay.xValue || 0,
            isSpellCasting: true,
            isFreeCast,
            isMiracleCast,
            exileOnResolution,
            parentContext
        });

        if (typeof result === 'boolean') return result;
        return result; // It's a string[] of targets
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
        parentContext?: EngineFrame,
        isFreeCast?: boolean,
        isMiracleCast?: boolean,
        exileOnResolution?: boolean
    ): boolean | null {
        const { logger, targeting: TargetingProcessor } = getProcessors(state);

        logger.debug(state, LogCategory.ACTION, `[DEBUG] Additional costs found: ${additionalCosts.length} -> ${JSON.stringify(additionalCosts)}`);

        // 1. Choice Cost
        const choiceCost = additionalCosts.find(c => c.type === CostType.Choice);
        const hasChosenCostChoice = state.interaction?.lastChoiceIndex !== undefined;

        if (choiceCost && !hasChosenCostChoice) {
            const { logger, cost: CostProcessor } = getProcessors(state);
            const choices = choiceCost.choices?.map((c: any, idx: number) => {
                const isPayable = CostProcessor.canPay(state, c.costs, cardToPlay.id, playerId);
                return {
                    label: c.label || `Option ${idx + 1}`,
                    value: `COST_CHOICE_${idx}`,
                    selectable: isPayable
                };
            }) || [];

            state.pendingAction = ActionBuilder.choice(playerId, cardToPlay.id, choiceCost.label || "Choose an additional cost")
                .asCost('Choice')
                .withContext({ isSpellCasting: true, isFreeCast, isMiracleCast, parentContext, exileOnResolution })
                .withData({ sourceObject: cardToPlay, choices: choices })
                .build();
            logger.info(state, LogCategory.ACTION, `[COST_CHOICE] ${state.players[playerId].name} must choose an additional cost for ${cardToPlay.definition.name}.`);
            return true;
        }

        // 2. Sacrifice Cost
        const sacrificeCost = additionalCosts.find(c => c.type === CostType.Sacrifice && !c.targetMapping);
        const hasChosenSacrifice = state.interaction?.lastSelections['Sacrifice'] !== undefined;

        if (sacrificeCost && !hasChosenSacrifice) {
            const legalSacrificeIds = state.battlefield
                .filter(o => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, (sacrificeCost as SacrificeCost).restrictions || [], {
                    sourceId: cardToPlay.id,
                    controllerId: playerId,
                    xValue: cardToPlay.xValue || 0, effects: [], targets: []
                }))
                .map(o => o.id);

            const isAny = String((sacrificeCost as SacrificeCost).amount) === 'ANY';
            const amount = isAny ? 0 : (Number((sacrificeCost as SacrificeCost).amount) || 1);
            if (legalSacrificeIds.length < amount) {
                logger.info(state, LogCategory.ACTION, `Illegal Play: No valid objects to sacrifice for ${cardToPlay.definition.name}.`);
                return null; // FAILURE
            }

            state.pendingAction = ActionBuilder.modal(playerId, cardToPlay.id, "Sacrifice a creature to cast " + cardToPlay.definition.name)
                .asCost('Sacrifice')
                .withContext({ isSpellCasting: true, isFreeCast, isMiracleCast, parentContext, exileOnResolution })
                .withChoices(legalSacrificeIds.map(id => {
                    const obj = state.battlefield.find(o => o.id === id)!;
                    return { label: `Sacrifice ${obj.definition.name}`, value: id, cardData: obj, selectable: true }
                }), amount, amount)
                .withData({ declaredTargets: declaredTargets || [] })
                .build();
            logger.info(state, LogCategory.ACTION, `[SACRIFICE] ${state.players[playerId].name} must choose an object to sacrifice.`);
            return true;
        }

        // 3. Discard Cost
        const discardCost = additionalCosts.find(c => c.type === CostType.Discard);
        const hasChosenDiscard = state.interaction?.lastSelections['Discard'] !== undefined;

        if (discardCost && !hasChosenDiscard) {
            const player = state.players[playerId];
            const legalDiscardIds = player.hand
                .filter(c => c.id !== cardInstanceId && TargetingProcessor.matchesRestrictions(state, c, (discardCost as DiscardCost).restrictions || [], {
                    sourceId: cardToPlay.id,
                    controllerId: playerId,
                    xValue: cardToPlay.xValue || 0, effects: [], targets: []
                }))
                .map(c => c.id);

            const isAny = String(discardCost.amount) === 'ANY';
            const amount = isAny ? 0 : (Number(discardCost.amount) || 1);
            if (legalDiscardIds.length < amount) {
                logger.info(state, LogCategory.ACTION, `Illegal Play: No valid cards to discard for ${cardToPlay.definition.name}.`);
                return null; // FAILURE
            }

            state.pendingAction = ActionBuilder.modal(playerId, cardToPlay.id, "Discard a card to cast " + cardToPlay.definition.name)
                .asCost('Discard')
                .withContext({ isSpellCasting: true, isFreeCast, isMiracleCast, parentContext, exileOnResolution })
                .withChoices(legalDiscardIds.map(id => {
                    const c = player.hand.find(o => o.id === id)!;
                    return { label: `Discard ${c.definition.name}`, value: id, cardData: c, selectable: true }
                }), amount, amount)
                .withData({ declaredTargets: declaredTargets || [] })
                .build();
            logger.info(state, LogCategory.ACTION, `[DISCARD] ${state.players[playerId].name} must choose a card to discard.`);
            return true;
        }

        // 4. Exile Cost
        const exileCost = additionalCosts.find(c => c.type === CostType.Exile && !c.targetMapping);
        const hasChosenExile = state.interaction?.lastSelections['Exile'] !== undefined;

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
                    controllerId: playerId,
                    xValue: cardToPlay.xValue || 0, effects: [], targets: []
                }))
                .map((c: GameObject) => c.id);

            const isAny = String((exileCost as ExileCost).amount) === 'ANY';
            const amount = isAny ? 0 : (Number((exileCost as ExileCost).amount) || 1);
            if (legalExileIds.length < amount) {
                logger.info(state, LogCategory.ACTION, `Illegal Play: Not enough valid objects to exile for ${cardToPlay.definition.name}.`);
                return null; // FAILURE
            }

            state.pendingAction = ActionBuilder.modal(playerId, cardToPlay.id, `Exile ${amount} card(s) to cast ` + cardToPlay.definition.name)
                .asCost('Exile')
                .withContext({ isSpellCasting: true, isFreeCast, isMiracleCast, parentContext, exileOnResolution })
                .withChoices(legalExileIds.map((id: string) => {
                    const obj = pool.find((o: GameObject) => o.id === id);
                    return { label: `Exile ${obj?.definition?.name || id}`, value: id, cardData: obj, selectable: true }
                }), amount, amount)
                .withData({ declaredTargets: declaredTargets || [] })
                .build();
            logger.info(state, LogCategory.ACTION, `[EXILE] ${state.players[playerId].name} must choose objects to exile.`);
            return true;
        }

        // 5. TapSelection Cost
        const tapSelectionCost = additionalCosts.find(c => c.type === CostType.TapSelection);
        const hasChosenTapSelection = state.interaction?.lastSelections['TapSelection'] !== undefined;

        if (tapSelectionCost && !hasChosenTapSelection) {
            const legalTapIds = state.battlefield.filter(o =>
                o.controllerId === playerId &&
                !o.isTapped &&
                TargetingProcessor.matchesRestrictions(state, o, tapSelectionCost.restrictions || [], {
                    sourceId: cardToPlay.id,
                    controllerId: playerId,
                    xValue: cardToPlay.xValue || 0, effects: [], targets: []
                })
            ).map(o => o.id);

            const amount = Number((tapSelectionCost as TapSelectionCost).amount || 1);
            if (legalTapIds.length < amount) {
                logger.info(state, LogCategory.ACTION, `Illegal Play: Not enough valid permanents to tap for ${cardToPlay.definition.name}.`);
                return null; // FAILURE
            }

            state.pendingAction = ActionBuilder.modal(playerId, cardToPlay.id, `Tap ${amount} permanents to cast ` + cardToPlay.definition.name)
                .asCost('TapSelection')
                .withContext({ isSpellCasting: true, isFreeCast, isMiracleCast, parentContext, exileOnResolution })
                .withChoices(legalTapIds.map(id => {
                    const sObj = state.battlefield.find(o => o.id === id);
                    return { label: `Tap ${sObj?.definition.name || id}`, value: id, cardData: sObj, selectable: true }
                }), amount, amount)
                .withData({ declaredTargets: declaredTargets || [] })
                .build();
            logger.info(state, LogCategory.ACTION, `[TAP] ${state.players[playerId].name} must choose ${amount} objects to tap.`);
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
    public static handleAbilityXChoice(state: GameState, playerId: PlayerId, obj: GameObject, abilityIndex: number, declaredTargets: string[] | undefined, parentContext?: EngineFrame): boolean {
        const ability = obj.definition.abilities?.[abilityIndex];
        if (!ability || typeof ability === 'string') return false;
        const needsX = (ability.effects || []).some((e: any) => e.value === 'X' || e.amount === 'X' || (e.costs && e.costs.some((c: any) => c.value === 'X')));
        const xValue = state.interaction?.lastChoiceX;

        if (needsX && xValue === undefined) {
            state.pendingAction = {
                type: ActionType.ChooseX,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    metadata: {
                        abilityIndex: abilityIndex,
                        parentContext
                    },
                    label: `Choose a value for X for ${obj.definition.name}'s ability`,
                    declaredTargets: declaredTargets || [],
                    isResolutionX: false
                }
            };
            const { logger } = getProcessors(state);
            logger.info(state, LogCategory.ACTION, `[CHOOSE_X] ${state.players[playerId].name} is choosing X for ${obj.definition.name}'s ability...`);
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
    public static handleAbilityInteractiveCosts(state: GameState, playerId: PlayerId, obj: GameObject, ability: AbilityDefinition, abilityIndex: number, declaredTargets: string[] | undefined, parentContext?: EngineFrame): boolean | null {
        const { logger, targeting: TargetingProcessor } = getProcessors(state);
        const player = state.players[playerId];
        const additionalCosts = ability.costs || [];
        const isFreeCast = false;
        const exileOnResolution = obj.exileOnResolution || ability.exileOnResolution || false;

        // Sacrifice Cost
        const sacrificeCost = additionalCosts.find((cost) => cost.type === CostType.Sacrifice);
        const hasChosenSacrifice = state.interaction?.lastSelections['Sacrifice'] !== undefined;
        if (sacrificeCost && !hasChosenSacrifice) {
            const isSelfSac = (sacrificeCost as SacrificeCost).targetMapping === TargetMapping.Self || ((sacrificeCost as SacrificeCost).restrictions || []).some(r => r === Restriction.Self);
            const legalSacrificeIds = state.battlefield.filter(o => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, (sacrificeCost as SacrificeCost).restrictions || [], {
                sourceId: obj.id,
                controllerId: playerId,
                xValue: obj.xValue || 0, effects: [], targets: []
            })).map(o => o.id);

            if (legalSacrificeIds.length === 0 && !isSelfSac) {
                const { logger } = getProcessors(state);
                logger.info(state, LogCategory.ACTION, `Illegal Activation: No valid objects to sacrifice for ${obj.definition.name}.`);
                return false;
            }

            if (isSelfSac) {
                if (state.interaction) state.interaction.lastSelections['Sacrifice'] = [obj.id];
            } else if (legalSacrificeIds.length === 1) {
                if (state.interaction) state.interaction.lastSelections['Sacrifice'] = [legalSacrificeIds[0]];
            } else {
                state.pendingAction = ActionBuilder.modal(playerId, obj.id, "Sacrifice a creature to activate " + obj.definition.name)
                    .asCost('Sacrifice')
                    .withContext({ abilityIndex, isSpellCasting: true, isFreeCast, parentContext, exileOnResolution })
                    .withChoices(legalSacrificeIds.map(id => {
                        const sObj = state.battlefield.find(o => o.id === id);
                        return { label: `Sacrifice ${sObj?.definition.name || id}`, value: id, cardData: sObj, selectable: true }
                    }))
                    .withData({ declaredTargets: declaredTargets || [] })
                    .build();
                logger.info(state, LogCategory.ACTION, `[SACRIFICE] ${player.name} must choose an object to sacrifice to activate ${obj.definition.name}.`);
                return true;
            }
        }

        // Discard Cost
        const discardCost = additionalCosts.find((cost) => cost.type === CostType.Discard);
        const hasChosenDiscard = state.interaction?.lastSelections['Discard'] !== undefined;
        if (discardCost && !hasChosenDiscard) {
            const legalDiscardIds = player.hand.filter(c => TargetingProcessor.matchesRestrictions(state, c, (discardCost as DiscardCost).restrictions || [], {
                sourceId: obj.id,
                controllerId: playerId,
                xValue: obj.xValue || 0, effects: [], targets: []
            })).map(c => c.id);
            if (legalDiscardIds.length === 0) {
                logger.info(state, LogCategory.ACTION, `Illegal Activation: No valid cards to discard for ${obj.definition.name}.`);
                return false;
            }
            state.pendingAction = ActionBuilder.modal(playerId, obj.id, "Discard a card to activate " + obj.definition.name)
                .asCost('Discard')
                .withContext({ abilityIndex, isSpellCasting: true, isFreeCast, parentContext, exileOnResolution })
                .withChoices(legalDiscardIds.map(id => {
                    const c = player.hand.find(o => o.id === id)!;
                    return { label: `Discard ${c.definition.name}`, value: id, cardData: c, selectable: true }
                }))
                .withData({ declaredTargets: declaredTargets || [] })
                .build();
            logger.info(state, LogCategory.ACTION, `[DISCARD] ${player.name} must choose a card to discard to activate ${obj.definition.name}.`);
            return true;
        }

        // TapSelection Cost
        const tapSelectionCost = additionalCosts.find((cost) => cost.type === CostType.TapSelection);
        const hasChosenTapSelection = state.interaction?.lastSelections['TapSelection'] !== undefined;
        if (tapSelectionCost && !hasChosenTapSelection) {
            const legalTapIds = state.battlefield.filter(o => o.controllerId === playerId && !o.isTapped && TargetingProcessor.matchesRestrictions(state, o, (tapSelectionCost as TapSelectionCost).restrictions || [], {
                sourceId: obj.id,
                controllerId: playerId,
                xValue: obj.xValue || 0, effects: [], targets: []
            })).map(o => o.id);
            const amount = Number((tapSelectionCost as TapSelectionCost).amount || 1);
            if (legalTapIds.length < amount) {
                logger.info(state, LogCategory.ACTION, `Illegal Activation: Not enough valid permanents to tap for ${obj.definition.name}.`);
                return false;
            }
            state.pendingAction = ActionBuilder.modal(playerId, obj.id, `Tap ${amount} creatures to activate ` + obj.definition.name)
                .asCost('TapSelection')
                .withContext({ abilityIndex, isSpellCasting: true, isFreeCast, parentContext, exileOnResolution })
                .withChoices(legalTapIds.map(id => {
                    const sObj = state.battlefield.find(o => o.id === id);
                    return { label: `Tap ${sObj?.definition.name || id}`, value: id, cardData: sObj, selectable: true }
                }), amount, amount)
                .withData({ declaredTargets: declaredTargets || [] })
                .build();
            logger.info(state, LogCategory.ACTION, `[TAP] ${player.name} must choose ${amount} objects to tap to activate ${obj.definition.name}.`);
            return true;
        }

        // Exile Cost
        const exileCost = additionalCosts.find((cost) => cost.type === CostType.Exile);
        const hasChosenExile = state.interaction?.lastSelections['Exile'] !== undefined;
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
                controllerId: playerId,
                xValue: obj.xValue || 0, effects: [], targets: []
            })).map((o: GameObject) => o.id);
            if (legalExileIds.length === 0) {
                logger.info(state, LogCategory.ACTION, `Illegal Activation: No valid cards to exile for ${obj.definition.name}.`);
                return false;
            }
            state.pendingAction = ActionBuilder.modal(playerId, obj.id, "Exile a card to activate " + obj.definition.name)
                .asCost('Exile')
                .withContext({ abilityIndex, isSpellCasting: true, isFreeCast, parentContext, exileOnResolution })
                .withChoices(legalExileIds.map((id: string) => {
                    const c = pool.find((o: GameObject) => o.id === id)!;
                    return { label: `Exile ${c.definition.name}`, value: id, cardData: c, selectable: true }
                }))
                .withData({ declaredTargets: declaredTargets || [] })
                .build();
            logger.info(state, LogCategory.ACTION, `[EXILE] ${player.name} must choose a card to exile to activate ${obj.definition.name}.`);
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
    public static handleAbilityTargeting(state: GameState, playerId: PlayerId, cardId: string, obj: GameObject, ability: AbilityDefinition, abilityIndex: number, engine: any, preSelectedChoice?: number, parentContext?: EngineFrame, exileOnResolution?: boolean): boolean {
        const targetDefs = ability.targetDefinitions || [];
        const existingTargets = parentContext?.targets || state.pendingAction?.data?.selectedTargets || [];

        const result = TargetingDispatcher.dispatchTargetingStep({
            state,
            playerId,
            sourceObj: obj,
            targetDefinitions: targetDefs,
            existingTargets: (existingTargets as (string | null)[]).filter((t): t is string => t !== null),
            xValue: obj.xValue || 0,
            isSpellCasting: false,
            isFreeCast: false,
            exileOnResolution,
            parentContext,
            abilityIndex,
            preSelectedChoice
        });

        if (typeof result === 'boolean') {
            return result;
        }

        // result is string[] (completed targets)
        return SpellProcessor.finalizeAbilityActivation(state, engine, {
            playerId,
            obj,
            ability,
            abilityIndex,
            declaredTargets: result,
            xValue: obj.xValue,
            preSelectedChoice,
            parentContext,
            exileOnResolution
        });
    }
}

