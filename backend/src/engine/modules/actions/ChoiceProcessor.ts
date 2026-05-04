import { AbilityCost, AbilityDefinition, AbilityType, ActionType, ChoiceOption, ChoicePayload, EffectDefinition, EffectType, GameObject, GameState, PendingAction, PlayerId, ResolutionContext, StackObject, TargetType, Zone } from '@shared/engine_types';
import { LogCategory } from '../../utils/EngineLogger';
import { EngineContext } from '../../interfaces/EngineContext';
import { oracle } from '../../OracleLogicMap';
import { ChoiceGenerator } from '../effects/ChoiceGenerator';
import { EffectProcessor } from '../effects/EffectProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { ActionProcessor } from './ActionProcessor';
import { PlayerActionProcessor } from './PlayerActionProcessor';
import { SpellProcessor } from './spells/SpellProcessor';
import { TargetingProcessor } from './targeting/TargetingProcessor';
import { RuleUtils } from "../../utils/RuleUtils";
import { getProcessors } from '../ProcessorRegistry';

/**
 * Handles interactive player choices (Targeting, Modal Choices)
 */
export class ChoiceProcessor {

    public static normalizePayload(input: number | string | ChoicePayload): ChoicePayload {
        if (typeof input === 'object' && input !== null) {
            return input;
        }
        if (typeof input === 'number') {
            return { index: input };
        }
        if (typeof input === 'string') {
            if (input === 'undo' || input === 'none') return { value: input };
            if (input.startsWith('{')) {
                try {
                    return JSON.parse(input);
                } catch (e) {
                    console.error("[CHOICE-ERROR] Failed to parse raw JSON payload:", e);
                }
            }
            if (input.includes('|')) {
                return { indices: input.split('|').map(s => parseInt(s.replace('CHOICE_', ''))) };
            }
            if (input.startsWith('CHOICE_')) {
                const raw = input.replace('CHOICE_', '');
                if (raw.startsWith('{')) {
                    try {
                        return JSON.parse(raw);
                    } catch (e) {
                        console.error("[CHOICE-ERROR] Failed to parse complex payload:", e);
                    }
                }
                return { index: parseInt(raw) };
            }
            // Check if it's a number string
            if (!isNaN(parseInt(input))) {
                return { index: parseInt(input) };
            }
            return { value: input };
        }
        return {};
    }

    public static resolveChoice(
        state: GameState,
        playerId: PlayerId,
        choiceInput: number | string | ChoicePayload,
        engine: EngineContext
    ): boolean {
        const { logger } = getProcessors(state);
        const action = state.pendingAction;
        if (!action) return false;

        if (action.playerId !== playerId) {
            logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] resolveChoice failed: Player ID mismatch. Expected ${action.playerId}, got ${playerId}.`);
            return false;
        }

        const payload = this.normalizePayload(choiceInput);
        let choiceIndex = payload.index !== undefined ? payload.index : payload.value;

        // If payload has indices (multi-select), join them into a string choiceIndex for compatibility
        if (choiceIndex === undefined && payload.indices && payload.indices.length > 0) {
            choiceIndex = payload.indices.map(i => `CHOICE_${i}`).join('|');
        }

        logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Resolving ${action.type} for ${playerId}. Index/Value: ${choiceIndex}`);

        const isModal = action.type === ActionType.ModalSelection;
        const isLegendRule = action.type === ActionType.LegendRule;
        const isResolution = action.type === ActionType.ResolutionChoice || action.type === ActionType.OptionalAction || action.type === ActionType.Choice || isLegendRule || action.type === ActionType.Discard;
        const isScry = action.type === ActionType.Scry || action.type === ActionType.Surveil;
        const isChoosingX = action.type === ActionType.ChooseX;
        const isOrderTriggers = action.type === ActionType.OrderTriggers;

        if (!isModal && !isResolution && !isScry && !isChoosingX && !isOrderTriggers) return false;

        if (isOrderTriggers) {
            let order: string[] = [];
            if (payload.values) order = payload.values;
            else if (payload.indices) order = payload.indices.map(i => i.toString());
            else if (typeof choiceInput === 'string') order = choiceInput.split('|').map(s => s.replace('CHOICE_', ''));

            return PlayerActionProcessor.resolveTriggerOrdering(state, playerId, order);
        }

        // Handle "Back/Undo"
        if (payload.value === 'undo' || payload.index === -1) {
            return this.handleUndo(state, playerId, action);
        }

        if (isChoosingX) {
            return this.handleXChoice(state, playerId, action, payload, engine);
        }

        // Handle multi-choice (batch selection) separated by '|' OR empty selection via 'confirm'/'done'
        const isMultiSelectAction = action.type === ActionType.Discard || action.data?.maxChoices > 1;
        const isEmptyConfirm = (choiceIndex === 'confirm' || choiceIndex === 'done' || choiceIndex === 'none') && isMultiSelectAction;

