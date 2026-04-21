import { GameObject, GameState, PlayerId, ResolutionContext, TargetingContext, Zone } from '@shared/engine_types';
import { EngineContext } from '../../../interfaces/EngineContext';
import { ManaProcessor } from '../../magic/ManaProcessor';
import { ActionProcessor } from '../ActionProcessor';
import { TargetMapper } from './TargetMapper';
import { TargetValidator } from './TargetValidator';

/**
 * Rules Engine Module: Targeting (Rule 115)
 * Retains interactive flow and facets while validation/mapping is extracted.
 */
export class TargetingProcessor {

    // --- FACADES FOR EXTRACTED MODULES ---
    public static calculateTotalCounts(targetDef: any, xValue: number = 0) { return TargetMapper.calculateTotalCounts(targetDef, xValue); }
    public static generateTargetPrompt(targetDef: any, selectedCount: number, xValue: number = 0, isSpellCasting: boolean = false) { return TargetMapper.generateTargetPrompt(targetDef, selectedCount, xValue, isSpellCasting); }
    public static findObjectInAnyZone(state: GameState, id: string): GameObject | null { return TargetValidator.findObjectInAnyZone(state, id); }
    public static isLegalTarget(state: GameState, context: TargetingContext, targetId: string): boolean { return TargetValidator.isLegalTarget(state, context, targetId); }
    public static hasLegalTargets(state: GameState, sourceId: string, targetDef: any, controllerId: string): boolean { return TargetValidator.hasLegalTargets(state, sourceId, targetDef, controllerId); }
    public static matchesRestrictions(state: GameState, targetObj: any, restrictions: any[], context: TargetingContext, log?: (msg: string) => void): boolean { return TargetValidator.matchesRestrictions(state, targetObj, restrictions, context, log); }
    public static sourceHasQualities(source: any, qualities: string[], state?: GameState): boolean { return TargetValidator.sourceHasQualities(source, qualities, state); }
    public static resolveTargetMapping(state: GameState, mapping: string, context: ResolutionContext, effect?: any): string[] { return TargetMapper.resolveTargetMapping(state, mapping, context, effect); }
    public static getDefinitionForIndex(targetDef: any, targetIndex: number): any { return TargetMapper.getDefinitionForIndex(targetDef, targetIndex); }

    /**
     * CR 603: Resolve a specific target selection from the UI.
     */
    public static resolveInteractiveTargeting(
        state: GameState,
        playerId: PlayerId,
        targetId: string,
        log: (m: string) => void,
        engine: {
            resetPriorityToActivePlayer: () => void;
            finaliseTargeting: (p: PlayerId, targets: string[]) => boolean;
        }
    ): boolean {
        if (state.pendingAction?.type !== 'TARGETING' || state.pendingAction.playerId !== playerId || !state.pendingAction.data) return false;

        const action = state.pendingAction;
        const actionData = action.data!;
        const targetDef = actionData.targetDefinition;
        const isOptional = targetDef?.optional || targetDef?.minCount === 0;
        const isSkipping = targetId === 'skip' || targetId === 'none' || targetId === 'confirm' || targetId === 'done';
        const isUndoing = targetId === 'undo' || targetId === 'back';

        const counts = TargetingProcessor.calculateTotalCounts(targetDef, (actionData.xValue !== undefined ? actionData.xValue : (actionData.stackObj?.xValue || 0)));
        const { maxCount, minCount, count } = counts;

        actionData.selectedTargets = actionData.selectedTargets || [];
        actionData.maxCount = maxCount;
        actionData.minCount = minCount;
        actionData.count = count;

        // Helper to refresh prompt based on CURRENT selection state
        const updatePrompt = () => {
            actionData.prompt = TargetingProcessor.generateTargetPrompt(
                targetDef,
                actionData.selectedTargets.length,
                (actionData.xValue !== undefined ? actionData.xValue : (actionData.stackObj?.xValue || 0)),
                actionData.isSpellCasting
            );
        };

        updatePrompt();

        if (isUndoing) {
            if (actionData.selectedTargets.length > 0) {
                const removed = actionData.selectedTargets.pop();

                // Refresh prompt and pool for the NEW index after removing
                const nextIndex = actionData.selectedTargets.length;
                const currentDef = this.getDefinitionForIndex(targetDef, nextIndex);
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
                    targetDef: targetDef,
                    targetIndex: nextIndex
                }, tid));

