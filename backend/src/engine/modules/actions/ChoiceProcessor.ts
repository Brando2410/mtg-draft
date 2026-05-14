import { AbilityCost, AbilityDefinition, AbilityType, ActionType, ChoiceOption, ChoicePayload, EffectDefinition, EffectType, GameObject, GameState, PendingAction, PlayerId, EngineFrame, StackObject, TargetType, TriggerEvent, Zone, ModalActionData, XChoiceActionData, BatchActionData, CostActionData, InteractionMetadata } from '@shared/engine_types';
import { isModalData, isXChoiceData, isBatchData, isCostData } from '../../utils/ActionTypeGuards';
import { LogCategory } from '../../utils/EngineLogger';
import { EngineContext } from '../../interfaces/EngineContext';
import { RuleUtils } from "../../utils/RuleUtils";
import { getProcessors } from '../ProcessorRegistry';
import { PlayerActionProcessor } from './PlayerActionProcessor';
import { ChoiceGenerator } from '../effects/ChoiceGenerator';
import { ResolutionManager } from '../core/stack/ResolutionManager';
import { StackProcessor } from '../core/stack/StackProcessor';
import { getActionMeta } from '@shared/utils/ActionUtils';
import { MulliganProcessor } from '../core/MulliganProcessor';
import { PermanentHandler } from '../effects/handlers/permanent/PermanentHandler';

/**
 * Handles interactive player choices (Targeting, Modal Choices)
 */
export class ChoiceProcessor {