        if ((typeof choiceIndex === 'string' && choiceIndex.includes('|')) || isEmptyConfirm) {
            // If it's a cost choice, spell casting mode selection, OR a targeting modal, we go through handleModalSelection
            if (action.data?.isCostChoice || action.data?.isSpellCasting || action.data?.isTargetingModal) {
                return this.handleModalSelection(state, playerId, action.sourceId as string, null, choiceIndex as string, action, engine);
            }
            const indices = (typeof choiceIndex === 'string' && choiceIndex.includes('|')) 
                ? choiceIndex.split('|').map(s => {
                    const raw = s.startsWith('CHOICE_') ? s.substring(7) : s;
                    return parseInt(raw);
                })
                : [];
            
            // Validate min choices for empty confirm
            if (isEmptyConfirm && (action.data?.minChoices || 0) > 0) {
                logger.info(state, LogCategory.ACTION, `Cannot confirm: Minimum ${(action.data?.minChoices || 0)} choices required.`);
                return false;
            }
            const sourceId = action.sourceId;
            const allEffects: EffectDefinition[] = [];
            let finalChoice: ChoiceOption | null = null;
            let currentTargetOffset = 0;
            indices.forEach(idx => {
                const choice = action.data?.choices?.[idx];
                if (choice) {
                    if (choice.effects) {
                        // Deep clone and inject targetOffset
                        const choiceEffects = JSON.parse(JSON.stringify(choice.effects)).map((e: any) => ({
                            ...e,
                            targetOffset: currentTargetOffset
                        }));
                        allEffects.push(...choiceEffects);
                    }

                    if (choice.targetDefinitions) {
                        const { targeting: TP } = getProcessors(state);
                        const counts = TP.calculateTotalCounts(choice.targetDefinitions, action.data?.xValue || 0);
                        currentTargetOffset += counts.maxCount;
                    }
                    finalChoice = choice; // Use metadata from the last one if needed
                }
            });

            if (allEffects.length === 0 && !finalChoice && !isEmptyConfirm) return false;

            state.pendingAction = undefined; // Clear modal before resolving effects

            // Resolve all effects in the batch
            if (allEffects.length > 0) {
                const discardEffects = allEffects.filter(e => e.type === EffectType.MoveToZone && e.isDiscard);
                if (discardEffects.length > 0) {
                    state.turnState.lastDiscardedCount = discardEffects.length;
                    state.turnState.lastDiscardedIds = [];
                    logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Reset lastDiscardedIds for new batch of ${discardEffects.length} discards.`);
                }
                EffectProcessor.resolveEffects({
                    state,
                    effects: allEffects,
                    sourceId: sourceId as string,
                    targets: [],
                    startIndex: 0,
                    stackObject: action.data?.stackObj,
                    parentContext: action.data?.parentContext,
                    lookingCards: action.data?.lookingCards as GameObject[],
                });
                logger.info(state, LogCategory.ACTION, `[CHOICE-DEBUG] Batch resolution finished. lastDiscardedIds: ${state.turnState.lastDiscardedIds?.length || 0}`);
            }

            // After batch is done, check if we need to move to the next player (for DiscardCards)
            const nextPlayerIds = action.data?.nextPlayerIds || action.data?.stackObj?.data?.nextPlayerIds || [];
            if (!state.pendingAction && nextPlayerIds.length > 0) {
                const discardAmount = action.data?.discardAmount || action.data?.stackObj?.data?.discardAmount || 1;
                const failureEffects = action.data?.onFailureEffects || action.data?.stackObj?.data?.onFailureEffects;
                state.pendingAction = ChoiceGenerator.createDiscardChoice(state, nextPlayerIds, sourceId as string, discardAmount, action.data?.label || "Discard", action.data?.stackObj, action.data?.parentContext, failureEffects);
            }

            // Resume whatever was happening
            return this.resumeResolution(state, sourceId as string, action.data?.stackObj as StackObject, action.data?.parentContext as ResolutionContext, engine);
        }

        // 3. Handle Scry/Surveil Reordering early as payload is not an index
        if (action.type === ActionType.Scry || action.type === ActionType.Surveil) {
            return this.handleScrySurveil(state, playerId, action, payload, engine);
        }

        const rawIdx = typeof choiceIndex === 'string' && choiceIndex.startsWith('CHOICE_') ? choiceIndex.substring(7) : choiceIndex;
        const idx = typeof rawIdx === 'string' ? parseInt(rawIdx) : rawIdx;

        // Handle Legend Rule Choice
        if (action.type === ActionType.LegendRule) {
            let choice = idx !== undefined ? action.data?.choices?.[idx as number] : undefined;
            if (!choice && typeof choiceIndex === 'string') {
                choice = action.data?.choices?.find((c: ChoiceOption) => c.value === choiceIndex);
            }
            const keepId = choice?.value as string;
            const involvedIds = (action.data?.involvedIds as string[]) || [];
            const discardIds = involvedIds.filter((id) => id !== keepId);

            logger.info(state, LogCategory.ACTION, `[LEGEND-RULE] Player chose index ${idx} or ID ${choiceIndex} (Keep: ${keepId}). Involved: ${involvedIds.join(', ')}`);

            discardIds.forEach((id) => {
                const obj = state.battlefield.find(o => o.id === id);
                if (obj) {
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId);
                }
            });

            state.pendingAction = undefined;
            return true;
        }

        const sourceId = action.sourceId as string;
        const choice = idx !== undefined ? action.data?.choices?.[idx as number] : undefined;

        if (!choice || !sourceId) return false;

        // 1. Handle Selection of Abilities (Planeswalkers/Modal costs in battlefield)
        const obj = state.battlefield.find(o => o.id === sourceId);
        if (obj && isModal && !action.data?.isCostChoice) {
            return this.handleBattlefieldAbilityActivation(state, playerId, obj, choice, engine);
        }

        // 2. Handle Casting-Phase Choices (Modes, Additional Costs)
        // If it's a resolution-phase choice (Cascade, etc.), we fall through to handleResolutionChoice
        if ((isModal || action.data?.isSpellCasting || action.data?.isCostChoice) && !isResolution) {
            return this.handleModalSelection(state, playerId, sourceId, choice, choiceIndex, action, engine);
        }

        // 4. Handle Resolution-Phase Choices (Effects, Search, Scry, May)
        return this.handleResolutionChoice(state, sourceId, choice, action, engine);
    }

    private static handleScrySurveil(
        state: GameState,
        playerId: PlayerId,
        action: PendingAction,
        payload: ChoicePayload | string,
        engine: EngineContext
    ): boolean {
        const { logger } = getProcessors(state);
        const { top = [], bottom = [], graveyard = [] } = (typeof payload === 'string' ? JSON.parse(payload) : payload) as { top?: string[], bottom?: string[], graveyard?: string[] };

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
        const cards = (action.data?.lookingCards || []) as GameObject[];

        // 3. Move cards to Bottom (Scry) or Graveyard (Surveil)
        bottom.forEach((id) => {
            const card = cards.find((c) => c.id === id);
            if (card) {
                ActionProcessor.moveCard(state, card, Zone.Library, playerId, 'bottom');
            }
        });

        graveyard.forEach((id) => {
            const card = cards.find((c) => c.id === id);
            if (card) {
                ActionProcessor.moveCard(state, card, Zone.Graveyard, playerId);
            }
        });

        // 4. Move cards to Top (Reverse order to maintain stack order)
        [...top].reverse().forEach((id) => {
            const card = cards.find((c) => c.id === id);
            if (card) {
                ActionProcessor.moveCard(state, card, Zone.Library, playerId, 'top');
            }
        });

        // 5. Cleanup
        const stackObj = action.data?.stackObj as StackObject;
        state.pendingAction = undefined;

        // 6. Resume resolution if needed
        if (stackObj) {
            logger.info(state, LogCategory.ACTION, `[RESOLVING] Resuming resolution after ${action.type}...`);
            return this.resumeResolution(state, action.sourceId!, stackObj, action.data?.parentContext as ResolutionContext, engine);
        }

        engine.resetPriorityToActivePlayer();
        return true;
    }

    public static resumeResolution(state: GameState, sourceId: string, stackObj: StackObject, parentContext: ResolutionContext, engine: EngineContext): boolean {
        const { logger } = getProcessors(state);
        let currentCtx: ResolutionContext | undefined = { ...parentContext, stackObject: stackObj }; // Wrap to start resuming

        // Then resume parent contexts
        while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex !== undefined && currentCtx.nextEffectIndex < currentCtx.effects.length) {
            logger.info(state, LogCategory.ACTION, `[RESOLVING] Resuming parent resolution context for ${sourceId}...`);
            const nextIdx = currentCtx.nextEffectIndex;
            const effs = currentCtx.effects;
            const parentTargets = currentCtx.targets || [];
            const lookingCards = currentCtx.lookingCards;
            const nextParentCtx: ResolutionContext | undefined = currentCtx.parentContext;

            currentCtx = nextParentCtx;
            const completed = EffectProcessor.resolveEffects({
                state,
                effects: effs,
                sourceId,
                targets: parentTargets,
                startIndex: nextIdx,
                stackObject: stackObj,
                parentContext: nextParentCtx,
                lookingCards: lookingCards,
            });

            if (stackObj && !completed && (state as GameState).pendingAction) {
                (stackObj as any).data = { ...(stackObj as any).data, nextEffectIndex: (state as GameState).pendingAction?.data?.nextEffectIndex };
            }
        }

        if (!state.pendingAction) {
            if (stackObj) {
                const fullStackObj = state.stack.find(s => s.id === stackObj.id);
                if (fullStackObj) {
                    if (fullStackObj.type === 'Spell' && fullStackObj.card) {
                        const card = fullStackObj.card;
                        const isPermanent = RuleUtils.isPermanent(card);

                        if (card.zone === Zone.Stack) {
                            const freshDef = oracle.getCard(card.definition.name);
                            const shouldExile = fullStackObj.exileOnResolution || (fullStackObj as any).isCopy || (card as any).isPreparedCopy || freshDef?.exileOnResolution;

                            if (shouldExile) {
                                logger.info(state, LogCategory.ACTION, `[RULE 701.5] ${card.definition.name} was exiled instead of being put into graveyard.`);
                                ActionProcessor.removeFromCurrentZone(state, card);
                                if (!(fullStackObj as any).isCopy) {
                                    ActionProcessor.moveCard(state, card, Zone.Exile, card.ownerId);
                                }
                            } else if (isPermanent) {
                                ActionProcessor.moveCard(state, card, Zone.Battlefield, fullStackObj.controllerId);
                            } else {
                                ActionProcessor.moveCard(state, card, Zone.Graveyard, card.ownerId);
                            }
                        }
                    } else {
                        // Clean up ability/trigger
                        ActionProcessor.removeFromCurrentZone(state, { id: fullStackObj.id, zone: Zone.Stack } as GameObject);
                    }
                    logger.info(state, LogCategory.ACTION, `[STACK] Completed resolution of ${stackObj.type} for ${sourceId}.`);

                    // --- KEYWORD HOOK: ON RESOLUTION ---
                    if (fullStackObj.type === AbilityType.Spell) {
                        const { trigger: TriggerProcessor } = getProcessors(state);
                        logger.info(state, LogCategory.ACTION, `[CHOICE-DEBUG] Firing ON_RESOLVE_SPELL for ${fullStackObj.card?.definition.name}`);
                        TriggerProcessor.onEvent(state, {
                            type: 'ON_RESOLVE_SPELL',
                            playerId: fullStackObj.controllerId,
                            payload: { card: fullStackObj.card, sourceId: fullStackObj.sourceId }
                        });
                    }
                }
            }
            engine.resetPriorityToActivePlayer();
        } else {
            state.priorityPlayerId = state.pendingAction.playerId || null;
        }
        return true;
    }

    private static handleUndo(state: GameState, playerId: PlayerId, action: PendingAction): boolean {
        const { logger } = getProcessors(state);
        if (action.data?.hideUndo || action.type === ActionType.ResolutionChoice) {
            logger.info(state, LogCategory.ACTION, `Undo not available for this mandatory action.`);
            return false;
        }

        const sourceId = action.sourceId!;
        const savedActionData = action.data;

        // A. Revert Battlefield source (Activated Ability/Planeswalker)
        const objOnBattlefield = state.battlefield.find(o => o.id === sourceId);
        if (objOnBattlefield) {
            const abilityIndex = savedActionData?.abilityIndex as number;
            if (objOnBattlefield.abilitiesUsedThisTurn > 0 && abilityIndex !== undefined) {
                objOnBattlefield.abilitiesUsedThisTurn--;

                // Refund Loyalty
                const logic = oracle.getCard(objOnBattlefield.definition.name);
                const ability = (logic?.abilities as AbilityDefinition[])?.[abilityIndex];
                const lCost = ability?.costs?.find((c: AbilityCost) => c.type === 'Loyalty')?.value as number;
                if (lCost !== undefined) {
                    objOnBattlefield.counters['loyalty'] = (objOnBattlefield.counters['loyalty'] || 0) - lCost;
                    logger.info(state, LogCategory.ACTION, `Refunded loyalty for ${objOnBattlefield.definition.name}: ${lCost > 0 ? '+' : ''}${lCost}`);
                }
            }
        }

        // B. Revert Stack source (Putting a spell back in hand)
        const stackObj = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
        if (stackObj && stackObj.card) {
            const card = stackObj.card;
            const player = state.players[card.ownerId];
            if (player) {
                const refundCost = card.definition.manaCost;
                card.xValue = undefined; // Explicitly clear
                ActionProcessor.moveCard(state, card, Zone.Hand, card.ownerId);

                const { mana: ManaProcessor } = getProcessors(state);
                ManaProcessor.refundManaCost(player, refundCost);
                logger.info(state, LogCategory.ACTION, `Undo Choice: ${card.definition.name} returned to hand.`);
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
        if (savedActionData?.tappedLandIds && Array.isArray(savedActionData.tappedLandIds)) {
            ManaProcessor.untapLands(state, savedActionData.tappedLandIds);

            if (player && savedActionData.manaSnapshot) {
                player.manaPool = savedActionData.manaSnapshot;
                player.restrictedMana = savedActionData.restrictedSnapshot || [];
                logger.info(state, LogCategory.ACTION, `Undo: Untapped ${savedActionData.tappedLandIds.length} lands and restored mana pool.`);
            } else if (player && savedActionData.producedMana) {
                const pm = savedActionData.producedMana as Record<string, number>;
                Object.entries(pm).forEach(([color, amount]) => {
                    if (amount > 0) {
                        player.manaPool[color as keyof typeof player.manaPool] -= amount;
                    }
                });
                logger.info(state, LogCategory.ACTION, `Undo: Untapped ${savedActionData.tappedLandIds.length} lands and cleared auto-tapped mana.`);
            } else if (player && savedActionData.totalMana) {
                ManaProcessor.refundManaCost(player, savedActionData.totalMana as string);
                logger.info(state, LogCategory.ACTION, `Undo: Untapped ${savedActionData.tappedLandIds.length} lands and refunded mana.`);
            }
        }

        logger.info(state, LogCategory.ACTION, `Action cancelled.`);
        state.pendingAction = undefined;
        state.priorityPlayerId = playerId;

        // CLEANUP TEMPORARY CASTING STATE
        state.interaction = {
            lastChosenCostChoiceIndex: undefined,
            lastChosenSacrificeId: undefined,
            lastChosenDiscardId: undefined,
            lastChosenTapSelectionIds: undefined,
            lastChosenExileIds: undefined,
            lastChosenModeIndex: undefined,
            lastChoiceIndex: undefined
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
        const logic = oracle.getCard(obj.definition.name);
        const ability = (logic?.abilities as AbilityDefinition[])?.[abilityIndex];

        if (!ability) return false;

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
            const { maxCount, minCount, count } = TargetingProcessor.calculateTotalCounts(targetDefinitions, obj.xValue || 0);
            const legalTargetIds = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                sourceId: obj.id,
                controllerId: obj.controllerId,
                targetDefinitions
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
                    legalTargetIds.map((id) => RuleUtils.findObject(state, id)!),
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
                    action.data.abilityIndex = abilityIndex;
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
                    abilityIndex,
                    targets: legalTargetIds,
                    optional: firstDef?.optional,
                    targetDefinitions: targetDefinitions,
                    maxCount: (maxCount as any),
                    minCount: (minCount as any),
                    count: (count as any)
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

    private static handleModalSelection(state: GameState, playerId: PlayerId, sourceId: string, choice: ChoiceOption | null, choiceIndex: any, action: PendingAction, engine: EngineContext): boolean {
        const { logger } = getProcessors(state);
        const savedTargets = (action.data?.declaredTargets as string[]) || [];
        const costType = action.data?.costType as string;
        logger.info(state, LogCategory.ACTION, `[DEBUG] handleModalSelection: costType=${costType}, choiceIndex=${choiceIndex}, choiceValue=${choice?.value}`);

        const isMultiSelect = action.type === ActionType.Discard || (action.data?.maxChoices && (action.data.maxChoices as number) > 1);
        const isEmptyConfirm = (choiceIndex === 'confirm' || choiceIndex === 'done' || choiceIndex === 'none') && isMultiSelect;
        
        if (!choice && choiceIndex !== undefined && !isEmptyConfirm) {
            let idxStr = String(choiceIndex);
            if (idxStr.includes('|')) idxStr = idxStr.split('|')[0];
            const idx = parseInt(idxStr.startsWith('CHOICE_') ? idxStr.substring(7) : idxStr);
            choice = action.data?.choices?.[idx] || null;
            logger.debug(state, LogCategory.ACTION, `[DEBUG] handleModalSelection: resolved choice from idx ${idx}: ${choice?.label} (${choice?.value})`);
        }

        if (!choice && !isEmptyConfirm) return false;

        // Validate min choices for empty confirm
        if (isEmptyConfirm && (action.data?.minChoices || 0) > 0) {
            logger.info(state, LogCategory.ACTION, `Cannot confirm: Minimum ${(action.data?.minChoices || 0)} choices required.`);
            return false;
        }

        state.pendingAction = undefined;

        if (costType === 'Sacrifice') {
            state.interaction.lastChosenSacrificeId = choice?.value as string;
        } else if (costType === 'Discard') {
            state.interaction.lastChosenDiscardId = choice?.value as string;
            logger.debug(state, LogCategory.ACTION, `[DEBUG] ChoiceProcessor: Set lastChosenDiscardId to ${choice?.value}`);
        } else if (costType === 'TapSelection' || costType === 'Exile') {
            logger.debug(state, LogCategory.ACTION, `[DEBUG] handleModalSelection: Processing ${costType} cost...`);
            if (action.data?.maxChoices && (action.data.maxChoices as number) > 1) {
                const batchIds = typeof choiceIndex === 'string' && choiceIndex.includes('|')
                    ? choiceIndex.split('|').map(s => {
                        const i = parseInt(s.startsWith('CHOICE_') ? s.substring(7) : s);
                        const val = action.data?.choices?.[i]?.value as string;
                        return val;
                    }).filter(v => v)
                    : [choice?.value as string].filter(v => v);

                logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Modal selection IDs for ${costType}: ${batchIds.join(', ')} (Max: ${action.data.maxChoices})`);
                if (costType === 'TapSelection') state.interaction.lastChosenTapSelectionIds = batchIds;
                else state.interaction.lastChosenExileIds = batchIds;
            } else {
                if (costType === 'TapSelection') state.interaction.lastChosenTapSelectionIds = [choice?.value as string].filter(v => v);
                else state.interaction.lastChosenExileIds = [choice?.value as string].filter(v => v);
            }
        } else if (choice && String(choice.value).startsWith('FACE_SELECTION_')) {
            const faceIdx = parseInt(String(choice.value).substring(15));
            const card = RuleUtils.findObject(state, sourceId);
            if (card && card.definition.faces) {
                card.selectedFaceDefinition = card.definition.faces[faceIdx];
            }
        } else if (choice && String(choice.value).startsWith('COST_CHOICE_')) {
            const choiceIdx = parseInt(String(choice.value).substring(12));
            state.interaction.lastChosenCostChoiceIndex = choiceIdx;
        } else if (choice && String(choice.value).startsWith('MODE_SELECTION_')) {
            if (typeof choiceIndex === 'string' && choiceIndex.includes('|')) {
                const indices = choiceIndex.split('|').map(s => {
                    const i = parseInt(s.startsWith('CHOICE_') ? s.substring(7) : s);
                    const val = action.data?.choices?.[i]?.value;
                    return parseInt(String(val).substring(15));
                });
                state.interaction.lastChosenModeIndex = indices;
            } else {
                const modeIdx = parseInt(String(choice.value).substring(15));
                state.interaction.lastChosenModeIndex = [modeIdx];
            }
        } else {
            state.interaction.lastChoiceIndex = choiceIndex as number;
        }