                updatePrompt();
                log(`Removed last target: ${removed}`);
                return true;
            } else {
                log(`Targeting cancelled.`);
                const sourceId = action.sourceId;
                const stackId = actionData.stackId;
                const stackObj = actionData.stackObj;

                if (stackObj && stackObj.card) {
                    const player = state.players[stackObj.controllerId];
                    if (player) {
                        stackObj.card.xValue = undefined; // Explicitly clear before move
                        ActionProcessor.moveCard(state, stackObj.card, Zone.Hand, stackObj.controllerId, log);
                        ManaProcessor.refundManaCost(player, stackObj.card.definition.manaCost);
                        log(`Refunding mana for ${stackObj.card.definition.name}: ${stackObj.card.definition.manaCost}`);
                    }
                } else if (sourceId) {
                    // Fallback for spells that haven't entered the stack yet (targeting phase)
                    const card = TargetingProcessor.findObjectInAnyZone(state, sourceId);
                    if (card && card.zone === Zone.Hand) {
                        card.xValue = undefined; // Reset state
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
                        
                        const { oracle } = require('../../../OracleLogicMap');
                        const logic = oracle.getCard(sourceOnField.definition.name);
                        const ability = (logic as any)?.abilities?.[abilityIndex];
                        const lCost = ability?.costs?.find((c: any) => String(c.type).toLowerCase() === 'loyalty')?.value;
                        if (lCost !== undefined) {
                            const val = parseInt(String(lCost));
                            sourceOnField.counters['loyalty'] = (sourceOnField.counters['loyalty'] || 0) - val;
                            log(`Refunding loyalty for ${sourceOnField.definition.name}: ${val > 0 ? '+' : ''}${val}`);
                        }
                    }
                }

                state.pendingAction = undefined;
                state.priorityPlayerId = playerId;

                // CLEANUP TEMPORARY CASTING STATE
                delete (state as any).lastChosenCostChoiceIndex;
                delete (state as any).lastChosenSacrificeId;
                delete (state as any).lastChosenDiscardId;
                delete (state as any).lastChosenExileIds;
                delete (state as any).lastChosenModeIndex;
                delete (state as any).lastChoiceIndex;

                return true;
            }
        }

        if (targetId === "clear") {
            actionData.selectedTargets = [];
            const firstIndex = 0;
            const pool = [
                ...Object.keys(state.players),
                ...state.battlefield.map((o: any) => o.id),
                ...state.exile.map((o: any) => o.id),
                ...state.stack.map((o: any) => o.id),
                ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((c: any) => c.id))
            ];
            actionData.targets = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                sourceId: action.sourceId || "",
                controllerId: playerId,
                stackObject: actionData.stackObj,
                targetDef: targetDef,
                targetIndex: firstIndex
            }, tid));
            updatePrompt();
            log(`Targeting selection cleared.`);
            return true;
        }

        if (isSkipping) {
            const nextIndex = actionData.selectedTargets.length;
            const currentDef = TargetingProcessor.getDefinitionForIndex(targetDef, nextIndex);

            // Sequential skipping: if we are in an array of definitions, 
            // clicking 'skip' on an optional slot should move to the next slot if available.
            const isChunkOptional = currentDef?.optional || currentDef?.minCount === 0;
            const hasMoreSlots = nextIndex < maxCount;

            if (isChunkOptional && Array.isArray(targetDef) && hasMoreSlots) {
                // Find if there are more definitions after the current index's definition
                let cumulative = 0;
                let hasLaterDefinition = false;
                for (let i = 0; i < targetDef.length; i++) {
                    const d = targetDef[i];
                    const dCount = typeof d.count === 'number' ? d.count : 1;
                    cumulative += dCount;
                    if (nextIndex < cumulative) {
                        // We found the current definition chunk at index i
                        if (i < targetDef.length - 1 || nextIndex < cumulative - 1) {
                            hasLaterDefinition = true;
                        }
                        break;
                    }
                }

                if (hasLaterDefinition) {
                    actionData.selectedTargets.push(null);
                    updatePrompt();

                    const newNextIndex = actionData.selectedTargets.length;
                    const newNextDef = TargetingProcessor.getDefinitionForIndex(targetDef, newNextIndex);
                    if (newNextDef?.label) {
                        actionData.label = newNextDef.label;
                    }

                    // Refresh targets for the new index
                    const pool = [
                        ...Object.keys(state.players),
                        ...state.battlefield.map((o: any) => o.id),
                        ...state.exile.map((o: any) => o.id),
                        ...state.stack.map((o: any) => o.id),
                        ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((c: any) => c.id))
                    ];
                    actionData.targets = pool.filter(tid => TargetingProcessor.isLegalTarget(state, {
                        sourceId: action.sourceId || "",
                        controllerId: playerId,
                        stackObject: actionData.stackObj,
                        targetDef: targetDef,
                        targetIndex: newNextIndex
                    }, tid));

                    log(`Skipped optional target slot ${newNextIndex}.`);
                    return true;
                }
            }

            if (minCount > 0 && (actionData.selectedTargets?.filter((t: any) => t !== null).length || 0) < minCount) {
                log(`Targeting requirement not met: ${actionData.selectedTargets?.filter((t: any) => t !== null).length || 0}/${minCount}. Please select more targets.`);
                return false;
            }
            return engine.finaliseTargeting(playerId, actionData.selectedTargets);
        }

        const validTargets = actionData.targets || [];
        if (actionData.isCopyTargeting || action.sourceId?.includes('copy')) {
            console.log(`[TARGETING-DEBUG] User clicked ${targetId}. Valid targets count: ${validTargets.length}. Included? ${validTargets.includes(targetId)}`);
            if (validTargets.length < 10) console.log(`[TARGETING-DEBUG] Valid IDs:`, JSON.stringify(validTargets));
        }

        if (!validTargets.includes(targetId)) {
            log(`Invalid target selected.`);
            return false;
        }

        // Duplicate check (Rule 115.3: Allow same target if chosen for DIFFERENT instances of the word 'target')
        const nextIndex = actionData.selectedTargets.length;
        let isDuplicate = false;
        if (Array.isArray(targetDef)) {
            let cumulative = 0;
            for (const d of targetDef) {
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
            log(`Target already selected for this instance of the word 'target'.`);
            return false;
        }

        // Prevent adding more than the max allowed targets
        if (actionData.selectedTargets.length >= maxCount) {
            log(`Maximum targets (${maxCount}) reached. Please confirm your selection.`);
            return false;
        }

        actionData.selectedTargets = [...actionData.selectedTargets, targetId];
        updatePrompt();
        log(`Target ${actionData.selectedTargets.length}/${maxCount} selected: ${targetId}`);

        // Update legal targets for the next index if there are more targets to select
        if (actionData.selectedTargets.length < maxCount) {
            const nextIndex = actionData.selectedTargets.length;
            const currentDef = this.getDefinitionForIndex(targetDef, nextIndex);
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
                targetDef: targetDef,
                targetIndex: nextIndex
            }, tid));
        }

        return true;
    }

    /**
     * CR 603: Finalize a targeting sequence and resume the effect chain.
     */
    public static finaliseTargeting(state: GameState, playerId: PlayerId, resolvedTargets: string[], engine: EngineContext): boolean {
        const actionData = state.pendingAction?.data;
        const sourceId = state.pendingAction?.sourceId;
        const abilityIndex = actionData?.abilityIndex;
        const stackObj = actionData?.stackObj;
        const stackId = actionData?.stackId;

        if (actionData?.isCostTargeting) {
            if (actionData.costType === 'Sacrifice') {
                (state as any).lastChosenSacrificeId = resolvedTargets[0];
            }
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            return engine.playCard({ playerId, cardId: sourceId!, targets: actionData.declaredTargets || [], bypassPriority: false });
        }

        if (actionData?.nextEffectIndex !== undefined) {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            const finalTargets = (actionData.isCopyTargeting && resolvedTargets.length === 0)
                ? (actionData.originalTargets || [])
                : resolvedTargets;

            const savedTargets = [...(actionData.targets || []), ...finalTargets];
            const savedEffects = actionData.effects || [];
            const useSourceId = actionData.sourceId || sourceId!;

            if (actionData.stackId) {
                const existingObject = state.stack.find(s => s.id === actionData.stackId);
                if (existingObject) {
                    existingObject.targets = finalTargets;
                    // Persist target controller IDs
                    if (!existingObject.data) existingObject.data = {};
                    existingObject.data.targetsControllers = finalTargets.map((tid: string) => {
                        const obj = this.findObjectInAnyZone(state, tid);
                        return obj ? obj.controllerId : null;
                    });
                    engine.log(`[TARGETING] Targets confirmed for ${existingObject.type === 'TriggeredAbility' ? 'Trigger' : 'Spell'}: ${finalTargets.join(', ')}`);
                }
            }

            const { EffectProcessor } = require('./../../effects/EffectProcessor');
            EffectProcessor.resolveEffects({
                state,
                effects: savedEffects,
                sourceId: useSourceId,
                targets: savedTargets,
                log: (m: string) => engine.log(m),
                startIndex: actionData.nextEffectIndex,
                stackObject: stackObj,
                parentContext: actionData.parentContext,
            });

            // --- RESUME PARENT CONTEXTS (NESTED RESOLUTION) ---
            let currentCtx = actionData.parentContext;
            while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex < currentCtx.effects.length) {
                engine.log(`[RESOLVING] Returning to parent context for ${useSourceId}...`);
                const pEffs = currentCtx.effects;
                const pNext = currentCtx.nextEffectIndex;
                const pSource = currentCtx.sourceId || sourceId!;
                const pTargets = currentCtx.targets || [];
                const pStackObj = currentCtx.stackObj;
                const pGrantContext = currentCtx.parentContext;

                currentCtx = pGrantContext;
                EffectProcessor.resolveEffects({
                    state,
                    effects: pEffs,
                    sourceId: pSource,
                    targets: pTargets,
                    log: (m: string) => engine.log(m),
                    startIndex: pNext,
                    stackObject: pStackObj,
                    parentContext: pGrantContext,
                });
            }

            if (!state.pendingAction) {
                engine.resetPriorityToActivePlayer();
            }
            return true;
        }

        if (stackObj) {
            const finalTargets = (actionData.isCopyTargeting && (resolvedTargets === null || resolvedTargets.length === 0))
                ? (actionData._backupTargets || [])
                : resolvedTargets;

            stackObj.targets = finalTargets;
            
            // BUG FIX: Prevent double-pushing triggers that were already added to the stack by TriggerProcessor
            const isAlreadyOnStack = state.stack.some(s => s === stackObj || s.id === stackObj.id);
            if (!isAlreadyOnStack) {
                state.stack.push(stackObj);
            }
            
            state.consecutivePasses = 0;

            engine.log(`--------------------------------------------------`);
            engine.log(`[STACK] + ${engine.getPlayerName(stackObj.controllerId)} cast/activated ${stackObj.card?.definition.name || stackObj.type}`);
            const targetNames = resolvedTargets.map(tid => {
                const obj = TargetingProcessor.findObjectInAnyZone(state, tid);
                return obj?.definition?.name || (state.players[tid as any] ? state.players[tid as any].name : tid);
            });
            engine.log(`[STACK] Target(s): ${targetNames.join(', ')}`);
            engine.log(`--------------------------------------------------`);

            state.pendingAction = undefined;
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
                bypassTargeting: true
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
                bypassTargeting: true
            });
            engine.checkAutoPass(playerId);
            return success;
        }
    }
}