import { AbilityCost, AbilityDefinition, AbilityType, ActionType, ChoiceOption, ChoicePayload, EffectDefinition, EffectType, GameObject, GameState, PendingAction, PlayerId, ResolutionContext, StackObject, TargetType, Zone } from '@shared/engine_types';
import { LogCategory } from '../../utils/EngineLogger';
import { EngineContext } from '../../interfaces/EngineContext';
import { oracle } from '../../OracleLogicMap';
import { RuleUtils } from "../../utils/RuleUtils";
import { getProcessors } from '../ProcessorRegistry';
import { PlayerActionProcessor } from './PlayerActionProcessor';
import { ChoiceGenerator } from '../effects/ChoiceGenerator';

/**
 * Handles interactive player choices (Targeting, Modal Choices)
 */
export class ChoiceProcessor {

    public static normalizePayload(input: number | string | ChoicePayload): ChoicePayload {
        if (typeof input === 'object' && input !== null && ('selections' in input || 'top' in input || 'graveyard' in input)) {
            const base = { selections: [] };
            return Object.assign(base, input);
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
        const { logger } = getProcessors(state);
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

        if (!isModal && !isResolution && !isScry && !isChoosingX && !isOrderTriggers && !isTargeting) return false;

        if (isTargeting) {
            logger.debug(state, LogCategory.ACTION, `[CHOICE-DELEGATE] Delegating targeting choice to TargetingProcessor: ${firstSelection}`);
            return this.resolveTargeting(state, playerId, firstSelection as string, engine);
        }

        if (isOrderTriggers) {
            const order = selections.map(s => s.toString());
            return PlayerActionProcessor.resolveTriggerOrdering(state, playerId, order);
        }

        // Handle "Back/Undo"
        if (firstSelection === 'undo' || firstSelection === -1) {
            return this.handleUndo(state, playerId, action);
        }

        if (isChoosingX) {
            return this.handleXChoice(state, playerId, action, payload, engine);
        }

        // Handle multi-choice (batch selection) or empty selection via 'confirm'/'done'
        const isMultiSelectAction = action.type === ActionType.Discard || action.data?.maxChoices > 1;
        const isEmptyConfirm = (firstSelection === 'confirm' || firstSelection === 'done' || firstSelection === 'none') && isMultiSelectAction;

        if (selections.length > 1 || (selections.length === 1 && typeof firstSelection === 'string' && (firstSelection.includes('|') || firstSelection.startsWith('{'))) || isEmptyConfirm || action.data?.isManaChoiceToggle) {
            // If it's a cost choice, spell casting mode selection, OR a targeting modal, we go through handleModalSelection
            if (action.data?.isCostChoice || action.data?.isSpellCasting || action.data?.isTargetingModal || action.data?.isManaChoiceToggle) {
                // Pass the first selection if it's a legacy string, otherwise pass null as handleModalSelection will use the payload
                return this.handleModalSelection(state, playerId, action.sourceId as string, null, firstSelection as string, action, engine, payload);
            }

            // Validate min choices for empty confirm
            if (isEmptyConfirm && (action.data?.minChoices || 0) > 0) {
                logger.info(state, LogCategory.ACTION, `Cannot confirm: Minimum ${(action.data?.minChoices || 0)} choices required.`);
                return false;
            }
            const sourceId = action.sourceId;
            const allEffects: EffectDefinition[] = [];
            let finalChoice: ChoiceOption | null = null;
            let currentTargetOffset = 0;

            const indices = selections.filter(s => typeof s === 'number') as number[];

            indices.forEach(idx => {
                const choice = action.data?.choices?.[idx];
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
                getProcessors(state).effect.resolveEffects({
                    state,
                    effects: allEffects,
                    sourceId: sourceId as string,
                    targets: [],
                    startIndex: 0,
                    stackObject: action.data?.stackObj,
                    parentContext: action.data?.parentContext,
                    lookingCards: action.data?.lookingCards as GameObject[],
                });
            }

            // After batch is done, check if we need to move to the next player (for DiscardCards)
            const nextPlayerIds = action.data?.nextPlayerIds || action.data?.stackObj?.data?.nextPlayerIds || [];
            if (!state.pendingAction && nextPlayerIds.length > 0) {
                const discardAmount = action.data?.discardAmount || action.data?.stackObj?.data?.discardAmount || 1;
                const failureEffects = action.data?.onFailureEffects || action.data?.stackObj?.data?.onFailureEffects;
                state.pendingAction = ChoiceGenerator.createDiscardChoice(state, nextPlayerIds, sourceId as string, discardAmount, action.data?.label || "Discard", action.data?.stackObj, action.data?.parentContext, failureEffects);
            }

            // Resume whatever was happening at the current level first
            return this.resumeResolution(state, sourceId as string, action.data?.stackObj as StackObject, action.data as any, engine);
        }

        // 3. Handle Scry/Surveil Reordering early as payload is not an index
        if (action.type === ActionType.Scry || action.type === ActionType.Surveil) {
            return this.handleScrySurveil(state, playerId, action, payload, engine);
        }

        const choiceIdx = typeof firstSelection === 'number' ? firstSelection : parseInt(String(firstSelection).replace('CHOICE_', ''));

        // Handle Legend Rule Choice
        if (action.type === ActionType.LegendRule) {
            let choice = !isNaN(choiceIdx) ? action.data?.choices?.[choiceIdx as number] : undefined;
            if (!choice && typeof firstSelection === 'string') {
                choice = action.data?.choices?.find((c: ChoiceOption) => c.value === firstSelection);
            }
            const keepId = choice?.value as string;
            const involvedIds = (action.data?.involvedIds as string[]) || [];
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
        const choice = !isNaN(choiceIdx) ? action.data?.choices?.[choiceIdx as number] : undefined;

        if (!choice || !sourceId) return false;

        // 1. Handle Selection of Abilities (Planeswalkers/Modal costs in battlefield)
        const obj = state.battlefield.find(o => o.id === sourceId);
        if (obj && isModal && !action.data?.isCostChoice) {
            return this.handleBattlefieldAbilityActivation(state, playerId, obj, choice, engine);
        }

        // 2. Handle Casting-Phase Choices (Modes, Additional Costs)
        // If it's a resolution-phase choice (Cascade, etc.), we fall through to handleResolutionChoice
        if ((isModal || action.data?.isSpellCasting || action.data?.isCostChoice) && !isResolution) {
            return this.handleModalSelection(state, playerId, sourceId, choice, firstSelection, action, engine, payload);
        }

        // 4. Handle Resolution-Phase Choices (Effects, Search, Scry,)
        return this.handleResolutionChoice(state, sourceId, choice, action, engine, payload);
    }

    private static handleScrySurveil(
        state: GameState,
        playerId: PlayerId,
        action: PendingAction,
        payload: ChoicePayload,
        engine: EngineContext
    ): boolean {
        const { logger } = getProcessors(state);
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
        const cards = (action.data?.lookingCards || []) as GameObject[];

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
        const stackObj = action.data?.stackObj as StackObject;
        state.pendingAction = undefined;

        // 6. Resume resolution if needed
        if (stackObj) {
            return this.resumeResolution(state, action.sourceId!, stackObj, action.data?.parentContext as ResolutionContext, engine);
        }

        engine.resetPriorityToActivePlayer();
        return true;
    }

    public static resumeResolution(state: GameState, sourceId: string, stackObj: StackObject, parentContext: ResolutionContext, engine: EngineContext): boolean {
        let currentCtx: ResolutionContext | undefined = { ...parentContext, stackObject: stackObj }; // Wrap to start resuming

        // Then resume parent contexts
        while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex !== undefined && currentCtx.nextEffectIndex < currentCtx.effects.length) {
            
            const resumingCtx: ResolutionContext = currentCtx; // Capture current context before moving to parent
            const nextIdx = resumingCtx.nextEffectIndex!;
            const effs = resumingCtx.effects;
            const parentTargets = resumingCtx.targets || [];
            const lookingCards = resumingCtx.lookingCards;
            const nextParentCtx: ResolutionContext | undefined = resumingCtx.parentContext;

            currentCtx = nextParentCtx;
            const completed = getProcessors(state).effect.resolveEffects({
                state,
                effects: effs,
                sourceId,
                targets: parentTargets,
                startIndex: nextIdx,
                stackObject: stackObj,
                parentContext: nextParentCtx,
                lookingCards: lookingCards,
                lastMilledIds: resumingCtx.lastMilledIds,
                lastDiscardedIds: resumingCtx.lastDiscardedIds,
                skipFizzleCheck: true,
            });

            if (stackObj && !completed && (state as GameState).pendingAction) {
                stackObj.data = { ...stackObj.data, nextEffectIndex: (state as GameState).pendingAction?.data?.nextEffectIndex };
            }
        }

        if (!state.pendingAction) {
            if (stackObj) {
                const fullStackObj = state.stack.find(s => s.id === stackObj.id);
                if (fullStackObj) {
                    if (fullStackObj.type === 'Spell' && fullStackObj.sourceObject) {
                        const card = fullStackObj.sourceObject;
                        const isPermanent = RuleUtils.isPermanent(card);

                        if (card.zone === Zone.Stack) {
                            const freshDef = oracle.getCard(card.definition.name);
                            const shouldExile = fullStackObj.exileOnResolution || fullStackObj.isCopy || (card as any).isPreparedCopy || freshDef?.exileOnResolution;

                            if (shouldExile) {
                                getProcessors(state).action.removeFromCurrentZone(state, card);
                                if (!fullStackObj.isCopy) {
                                    getProcessors(state).action.moveCard(state, card, Zone.Exile, card.ownerId);
                                }
                            } else if (isPermanent) {
                                getProcessors(state).action.moveCard(state, card, Zone.Battlefield, fullStackObj.controllerId);
                            } else {
                                getProcessors(state).action.moveCard(state, card, Zone.Graveyard, card.ownerId);
                            }
                        }
                    } else {
                        // Clean up ability/trigger
                        // Use both instance ID and source ID to be absolutely sure we find it
                        const stackIdx = state.stack.findIndex(s => s.id === fullStackObj.id || (s.id === stackObj.id && s.type === fullStackObj.type));
                        if (stackIdx !== -1) {
                            state.stack.splice(stackIdx, 1);
                        } else {
                            // Deep search fallback
                            const altIdx = state.stack.findIndex(s => s.sourceId === fullStackObj.sourceId && s.type === fullStackObj.type);
                            if (altIdx !== -1) {
                                state.stack.splice(altIdx, 1);
                            }
                        }
                    }

                    // ROOT TRIGGER CLEANUP: If this was resumed from a parent context (like a trigger), clean up the parent too
                    if (parentContext && parentContext.stackObject && parentContext.stackObject.id !== stackObj.id) {
                        const parentStackObj = parentContext.stackObject;
                        const pIdx = state.stack.findIndex(s => s.id === parentStackObj.id);
                        if (pIdx !== -1) {
                            state.stack.splice(pIdx, 1);
                        }
                    }

                    // --- KEYWORD HOOK: ON RESOLUTION ---
                    if (fullStackObj.type === AbilityType.Spell) {
                        const { trigger: TriggerProcessor } = getProcessors(state);
                        TriggerProcessor.onEvent(state, {
                            type: 'ON_RESOLVE_SPELL',
                            playerId: fullStackObj.controllerId,
                            payload: { object: fullStackObj.sourceObject, sourceId: fullStackObj.sourceId, targetIds: [fullStackObj.id] }
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
                }
            }
        }

        // B. Revert Stack source (Putting a spell back in hand)
        const stackObj = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
        if (stackObj && stackObj.sourceObject) {
            const card = stackObj.sourceObject;
            const player = state.players[card.ownerId];
            if (player) {
                const refundCost = card.definition.manaCost;
                card.xValue = undefined; // Explicitly clear
                getProcessors(state).action.moveCard(state, card, Zone.Hand, card.ownerId);

                const { mana: ManaProcessor } = getProcessors(state);
                ManaProcessor.refundManaCost(player, refundCost);
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
        const logic = oracle.getCard(obj.definition.name);
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = LayerProcessor.getEffectiveStats(obj, state);
        const allAbilities = [...((logic?.abilities as any[]) || [])];
        if (stats.abilities) {
          stats.abilities.forEach((a: any) => {
            if (typeof a === 'string') return;
            const isDuplicate = allAbilities.some(existing => {
              if (typeof existing === 'string') return false;
              return (a.id !== undefined && existing.id !== undefined) ? a.id === existing.id : (a.type === existing.type && JSON.stringify(a.effects) === JSON.stringify(existing.effects));
            });
            if (!isDuplicate) allAbilities.push(a);
          });
        }

        const ability = allAbilities[abilityIndex];
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
            const { targeting: TargetingProcessor } = getProcessors(state);
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
        const savedTargets = (action.data?.declaredTargets as string[]) || [];
        const costType = action.data?.costType as string;

        const selections = payload?.selections || [choiceIndex];
        const firstSelection = selections[0];

        const isMultiSelect = action.type === ActionType.Discard || (action.data?.maxChoices && (action.data.maxChoices as number) > 1);
        const isEmptyConfirm = (firstSelection === 'confirm' || firstSelection === 'done' || firstSelection === 'none') && isMultiSelect;

        if (!choice && firstSelection !== undefined && !isEmptyConfirm) {
            let idxStr = String(firstSelection);
            const idx = parseInt(idxStr.startsWith('CHOICE_') ? idxStr.substring(7) : idxStr);
            choice = action.data?.choices?.[idx] || null;
        }

        if (!choice && !isEmptyConfirm && !action.data?.isManaChoiceToggle) return false;

        // Validate min choices for empty confirm
        if (isEmptyConfirm && (action.data?.minChoices || 0) > 0) {
            logger.info(state, LogCategory.ACTION, `Cannot confirm: Minimum ${(action.data?.minChoices || 0)} choices required.`);
            return false;
        }

        state.pendingAction = undefined;

        if (costType === 'Sacrifice') {
            state.interaction.lastSelections['Sacrifice'] = [choice?.value as string].filter(v => v);
        } else if (costType === 'Discard') {
            state.interaction.lastSelections['Discard'] = [choice?.value as string].filter(v => v);
        } else if (costType === 'TapSelection' || costType === 'Exile') {
            if (isMultiSelect) {
                const batchIds = selections.map(s => {
                    const str = s.toString();
                    if (str.startsWith('CHOICE_')) {
                        const idx = parseInt(str.substring(7));
                        return action.data?.choices?.[idx]?.value as string;
                    }
                    if (!isNaN(parseInt(str)) && action.data?.choices?.[parseInt(str)]) {
                        return action.data?.choices?.[parseInt(str)]?.value as string;
                    }
                    return str;
                }).filter(v => v && v !== 'confirm' && v !== 'done' && v !== 'none');

                logger.debug(state, LogCategory.ACTION, `[CHOICE-DEBUG] Modal selection IDs for ${costType}: ${batchIds.join(', ')} (Max: ${action.data?.maxChoices})`);
                state.interaction.lastSelections[costType] = batchIds;
            } else {
                const val = choice?.value as string;
                state.interaction.lastSelections[costType] = val ? [val] : [];
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
                const val = action.data?.choices?.[i]?.value;
                return typeof val === 'number' ? val : parseInt(String(val).substring(15));
            });
            state.interaction.lastChosenModeIndex = modeIndices;
        } else if (action.data?.isManaChoiceToggle) {
            let parsedSelections: string[] = [];
            if (typeof firstSelection === 'string' && firstSelection.startsWith('{')) {
                parsedSelections = Object.values(JSON.parse(firstSelection));
            } else if (typeof firstSelection === 'string' && firstSelection.startsWith('[')) {
                parsedSelections = JSON.parse(firstSelection);
            } else if (payload?.selections) {
                parsedSelections = payload.selections.map(s => String(s));
            }
            if (state.interaction) {
                state.interaction.manaChoices = state.interaction.manaChoices || {};
                action.data.hybridGroups.forEach((group: any, index: number) => {
                    state.interaction!.manaChoices![group.idx] = parsedSelections[index];
                });
            }
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
                isAbilitySelectionBypassed: true // Avoid infinite loop
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

        if (action.data?.abilityIndex !== undefined) {
            let targets = savedTargets;
            if (action.data.isTargetingModal) {
                const newTargets: string[] = [];
                selections.forEach((sel: any) => {
                    const i = typeof sel === 'number' ? sel : parseInt(String(sel).startsWith('CHOICE_') ? String(sel).substring(7) : String(sel));
                    const val = !isNaN(i) ? action.data?.choices?.[i]?.value as string : (typeof sel === 'string' ? sel : undefined);
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
            getProcessors(state).cost.pay(state, [costToPay], sourceId, playerId);

            if (action.data.remainingCosts && (action.data.remainingCosts as AbilityCost[]).length > 0) {
                getProcessors(state).cost.pay(state, action.data.remainingCosts as AbilityCost[], sourceId, playerId);
            }

            if (action.data.choiceEffects && (action.data.choiceEffects as EffectDefinition[]).length > 0) {
                getProcessors(state).effect.resolveEffects({
                    state,
                    effects: action.data.choiceEffects as EffectDefinition[],
                    sourceId,
                    targets: savedTargets,
                    startIndex: 0,
                    stackObject: action.data.stackObj as StackObject,
                    parentContext: action.data.parentContext as ResolutionContext,
                    controllerIdOverride: playerId,
                    lookingCards: action.data.lookingCards as GameObject[],
                    skipFizzleCheck: true,
                });
            }

            const stackObj = action.data.stackObj as StackObject;
            let currentCtx: ResolutionContext | undefined = this.getSuspendedContext(action);
            while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex !== undefined && currentCtx.nextEffectIndex < currentCtx.effects.length) {
                logger.info(state, LogCategory.ACTION, `[RESOLVING] Resuming parent resolution context for ${sourceId}...`);
                const nextIdx = currentCtx.nextEffectIndex;
                const effs = currentCtx.effects;
                const parentTargets = currentCtx.targets || currentCtx.parentContext?.targets || [];
                const parentCtx: ResolutionContext | undefined = currentCtx.parentContext;

                currentCtx = parentCtx;
                const completed = getProcessors(state).effect.resolveEffects({
                    state,
                    effects: effs,
                    sourceId,
                    targets: parentTargets,
                    startIndex: nextIdx,
                    stackObject: stackObj,
                    parentContext: parentCtx,
                    lookingCards: action.data.lookingCards as GameObject[],
                    lastMilledIds: parentCtx?.lastMilledIds,
                    lastDiscardedIds: parentCtx?.lastDiscardedIds,
                    skipFizzleCheck: true,
                });

                if (stackObj && !completed && (state as GameState).pendingAction) {
                    stackObj.data = { ...stackObj.data, nextEffectIndex: (state as GameState).pendingAction?.data?.nextEffectIndex };
                }
            }

            this.finalizeResolution(state, sourceId, stackObj, action, engine);
            return true;
        }

        if (action.data?.confirmedAutoTap) {
            state.interaction.flags.confirmedAutoTap = true;
        }

        let finalTargets = savedTargets;
        if (action.data?.isTargetingModal) {
            let newTargets: string[] = [];
            
            selections.forEach((sel: any) => {
                if (typeof sel === 'string' && sel.includes('|')) {
                     const ids = sel.split('|').map(s => {
                        const i = parseInt(s.startsWith('CHOICE_') ? s.substring(7) : s);
                        const val = action.data?.choices?.[i]?.value as string;
                        return val && val.length > 20 ? val : undefined;
                    }).filter(v => v) as string[];
                    newTargets.push(...ids);
                } else {
                    const i = typeof sel === 'number' ? sel : parseInt(String(sel).startsWith('CHOICE_') ? String(sel).substring(7) : String(sel));
                    const val = !isNaN(i) ? action.data?.choices?.[i]?.value as string : (typeof sel === 'string' ? sel : undefined);
                    if (val && val.length > 20) newTargets.push(val);
                }
            });

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
        return getProcessors(state).spell.playCard(
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

    private static handleResolutionChoice(state: GameState, sourceId: string, choice: ChoiceOption, action: PendingAction, engine: EngineContext, payload: ChoicePayload): boolean {
        const { logger } = getProcessors(state);
        const savedActionData = action.data;
        const stackObj = savedActionData?.stackObj as StackObject;
        const parentTargets = (action.data?.targets || savedActionData?.targets || action.data?.parentContext?.targets || savedActionData?.parentContext?.targets || []) as string[];

        let targetsForResolution = parentTargets;
        const selections = payload.selections || [];

        if (selections.length > 0) {
            const newTargets = selections.map(sel => {
                const i = typeof sel === 'number' ? sel : parseInt(String(sel).startsWith('CHOICE_') ? String(sel).substring(7) : String(sel));
                const c = !isNaN(i) ? action.data?.choices?.[i] : undefined;
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
                (c.type === 'TapSelection' && !state.interaction.lastSelections['TapSelection']) ||
                (c.type === 'Discard' && !state.interaction.lastSelections['Discard']) ||
                (c.type === 'Sacrifice' && !state.interaction.lastSelections['Sacrifice'] && !ChoiceProcessor.isSelfSac(c, sourceId)) ||
                (c.type === 'Exile' && !state.interaction.lastSelections['Exile'])
            );

            if (interactiveCost) {
                // Clear any stale interaction data for this cost type before prompting
                delete state.interaction.lastSelections[interactiveCost.type];

                state.pendingAction = getProcessors(state).choiceGenerator.createCostInteractionChoice(state, interactiveCost, sourceId, action.playerId, choice, action.data);
                return true;
            }

            const alreadyChosen = action.data?.xValueConfirmed === true;
            const needsX = costs.some((c: AbilityCost) => {
                const isManaCost = c.type === 'Mana';
                // Check if the mana string or the numeric value contains X
                const hasX = String((c as any).value || "").includes('{X}') || String((c as any).value || "").includes('X');

                return isManaCost && hasX && !alreadyChosen;
            });


            if (needsX && !alreadyChosen) {
                logger.info(state, LogCategory.ACTION, `[CHOOSE_X] Prompting for X value for resolution cost...`);
                state.pendingAction = getProcessors(state).choiceGenerator.createXChoice(state, sourceId, action.playerId, choice, action.data);
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
            getProcessors(state).effect.resolveEffects({
                state,
                effects: choice.effects,
                sourceId,
                targets: targetsForResolution,
                startIndex: 0,
                stackObject: stackObj,
                parentContext: savedActionData?.parentContext as ResolutionContext,
                controllerIdOverride: action.playerId,
                lookingCards: savedActionData?.lookingCards as GameObject[],
                lastMilledIds: savedActionData?.parentContext?.lastMilledIds,
                lastDiscardedIds: savedActionData?.parentContext?.lastDiscardedIds,
                skipFizzleCheck: true,
            });
        }

        return this.finalizeResolution(state, sourceId, stackObj, action, engine);
    }

    private static finalizeResolution(state: GameState, sourceId: string, stackObj: any, action: PendingAction, engine: EngineContext): boolean {
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

        // 2. ENQUEUE NEXT PLAYERS (Legacy path)
        if (!state.pendingAction) {
            const nextPlayerIds = action.data?.nextPlayerIds || action.data?.stackObj?.data?.nextPlayerIds || [];
            if (nextPlayerIds.length > 0) {
                const discardAmount = action.data?.discardAmount || action.data?.stackObj?.data?.discardAmount || 1;
                const failureEffects = action.data?.onFailureEffects || action.data?.stackObj?.data?.onFailureEffects;
                state.pendingAction = getProcessors(state).choiceGenerator.createDiscardChoice(state, nextPlayerIds, sourceId as string, discardAmount, action.data?.label || "Discard", action.data?.stackObj, action.data?.parentContext, failureEffects);
                return true;
            }
        }

        // 3. Resume/Finalize Resolution
        if (!state.pendingAction) {
            return this.resumeResolution(state, sourceId, stackObj, this.getSuspendedContext(action), engine);
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

    private static handleXChoice(state: GameState, playerId: string, action: PendingAction, payload: ChoicePayload, engine: any): boolean {
        const { logger } = getProcessors(state);
        let x = payload.params?.xValue ?? 0;

        if (payload.params?.xValue === undefined) {
            const firstSelection = payload.selections[0];
            if (typeof firstSelection === 'number') x = firstSelection;
            else if (typeof firstSelection === 'string') x = parseInt(firstSelection);
        }

        const sourceId = action.sourceId!;
        const card = RuleUtils.findObject(state, sourceId);
        if (!card) {
            logger.info(state, LogCategory.ACTION, `[CHOOSE_X] Error: Could not find card for sourceId ${sourceId}`);
            return false;
        }

        if (RuleUtils.isEntity(card)) {
            card.xValue = x;
        }
        state.pendingAction = undefined;

        const cardName = RuleUtils.isEntity(card) ? card.definition.name : "Source";
        logger.info(state, LogCategory.ACTION, `${state.players[playerId].name} chose X = ${x} for ${cardName}.`);

        if (action.data?.isResolutionX) {
            // Mark as confirmed in the original action data so we don't re-prompt
            if (action.data.originalActionData && !action.data.originalActionData.data) {
                action.data.originalActionData.data = {};
            }
            if (action.data.originalActionData?.data) {
                action.data.originalActionData.data.xValueConfirmed = true;
            }

            // Resume resolution choice with the chosen X
            return ChoiceProcessor.handleResolutionChoice(
                state,
                action.sourceId!,
                action.data.selectedChoice,
                { ...action, data: action.data.originalActionData },
                engine,
                payload
            );
        }

        const abilityIndex = action.data?.abilityIndex;
        let success = false;

        if (abilityIndex !== undefined) {
            success = getProcessors(state).spell.activateAbility(
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
            success = getProcessors(state).spell.playCard(
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
            const card = RuleUtils.findObject(state, sourceId);
            if (RuleUtils.isEntity(card)) card.xValue = undefined;
        }
        return success;
    }


    private static isSelfSac(cost: any, sourceId: string): boolean {
        if (cost.type !== 'Sacrifice') return false;
        if (cost.restrictions && cost.restrictions.some((r: any) => r.type === 'Self' || (r.type === 'ObjectId' && r.value === sourceId))) return true;
        return false;
    }

    private static getSuspendedContext(action: PendingAction): ResolutionContext {
        // Reconstruct a valid ResolutionContext from the pending action data
        const data = (action.data || {}) as any;
        return {
            effects: (data.effects as EffectDefinition[]) || [],
            nextEffectIndex: data.nextEffectIndex as number,
            parentContext: data.parentContext as ResolutionContext,
            targets: (data.targets as string[]) || [],
            lookingCards: (data.lookingCards as GameObject[]) || [],
            sourceId: action.sourceId || "",
            controllerId: action.playerId,
            stackObject: data.stackObj as StackObject,
            lastMilledIds: data.lastMilledIds as string[],
            lastDiscardedIds: data.lastDiscardedIds as string[],
        } as ResolutionContext;
    }
}
