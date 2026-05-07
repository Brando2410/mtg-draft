import {
    GameObject,
    GameState,
    PlayerId,
    TargetingContext,
    ResolutionContext,
    Zone,
    CostType,
    TargetType,
    ActionType,
    TargetRestriction,
    TargetDefinition,
    Targetable,
    EffectDefinition,
    ActivatedAbility,
    TriggeredAbility,
    ReplacementEffect,
    PreventionEffect,
    AbilityType,
    StackObject
} from '@shared/engine_types';
import { getProcessors } from '../../ProcessorRegistry';
import { LogCategory } from '../../../utils/EngineLogger';
import { RuleUtils } from '../../../utils/RuleUtils';
import { EngineContext } from '../../../interfaces/EngineContext';
import { ManaProcessor } from '../../magic/ManaProcessor';
import { ActionProcessor } from '../ActionProcessor';
import { TargetMapper } from './TargetMapper';
import { TargetValidator } from './TargetValidator';
import { oracle } from '../../../OracleLogicMap';
import { ResolutionManager } from '../../core/stack/ResolutionManager';

/**
 * Rules Engine Module: Targeting (Rule 115)
 * Retains interactive flow and facets while validation/mapping is extracted.
 */
export class TargetingProcessor {

    // --- FACADES FOR EXTRACTED MODULES ---
    public static calculateTotalCounts(targetDefinitions: TargetDefinition[], xValue: number = 0) { return TargetMapper.calculateTotalCounts(targetDefinitions, xValue); }
    public static getCountsForDefinition(d: TargetDefinition | null, xValue: number = 0) { return TargetMapper.getCountsForDefinition(d, xValue); }
    public static generateTargetPrompt(targetDefinitions: TargetDefinition[], selectedCount: number, xValue: number = 0, isSpellCasting: boolean = false) { return TargetMapper.generateTargetPrompt(targetDefinitions, selectedCount, xValue, isSpellCasting); }
    public static isLegalTarget(state: GameState, context: TargetingContext, targetId: string): boolean { return TargetValidator.isLegalTarget(state, context, targetId); }
    public static hasLegalTargets(state: GameState, sourceId: string, targetDefinitions: TargetDefinition[] | undefined, controllerId: string, xValue: number = 0): boolean { return TargetValidator.hasLegalTargets(state, sourceId, targetDefinitions || [], controllerId, xValue); }
    public static matchesRestrictions(state: GameState, target: Targetable | string, restrictions: (TargetRestriction | string)[], context: TargetingContext): boolean { return TargetValidator.matchesRestrictions(state, target, restrictions, context); }
    public static sourceHasQualities(source: Targetable, qualities: string[], state?: GameState): boolean { return TargetValidator.sourceHasQualities(source, qualities, state); }
    public static getColors(obj: Targetable, state?: GameState): string[] { return TargetValidator.getColors(obj, state); }
    public static getLegalTargetPool(state: GameState, sourceId: string, targetDefinitions: TargetDefinition[], controllerId: string, targetIndex: number = 0, xValue: number = 0): string[] { return TargetValidator.getLegalTargetPool(state, sourceId, targetDefinitions, controllerId, targetIndex, xValue); }
    public static resolveTargetMapping(state: GameState, mapping: string, context: ResolutionContext, effect?: Partial<EffectDefinition> | ActivatedAbility | TriggeredAbility | ReplacementEffect | PreventionEffect): string[] { return TargetMapper.resolveTargetMapping(state, mapping, context, effect); }
    public static getDefinitionForIndex(targetDefinitions: TargetDefinition[], targetIndex: number, xValue: number = 0): TargetDefinition | null { return TargetMapper.getDefinitionForIndex(targetDefinitions, targetIndex, xValue); }
    public static shouldFizzle(state: GameState, context: TargetingContext, targets: string[], effects: EffectDefinition[]): boolean { return TargetValidator.shouldFizzle(state, context, targets, effects); }

    /**
     * Checks if there are any optional targeting slots remaining that haven't been filled.
     */
    public static hasOptionalTargetsRemaining(targetDefinitions: TargetDefinition[], existingTargets: string[], xValue: number = 0): boolean {
        const total = this.calculateTotalCounts(targetDefinitions, xValue);
        if (existingTargets.length >= total.maxCount) return false;

        // If we haven't reached the minimum requirement, we definitely have remaining work
        if (existingTargets.length < total.minCount) return true;

        // If we are between min and max, the remaining slots are by definition optional
        return true;
    }

