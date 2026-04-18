import { GameObject, GameObjectId, GameState, PlayerId, Zone, TargetType, TargetMapping } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { ActionProcessor } from './ActionProcessor';
import { TargetValidator } from './TargetValidator';
import { TargetMapper } from './TargetMapper';

/**
 * Rules Engine Module: Targeting (Rule 115)
 * Retains interactive flow and facets while validation/mapping is extracted.
 */
export class TargetingProcessor {

    // --- FACADES FOR EXTRACTED MODULES ---
    public static calculateTotalCounts(targetDef: any, xValue: number = 0) { return TargetMapper.calculateTotalCounts(targetDef, xValue); }
    public static generateTargetPrompt(targetDef: any, selectedCount: number, xValue: number = 0, isSpellCasting: boolean = false) { return TargetMapper.generateTargetPrompt(targetDef, selectedCount, xValue, isSpellCasting); }
    public static findObjectInAnyZone(state: GameState, id: string): GameObject | null { return TargetValidator.findObjectInAnyZone(state, id); }
    public static isLegalTarget(state: GameState, sourceOrId: string | any, targetId: string, abilityTargetDef?: any, targetIndex: number = 0): boolean { return TargetValidator.isLegalTarget(state, sourceOrId, targetId, abilityTargetDef, targetIndex); }
    public static hasLegalTargets(state: GameState, sourceId: string, targetDef: any, controllerId: string): boolean { return TargetValidator.hasLegalTargets(state, sourceId, targetDef, controllerId); }
    public static matchesRestrictions(state: GameState, targetObj: any, restrictions: any[], controllerId: string | null, sourceId: string, log?: (msg: string) => void, stackObject?: any): boolean { return TargetValidator.matchesRestrictions(state, targetObj, restrictions, controllerId, sourceId, log, stackObject); }
    public static sourceHasQualities(source: any, qualities: string[], state?: GameState): boolean { return TargetValidator.sourceHasQualities(source, qualities, state); }
    public static resolveTargetMapping(state: GameState, mapping: string, targets: string[], sourceId: GameObjectId, controllerId: PlayerId, stackData?: any, effect?: any, parentContext?: any): string[] { return TargetMapper.resolveTargetMapping(state, mapping, targets, sourceId, controllerId, stackData, effect, parentContext); }
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
        if (state.pendingAction?.type !== 'TARGETING' || state.pendingAction.playerId !== playerId) return false;

        const actionData = state.pendingAction.data;
        const targetDef = actionData?.targetDefinition;
        const isOptional = targetDef?.optional || targetDef?.minCount === 0;
        const isSkipping = targetId === 'skip' || targetId === 'none' || targetId === 'confirm';
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
                    state.pendingAction!.data.label = currentDef.label;
                }
                const pool = [
                    ...Object.keys(state.players),
                    ...state.battlefield.map((o: any) => o.id),
                    ...state.exile.map((o: any) => o.id),
                    ...state.stack.map((o: any) => o.id),
                    ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((c: any) => c.id))
                ];
                actionData.targets = pool.filter(tid => this.isLegalTarget(state, state.pendingAction!.sourceId, tid, targetDef, nextIndex));

                updatePrompt();
                log(`Removed last target: ${removed}`);
                return true;
            } else {
                log(`Targeting cancelled.`);
                const sourceId = state.pendingAction.sourceId;
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
                }
                state.stack = state.stack.filter(s => s.id !== stackId);

                const sourceOnField = state.battlefield.find(o => o.id === sourceId);
                if (sourceOnField) {
                    if (sourceOnField.abilitiesUsedThisTurn > 0) sourceOnField.abilitiesUsedThisTurn--;
                    const abilityIndex = actionData.abilityIndex;
                    if (abilityIndex !== undefined) {
                        const { oracle } = require('../../OracleLogicMap');
                        const logic = oracle.getCard(sourceOnField.definition.name);
                        const ability = (logic as any)?.abilities?.[abilityIndex];
                        const lCost = ability?.costs?.find((c: any) => c.type === 'Loyalty')?.value;
                        if (lCost !== undefined) {
                            sourceOnField.counters['loyalty'] = (sourceOnField.counters['loyalty'] || 0) - lCost;
                            log(`Refunding loyalty for ${sourceOnField.definition.name}: ${lCost > 0 ? '+' : ''}${lCost}`);
                        }
                    }
                }

                state.pendingAction = undefined;
                state.priorityPlayerId = playerId;
                return true;
            }
        }

        if (targetId === 'clear') {
            actionData.selectedTargets = [];
            updatePrompt();
            log(`Targeting selection cleared.`);
            return true;
        }

        if (isSkipping) {
            if (actionData.selectedTargets.length < minCount) {
                log(`Targeting is required (minimum ${minCount}), cannot finalize yet.`);
                return false;
            }
            return engine.finaliseTargeting(playerId, actionData.selectedTargets);
        }

        const validTargets = actionData.targets || [];
        if (!validTargets.includes(targetId)) {
            log(`Invalid target selected.`);
            return false;
        }

        if (actionData.selectedTargets.includes(targetId)) {
            log(`Target already selected.`);
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
                state.pendingAction!.data.label = currentDef.label;
            }
            const pool = [
                ...Object.keys(state.players),
                ...state.battlefield.map((o: any) => o.id),
                ...state.exile.map((o: any) => o.id),
                ...state.stack.map((o: any) => o.id),
                ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((c: any) => c.id))
            ];
            actionData.targets = pool.filter(tid => this.isLegalTarget(state, state.pendingAction!.sourceId, tid, targetDef, nextIndex));
        }

        return true;
    }

    /**
     * CR 603: Finalize a targeting sequence and resume the effect chain.
     */
    public static finaliseTargeting(state: GameState, playerId: PlayerId, resolvedTargets: string[], engine: any): boolean {
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
            return engine.playCard(playerId, sourceId!, actionData.declaredTargets || [], false);
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

            const { EffectProcessor } = require('./../effects/EffectProcessor');
            EffectProcessor.resolveEffects(state, savedEffects, useSourceId, savedTargets, (m: string) => engine.log(m), actionData.nextEffectIndex, stackObj, actionData.parentContext);

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
                EffectProcessor.resolveEffects(state, pEffs, pSource, pTargets, (m: string) => engine.log(m), pNext, pStackObj, pGrantContext);
            }

            if (!state.pendingAction) {
                engine.resetPriorityToActivePlayer();
            }
            return true;
        }

        if (stackObj) {
            stackObj.targets = resolvedTargets;
            state.stack.push(stackObj);
            state.consecutivePasses = 0;

            engine.log(`--------------------------------------------------`);
            engine.log(`[STACK] + ${engine.getPlayerName(stackObj.controllerId)} cast/activated ${stackObj.card?.definition.name || stackObj.type}`);
            if (resolvedTargets.length > 0) {
                engine.log(`[STACK] Target(s): ${resolvedTargets.join(', ')}`);
            }
            engine.log(`--------------------------------------------------`);

            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            engine.checkAutoPass(playerId);
            return true;
        }

        if (abilityIndex !== undefined) {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            const success = engine.activateAbility(playerId, sourceId!, abilityIndex, resolvedTargets, true);
            engine.checkAutoPass(playerId);
            return success;
        } else {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            const success = engine.playCard(playerId, sourceId!, resolvedTargets, true);
            engine.checkAutoPass(playerId);
            return success;
        }
    }
}