    public static normalizePayload(input: number | string | ChoicePayload): ChoicePayload {
        if (typeof input === 'object' && input !== null) {
            if ('selections' in input || 'top' in input || 'graveyard' in input) {
                const base = { selections: [] };
                return Object.assign(base, input);
            }

            // Handle raw map object (e.g. {"0":"W"})
            const keys = Object.keys(input);
            if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)))) {
                return { selections: [JSON.stringify(input)] };
            }
        }

        // Handle legacy/raw string payloads
        if (typeof input === 'number') {
            return { selections: [input] };
        }

        if (typeof input === 'string') {
            if (input === 'undo' || input === 'none' || input === 'confirm' || input === 'done') {
                return { selections: [input] };
            }

            if (input.startsWith('{')) {
                try {
                    const parsed = JSON.parse(input);
                    if (parsed.selections) return parsed;
                    if (parsed.top || parsed.bottom || parsed.graveyard) return { selections: [], ...parsed } as ChoicePayload;

                    // If it's a map string, wrap it so it gets processed by specialized handlers
                    if (Object.keys(parsed).every(k => !isNaN(parseInt(k)))) {
                        return { selections: [input] };
                    }

                    // Backward compatibility for old JSON shapes
                    if (parsed.index !== undefined) return { ...parsed, selections: [parsed.index] };
                    if (parsed.value !== undefined) return { ...parsed, selections: [parsed.value] };
                    if (parsed.indices) return { ...parsed, selections: parsed.indices };
                } catch (e) {
                    console.error("[CHOICE-ERROR] Failed to parse raw JSON payload:", e);
                }
            }

            // Handle multi-select strings (1|2|3 or CHOICE_1|CHOICE_2)
            if (input.includes('|')) {
                const selections = input.split('|').map(s => {
                    const raw = s.replace('CHOICE_', '');
                    return isNaN(parseInt(raw)) ? raw : parseInt(raw);
                });
                return { selections };
            }

            // Handle single CHOICE_N string
            if (input.startsWith('CHOICE_')) {
                const raw = input.replace('CHOICE_', '');
                return { selections: [isNaN(parseInt(raw)) ? raw : parseInt(raw)] };
            }

            // Check if it's a number string
            const num = parseInt(input);
            if (!isNaN(num) && String(num) === input) {
                return { selections: [num] };
            }

            return { selections: [input] };
        }

        return { selections: [] };
    }

    public static resolveChoice(
        state: GameState,
        playerId: PlayerId,
        choiceInput: number | string | ChoicePayload,
        engine: EngineContext
    ): boolean {
        const { logger, effect: EP } = getProcessors(state);
        const action = state.pendingAction;
        if (!action) return false;

        if (action.playerId !== playerId) {
            logger.debug(state, LogCategory.ACTION, `[CHOICE-ERROR] resolveChoice failed: Player ID mismatch. Expected ${action.playerId}, got ${playerId}.`);
            return false;
        }

        const payload = this.normalizePayload(choiceInput);
        const selections = payload.selections;
        const firstSelection = selections[0];

        logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Resolving ${action.type} for ${playerId}. Selections: ${selections.join(', ')}`);

        const isModal = action.type === ActionType.ModalSelection;
        const isLegendRule = action.type === ActionType.LegendRule;
        const isResolution = action.type === ActionType.ResolutionChoice || action.type === ActionType.OptionalAction || action.type === ActionType.Choice || isLegendRule || action.type === ActionType.Discard;
        const isScry = action.type === ActionType.Scry || action.type === ActionType.Surveil;
        const isChoosingX = action.type === ActionType.ChooseX;
        const isOrderTriggers = action.type === ActionType.OrderTriggers;
        const isTargeting = action.type === ActionType.Targeting;
        const isMulligan = action.type === ActionType.Mulligan;
        const isStartingPlayer = action.type === ActionType.StartingPlayerSelection;
        const isMiracleReveal = action.type === ActionType.MiracleReveal;

        if (!isModal && !isResolution && !isScry && !isChoosingX && !isOrderTriggers && !isTargeting && !isMulligan && !isStartingPlayer && !isMiracleReveal) return false;
        if (!action.data) return false;
        const actionData = action.data;
        const meta = getActionMeta(action);

        if (isTargeting) {
            let success = false;
            for (const sel of selections) {
                logger.debug(state, LogCategory.ACTION, `[CHOICE-DELEGATE] Delegating targeting choice to TargetingProcessor: ${sel}`);
                success = this.resolveTargeting(state, playerId, String(sel), engine);
                if (!success) break;
                // If the targeting sequence finalized and cleared pendingAction, stop processing further items in this batch
                if (!state.pendingAction) break;
            }
            return success;
        }

        if (isOrderTriggers) {
            const order = selections.map(s => s.toString());
            return PlayerActionProcessor.resolveTriggerOrdering(state, playerId, order);
        }

        // Handle "Back/Undo"
        if (firstSelection === 'undo' || firstSelection === -1) {
            return this.handleUndo(state, playerId, action);
        }

        if (isStartingPlayer) {
            const choiceIdx = typeof firstSelection === 'number' ? firstSelection : parseInt(String(firstSelection).replace('CHOICE_', ''));
            const choice = actionData.choices?.[choiceIdx];
            const chosenId = choice?.value as PlayerId;
            state.pendingAction = undefined;
            MulliganProcessor.resolveStartingPlayer(state, engine, chosenId);
            return true;
        }

        if (isMulligan) {
            const choiceIdx = typeof firstSelection === 'number' ? firstSelection : parseInt(String(firstSelection).replace('CHOICE_', ''));
            const choice = actionData.choices?.[choiceIdx];
            const decision = choice?.value as 'keep' | 'mulligan';
            state.pendingAction = undefined;
            MulliganProcessor.resolveMulligan(state, engine, playerId, decision);
            return true;
        }

        if (isChoosingX) {
            return this.handleXChoice(state, playerId, action, payload, engine);
        }

        if (isMiracleReveal) {
            return this.handleMiracleReveal(state, playerId, action, payload, engine);
        }

        // Handle multi-choice (batch selection) or empty selection via 'confirm'/'done'
        const isMultiSelectAction = action.type === ActionType.Discard || (meta.maxChoices || 0) > 1;
        const isEmptyConfirm = (firstSelection === 'confirm' || firstSelection === 'done' || firstSelection === 'none') && isMultiSelectAction;

        const isConfirm = firstSelection === 'confirm' || firstSelection === 'done';
        if (selections.length > 1 || (selections.length === 1 && typeof firstSelection === 'string' && (firstSelection.includes('|') || firstSelection.startsWith('{'))) || isEmptyConfirm || isConfirm || meta.isManaChoiceToggle) {
            // If it's a cost choice, spell casting mode selection, OR a targeting modal, we go through handleModalSelection
            if (actionData.isCostChoice || meta.isSpellCasting || actionData.isTargetingModal || meta.isManaChoiceToggle) {
                // Pass the first selection if it's a legacy string, otherwise pass null as handleModalSelection will use the payload
                return this.handleModalSelection(state, playerId, action.sourceId as string, null, firstSelection as string, action, engine, payload);
            }

            // Validate min choices for empty confirm
            const minChoices = meta.minChoices || 0;
            if (isEmptyConfirm && minChoices > 0) {
                logger.info(state, LogCategory.ACTION, `Cannot confirm: Minimum ${minChoices} choices required.`);
                return false;
            }
            const sourceId = action.sourceId;
            const allEffects: EffectDefinition[] = [];
            let finalChoice: ChoiceOption | null = null;
            let currentTargetOffset = 0;

            const indices = selections.filter(s => typeof s === 'number') as number[];
            logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Processing indices: ${indices.join(', ')}. isConfirm: ${isConfirm}, lastChoiceIndex: ${state.interaction.lastChoiceIndex}`);

            // RECOVERY: If confirming after a cost interaction, use the previously stored selection index
            if (indices.length === 0 && (firstSelection === 'confirm' || firstSelection === 'done') && state.interaction.lastChoiceIndex !== undefined) {
                indices.push(state.interaction.lastChoiceIndex);
                logger.debug(state, LogCategory.ACTION, `[CHOICE-RECOVERY] Recovered selection index ${state.interaction.lastChoiceIndex} from interaction state.`);
            }

            indices.forEach(idx => {
                const choice = actionData.choices?.[idx];
                if (choice) {
                    if (choice.effects) {
                        // Deep clone and inject targetOffset
                        const choiceEffects = JSON.parse(JSON.stringify(choice.effects)).map((e: EffectDefinition) => ({
                            ...e,
                            targetOffset: currentTargetOffset
                        }));
                        allEffects.push(...choiceEffects);
                    }

                    if (choice.targetDefinitions) {
                        const { targeting: TP } = getProcessors(state);
                        const meta = getActionMeta(action);
                        const counts = TP.calculateTotalCounts(choice.targetDefinitions, meta.xValue || 0);
                        currentTargetOffset += counts.maxCount;
                    }
                    finalChoice = choice; // Use metadata from the last one if needed
                }
            });

            if (allEffects.length === 0 && !finalChoice && !isEmptyConfirm) return false;

            state.pendingAction = undefined; // Clear modal before resolving effects

            // Cleanup: ensure the player's discard count is cleared since they just finished their choice
            if (action.type === ActionType.Discard) {
                state.players[playerId].pendingDiscardCount = 0;
            }

            // Resolve all effects in the batch
            if (allEffects.length > 0) {
                // IMPORTANT: Pay any costs associated with the choice(s) before resolving effects
                const choiceToPay = finalChoice as ChoiceOption | null;
                if (choiceToPay && choiceToPay.costs && choiceToPay.costs.length > 0) {
                    logger.info(state, LogCategory.ACTION, `[CHOICE-PAY] Paying costs for selection: ${choiceToPay.label}`);
                    getProcessors(state).cost.pay(state, choiceToPay.costs, sourceId!, playerId);
                }

                const discardEffects = allEffects.filter(e => e.type === EffectType.MoveToZone && e.isDiscard);
                if (discardEffects.length > 0) {
                    state.turnState.lastDiscardedCount = discardEffects.length;
                    state.turnState.lastDiscardedIds = [];
                    logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Reset lastDiscardedIds for new batch of ${discardEffects.length} discards.`);
                }

                const completed = getProcessors(state).effect.resolveEffects({
                    state,
                    context: getProcessors(state).effect.createEngineFrame(state, {
                        sourceId: sourceId as string,
                        effects: allEffects,
                        targets: [],
                        stackObject: meta.stackObj,
                        parentContext: meta.parentContext,
                        lookingCards: meta.lookingCards as GameObject[],
                        effectIndex: 0,
                        isResumption: false,
                        exileOnResolution: meta.exileOnResolution ?? meta.stackObj?.exileOnResolution ?? meta.parentContext?.exileOnResolution
                    })
                });

                if (!completed && (!meta.isSpellCasting || meta.isCopyTargeting)) {
                    logger.info(state, LogCategory.ACTION, `[CHOICE-SUSPEND] Resolution suspended for further interaction.`);
                    return true;
                }
            }

            // After batch is done, handle any next players in the sequence
            if (this.processNextPlayerHandOff(state, engine, action, meta)) {
                return true;
            }

            // Resume whatever was happening at the current level first
            if (meta.isMulliganPutBack) {
                const cardIds = selections.filter(s => typeof s === 'string') as string[];
                MulliganProcessor.resolvePutBack(state, engine, playerId, cardIds);
            }

            // Resume parent resolution, advancing index since this effect sequence is complete
            const resumeIndex = (meta.effectIndex !== undefined) ? meta.effectIndex + 1 : undefined;
            return ResolutionManager.resume(state, engine, undefined, undefined, {
                ...meta.parentContext,
                targets: [], // Clear targets from previous effect sequence to allow re-mapping
                effectIndex: resumeIndex
            }, action);
        }

        // 3. Handle Scry/Surveil Reordering early as payload is not an index
        if (action.type === ActionType.Scry || action.type === ActionType.Surveil) {
            return this.handleScrySurveil(state, playerId, action, payload, engine);
        }

        const choiceIdx = typeof firstSelection === 'number' ? firstSelection : parseInt(String(firstSelection).replace('CHOICE_', ''));
        if (!isNaN(choiceIdx) && isResolution && action.type !== ActionType.ResolutionChoice && action.type !== ActionType.OptionalAction && !meta.isSpellCasting && !actionData.isCostChoice) {
            state.interaction.lastChoiceIndex = choiceIdx;
            logger.debug(state, LogCategory.ACTION, `[CHOICE-PERSIST] Stored lastChoiceIndex: ${choiceIdx}`);

            // If we are here, it's a single-choice resolution that didn't go through the batch block above.
            // We should treat it exactly like a batch of one to ensure consistency.
            const choice = actionData.choices?.[choiceIdx];
            if (choice) {
                state.pendingAction = undefined;
                if (choice.effects && choice.effects.length > 0) {
                    EP.resolveEffects({
                        state,
                        context: EP.createEngineFrame(state, {
                            sourceId: action.sourceId || "",
                            effects: choice.effects,
                            targets: meta.targets || meta.parentContext?.targets || [],
                            stackObject: meta.stackObj as StackObject,
                            parentContext: meta.parentContext as EngineFrame,
                            controllerIdOverride: playerId,
                            effectIndex: 0
                        }),
                        skipFizzleCheck: true
                    });
                }

                if (this.processNextPlayerHandOff(state, engine, action, meta)) {
                    return true;
                }

                return ResolutionManager.resume(state, engine, undefined, undefined, {
                    ...meta.parentContext,
                    targets: [],
                    effectIndex: (meta.effectIndex !== undefined) ? meta.effectIndex + 1 : undefined
                }, action);
            }
        }

        // Handle Legend Rule Choice
        if (action.type === ActionType.LegendRule) {
            let choice = !isNaN(choiceIdx) ? actionData.choices?.[choiceIdx as number] : undefined;
            if (!choice && typeof firstSelection === 'string') {
                choice = actionData.choices?.find((c: ChoiceOption) => c.value === firstSelection);
            }
            const keepId = choice?.value as string;
            const involvedIds = (meta.involvedIds as string[]) || [];
            const discardIds = involvedIds.filter((id) => id !== keepId);

            discardIds.forEach((id) => {
                const obj = state.battlefield.find(o => o.id === id);
                if (obj) {
                    getProcessors(state).action.moveCard(state, obj, Zone.Graveyard, obj.ownerId);
                }
            });

            state.pendingAction = undefined;
            return true;
        }

        const sourceId = action.sourceId as string;
        const choice = !isNaN(choiceIdx) ? actionData.choices?.[choiceIdx as number] : undefined;

        if (!choice || !sourceId) return false;

        // 1. Handle Selection of Abilities (Planeswalkers/Modal costs in battlefield)
        const obj = state.battlefield.find(o => o.id === sourceId);
        if (obj && isModal && !actionData.isCostChoice) {
            return this.handleBattlefieldAbilityActivation(state, playerId, obj, choice, engine);
        }

        // 2. Handle Casting-Phase Choices (Modes, Additional Costs)
        // If it's a resolution-phase choice (Cascade, etc.), we fall through to handleResolutionChoice
        if ((isModal || meta.isSpellCasting || actionData.isCostChoice) && (action.type !== ActionType.Choice || meta.isSpellCasting || actionData.isCostChoice)) {
            return this.handleModalSelection(state, playerId, sourceId, choice, firstSelection, action, engine, payload);
        }

        // 4. Handle Resolution-Phase Choices (Effects, Search, Scry,)
        return this.handleResolutionChoice(state, sourceId, choice, action, engine, payload);
    }

    private static handleMiracleReveal(
        state: GameState,
        playerId: PlayerId,
        action: PendingAction,
        payload: ChoicePayload,
        engine: EngineContext
    ): boolean {
        const { logger, trigger: TrP, action: AP } = getProcessors(state);
        const actionData = action.data;
        const selections = payload.selections;
        const selection = selections[0];

        const choiceIdx = typeof selection === 'number' ? selection : parseInt(String(selection).replace('CHOICE_', ''));
        const choice = actionData?.choices?.[choiceIdx];

        const cardId = actionData?.cardId;
        const card = RuleUtils.findObject(state, cardId as string) as GameObject;

        if (!card) {
            logger.error(state, LogCategory.ACTION, `[MIRACLE-ERROR] Card ${cardId} not found for reveal.`);
            state.pendingAction = undefined;
            return ResolutionManager.resume(state, engine);
        }

        if (choice?.value === 'reveal') {
            logger.info(state, LogCategory.ACTION, `[MIRACLE] Player ${playerId} revealed ${card.definition.name}.`);
            card.isRevealed = true;

            // Fire the reveal event which will be picked up by SystemKeywordTriggers
            TrP.onEvent(state, {
                type: TriggerEvent.MiracleReveal,
                playerId,
                payload: { object: card, targetIds: [card.id] }
            });
        } else {
            logger.debug(state, LogCategory.ACTION, `[MIRACLE] Player ${playerId} declined to reveal.`);
        }

        state.pendingAction = undefined;

        // Finish the draw operation that was interrupted
        // We call moveCard with bypassMiracle = true to prevent re-interruption
        AP.moveCard(state, card, Zone.Hand, playerId, 'top', true, false, true);

        // Resume whatever was happening (e.g. DrawCardsHandler loop)
        return ResolutionManager.resume(state, engine);
    }

    private static handleScrySurveil(
        state: GameState,
        playerId: PlayerId,
        action: PendingAction,
        payload: ChoicePayload,
        engine: EngineContext
    ): boolean {
        const meta = getActionMeta(action);
        const { top = [], bottom = [], graveyard = [] } = payload;

        // Track result for UI
        state.turnState.lastScrySurveilResult = {
            playerId,
            top: top.length,
            bottom: bottom.length,
            graveyard: graveyard.length,
            type: action.type as string,
            timestamp: Date.now()
        };

        // 1. Validate all cards are still in a valid state (optional but good)
        const cards = (meta.lookingCards || []) as GameObject[];

        // 3. Move cards to Bottom (Scry) or Graveyard (Surveil)
        bottom.forEach((id) => {
            const card = cards.find((c) => c.id === id);
            if (card) {
                getProcessors(state).action.moveCard(state, card, Zone.Library, playerId, 'bottom');
            }
        });

        graveyard.forEach((id) => {
            const card = cards.find((c) => c.id === id);
            if (card) {
                getProcessors(state).action.moveCard(state, card, Zone.Graveyard, playerId);
            }
        });

        // 4. Move cards to Top (Reverse order to maintain stack order)
        [...top].reverse().forEach((id) => {
            const card = cards.find((c) => c.id === id);
            if (card) {
                getProcessors(state).action.moveCard(state, card, Zone.Library, playerId, 'top');
            }
        });

        // 5. Cleanup
        const stackObj = meta.stackObj as StackObject;
        state.pendingAction = undefined;

        // 6. Resume resolution if needed
        if (stackObj) {
            return ResolutionManager.resume(state, engine);
        }

        engine.resetPriorityToActivePlayer();
        return true;
    }


    private static handleUndo(state: GameState, playerId: PlayerId, action: PendingAction): boolean {
        const { logger } = getProcessors(state);
        const actionData = action.data;
        if (actionData?.hideUndo || action.type === ActionType.ResolutionChoice) {
            return false;
        }

        const sourceId = action.sourceId!;
        const savedActionData = action.data;
        const meta = getActionMeta(action);

        // A. Revert Battlefield source (Activated Ability/Planeswalker)
        const objOnBattlefield = state.battlefield.find(o => o.id === sourceId);
        if (objOnBattlefield) {
            const abilityIndex = meta.abilityIndex;
            if (objOnBattlefield.abilitiesUsedThisTurn > 0 && abilityIndex !== undefined) {
                objOnBattlefield.abilitiesUsedThisTurn--;

                // Refund Loyalty
                const ability = (objOnBattlefield.definition.abilities as AbilityDefinition[])?.[abilityIndex];
                const lCost = ability?.costs?.find((c: AbilityCost) => c.type === 'Loyalty')?.value as number;
                if (lCost !== undefined) {
                    objOnBattlefield.counters['loyalty'] = (objOnBattlefield.counters['loyalty'] || 0) - lCost;
                }
            }
        }

        // B. Revert Stack source (Putting a spell back in hand)
        const stackObj = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
        if (stackObj && stackObj.sourceObject) {
            const card = stackObj.sourceObject;
            const player = state.players[card.ownerId];
            if (player) {
                card.xValue = undefined; // Explicitly clear

                // BUG FIX: Only move to hand if it's a SPELL.
                // Triggered abilities (ETBs) must NOT bounce the creature.
                if (stackObj.type === AbilityType.Spell) {
                    getProcessors(state).action.moveCard(state, card, Zone.Hand, card.ownerId);
                    const { mana: ManaProcessor } = getProcessors(state);
                    ManaProcessor.refundManaCost(player, card.definition.manaCost);
                } else if (stackObj.type === AbilityType.Activated) {
                    // Refund costs for activated abilities but leave source on battlefield
                    const { mana: ManaProcessor } = getProcessors(state);
                    ManaProcessor.refundManaCost(player, card.definition.manaCost);
                }
            }
        }

        // C. Revert Hand source (MDFC selection phase)
        const player = state.players[playerId];
        const cardInHand = player?.hand.find(c => c.id === sourceId);
        if (cardInHand) {
            cardInHand.selectedFaceDefinition = undefined;
        }

        const { mana: ManaProcessor } = getProcessors(state);

        // Revert Auto-tap lands if we were in the confirmation step
        if (meta.tappedLandIds && Array.isArray(meta.tappedLandIds)) {
            ManaProcessor.untapLands(state, meta.tappedLandIds);

            if (player && meta.manaSnapshot) {
                player.manaPool = meta.manaSnapshot;
                player.restrictedMana = meta.restrictedSnapshot || [];
            } else if (player && meta.producedMana) {
                const pm = meta.producedMana as Record<string, number>;
                Object.entries(pm).forEach(([color, amount]) => {
                    if (amount > 0) {
                        player.manaPool[color as keyof typeof player.manaPool] -= amount;
                    }
                });
                logger.info(state, LogCategory.ACTION, `Undo: Untapped ${meta.tappedLandIds.length} lands and cleared auto-tapped mana.`);
            } else if (player && savedActionData && savedActionData.totalMana) {
                ManaProcessor.refundManaCost(player, savedActionData.totalMana);
                logger.info(state, LogCategory.ACTION, `Undo: Untapped ${meta.tappedLandIds.length} lands and refunded mana.`);
            }
        }

        logger.info(state, LogCategory.ACTION, `Action cancelled.`);
        state.pendingAction = undefined;
        state.priorityPlayerId = playerId;

        // CLEANUP TEMPORARY CASTING STATE
        state.interaction = {
            lastSelections: {},
            lastChoiceIndex: undefined,
            lastChoiceValue: undefined,
            lastChosenModeIndex: undefined,
            lastChoiceX: undefined,
            manaChoices: undefined,
            flags: {}
        };

        return true;
    }

    private static handleBattlefieldAbilityActivation(state: GameState, playerId: PlayerId, obj: GameObject, choice: ChoiceOption, engine: EngineContext): boolean {
        const { logger } = getProcessors(state);
        if (choice.value === 'none') {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            logger.info(state, LogCategory.ACTION, `Action cancelled.`);
            return true;
        }

        const abilityIndex = typeof choice.value === 'number' ? choice.value : parseInt(choice.value as string);
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        const allAbilities = [...((obj.definition.abilities as (AbilityDefinition | string)[]) || [])];
        if (stats.abilities) {
            stats.abilities.forEach((a: AbilityDefinition | string) => {
                if (typeof a === 'string') return;
                const isDuplicate = allAbilities.some(existing => {
                    if (typeof existing === 'string') return false;
                    return (a.id !== undefined && existing.id !== undefined) ? a.id === existing.id : (a.type === existing.type && JSON.stringify(a.effects) === JSON.stringify(existing.effects));
                });
                if (!isDuplicate) allAbilities.push(a);
            });
        }

        const ability = allAbilities[abilityIndex];
        if (!ability || typeof ability === 'string') return false;

        if (ability.targetDefinitions) {
            const targetDefinitions = ability.targetDefinitions;
            const firstDef = targetDefinitions[0];
            const pool = [
                ...Object.keys(state.players),
                ...state.battlefield.map(o => o.id),
                ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id)),
                ...state.exile.map(o => o.id),
                ...state.stack.map(o => o.id)
            ];
            const { targeting: TargetingProcessor } = getProcessors(state);
            const { maxCount, minCount, count } = TargetingProcessor.calculateTotalCounts(targetDefinitions, obj.xValue || 0);
            const legalTargetIds = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                sourceId: obj.id,
                controllerId: obj.controllerId,
                targetDefinitions,
                effects: [],
                targets: []
            }, tid));

            if (legalTargetIds.length === 0 && minCount === 0) {
                logger.info(state, LogCategory.ACTION, `No targets found, auto-skipping target selection for ${obj.definition.name} (+1 ability).`);
                state.priorityPlayerId = playerId;
                state.pendingAction = undefined;
                return engine.activateAbility({
                    playerId,
                    cardId: obj.id,
                    abilityIndex,
                    bypassPriority: true,
                    bypassTargeting: true
                });
            }

            if (legalTargetIds.length < minCount) {
                if (firstDef?.optional) {
                    logger.info(state, LogCategory.ACTION, `No valid targets found, auto-skipping target selection for ${obj.definition.name}.`);
                    state.pendingAction = undefined;
                    state.priorityPlayerId = playerId;
                    return engine.activateAbility({
                        playerId,
                        cardId: obj.id,
                        abilityIndex,
                        bypassPriority: true,
                        bypassTargeting: true
                    });
                } else {
                    logger.info(state, LogCategory.ACTION, `No legal targets available. Activation invalid.`);
                    return false;
                }
            }

            const isGraveyardTargeting = firstDef?.type === TargetType.CardInGraveyard;

            if (isGraveyardTargeting && legalTargetIds.length > 0) {
                const action = ChoiceGenerator.createCardChoice(
                    state,
                    legalTargetIds.map((id) => RuleUtils.findObject(state, id) as GameObject),
                    {
                        label: "Select a card from graveyard",
                        playerId,
                        sourceId: obj.id,
                        optional: firstDef?.minCount === 0 || firstDef?.optional,
                        actionType: ActionType.ModalSelection,
                        filterSelectable: true,
                        minChoices: (firstDef?.minCount === 'X' ? (obj.xValue || 0) : (typeof firstDef?.minCount === 'number' ? firstDef.minCount : 0)),
                        maxChoices: (firstDef?.count === 'X' ? (obj.xValue || 0) : (typeof firstDef?.count === 'number' ? firstDef.count : 1))
                    }
                );

                if (action && action.data) {
                    action.data.metadata = { ...action.data.metadata, abilityIndex };
                    action.data.isTargetingModal = true;
                }
                state.pendingAction = action;

                logger.info(state, LogCategory.ACTION, `Select target from graveyard for ${obj.definition.name}'s ability.`);
                return true;
            }

            state.pendingAction = {
                type: ActionType.Targeting,
                playerId,
                sourceId: obj.id,
                data: {
                    label: 'Select Target',
                    metadata: { abilityIndex },
                    targets: legalTargetIds,
                    optional: firstDef?.optional,
                    targetDefinitions: targetDefinitions,
                    maxCount,
                    minCount,
                    count
                }
            };
            state.priorityPlayerId = playerId;
            logger.info(state, LogCategory.ACTION, `Select target for ${obj.definition.name}'s ability.`);
            return true;
        }

        state.pendingAction = undefined;
        state.priorityPlayerId = playerId;
        return engine.activateAbility({
            playerId,
            cardId: obj.id,
            abilityIndex,
            bypassPriority: true,
            bypassTargeting: true
        });
    }

    private static handleModalSelection(
        state: GameState,
        playerId: PlayerId,
        sourceId: string,
        choice: ChoiceOption | null,
        choiceIndex: any,
        action: PendingAction,
        engine: EngineContext,
        payload?: ChoicePayload
    ): boolean {
        const { logger } = getProcessors(state);
        const actionData = action.data;
        const meta = getActionMeta(action);

        if (!actionData || !isModalData(actionData)) return false;
        const savedTargets = (meta.declaredTargets as string[]) || [];
        const costType = actionData.costType as string;

        const selections = payload?.selections || [choiceIndex];
        const firstSelection = selections[0];

        const isMultiSelect = action.type === ActionType.Discard || (meta.maxChoices && (meta.maxChoices as number) > 1);
        const isEmptyConfirm = (firstSelection === 'confirm' || firstSelection === 'done' || firstSelection === 'none') && isMultiSelect;

        if (!choice && firstSelection !== undefined && !isEmptyConfirm) {
            let idxStr = String(firstSelection);
            const idx = parseInt(idxStr.startsWith('CHOICE_') ? idxStr.substring(7) : idxStr);
            choice = actionData.choices?.[idx] || null;
        }

        if (!choice && !isEmptyConfirm && !meta.isManaChoiceToggle) return false;

        // Validate min choices for empty confirm
        if (isEmptyConfirm && (actionData.minChoices || 0) > 0) {
            logger.info(state, LogCategory.ACTION, `Cannot confirm: Minimum ${(actionData.minChoices || 0)} choices required.`);
            return false;
        }

        state.pendingAction = undefined;

        if (costType === 'Sacrifice') {
            const val = choice?.value as string;
            if (val) state.interaction.lastSelections['Sacrifice'] = [val];
        } else if (costType === 'Discard') {
            const val = choice?.value as string;
            if (val) state.interaction.lastSelections['Discard'] = [val];
        } else if (costType === 'TapSelection' || costType === 'Exile') {
            if (isMultiSelect) {
                const batchIds = selections.map(s => {
                    const str = s.toString();
                    if (str.startsWith('CHOICE_')) {
                        const idx = parseInt(str.substring(7));
                        return actionData.choices?.[idx]?.value as string;
                    }
                    if (!isNaN(parseInt(str)) && actionData.choices?.[parseInt(str)]) {
                        return actionData.choices?.[parseInt(str)]?.value as string;
                    }
                    return str;
                }).filter(v => v && v !== 'confirm' && v !== 'done' && v !== 'none');

                // Only update lastSelections if we have new IDs or if this isn't a control-only (confirm/done) payload.
                // This prevents 'confirm' signals from clearing selections just populated by Targeting finalization.
                const isControlOnly = selections.every(s => s === 'confirm' || s === 'done' || s === 'none');
                if (batchIds.length > 0 || !isControlOnly) {
                    logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Modal selection IDs for ${costType}: ${batchIds.join(', ')} (Max: ${meta.maxChoices})`);
                    state.interaction.lastSelections[costType] = batchIds;
                }
            } else {
                const val = choice?.value as string;
                if (val && val !== 'confirm' && val !== 'done' && val !== 'none') {
                    state.interaction.lastSelections[costType] = [val];
                }
            }
        } else if (payload?.params?.faceIndex !== undefined || (choice && String(choice.value).startsWith('FACE_SELECTION_'))) {
            const faceIdx = (payload?.params?.faceIndex !== undefined) ? payload.params.faceIndex : parseInt(String(choice?.value).substring(15));
            const card = RuleUtils.findObject(state, sourceId);
            if (card && 'selectedFaceDefinition' in card && card.definition.faces) {
                card.selectedFaceDefinition = card.definition.faces[faceIdx];
            }
        } else if ((payload?.params && payload.params.costChoiceId) || (choice && String(choice.value).startsWith('COST_CHOICE_'))) {
            const choiceIdx = (payload?.params && payload.params.costChoiceId) ? parseInt(payload.params.costChoiceId) : parseInt(String(choice?.value).substring(12));
            state.interaction.lastChoiceIndex = choiceIdx;
        } else if ((payload?.params && payload.params.modeIndices) || (choice && String(choice.value).startsWith('MODE_SELECTION_'))) {
            const modeIndices = (payload?.params && payload.params.modeIndices) || selections.map(s => {
                const str = s.toString();
                const i = parseInt(str.startsWith('CHOICE_') ? str.substring(7) : str);
                const val = actionData.choices?.[i]?.value;
                return typeof val === 'number' ? val : parseInt(String(val).substring(15));
            });
            state.interaction.lastChosenModeIndex = modeIndices;
        } else if (meta.isManaChoiceToggle) {
            if (state.interaction) {
                state.interaction.manaChoices = state.interaction.manaChoices || {};

                let selectionMap: Record<string, string> = {};
                try {
                    if (typeof firstSelection === 'string' && firstSelection.startsWith('{')) {
                        selectionMap = JSON.parse(firstSelection);
                    } else if (typeof firstSelection === 'object' && firstSelection !== null) {
                        selectionMap = firstSelection;
                    } else if (payload?.selections && payload.selections.length > 0) {
                        // If it's an array, we assume it matches hybridGroups order
                        const hGroups = meta.hybridGroups || [];
                        hGroups.forEach((group, idx) => {
                            if (payload.selections[idx] !== undefined) {
                                selectionMap[group.idx] = String(payload.selections[idx]);
                            }
                        });
                    }

                    const hybridGroups = meta.hybridGroups || [];
                    hybridGroups.forEach((group, index) => {
                        // The frontend usually sends the selection index as the key (0, 1, 2...)
                        // but we store it by the actual symbol index in the mana string.
                        const val = selectionMap[index] ?? selectionMap[String(index)] ?? selectionMap[group.idx];
                        if (val !== undefined) {
                            state.interaction!.manaChoices![group.idx] = String(val);
                        }
                    });
                    logger.info(state, LogCategory.ACTION, `[MANA-CHOICE] Assigned ${Object.keys(state.interaction!.manaChoices!).length}/${hybridGroups.length} hybrid choices.`);
                } catch (e) {
                    logger.error(state, LogCategory.ACTION, `[CHOICE-ERROR] Failed to parse mana choices: ${e}`);
                }
            }
        } else if (choice && String(choice.value).startsWith('CAST_MODE_')) {
            const mode = String(choice.value);
            const isFree = mode === 'CAST_MODE_FREE';
            const isFlashback = mode === 'CAST_MODE_FLASHBACK';

            logger.info(state, LogCategory.ACTION, `[CAST-MODE] User selected: ${mode}`);
            state.pendingAction = undefined;

            return getProcessors(state).spell.playCard(state, engine, {
                playerId,
                cardId: sourceId,
                targets: savedTargets,
                bypassPriority: true,
                isFreeCast: isFree,
                forceFlashback: isFlashback,
                isModeSelected: true,
                parentContext: meta.parentContext,
                exileOnResolution: meta.exileOnResolution,
                isMiracleCast: meta.isMiracleCast as boolean
            });
        } else {
            if (typeof firstSelection === 'number') state.interaction.lastChoiceIndex = firstSelection;
            else state.interaction.lastChoiceValue = firstSelection as string;
        }

        // --- HAND ACTION SELECTION REDIRECTION ---
        if (choice && String(choice.value) === 'PLAY_ACTION_SPELL') {
            logger.info(state, LogCategory.ACTION, `[HAND-CHOICE] User selected: Cast Spell.`);
            return getProcessors(state).spell.playCard(state, engine, {
                playerId,
                cardId: sourceId,
                targets: savedTargets,
                bypassPriority: true,
                isAbilitySelectionBypassed: true, // Avoid infinite loop
                isMiracleCast: meta.isMiracleCast as boolean
            });
        }

        if (choice && String(choice.value).startsWith('PLAY_ACTION_ABILITY_')) {
            const abilityIdx = parseInt(String(choice.value).substring(20));
            logger.info(state, LogCategory.ACTION, `[HAND-CHOICE] User selected: Activate Ability ${abilityIdx}.`);
            return getProcessors(state).spell.activateAbility(state, engine, {
                playerId,
                cardId: sourceId,
                abilityIndex: abilityIdx,
                targets: savedTargets,
                bypassPriority: true
            });
        }

        logger.info(state, LogCategory.ACTION, `Selected ${costType ? costType + ' item' : 'choice'}: ${choice?.label || 'none'}`);

        if (meta.abilityIndex !== undefined) {
            let targets = savedTargets;
            if (actionData.isTargetingModal) {
                const newTargets: string[] = [];
                selections.forEach((sel: string | number) => {
                    const i = typeof sel === 'number' ? sel : parseInt(String(sel).startsWith('CHOICE_') ? String(sel).substring(7) : String(sel));
                    const val = !isNaN(i) ? actionData.choices?.[i]?.value as string : (typeof sel === 'string' ? sel : undefined);
                    if (val && val.length > 20) newTargets.push(val);
                });
                targets = newTargets;
            }

            return getProcessors(state).spell.activateAbility(
                state,
                engine,
                {
                    playerId,
                    cardId: sourceId,
                    abilityIndex: meta.abilityIndex,
                    targets,
                    xValue: meta.xValue,
                    bypassPriority: true,
                    bypassTargeting: false,
                    parentContext: meta.parentContext,
                    isFreeCast: meta.isFreeCast,
                    exileOnResolution: meta.exileOnResolution
                }
            );
        }

        if (actionData.isCostChoice && (meta.stackObj || meta.effectIndex !== undefined)) {
            logger.info(state, LogCategory.ACTION, `[RESOLVING] Resuming resolution after interactive cost ${costType}...`);

            const costToPay = { type: actionData.costType, amount: meta.maxChoices, value: meta.maxChoices } as AbilityCost;
            getProcessors(state).cost.pay(state, [costToPay], sourceId, playerId);

            if (actionData.remainingCosts && (actionData.remainingCosts as AbilityCost[]).length > 0) {
                getProcessors(state).cost.pay(state, actionData.remainingCosts as AbilityCost[], sourceId, playerId);
            }

            if (meta.choiceEffects && (meta.choiceEffects as EffectDefinition[]).length > 0) {
                getProcessors(state).effect.resolveEffects({
                    state,
                    context: getProcessors(state).effect.createEngineFrame(state, {
                        sourceId,
                        effects: meta.choiceEffects as EffectDefinition[],
                        targets: savedTargets,
                        stackObject: meta.stackObj as StackObject,
                        parentContext: meta.parentContext as EngineFrame,
                        controllerIdOverride: playerId,
                        lookingCards: meta.lookingCards as GameObject[],
                    }),
                    skipFizzleCheck: true,
                });
            }

            const stackObj = meta.stackObj as StackObject;
            ResolutionManager.resume(state, engine, stackObj, sourceId, undefined, action);
            return true;

            this.finalizeResolution(state, sourceId, stackObj, action, engine);
            return true;
        }

        if (meta.confirmedAutoTap) {
            state.interaction.flags.confirmedAutoTap = true;
        }

        let finalTargets = savedTargets;
        if (actionData.isTargetingModal) {
            let newTargets: string[] = [];

            selections.forEach((sel: string | number) => {
                if (typeof sel === 'string' && sel.includes('|')) {
                    const ids = sel.split('|').map(s => {
                        const i = parseInt(s.startsWith('CHOICE_') ? s.substring(7) : s);
                        const val = actionData.choices?.[i]?.value as string;
                        return val && val.length > 20 ? val : undefined;
                    }).filter(v => v) as string[];
                    newTargets.push(...ids);
                } else {
                    const i = typeof sel === 'number' ? sel : parseInt(String(sel).startsWith('CHOICE_') ? String(sel).substring(7) : String(sel));
                    const val = !isNaN(i) ? actionData.choices?.[i]?.value as string : (typeof sel === 'string' ? sel : undefined);
                    if (val && val.length > 20) newTargets.push(val);
                }
            });

            finalTargets = [...savedTargets, ...newTargets];
            logger.info(state, LogCategory.ACTION, `[MODAL-TARGET-APPEND] Appended ${newTargets.length} modal targets to ${savedTargets.length} previous ones. Total: ${finalTargets.length}`);
        }

        const isTargeting = !!actionData.isTargetingModal;
        const isSpellCasting = meta.isSpellCasting;

        // Ensure cardToPlayId remains sourceId for modes/costs/targeting. 
        // Only use choice.value if it's a legitimate card selection (e.g. from a list of faces/cards) AND not a cost choice.
        const choiceValStr = choice?.value ? String(choice.value) : "";
        const isSystemValue = choiceValStr.startsWith('MODE_SELECTION_') || choiceValStr.startsWith('COST_CHOICE_') || choiceValStr.startsWith('FACE_SELECTION_');
        const isCostChoice = actionData.isCostChoice || !!actionData.costType;
        const cardToPlayId = (isSpellCasting && !isTargeting && !isSystemValue && !isCostChoice && choice?.value && typeof choice.value === 'string' && choice.value.length > 20) ? choice.value : sourceId;

        // If this is a copy being re-targeted at resolution time, we do NOT call playCard.
        // We just update the copy's targets and resume the parent resolution (the trigger).
        if (meta.isCopyTargeting) {
            const stackObj = (meta.spellCopyRef || meta.stackObj) as StackObject;
            if (stackObj) {
                StackProcessor.refreshTargetMetadata(state, stackObj, finalTargets);
                logger.info(state, LogCategory.ACTION, `[COPY-TARGETS] Updated targets for copy ${stackObj.id}: ${finalTargets.join(', ')}`);
            }
            if (meta.parentContext) {
                return ResolutionManager.resume(state, engine, meta.parentContext.stackObject, meta.parentContext.sourceId, meta.parentContext);
            }
            return ResolutionManager.resume(state, engine);
        }

        // ARCHITECTURAL NOTE: Metadata Propagation
        return getProcessors(state).spell.playCard(
            state,
            engine,
            {
                playerId,
                cardId: cardToPlayId,
                targets: finalTargets,
                xValue: meta.xValue as number,
                bypassPriority: true,
                bypassTargeting: false,
                parentContext: meta.parentContext as EngineFrame,
                isFreeCast: meta.isFreeCast as boolean,
                exileOnResolution: meta.exileOnResolution as boolean,
                isMiracleCast: meta.isMiracleCast as boolean
            }
        );
    }

    private static handleResolutionChoice(state: GameState, sourceId: string, choice: ChoiceOption, action: PendingAction, engine: EngineContext, payload: ChoicePayload): boolean {
        const { logger } = getProcessors(state);
        const actionData = action.data!;
        const meta = getActionMeta(action);
        const stackObj = meta.stackObj as StackObject;
        const parentTargets = (meta.targets || meta.parentContext?.targets || []) as string[];

        let targetsForResolution = parentTargets;
        const selections = payload.selections || [];

        if (selections.length > 0) {
            const newTargets = selections.map(sel => {
                const i = typeof sel === 'number' ? sel : parseInt(String(sel).startsWith('CHOICE_') ? String(sel).substring(7) : String(sel));
                const c = !isNaN(i) ? actionData.choices?.[i] : undefined;
                const val = c?.value ? String(c.value) : (typeof sel === 'string' ? sel : "");
                return val;
            }).filter(v => v.length > 20); // Filter for GUID-like IDs

            if (newTargets.length > 0) {
                targetsForResolution = [...newTargets, ...parentTargets];
            }
        }

        if (choice.costs && choice.costs.length > 0) {
            const costs = choice.costs as AbilityCost[];
            const sourceObj = RuleUtils.findObject(state, sourceId);

            if (!getProcessors(state).cost.canPay(state, costs, sourceId, action.playerId, stackObj)) {
                logger.info(state, LogCategory.ACTION, `Insufficient resources to select: ${choice.label}`);
                return false;
            }

            state.pendingAction = undefined;

            const interactiveCost = costs.find((c: AbilityCost) =>
                (c.type === 'TapSelection' && (!state.interaction.lastSelections['TapSelection'] || state.interaction.lastSelections['TapSelection'].length === 0)) ||
                (c.type === 'Discard' && (!state.interaction.lastSelections['Discard'] || state.interaction.lastSelections['Discard'].length === 0)) ||
                (c.type === 'Sacrifice' && (!state.interaction.lastSelections['Sacrifice'] || state.interaction.lastSelections['Sacrifice'].length === 0) && !ChoiceProcessor.isSelfSac(c, sourceId)) ||
                (c.type === 'Exile' && (!state.interaction.lastSelections['Exile'] || state.interaction.lastSelections['Exile'].length === 0))
            );

            if (interactiveCost) {
                logger.info(state, LogCategory.ACTION, `[CHOICE-COST] Prompting for interactive cost: ${interactiveCost.type}`);
                // Clear any stale interaction data for this cost type before prompting
                delete state.interaction.lastSelections[interactiveCost.type];

                state.pendingAction = getProcessors(state).choiceGenerator.createCostInteractionChoice(state, interactiveCost, sourceId, action.playerId, choice, actionData);
                return true;
            }

            const alreadyChosen = meta.xValueConfirmed === true;
            const needsX = costs.some((c: AbilityCost) => {
                const isManaCost = c.type === 'Mana';
                // Check if the mana string or the numeric value contains X
                const val = 'value' in c ? String(c.value) : "";
                const hasX = val.includes('{X}') || val.includes('X');

                return isManaCost && hasX && !alreadyChosen;
            });


            if (needsX && !alreadyChosen) {
                logger.info(state, LogCategory.ACTION, `[CHOOSE_X] Prompting for X value for resolution cost...`);
                state.pendingAction = getProcessors(state).choiceGenerator.createXChoice(state, sourceId, action.playerId, choice, actionData);
                return true;
            }

            getProcessors(state).cost.pay(state, costs, sourceId, action.playerId);

            state.interaction = {
                lastSelections: {},
                lastChoiceIndex: undefined,
                lastChoiceValue: undefined,
                lastChosenModeIndex: undefined,
                lastChoiceX: undefined,
                flags: {}
            };
        }

        state.pendingAction = undefined;

        if (choice.effects && choice.effects.length > 0) {
            logger.info(state, LogCategory.ACTION, `[CHOICE-DEBUG] Resolving ${choice.effects.length} effects for selection: ${choice.label}. SourceId: ${sourceId}`);
            const resolved = getProcessors(state).effect.resolveEffects({
                state,
                context: getProcessors(state).effect.createEngineFrame(state, {
                    sourceId,
                    effects: choice.effects,
                    targets: targetsForResolution,
                    stackObject: stackObj,
                    parentContext: meta.parentContext as EngineFrame,
                    controllerIdOverride: action.playerId,
                    lookingCards: meta.lookingCards as GameObject[],
                    lastMilledIds: meta.parentContext?.lastMilledIds,
                    lastDiscardedIds: meta.parentContext?.lastDiscardedIds,
                    effectIndex: 0,
                    isResumption: false,
                }),
                skipFizzleCheck: true,
            });

            if (!resolved) {
                logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Resolution suspended within choice effects. Waiting.`);
                return false;
            }
        }

        return this.finalizeResolution(state, sourceId, stackObj, action, engine);
    }

    private static finalizeResolution(state: GameState, sourceId: string, stackObj: StackObject | undefined, action: PendingAction, engine: EngineContext): boolean {
        const { logger } = getProcessors(state);
        const actionData = action.data!;
        const meta = getActionMeta(action);
        // 1. Process Choice Queue (highest priority)
        if (!state.pendingAction && state.choiceQueue && state.choiceQueue.length > 0) {
            const nextItem = state.choiceQueue.shift()!;
            if (nextItem.type === 'RESOLUTION_CHOICE' && nextItem.data?.choices && !nextItem.data.lookingCards) {
                const choices = (nextItem.data.choices as ChoiceOption[]).map((c: ChoiceOption) => ({ label: c.label, value: c.value, costs: c.costs, effects: c.effects }));
                state.pendingAction = getProcessors(state).action.prepareAction(state, {
                    type: nextItem.type,
                    playerId: nextItem.playerId,
                    sourceId: nextItem.sourceId,
                    data: {
                        ...nextItem.data,
                        choices
                    }
                });
                if (state.pendingAction && state.pendingAction.data) {
                    state.pendingAction.data.nextPlayerIds = nextItem.data.nextPlayerIds;
                }
            } else if (nextItem.data?.isSacrificeSequence) {
                const { effect: EP } = getProcessors(state);
                const PermanentHandler = EP.getEffectHandler(EffectType.Sacrifice) as any;
                const realEffect = nextItem.data.parentContext?.effects?.[nextItem.data.parentContext?.effectIndex];
                PermanentHandler.handleSacrifice(state, realEffect || { label: nextItem.data.label }, {
                    sourceId: nextItem.sourceId,
                    controllerId: nextItem.playerId,
                    targets: [nextItem.playerId, ...nextItem.data.nextPlayerIds],
                    stackObject: nextItem.data.stackObj,
                    parentContext: nextItem.data.parentContext
                });
            } else if (nextItem.data?.isChoiceSequence) {
                const { effect: EP } = getProcessors(state);
                const ChoiceEffectHandler = EP.getEffectHandler(EffectType.Choice) as any;
                ChoiceEffectHandler.handleChoice(state, nextItem.data.sequencedEffect, {
                    sourceId: nextItem.sourceId,
                    controllerId: nextItem.playerId,
                    targets: [nextItem.playerId, ...nextItem.data.nextPlayerIds],
                    stackObject: nextItem.data.stackObj,
                    parentContext: nextItem.data.parentContext
                });
            } else {
                state.pendingAction = getProcessors(state).choiceGenerator.createDiscardChoice(
                    state,
                    [nextItem.playerId, ...nextItem.data.nextPlayerIds],
                    nextItem.sourceId,
                    nextItem.data.discardAmount || 1,
                    nextItem.data.label || "Discard",
                    nextItem.data.stackObj,
                    nextItem.data.parentContext,
                    nextItem.data.onFailureEffects,
                );
            }
            return true;
        }

        // 2. ENQUEUE NEXT PLAYERS
        if (this.processNextPlayerHandOff(state, engine, action, meta)) {
            return true;
        }

        // 3. Resume/Finalize Resolution
        if (!state.pendingAction) {
            logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] No pending action after choice. Resuming via ResolutionManager.`);
            return ResolutionManager.resume(state, engine, stackObj, sourceId, {
                ...meta.parentContext,
                effectIndex: (meta.effectIndex !== undefined) ? meta.effectIndex + 1 : undefined,
                targets: []
            }, action);
        }

        return true;
    }

    public static resolveTargeting(
        state: GameState,
        playerId: PlayerId,
        targetId: string,
        engine: EngineContext
    ): boolean {
        return getProcessors(state).targeting.resolveInteractiveTargeting(state, playerId, targetId, engine);
    }

    private static handleXChoice(state: GameState, playerId: string, action: PendingAction, payload: ChoicePayload, engine: EngineContext): boolean {
        const { logger } = getProcessors(state);
        if (!action.data || !isXChoiceData(action.data)) return false;
        const actionData = action.data;
        const meta = getActionMeta(action);
        let x = payload.params?.xValue ?? 0;

        if (payload.params?.xValue === undefined) {
            const firstSelection = payload.selections[0];
            if (typeof firstSelection === 'number') x = firstSelection;
            else if (typeof firstSelection === 'string') x = parseInt(firstSelection);
        }

        const oldAction = state.pendingAction;
        state.pendingAction = undefined;

        const sourceId = action.sourceId!;
        const card = RuleUtils.findObject(state, sourceId);
        if (!card) {
            logger.info(state, LogCategory.ACTION, `[CHOOSE_X] Error: Could not find card for sourceId ${sourceId}`);
            state.pendingAction = oldAction;
            return false;
        }

        const cardName = RuleUtils.isEntity(card) ? card.definition.name : "Source";
        logger.info(state, LogCategory.ACTION, `[CHOICE-DEBUG] ${state.players[playerId].name} chose X = ${x} for ${cardName} (SourceId: ${sourceId}).`);

        if (RuleUtils.isEntity(card)) {
            card.xValue = x;
            logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Set xValue=${x} on ${card.id}.`);

            // CRITICAL: Also propagate to the stack object if this is a triggered/activated ability resolution.
            // Effects like MoveCounters look at the stackObj.xValue during resolveAmount('X').
            if (meta.stackObj && meta.stackObj.id !== card.id) {
                meta.stackObj.xValue = x;
                logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Also set xValue=${x} on stack object ${meta.stackObj.id}.`);
            }
        }


        if (meta.isResolutionX) {
            // Mark as confirmed in the original action data so we don't re-prompt
            if (actionData.originalActionData) {
                if (!actionData.originalActionData.metadata) {
                    actionData.originalActionData.metadata = {};
                }
                actionData.originalActionData.metadata.xValueConfirmed = true;
                actionData.originalActionData.metadata.xValue = x;

                // Also ensure the stack object in the original metadata gets the update
                if (actionData.originalActionData.metadata.stackObj) {
                    actionData.originalActionData.metadata.stackObj.xValue = x;
                }
            }

            // Resume resolution choice with the chosen X
            return ChoiceProcessor.handleResolutionChoice(
                state,
                action.sourceId!,
                actionData.selectedChoice,
                { ...action, data: actionData.originalActionData },
                engine,
                payload
            );
        }

        const abilityIndex = meta.abilityIndex;
        let success = false;

        logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Proceeding with ${abilityIndex !== undefined ? 'ability activation' : 'spell play'}. AbilityIndex: ${abilityIndex}`);

        if (abilityIndex !== undefined) {
            success = getProcessors(state).spell.activateAbility(
                state,
                engine,
                {
                    playerId,
                    cardId: sourceId,
                    abilityIndex,
                    targets: meta.declaredTargets || [],
                    xValue: x,
                    bypassPriority: true,
                    bypassTargeting: false,
                    parentContext: meta.parentContext as EngineFrame,
                    isFreeCast: meta.isFreeCast as boolean,
                    exileOnResolution: meta.exileOnResolution as boolean
                }
            );
        } else {
            success = getProcessors(state).spell.playCard(
                state,
                engine,
                {
                    playerId,
                    cardId: sourceId,
                    targets: meta.declaredTargets || [],
                    xValue: x,
                    bypassPriority: true,
                    bypassTargeting: false,
                    parentContext: meta.parentContext as EngineFrame,
                    isFreeCast: meta.isFreeCast as boolean,
                    exileOnResolution: meta.exileOnResolution as boolean
                }
            );
        }

        if (success === false) {
            logger.info(state, LogCategory.ACTION, `[CHOICE-ERROR] Action failed for ${cardName || 'Unknown'}. Clearing pending action to break potential loop.`);
            const card = RuleUtils.findObject(state, sourceId);
            if (RuleUtils.isEntity(card)) card.xValue = undefined;
            // BREAK LOOP: Do not restore oldAction if it's a modal selection that just failed
            state.pendingAction = undefined;
        }
        return success;
    }


    private static isSelfSac(cost: AbilityCost, sourceId: string): boolean {
        if (cost.type !== 'Sacrifice') return false;
        if (cost.restrictions && cost.restrictions.some(r => {
            if (typeof r === 'string') return r === 'Self';
            return r.type === 'Self' || (r.type === 'ObjectId' && r.value === sourceId);
        })) return true;
        return false;
    }

    private static processNextPlayerHandOff(state: GameState, engine: EngineContext, action: PendingAction, meta: InteractionMetadata): boolean {
        if (state.pendingAction) return false;

        const nextPlayerIds = meta.nextPlayerIds || [];
        if (nextPlayerIds.length === 0) return false;

        const sourceId = action.sourceId || "";
        const actionData = action.data!;

        if (meta.isSacrificeSequence) {
            const effect = meta.parentContext?.effects?.[meta.effectIndex ?? 0];
            PermanentHandler.handleSacrifice(state, effect || { label: actionData.label || "Sacrifice" }, {
                ...meta.parentContext,
                targets: nextPlayerIds,
                effectIndex: meta.effectIndex,
                effects: meta.effects
            });
        } else if (meta.isDiscardSequence || action.type === ActionType.Discard) {
            const discardAmount = meta.discardAmount || 1;
            const failureEffects = meta.onFailureEffects;
            state.pendingAction = ChoiceGenerator.createDiscardChoice(state, nextPlayerIds, sourceId as string, discardAmount, actionData.label || "Discard", meta.stackObj, meta.parentContext, failureEffects);
            if (state.pendingAction && state.pendingAction.data) {
                state.pendingAction.data.isDiscardSequence = true;
                state.pendingAction.data.effectIndex = meta.effectIndex;
                state.pendingAction.data.metadata = {
                    ...state.pendingAction.data.metadata,
                    isDiscardSequence: true,
                    effects: meta.effects,
                    effectIndex: meta.effectIndex,
                    parentContext: meta.parentContext
                };
            }
        } else {
            // Fallback to resume if no known sequence is detected
            getProcessors(state).logger.warn(state, LogCategory.ACTION, `[CHOICE-HANDOFF] Unknown sequence type for ${sourceId}. Resuming parent context.`);
            ResolutionManager.resume(state, engine, undefined, undefined, {
                ...meta.parentContext,
                targets: [],
                effectIndex: meta.effectIndex
            }, action);
        }

        return !!state.pendingAction;
    }
}


