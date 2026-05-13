import {
    GameObject,
    GameState,
    PlayerId,
    EngineFrame,
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
    StackObject,
    AbilityDefinition,
    AbilityCost,
    TargetingActionData
} from '@shared/engine_types';
import { isTargetingData } from '../../../utils/ActionTypeGuards';
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
import { StackProcessor } from '../../core/stack/StackProcessor';
import { getActionMeta } from '@shared/utils/ActionUtils';

/**
 * Rules Engine Module: Targeting (Rule 115)
 * Retains interactive flow and facets while validation/mapping is extracted.
 */
export class TargetingProcessor {

    // --- FACADES FOR EXTRACTED MODULES ---
    public static calculateTotalCounts(targetDefinitions: TargetDefinition[], xValue: number = 0) { return TargetMapper.calculateTotalCounts(targetDefinitions, xValue); }
    public static getCountsForDefinition(d: TargetDefinition | null, xValue: number = 0) { return TargetMapper.getCountsForDefinition(d, xValue); }
    public static generateTargetPrompt(targetDefinitions: TargetDefinition[], selectedCount: number, xValue: number = 0, isSpellCasting: boolean = false) { return TargetMapper.generateTargetPrompt(targetDefinitions, selectedCount, xValue, isSpellCasting); }
    public static isLegalTarget(state: GameState, context: EngineFrame, targetId: string): boolean { return TargetValidator.isLegalTarget(state, context, targetId); }
    public static hasLegalTargets(state: GameState, sourceId: string, targetDefinitions: TargetDefinition[] | undefined, controllerId: string, xValue: number = 0): boolean { return TargetValidator.hasLegalTargets(state, sourceId, targetDefinitions || [], controllerId, xValue); }
    public static matchesRestrictions(state: GameState, target: Targetable | string, restrictions: (TargetRestriction | string)[], context: EngineFrame): boolean { return TargetValidator.matchesRestrictions(state, target, restrictions, context); }
    public static sourceHasQualities(source: Targetable, qualities: string[], state?: GameState): boolean { return TargetValidator.sourceHasQualities(source, qualities, state); }
    public static getColors(obj: Targetable, state?: GameState): string[] { return TargetValidator.getColors(obj, state); }
    public static getLegalTargetPool(state: GameState, sourceId: string, targetDefinitions: TargetDefinition[], controllerId: string, targetIndex: number = 0, xValue: number = 0): string[] { return TargetValidator.getLegalTargetPool(state, sourceId, targetDefinitions, controllerId, targetIndex, xValue); }
    public static resolveTargetMapping(state: GameState, mapping: string, context: EngineFrame, effect?: Partial<EffectDefinition> | ActivatedAbility | TriggeredAbility | ReplacementEffect | PreventionEffect): string[] { return TargetMapper.resolveTargetMapping(state, mapping, context, effect); }
    public static getDefinitionForIndex(targetDefinitions: TargetDefinition[], targetIndex: number, xValue: number = 0): TargetDefinition | null { return TargetMapper.getDefinitionForIndex(targetDefinitions, targetIndex, xValue); }
    public static shouldFizzle(state: GameState, context: EngineFrame, targets: string[], effects: EffectDefinition[]): boolean { return TargetValidator.shouldFizzle(state, context, targets, effects); }

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
        if (!action.data || !isTargetingData(action.data)) return false;
        const actionData = action.data;
        const meta = getActionMeta(action);
        const targetDefinitions = actionData.targetDefinitions as TargetDefinition[];
        const xValue = (meta.xValue !== undefined ? meta.xValue : (meta.stackObj?.xValue || 0));
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
                actionData.selectedTargets!.length,
                xValue,
                meta.isSpellCasting
            );
        };
        updatePrompt();

        if (isUndoing) {
            if (action.data?.hideUndo) {
                logger.info(state, LogCategory.ACTION, `Undo blocked: this action is mandatory.`);
                return false;
            }

            if (actionData.selectedTargets.length > 0) {
                const removed = actionData.selectedTargets.pop();

                // Refresh prompt and pool for the NEW index after removing
                const nextIndex = actionData.selectedTargets.length;
                const currentDef = this.getDefinitionForIndex(targetDefinitions, nextIndex, xValue);
                actionData.label = currentDef?.label || `Select target for ${meta.stackObj?.name || meta.stackObj?.definition.name || 'this effect'}`;
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
                    stackObject: meta.stackObj,
                    targetDefinitions: targetDefinitions,
                    targetIndex: nextIndex,
                    xValue: xValue,
                    effectIndex: 0,
                    isResumption: false,
                    effects: [],
                    targets: []
                }, tid));

                updatePrompt();
                logger.info(state, LogCategory.ACTION, `Removed last target: ${removed}`);
                return true;
            } else {
                logger.info(state, LogCategory.ACTION, `Targeting cancelled.`);
                const sourceId = action.sourceId;
                const stackId = actionData.stackId;
                const stackObj = meta.stackObj;

                if (stackObj && stackObj.sourceObject) {
                    const player = state.players[stackObj.controllerId];
                    if (player) {
                        stackObj.sourceObject.xValue = undefined; // Explicitly clear before move

                        // BUG FIX: Only move to hand if it's a SPELL. 
                        // Triggered abilities and Activated abilities should NOT move their source permanent.
                        if (stackObj.type === AbilityType.Spell) {
                            ActionProcessor.moveCard(state, stackObj.sourceObject, Zone.Hand, stackObj.controllerId);
                            ManaProcessor.refundManaCost(player, stackObj.sourceObject.definition.manaCost);
                            logger.info(state, LogCategory.ACTION, `Refunding mana for ${stackObj.sourceObject.definition.name}: ${stackObj.sourceObject.definition.manaCost}`);
                        } else if (stackObj.type === AbilityType.Activated) {
                            // Activated abilities stay on battlefield but refund costs if they weren't finalized
                            ManaProcessor.refundManaCost(player, stackObj.sourceObject.definition.manaCost);
                            logger.info(state, LogCategory.ACTION, `Refunding mana for activated ability of ${stackObj.sourceObject.definition.name}.`);
                        }
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
                    const abilityIndex = meta.abilityIndex;
                    // ONLY refund and decrement usage if the ability was actually finalized (paid for)
                    // increments happen in SpellProcessor.finalizeAbilityActivation
                    if (sourceOnField.abilitiesUsedThisTurn > 0 && abilityIndex !== undefined) {
                        sourceOnField.abilitiesUsedThisTurn--;
                        const ability = (sourceOnField.definition.abilities as AbilityDefinition[])?.[abilityIndex];
                        if (ability && typeof ability !== 'string' && ability.type === AbilityType.Activated) {
                            const lCost = ability.costs?.find((c: AbilityCost) => c.type === CostType.Loyalty)?.value;
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
                stackObject: meta.stackObj,
                targetDefinitions: targetDefinitions,
                targetIndex: firstIndex,
                xValue: xValue,
                effectIndex: 0,
                isResumption: false,
                effects: [],
                targets: []
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
                    actionData.label = newNextDef?.label || `Select target for ${meta.stackObj?.name || meta.stackObj?.definition.name || 'this effect'}`;

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
                        stackObject: meta.stackObj,
                        targetDefinitions: targetDefinitions,
                        targetIndex: newNextIndex,
                        xValue: xValue,
                        effectIndex: 0,
                        isResumption: false,
                        effects: [],
                        targets: []
                    }, tid));

                    logger.info(state, LogCategory.ACTION, `Skipped optional target slot ${newNextIndex}.`);
                    return true;
                }
            }

            if (minCount > 0 && (actionData.selectedTargets?.filter((t: any) => t !== null).length || 0) < minCount) {
                logger.info(state, LogCategory.ACTION, `Targeting requirement not met: ${actionData.selectedTargets?.filter((t: any) => t !== null).length || 0}/${minCount}. Please select more targets.`);
                return false;
            }
            return engine.finaliseTargeting(playerId, actionData.selectedTargets.filter((t): t is string => t !== null));
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
            actionData.label = currentDef?.label || `Select target for ${meta.stackObj?.name || meta.stackObj?.definition.name || 'this effect'}`;
            const pool = [
                ...Object.keys(state.players),
                ...state.battlefield.map((o) => o.id),
                ...state.exile.map((o) => o.id),
                ...state.stack.map((o) => o.id),
                ...(Object.values(state.players).flatMap(p => p.graveyard.map((c) => c.id)))
            ];

            actionData.targets = pool.filter(tid => this.isLegalTarget(state, {
                sourceId: action.sourceId || "",
                controllerId: playerId,
                stackObject: meta.stackObj,
                targetDefinitions: targetDefinitions,
                targetIndex: nextIndex,
                xValue: xValue,
                effectIndex: 0,
                isResumption: false,
                effects: [],
                targets: []
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
                    const label = RuleUtils.isEntity(obj) ? (obj.definition.name || 'Unknown') : (RuleUtils.isPlayer(obj) ? obj.name : tid);
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
                actionData.declaredTargets = actionData.selectedTargets.filter((t): t is string => t !== null);
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
        if (!action || !action.data || !isTargetingData(action.data)) return false;
        const actionData = action.data as TargetingActionData;
        const meta = getActionMeta(action);
        const sourceId = action.sourceId;
        const abilityIndex = meta.abilityIndex;
        const stackObj = (meta.spellCopyRef || meta.stackObj) as StackObject;

        const { logger, effect: EffectProcessor, trigger: TriggerProcessor } = getProcessors(state);
        const stackIds = state.stack.map(s => s.id).join(', ');
        logger.debug(state, LogCategory.TARGETING, `[TARGET-FINAL] Finalizing for ${sourceId}. isFreeCast=${meta.isFreeCast}, hasParent=${!!meta.parentContext}, hasStackObj=${!!meta.stackObj}, parentStackId=${meta.parentStackId}, parentSourceId=${meta.parentSourceId}. Stack IDs: [${stackIds}]`);

        if (actionData?.isCostChoice && actionData.costType) {
            state.interaction.lastSelections[actionData.costType as string] = resolvedTargets;

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

        if (meta.isCostTargeting) {
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
                isFreeCast: meta.isFreeCast,
                parentContext: meta.parentContext
            });
        }

        // --- CASE 1: Standard Spell/Ability Cast (isSpellCasting) ---
        // We MUST go through playCard/activateAbility to ensure the object reaches the stack 
        // and all ETB/Cast triggers fire correctly.
        if (meta.isSpellCasting && !meta.isCopyTargeting) {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;

            let success = false;
            if (abilityIndex !== undefined) {
                success = engine.activateAbility({
                    playerId,
                    cardId: sourceId!,
                    abilityIndex,
                    targets: resolvedTargets,
                    xValue: meta.xValue,
                    bypassPriority: true,
                    bypassTargeting: true,
                    parentContext: meta.parentContext
                });
            } else {
                success = engine.playCard({
                    playerId,
                    cardId: sourceId!,
                    targets: resolvedTargets,
                    xValue: meta.xValue,
                    bypassPriority: true,
                    bypassTargeting: true,
                    parentContext: meta.parentContext,
                    isFreeCast: meta.isFreeCast,
                    exileOnResolution: meta.exileOnResolution
                });
            }

            // If the cast was successful and didn't trigger a new suspension, 
            // and we have a parent resolution waiting, resume it now.
            if (success && !state.pendingAction && meta.parentContext && meta.effectIndex !== undefined) {
                logger.info(state, LogCategory.ACTION, `[TARGET-FINAL] Spell cast finished, resuming parent resolution for ${meta.parentContext.sourceId}`);
                EffectProcessor.resolveEffects({
                    state,
                    context: EffectProcessor.createEngineFrame(state, {
                        sourceId: meta.parentContext.sourceId,
                        effects: meta.effects || [],
                        targets: meta.targets || [],
                        effectIndex: meta.effectIndex,
                        isResumption: true,
                        stackObject: meta.parentContext.stackObject,
                        parentContext: meta.parentContext.parentContext,
                        exileOnResolution: meta.exileOnResolution
                    }),
                });

                if (!state.pendingAction) {
                    return ResolutionManager.resume(state, engine);
                }
            } else if (!state.pendingAction) {
                engine.checkAutoPass(playerId);
            }
            return success;
        }

        // --- CASE 2: Resolution-Time Effects (e.g. "Exile target, then draw") ---
        // These resume the current effect chain directly.
        if (meta.effectIndex !== undefined) {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;

            const finalTargets = (meta.isCopyTargeting && (resolvedTargets === null || resolvedTargets.length === 0))
                ? (actionData._backupTargets || [])
                : resolvedTargets;

            const savedTargets = [...(meta.targets || []), ...finalTargets];
            const savedEffects = meta.effects || [];

            // If this is a copy or a target change, we update the spell copy on the stack
            if (stackObj && (meta.isCopyTargeting || meta.isChangeTargeting)) {
                StackProcessor.refreshTargetMetadata(state, stackObj, finalTargets);
                logger.info(state, LogCategory.TARGETING, `[${meta.isCopyTargeting ? 'COPY' : 'CHANGE'}-TARGETING] Updated targets for ${stackObj.id}: ${finalTargets.join(', ')}`);
            }

            // Legacy stackId handling
            if (actionData.stackId) {
                const existingObject = state.stack.find(s => s.id === actionData.stackId);
                if (existingObject) {
                    StackProcessor.refreshTargetMetadata(state, existingObject, finalTargets);
                }
            }

            // Resume the current resolution
            let resumeSourceId = (actionData.sourceId || sourceId!);
            let resumeStackObj = stackObj;

            if (meta.parentContext || meta.parentStackId || meta.parentSourceId || meta.isCopyTargeting || meta.isChangeTargeting) {
                const parentId = meta.parentStackId || meta.parentContext?.stackObject?.id;
                const parentSource = meta.parentSourceId || meta.parentContext?.sourceId;
                
                // CRITICAL: Search stack for the parent spell/ability
                const parentObj = state.stack.find(s => (parentId && s.id === parentId) || (parentSource && s.id === parentSource));
                
                logger.debug(state, LogCategory.TARGETING, `[RESUME-PARENT] Attempting to resume parent. ParentId: ${parentId}, ParentSource: ${parentSource}. Found: ${!!parentObj}`);
                
                if (parentObj || meta.parentContext) {
                    // Explicitly clear pendingAction so resume can work
                    state.pendingAction = undefined;
                    
                    return ResolutionManager.resume(state, engine, 
                        parentObj, 
                        parentSource || parentId, 
                        meta.parentContext
                    );
                } else {
                    logger.warn(state, LogCategory.TARGETING, `[RESUME-FAIL] Could not find parent object on stack to resume resolution.`);
                }
            }

            // Fallback for non-parented resumption (legacy)
            EffectProcessor.resolveEffects({
                state,
                context: EffectProcessor.createEngineFrame(state, {
                    sourceId: resumeSourceId,
                    effects: savedEffects,
                    targets: savedTargets,
                    effectIndex: (meta.effectIndex !== undefined ? meta.effectIndex + 1 : undefined),
                    isResumption: true,
                    stackObject: resumeStackObj,
                    parentContext: meta.parentContext,
                    exileOnResolution: meta.exileOnResolution
                }),
            });

            if (!state.pendingAction) {
                if (meta.parentContext) {
                    return ResolutionManager.resume(state, engine);
                }
                engine.resetPriorityToActivePlayer();
            }
            return true;
        }

        // --- CASE 3: Specialized Stack Object Updates (e.g. Copying/Retargeting Spells) ---
        if (stackObj) {
            const finalTargets = (meta.isCopyTargeting && (resolvedTargets === null || resolvedTargets.length === 0))
                ? (actionData._backupTargets || [])
                : resolvedTargets;

            stackObj.targets = finalTargets;

            // UI METADATA REFRESH via centralized helper
            StackProcessor.refreshTargetMetadata(state, stackObj, finalTargets);

            StackProcessor.ensureOnStack(state, stackObj);

            state.consecutivePasses = 0;

            logger.info(state, LogCategory.STACK, `--------------------------------------------------`);
            logger.info(state, LogCategory.STACK, `[STACK] + ${engine.getPlayerName(stackObj.controllerId)} cast/activated ${stackObj.sourceObject?.definition.name || stackObj.type}`);
            logger.info(state, LogCategory.STACK, `[STACK] Target(s): ${stackObj.summary || finalTargets.join(', ')}`);
            logger.info(state, LogCategory.STACK, `--------------------------------------------------`);

            state.pendingAction = undefined;

            // Brand New: Handle queued triggers via ResolutionManager
            if (actionData.nextTriggersToStack && Array.isArray(actionData.nextTriggersToStack)) {
                ResolutionManager.stackTriggers(state, actionData.nextTriggersToStack);
                if (state.pendingAction) return true; // Still more interactions needed
            }

            if (meta.parentContext) {
                // BUG FIX: If this was targeting for a COPY (created by a trigger/spell), 
                // we should resume the parent resolution (the trigger) rather than resolving the copy itself.
                // The copy should remain on the stack to be resolved later.
                const isCopy = !!meta.isCopyTargeting;
                const resumeObj = isCopy ? meta.parentContext.stackObject : stackObj;
                const resumeSourceId = isCopy ? (meta.parentContext.stackObject?.id || sourceId!) : (sourceId || stackObj.sourceId);

                if (resumeObj) {
                    return ResolutionManager.resume(state, engine, resumeObj, resumeSourceId, meta.parentContext);
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
                xValue: meta.xValue,
                bypassPriority: true,
                bypassTargeting: true,
                parentContext: meta.parentContext
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
                xValue: meta.xValue,
                bypassPriority: true,
                bypassTargeting: true,
                parentContext: meta.parentContext,
                isFreeCast: meta.isFreeCast,
                exileOnResolution: meta.exileOnResolution
            });
            engine.checkAutoPass(playerId);
            return success;
        }
    }
}