        logger.info(state, LogCategory.ACTION, `Selected ${costType ? costType + ' item' : 'choice'}: ${choice?.label || 'none'}`);

        if (action.data?.abilityIndex !== undefined) {
            let targets = savedTargets;
            if (action.data.isTargetingModal) {
                targets = (!choice || choice.value === 'none') ? [] : (Array.isArray(choice.value) ? choice.value : [choice.value as string]);
            }

            return SpellProcessor.activateAbility(
                state,
                engine,
                {
                    playerId,
                    cardId: sourceId,
                    abilityIndex: action.data.abilityIndex as number,
                    targets,
                    xValue: action.data.xValue as number,
                    bypassPriority: true,
                    bypassTargeting: false,
                    parentContext: action.data.parentContext as ResolutionContext,
                    isFreeCast: action.data.isFreeCast as boolean
                }
            );
        }

        if (action.data?.isCostChoice && (action.data?.stackObj || action.data?.nextEffectIndex !== undefined)) {
            logger.info(state, LogCategory.ACTION, `[RESOLVING] Resuming resolution after interactive cost ${costType}...`);

            const costToPay = { type: action.data.costType, amount: action.data.maxChoices, value: action.data.maxChoices } as AbilityCost;
            CostProcessor.pay(state, [costToPay], sourceId, playerId);

            if (action.data.remainingCosts && (action.data.remainingCosts as AbilityCost[]).length > 0) {
                CostProcessor.pay(state, action.data.remainingCosts as AbilityCost[], sourceId, playerId);
            }

            if (action.data.choiceEffects && (action.data.choiceEffects as EffectDefinition[]).length > 0) {
                EffectProcessor.resolveEffects({
                    state,
                    effects: action.data.choiceEffects as EffectDefinition[],
                    sourceId,
                    targets: savedTargets,
                    startIndex: 0,
                    stackObject: action.data.stackObj as StackObject,
                    parentContext: action.data.parentContext as ResolutionContext,
                    controllerIdOverride: playerId,
                    lookingCards: action.data.lookingCards as GameObject[],
                });
            }

            const stackObj = action.data.stackObj as StackObject;
            let currentCtx: ResolutionContext | undefined = action.data.parentContext;
            while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex !== undefined && currentCtx.nextEffectIndex < currentCtx.effects.length) {
                logger.info(state, LogCategory.ACTION, `[RESOLVING] Resuming parent resolution context for ${sourceId}...`);
                const nextIdx = currentCtx.nextEffectIndex;
                const effs = currentCtx.effects;
                const parentTargets = currentCtx.targets || currentCtx.parentContext?.targets || [];
                const parentCtx = currentCtx.parentContext;

                currentCtx = parentCtx;
                const completed = EffectProcessor.resolveEffects({
                    state,
                    effects: effs,
                    sourceId,
                    targets: parentTargets,
                    startIndex: nextIdx,
                    stackObject: stackObj,
                    parentContext: parentCtx,
                    lookingCards: action.data.lookingCards as GameObject[],
                });

                if (stackObj && !completed && (state as GameState).pendingAction) {
                    (stackObj as any).data = { ...(stackObj as any).data, nextEffectIndex: (state as GameState).pendingAction?.data?.nextEffectIndex };
                }
            }