    /**
     * CR 603: Resolve a specific target selection from the UI.
     */
    public static resolveInteractiveTargeting(
        state: GameState,
        playerId: PlayerId,
        targetId: string,
        engine: EngineContext
    ): boolean {
        const { logger } = getProcessors(state);
        if (state.pendingAction?.type !== ActionType.Targeting || state.pendingAction.playerId !== playerId || !state.pendingAction.data) {
            return false;
        }

        const action = state.pendingAction;
        const actionData = action.data!;
        const targetDefinitions = actionData.targetDefinitions as TargetDefinition[];
        const xValue = (actionData.xValue !== undefined ? actionData.xValue : (actionData.stackObj?.xValue || 0));
        const counts = TargetingProcessor.calculateTotalCounts(targetDefinitions, xValue);
        const { maxCount, minCount, count } = counts;

        const isOptional = minCount === 0;

        const isSkipping = targetId === 'skip' || targetId === 'none' || targetId === 'confirm' || targetId === 'done';
        const isUndoing = targetId === 'undo' || targetId === 'back';

        actionData.selectedTargets = actionData.selectedTargets || [];
        actionData.maxCount = maxCount;
        actionData.minCount = minCount;
        actionData.count = count;

        // Helper to refresh prompt based on CURRENT selection state
        const updatePrompt = () => {
            actionData.prompt = TargetingProcessor.generateTargetPrompt(
                targetDefinitions,
                actionData.selectedTargets.length,
                xValue,
                actionData.isSpellCasting
            );
        };
        updatePrompt();

        if (isUndoing) {
            if (actionData.selectedTargets.length > 0) {
                const removed = actionData.selectedTargets.pop();

                // Refresh prompt and pool for the NEW index after removing
                const nextIndex = actionData.selectedTargets.length;
                const currentDef = this.getDefinitionForIndex(targetDefinitions, nextIndex, xValue);
                if (currentDef?.label) {
                    actionData.label = currentDef.label;
                }
                const pool = [
                    ...Object.keys(state.players),
                    ...state.battlefield.map(o => o.id),
                    ...state.exile.map(o => o.id),
                    ...state.stack.map(o => o.id),
                    ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
                ];
                actionData.targets = pool.filter(tid => this.isLegalTarget(state, {
                    sourceId: action.sourceId || "",
                    controllerId: playerId,
                    stackObject: actionData.stackObj,
                    targetDefinitions: targetDefinitions,
                    targetIndex: nextIndex,
                    xValue: xValue
                }, tid));

                updatePrompt();
                logger.info(state, LogCategory.ACTION, `Removed last target: ${removed}`);
                return true;
            } else {
                logger.info(state, LogCategory.ACTION, `Targeting cancelled.`);
                const sourceId = action.sourceId;
                const stackId = actionData.stackId;
                const stackObj = actionData.stackObj;

                if (stackObj && stackObj.sourceObject) {
                    const player = state.players[stackObj.controllerId];
                    if (player) {
                        stackObj.sourceObject.xValue = undefined; // Explicitly clear before move
                        ActionProcessor.moveCard(state, stackObj.sourceObject, Zone.Hand, stackObj.controllerId);
                        ManaProcessor.refundManaCost(player, stackObj.sourceObject.definition.manaCost);
                        logger.info(state, LogCategory.ACTION, `Refunding mana for ${stackObj.sourceObject.definition.name}: ${stackObj.sourceObject.definition.manaCost}`);
                    }
                } else if (sourceId) {
                    // Fallback for spells that haven't entered the stack yet (targeting phase)
                    const card = RuleUtils.findObject(state, sourceId);
                    if (card && 'zone' in card && card.zone === Zone.Hand) {
                        if ('xValue' in card) card.xValue = undefined; // Reset state
                    }
                }
                state.stack = state.stack.filter(s => s.id !== stackId);

                const sourceOnField = state.battlefield.find(o => o.id === sourceId);
                if (sourceOnField) {
                    const abilityIndex = actionData.abilityIndex;
                    // ONLY refund and decrement usage if the ability was actually finalized (paid for)
                    // increments happen in SpellProcessor.finalizeAbilityActivation
                    if (sourceOnField.abilitiesUsedThisTurn > 0 && abilityIndex !== undefined) {
                        sourceOnField.abilitiesUsedThisTurn--;
                        const logic = oracle.getCard(sourceOnField.definition.name);
                        const ability = logic?.abilities?.[abilityIndex];
                        if (ability && typeof ability !== 'string' && ability.type === AbilityType.Activated) {
                            const lCost = ability.costs?.find(c => c.type === CostType.Loyalty)?.value;
                            if (lCost !== undefined) {
                                const val = parseInt(String(lCost));
                                sourceOnField.counters.loyalty = (sourceOnField.counters.loyalty || 0) - val;
                                logger.info(state, LogCategory.ACTION, `Refunding loyalty for ${sourceOnField.definition.name}: ${val > 0 ? '+' : ''}${val}`);
                            }
                        }
                    }
                }

                state.pendingAction = undefined;
                state.priorityPlayerId = playerId;

                // CLEANUP TEMPORARY CASTING STATE
                state.interaction.lastChoiceIndex = undefined;
                state.interaction.lastChoiceValue = undefined;
                state.interaction.lastSelections = {};
                state.interaction.flags = {};
                delete state.interaction.lastChosenModeIndex;
                delete state.interaction.lastChoiceX;

                return true;
            }
        }

        if (targetId === "clear") {
            actionData.selectedTargets = [];
            const firstIndex = 0;
            const pool = RuleUtils.getAllVisibleObjectIds(state);
            actionData.targets = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                sourceId: action.sourceId || "",
                controllerId: playerId,
                stackObject: actionData.stackObj,
                targetDefinitions: targetDefinitions,
                targetIndex: firstIndex,
                xValue: xValue
            }, tid));
            updatePrompt();
            logger.info(state, LogCategory.ACTION, `Targeting selection cleared.`);
            return true;
        }

        if (isSkipping) {
            const nextIndex = actionData.selectedTargets.length;
            const currentDef = TargetingProcessor.getDefinitionForIndex(targetDefinitions, nextIndex);

            // Sequential skipping: if we are in an array of definitions, 
            // clicking 'skip' on an optional slot should move to the next slot if available.
            const isChunkOptional = currentDef?.optional || currentDef?.minCount === 0;
            const hasMoreSlots = nextIndex < maxCount;

            if (isChunkOptional && Array.isArray(targetDefinitions) && hasMoreSlots) {
                // Find if there are more definitions after the current index's definition
                let cumulative = 0;
                let hasLaterDefinition = false;
                for (let i = 0; i < targetDefinitions.length; i++) {
                    const d = targetDefinitions[i];
                    const dCount = typeof d.count === 'number' ? d.count : 1;
                    cumulative += dCount;
                    if (nextIndex < cumulative) {
                        // We found the current definition chunk at index i
                        if (i < targetDefinitions.length - 1 || nextIndex < cumulative - 1) {
                            hasLaterDefinition = true;
                        }
                        break;
                    }
                }

                if (hasLaterDefinition) {
                    actionData.selectedTargets.push(null);
                    updatePrompt();

                    const newNextIndex = actionData.selectedTargets.length;
                    const newNextDef = TargetingProcessor.getDefinitionForIndex(targetDefinitions, newNextIndex);
                    if (newNextDef?.label) {
                        actionData.label = newNextDef.label;
                    }

                    // Refresh targets for the new index
                    const pool = [
                        ...Object.keys(state.players),
                        ...state.battlefield.map(o => o.id),
                        ...state.exile.map(o => o.id),
                        ...state.stack.map(o => o.id),
                        ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
                    ];
                    actionData.targets = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                        sourceId: action.sourceId || "",
                        controllerId: playerId,
                        stackObject: actionData.stackObj,
                        targetDefinitions: targetDefinitions,
                        targetIndex: newNextIndex,
                        xValue: xValue
                    }, tid));

                    logger.info(state, LogCategory.ACTION, `Skipped optional target slot ${newNextIndex}.`);
                    return true;
                }
            }

            if (minCount > 0 && (actionData.selectedTargets?.filter((t: any) => t !== null).length || 0) < minCount) {
                logger.info(state, LogCategory.ACTION, `Targeting requirement not met: ${actionData.selectedTargets?.filter((t: any) => t !== null).length || 0}/${minCount}. Please select more targets.`);
                return false;
            }
            return engine.finaliseTargeting(playerId, actionData.selectedTargets);
        }

        const validTargets = actionData.targets || [];
        logger.info(state, LogCategory.ACTION, `[TARGET-DEBUG] Player ${playerId} selecting target ${targetId}. Valid targets: ${JSON.stringify(validTargets)}`);

        if (!validTargets.includes(targetId)) {
            // CR 115.1: If the user clicked the card representing the spell, resolve it to the spell's stack ID
            const stackAlias = state.stack.find(s => s.sourceObject?.id === targetId && validTargets.includes(s.id))?.id;
            if (stackAlias) {
                logger.info(state, LogCategory.ACTION, `[TARGET-ALIAS] Mapping card ID ${targetId} to stack ID ${stackAlias}`);
                targetId = stackAlias;
            } else {
                logger.info(state, LogCategory.ACTION, `Invalid target selected: ${targetId}. Valid targets are: ${validTargets.join(', ')}`);
                return false;
            }
        }

        // Duplicate check (Rule 115.3: Allow same target if chosen for DIFFERENT instances of the word 'target')
        const nextIndex = actionData.selectedTargets.length;
        let isDuplicate = false;
        if (Array.isArray(targetDefinitions)) {
            let cumulative = 0;
            for (const d of targetDefinitions) {
                const dCount = typeof d.count === 'number' ? d.count : 1;
                const endIdx = cumulative + dCount;
                if (nextIndex >= cumulative && nextIndex < endIdx) {
                    // Check only within the current definition chunk
                    const currentChunk = actionData.selectedTargets.slice(cumulative, nextIndex);
                    if (currentChunk.includes(targetId)) {
                        isDuplicate = true;
                    }
                    break;
                }
                cumulative = endIdx;
            }
        } else {
            // Single definition: block all duplicates
            if (actionData.selectedTargets.includes(targetId)) {
                isDuplicate = true;
            }
        }

        if (isDuplicate) {
            logger.info(state, LogCategory.ACTION, `Target already selected for this instance of the word 'target'.`);
            return false;
        }

        // Prevent adding more than the max allowed targets
        if (actionData.selectedTargets.length >= maxCount) {
            logger.info(state, LogCategory.ACTION, `Maximum targets (${maxCount}) reached. Please confirm your selection.`);
            return false;
        }

        actionData.selectedTargets = [...actionData.selectedTargets, targetId];
        updatePrompt();
        // Update legal targets for the next index if there are more targets to select
        if (actionData.selectedTargets.length < maxCount) {
            const nextIndex = actionData.selectedTargets.length;
            const currentDef = this.getDefinitionForIndex(targetDefinitions, nextIndex, xValue);
            if (currentDef?.label) {
                actionData.label = currentDef.label;
            }
            const pool = [
                ...Object.keys(state.players),
                ...state.battlefield.map((o: any) => o.id),
                ...state.exile.map((o: any) => o.id),
                ...state.stack.map((o: any) => o.id),
                ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((c: any) => c.id))
            ];

            actionData.targets = pool.filter(tid => this.isLegalTarget(state, {
                sourceId: action.sourceId || "",
                controllerId: playerId,
                stackObject: actionData.stackObj,
                targetDefinitions: targetDefinitions,
                targetIndex: nextIndex,
                xValue: xValue
            }, tid));

            // ENHANCEMENT: Consecutive Zone Shift
            // If the current target is off-battlefield, group all consecutive off-battlefield targets into one modal.
            const isOffBattlefield = currentDef?.type === TargetType.CardInGraveyard || currentDef?.type === TargetType.CardInExile;

            if (isOffBattlefield && actionData.targets.length > 0) {
                // Calculate how many consecutive targets from this point share an off-battlefield zone
                let consecutiveCount = 0;
                let consecutiveMin = 0;
                for (let i = nextIndex; i < maxCount; i++) {
                    const d = this.getDefinitionForIndex(targetDefinitions, i, xValue);
                    if (d?.type === TargetType.CardInGraveyard || d?.type === TargetType.CardInExile) {
                        consecutiveCount++;
                        if (d && !d.optional && (d.minCount === undefined || (typeof d.minCount === 'number' && d.minCount > 0))) {
                            consecutiveMin++;
                        }
                    } else {
                        break;
                    }
                }

                const choices = actionData.targets.map((tid: string) => {
                    const obj = RuleUtils.findObject(state, tid);
                    const label = RuleUtils.isEntity(obj) ? obj.definition.name : (RuleUtils.isPlayer(obj) ? obj.name : tid);
                    return {
                        label,
                        value: tid,
                        cardData: (obj && 'zone' in obj) ? (obj as GameObject) : undefined,
                        selectable: true
                    };
                });

                state.pendingAction.type = ActionType.ModalSelection;
                actionData.isTargetingModal = true;
                actionData.choices = choices;

                // The modal only handles THIS block of targets
                actionData.minChoices = Math.max(1, consecutiveMin);
                actionData.maxChoices = consecutiveCount;

                // Ensure we keep existing targets for ChoiceProcessor to append to
                actionData.declaredTargets = actionData.selectedTargets;
                return true;
            }
        }

        return true;
    }

    /**
     * CR 603: Finalize a targeting sequence and resume the effect chain.
     */
    public static finaliseTargeting(state: GameState, playerId: PlayerId, resolvedTargets: string[], engine: EngineContext): boolean {
        const action = state.pendingAction;
        if (!action || !action.data) return false;
        const actionData = action.data;
        const sourceId = action.sourceId;
        const abilityIndex = actionData.abilityIndex;
        const stackObj = (actionData.spellCopyRef || actionData.stackObj) as StackObject;

        const { logger, effect: EffectProcessor, trigger: TriggerProcessor } = getProcessors(state);
        console.log(`[TARGET-FINAL] Finalizing for ${sourceId}. isFreeCast=${actionData?.isFreeCast}, hasParent=${!!actionData?.parentContext}, hasStackObj=${!!actionData?.stackObj}`);

        if (actionData?.isCostChoice) {
            state.interaction.lastSelections[actionData.costType] = resolvedTargets;
            
            // Reconstruct the original choice action to resume resolution
            state.pendingAction = {
                type: ActionType.ResolutionChoice,
                playerId: playerId,
                sourceId: sourceId!,
                data: actionData.originalActionData || actionData
            };
            
            logger.info(state, LogCategory.ACTION, `[COST-FINAL] Cost paid. Resuming original choice resolution for ${sourceId}.`);
            return getProcessors(state).choice.resolveChoice(state, playerId, 'confirm', engine);
        }

        if (actionData?.isCostTargeting) {
            if (actionData.costType === 'Sacrifice') {
                state.interaction.lastSelections['Sacrifice'] = [resolvedTargets[0]];
            }
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            return engine.playCard({
                playerId,
                cardId: sourceId!,
                targets: actionData.declaredTargets || [],
                bypassPriority: false,
                isFreeCast: actionData.isFreeCast,
                parentContext: actionData.parentContext
            });
        }

        if (actionData?.nextEffectIndex !== undefined) {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            
            const finalTargets = (actionData.isCopyTargeting && (resolvedTargets === null || resolvedTargets.length === 0))
                ? (actionData._backupTargets || [])
                : resolvedTargets;

            const savedTargets = [...(actionData.targets || []), ...finalTargets];
            const savedEffects = actionData.effects || [];
            
            // If this is a copy, we update the spell copy on the stack
            if (stackObj && actionData.isCopyTargeting) {
                stackObj.targets = finalTargets;
                
                // UI METADATA REFRESH
                if (!stackObj.data) stackObj.data = {};
                stackObj.data.targetsControllers = finalTargets.map((tid: string) => {
                    const obj = RuleUtils.findObject(state, tid);
                    return RuleUtils.isPlayer(obj) ? obj.id : (RuleUtils.isEntity(obj) ? obj.controllerId : null);
                });
                const targetNames = finalTargets.map((tid: string) => {
                    const obj = RuleUtils.findObject(state, tid);
                    return RuleUtils.isEntity(obj) ? obj.definition.name : (RuleUtils.isPlayer(obj) ? obj.name : tid);
                });
                if (targetNames.length > 0) {
                    stackObj.data.summary = `targeting ${targetNames.join(', ')}`;
                }
                logger.info(state, LogCategory.TARGETING, `[COPY-TARGETING] Updated targets for copy ${stackObj.id}: ${finalTargets.join(', ')}`);
            }

            // Legacy stackId handling
            if (actionData.stackId) {
                const existingObject = state.stack.find(s => s.id === actionData.stackId);
                if (existingObject) {
                    existingObject.targets = finalTargets;
                    if (!existingObject.data) existingObject.data = {};
                    existingObject.data.targetsControllers = finalTargets.map((tid: string) => {
                        const obj = RuleUtils.findObject(state, tid);
                        return obj ? obj.controllerId : null;
                    });
                }
            }

            // Resume the parent resolution (e.g. Aziza's trigger)
            const resumeSourceId = actionData.isCopyTargeting ? (actionData.parentContext?.sourceId || sourceId!) : (actionData.sourceId || sourceId!);
            const resumeStackObj = actionData.isCopyTargeting ? (actionData.parentContext?.stackObject || stackObj) : stackObj;

            EffectProcessor.resolveEffects({
                state,
                effects: savedEffects,
                sourceId: resumeSourceId,
                targets: savedTargets,
                startIndex: actionData.nextEffectIndex,
                stackObject: resumeStackObj,
                parentContext: actionData.parentContext,
            });

            if (!state.pendingAction) {
                if (actionData.parentContext) {
                    return ResolutionManager.resume(state, engine);
                }
                engine.resetPriorityToActivePlayer();
            }
            return true;
        }

        // If we have a stackObj (usually for copies or resolution-time targeting), 
        // update its targets and potentially finalize it.
        // IMPORTANT: Standard spell casts from hand (isSpellCasting=true) should NOT 
        // use this shortcut; they must fall through to engine.playCard for full sequence.
        if (stackObj && (!actionData.isSpellCasting || actionData.isCopyTargeting)) {
            const finalTargets = (actionData.isCopyTargeting && (resolvedTargets === null || resolvedTargets.length === 0))
                ? (actionData._backupTargets || [])
                : resolvedTargets;

            stackObj.targets = finalTargets;

            // UI METADATA REFRESH: Update controllers and summary for frontend arrows/labels
            if (!stackObj.data) stackObj.data = {};
            stackObj.data.targetsControllers = finalTargets.map((tid: string) => {
                const obj = RuleUtils.findObject(state, tid);
                return RuleUtils.isPlayer(obj) ? obj.id : (RuleUtils.isEntity(obj) ? obj.controllerId : null);
            });
            
            // Build a human-readable summary for the stack UI
            const targetNames = finalTargets.map((tid: string) => {
                const obj = RuleUtils.findObject(state, tid);
                return RuleUtils.isEntity(obj) ? obj.definition.name : (RuleUtils.isPlayer(obj) ? obj.name : tid);
            });
            if (targetNames.length > 0) {
                stackObj.data.summary = `targeting ${targetNames.join(', ')}`;
            }

            // BUG FIX: Prevent double-pushing triggers that were already added to the stack by TriggerProcessor
            const isAlreadyOnStack = state.stack.some(s => s === stackObj || s.id === stackObj.id);
            if (!isAlreadyOnStack) {
                state.stack.push(stackObj);
            }

            state.consecutivePasses = 0;

            logger.info(state, LogCategory.STACK, `--------------------------------------------------`);
            logger.info(state, LogCategory.STACK, `[STACK] + ${engine.getPlayerName(stackObj.controllerId)} cast/activated ${stackObj.sourceObject?.definition.name || stackObj.type}`);
            logger.info(state, LogCategory.STACK, `[STACK] Target(s): ${targetNames.join(', ')}`);
            logger.info(state, LogCategory.STACK, `--------------------------------------------------`);

            state.pendingAction = undefined;

            // Brand New: Handle queued triggers via ResolutionManager
            if (actionData.nextTriggersToStack && Array.isArray(actionData.nextTriggersToStack)) {
                ResolutionManager.stackTriggers(state, actionData.nextTriggersToStack);
                if (state.pendingAction) return true; // Still more interactions needed
            }

            if (actionData.parentContext) {
                // BUG FIX: If this was targeting for a COPY (created by a trigger/spell), 
                // we should resume the parent resolution (the trigger) rather than resolving the copy itself.
                // The copy should remain on the stack to be resolved later.
                const isCopy = !!actionData.isCopyTargeting;
                const resumeObj = isCopy ? actionData.parentContext.stackObject : stackObj;
                const resumeSourceId = isCopy ? (actionData.parentContext.stackObject?.id || sourceId!) : (sourceId || stackObj.sourceId);

                if (resumeObj) {
                    return ResolutionManager.resume(state, engine, resumeObj as any, resumeSourceId, actionData.parentContext);
                }
            }

            state.priorityPlayerId = playerId;
            engine.checkAutoPass(playerId);
            return true;
        }

        if (abilityIndex !== undefined) {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            const success = engine.activateAbility({
                playerId,
                cardId: sourceId!,
                abilityIndex,
                targets: resolvedTargets,
                xValue: actionData?.xValue,
                bypassPriority: true,
                bypassTargeting: true,
                parentContext: actionData?.parentContext
            });
            engine.checkAutoPass(playerId);
            return success;
        } else {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            const success = engine.playCard({
                playerId,
                cardId: sourceId!,
                targets: resolvedTargets,
                xValue: actionData?.xValue,
                bypassPriority: true,
                bypassTargeting: true,
                parentContext: actionData?.parentContext,
                isFreeCast: actionData?.isFreeCast,
                exileOnResolution: actionData?.exileOnResolution
            });
            engine.checkAutoPass(playerId);
            return success;
        }
    }
}