            this.finalizeResolution(state, sourceId, stackObj, action, engine);
            return true;
        }

        if (action.data?.confirmedAutoTap) {
            state.interaction.confirmedAutoTap = true;
        }

        let finalTargets = savedTargets;
        if (action.data?.isTargetingModal) {
            let newTargets: string[] = [];
            if (typeof choiceIndex === 'string' && choiceIndex.includes('|')) {
                newTargets = choiceIndex.split('|').map(s => {
                    const i = parseInt(s.startsWith('CHOICE_') ? s.substring(7) : s);
                    return action.data?.choices?.[i]?.value as string;
                }).filter(v => v);
            } else {
                newTargets = choice?.value ? [choice.value as string] : [];
            }
            finalTargets = [...savedTargets, ...newTargets];
            logger.info(state, LogCategory.ACTION, `[MODAL-TARGET-APPEND] Appended ${newTargets.length} modal targets to ${savedTargets.length} previous ones. Total: ${finalTargets.length}`);
        }

        const isTargeting = !!action.data?.isTargetingModal;
        const metadata = action.data?.metadata;
        const isSpellCasting = metadata?.isSpellCasting ?? action.data?.isSpellCasting;

        // Ensure cardToPlayId remains sourceId for modes/costs/targeting. 
        // Only use choice.value if it's a legitimate card selection (e.g. from a list of faces/cards).
        const choiceValStr = choice?.value ? String(choice.value) : "";
        const isSystemValue = choiceValStr.startsWith('MODE_SELECTION_') || choiceValStr.startsWith('COST_CHOICE_') || choiceValStr.startsWith('FACE_SELECTION_');
        const cardToPlayId = (isSpellCasting && !isTargeting && !isSystemValue && choice?.value && typeof choice.value === 'string' && choice.value.length > 20) ? choice.value : sourceId;

        // ARCHITECTURAL NOTE: Metadata Propagation
        return SpellProcessor.playCard(
            state,
            engine,
            {
                playerId,
                cardId: cardToPlayId,
                targets: finalTargets,
                xValue: action.data?.xValue as number,
                bypassPriority: true,
                bypassTargeting: false,
                parentContext: (metadata?.parentContext ?? action.data?.parentContext) as ResolutionContext,
                isFreeCast: (metadata?.isFreeCast ?? action.data?.isFreeCast) as boolean,
                exileOnResolution: (metadata?.exileOnResolution ?? action.data?.exileOnResolution) as boolean
            }
        );
    }

    private static handleResolutionChoice(state: GameState, sourceId: string, choice: ChoiceOption, action: PendingAction, engine: EngineContext): boolean {
        const { logger } = getProcessors(state);
        const savedActionData = action.data;
        const stackObj = savedActionData?.stackObj as StackObject;
        const parentTargets = (action.data?.targets || savedActionData?.targets || action.data?.parentContext?.targets || savedActionData?.parentContext?.targets || []) as string[];
        let targetsForResolution = parentTargets;
        if (choice.value && typeof choice.value === 'string' && choice.value.length > 20) {
            targetsForResolution = [choice.value, ...parentTargets];
        }

        if (choice.costs && choice.costs.length > 0) {
            const costs = choice.costs as AbilityCost[];
            const sourceObj = RuleUtils.findObject(state, sourceId);

            if (!CostProcessor.canPay(state, costs, sourceId, action.playerId, stackObj)) {
                logger.info(state, LogCategory.ACTION, `Insufficient resources to select: ${choice.label}`);
                return false;
            }

            state.pendingAction = undefined;

            const interactiveCost = costs.find((c: AbilityCost) =>
                (c.type === 'TapSelection' && !state.interaction.lastChosenTapSelectionIds) ||
                (c.type === 'Discard' && !state.interaction.lastChosenDiscardId) ||
                (c.type === 'Sacrifice' && !state.interaction.lastChosenSacrificeId && !ChoiceProcessor.isSelfSac(c, sourceId)) ||
                (c.type === 'Exile' && !state.interaction.lastChosenExileIds)
            );

            if (interactiveCost) {
                // Clear any stale interaction data for this cost type before prompting
                if (interactiveCost.type === 'TapSelection') delete state.interaction.lastChosenTapSelectionIds;
                if (interactiveCost.type === 'Discard') delete state.interaction.lastChosenDiscardId;
                if (interactiveCost.type === 'Sacrifice') delete state.interaction.lastChosenSacrificeId;
                if (interactiveCost.type === 'Exile') delete state.interaction.lastChosenExileIds;

                state.pendingAction = ChoiceGenerator.createCostInteractionChoice(state, interactiveCost, sourceId, action.playerId, choice, action.data);
                return true;
            }

            const alreadyChosen = action.data?.xValueConfirmed === true;
            const needsX = costs.some((c: AbilityCost) => {
                const isManaCost = String(c.type).toLowerCase() === 'mana';
                const hasX = String((c as any).manaCost || "").includes('{X}') || String((c as any).value || "").includes('{X}');

                return isManaCost && hasX && !alreadyChosen;
            });


            if (needsX && !alreadyChosen) {
                logger.info(state, LogCategory.ACTION, `[CHOOSE_X] Prompting for X value for resolution cost...`);
                state.pendingAction = ChoiceGenerator.createXChoice(state, sourceId, action.playerId, choice, action.data);
                return true;
            }

            CostProcessor.pay(state, costs, sourceId, action.playerId);

            state.interaction = {
                lastChosenCostChoiceIndex: undefined,
                lastChosenSacrificeId: undefined,
                lastChosenDiscardId: undefined,
                lastChosenTapSelectionIds: undefined,
                lastChosenExileIds: undefined,
                lastChosenModeIndex: undefined,
                lastChoiceIndex: undefined
            };
        }

        state.pendingAction = undefined;

        if (choice.effects && choice.effects.length > 0) {
            EffectProcessor.resolveEffects({
                state,
                effects: choice.effects,
                sourceId,
                targets: targetsForResolution,
                startIndex: 0,
                stackObject: stackObj,
                parentContext: savedActionData?.parentContext as ResolutionContext,
                controllerIdOverride: action.playerId,
                lookingCards: savedActionData?.lookingCards as GameObject[],
            });
        }

        return this.finalizeResolution(state, sourceId, stackObj, action, engine);
    }

    private static finalizeResolution(state: GameState, sourceId: string, stackObj: any, action: PendingAction, engine: EngineContext): boolean {
        // 1. Process Choice Queue (highest priority)
        if (!state.pendingAction && state.choiceQueue && state.choiceQueue.length > 0) {
            const nextItem = state.choiceQueue.shift()!;
            if (nextItem.type === 'RESOLUTION_CHOICE' && nextItem.data?.choices && !nextItem.data.lookingCards) {
                state.pendingAction = ChoiceGenerator.createModalChoice(
                    state,
                    {
                        label: nextItem.data.label,
                        playerId: nextItem.playerId,
                        sourceId: nextItem.sourceId,
                        actionType: nextItem.type as ActionType,
                        hideUndo: nextItem.data.hideUndo,
                        stackObj: nextItem.data.stackObj,
                        parentContext: nextItem.data.parentContext
                    },
                    (nextItem.data.choices as any[]).map((c: any) => ({ label: c.label, value: c.value, costs: c.costs, effects: c.effects }))
                );
                if (state.pendingAction && state.pendingAction.data) {
                    state.pendingAction.data.nextPlayerIds = nextItem.data.nextPlayerIds;
                }
            } else if (nextItem.data?.isSacrificeSequence) {
                const { effect: EP } = getProcessors(state);
                const PermanentHandler = EP.getEffectHandler('Sacrifice') as any;
                const realEffect = nextItem.data.parentContext?.effects?.[nextItem.data.parentContext?.nextEffectIndex];
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
                state.pendingAction = ChoiceGenerator.createDiscardChoice(
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

        // 2. ENQUEUE NEXT PLAYERS (Legacy path)
        if (!state.pendingAction) {
            const nextPlayerIds = action.data?.nextPlayerIds || action.data?.stackObj?.data?.nextPlayerIds || [];
            if (nextPlayerIds.length > 0) {
                const discardAmount = action.data?.discardAmount || action.data?.stackObj?.data?.discardAmount || 1;
                const failureEffects = action.data?.onFailureEffects || action.data?.stackObj?.data?.onFailureEffects;
                state.pendingAction = ChoiceGenerator.createDiscardChoice(state, nextPlayerIds, sourceId as string, discardAmount, action.data?.label || "Discard", action.data?.stackObj, action.data?.parentContext, failureEffects);
                return true;
            }
        }

        // 3. Resume/Finalize Resolution
        if (!state.pendingAction) {
            return this.resumeResolution(state, sourceId, stackObj, action.data?.parentContext, engine);
        }

        return true;
    }

    public static resolveTargeting(
        state: GameState,
        playerId: PlayerId,
        targetId: string,
        engine: EngineContext
    ): boolean {
        return TargetingProcessor.resolveInteractiveTargeting(state, playerId, targetId, engine);
    }

    private static handleXChoice(state: GameState, playerId: string, action: PendingAction, xValue: any, engine: any): boolean {
        const { logger } = getProcessors(state);
        let x = 0;
        if (typeof xValue === 'object' && xValue !== null) {
            if ('x' in xValue) x = parseInt(String(xValue.x));
            else if ('index' in xValue) x = parseInt(String(xValue.index));
            else if ('value' in xValue) x = parseInt(String(xValue.value));
        } else if (typeof xValue === 'number') {
            x = xValue;
        } else if (typeof xValue === 'string') {
            x = parseInt(xValue);
        }

        const sourceId = action.sourceId!;
        const card = RuleUtils.findObject(state, sourceId);
        if (!card) {
            logger.info(state, LogCategory.ACTION, `[CHOOSE_X] Error: Could not find card for sourceId ${sourceId}`);
            return false;
        }

        card.xValue = x;
        state.pendingAction = undefined;

        logger.info(state, LogCategory.ACTION, `${state.players[playerId].name} chose X = ${x} for ${card.definition.name}.`);

        if (action.data?.isResolutionX) {
            // Mark as confirmed in the original action data so we don't re-prompt
            if (action.data.originalActionData && !action.data.originalActionData.data) {
                action.data.originalActionData.data = {};
            }
            if (action.data.originalActionData?.data) {
                action.data.originalActionData.data.xValueConfirmed = true;
            }

            // Resume resolution choice with the chosen X
            return (this as any).handleResolutionChoice(
                state,
                action.sourceId!,
                action.data.selectedChoice,
                { ...action, data: action.data.originalActionData },
                engine
            );
        }

        const abilityIndex = action.data?.abilityIndex;
        let success = false;

        if (abilityIndex !== undefined) {
            success = SpellProcessor.activateAbility(
                state,
                engine,
                {
                    playerId,
                    cardId: sourceId,
                    abilityIndex,
                    targets: action.data?.declaredTargets || [],
                    xValue: x,
                    bypassPriority: true,
                    bypassTargeting: false,
                    parentContext: action.data?.parentContext as ResolutionContext,
                    isFreeCast: action.data?.isFreeCast as boolean,
                    exileOnResolution: action.data?.exileOnResolution as boolean
                }
            );
        } else {
            success = SpellProcessor.playCard(
                state,
                engine,
                {
                    playerId,
                    cardId: sourceId,
                    targets: action.data?.declaredTargets || [],
                    xValue: x,
                    bypassPriority: true,
                    bypassTargeting: false,
                    parentContext: action.data?.parentContext as ResolutionContext,
                    isFreeCast: action.data?.isFreeCast as boolean,
                    exileOnResolution: action.data?.exileOnResolution as boolean
                }
            );
        }

        if (success === false) {
            card.xValue = undefined;
        }
        return success;
    }

    private static isSelfSac(cost: AbilityCost, sourceId: string): boolean {
        if (cost.type !== 'Sacrifice') return false;
        if (cost.restrictions && cost.restrictions.some((r: any) => r.type === 'Self' || (r.type === 'ObjectId' && r.value === sourceId))) return true;
        return false;
    }
}
