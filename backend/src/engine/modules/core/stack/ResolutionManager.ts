import {
    AbilityType,
    GameState,
    PendingAction,
    PlayerId,
    ResolutionContext,
    StackObject,
    Zone,
} from '@shared/engine_types';
import { LogCategory } from '../../../utils/EngineLogger';
import { RuleUtils } from '../../../utils/RuleUtils';
import { getProcessors } from '../../ProcessorRegistry';
import { EngineContext } from '../../../interfaces/EngineContext';
import { oracle } from '../../../OracleLogicMap';

/**
 * ResolutionManager: Centralized module for resuming and completing stack object resolution.
 * 
 * This replaces the scattered resumption logic previously in:
 * - ChoiceProcessor.resumeResolution
 * - TargetingProcessor.finaliseTargeting
 * - PriorityProcessor.passPriority
 * - GameEngine.resumeResolution
 * 
 * The lifecycle is:
 * 1. StackProcessor pops an object and calls StackResolver.resolveObject
 * 2. If effects suspend (needing UI input), StackProcessor pushes it back
 * 3. After user input, the handler calls ResolutionManager.resume()
 * 4. ResolutionManager continues the effect loop via EffectProcessor.resolveEffects
 * 5. If all effects complete, ResolutionManager handles post-resolution cleanup
 */
export class ResolutionManager {

    public static resume(
        state: GameState,
        engine: EngineContext,
        stackObjOverride?: StackObject,
        sourceIdOverride?: string,
        contextOverride?: ResolutionContext,
        actionOverride?: PendingAction
    ): boolean {
        const { logger } = getProcessors(state);
        const action = actionOverride || state.pendingAction;

        // AUTOMATIC EXTRACTION: If we have a pending action, it is our source of truth for resumption.
        const sourceId = sourceIdOverride || action?.sourceId || "";
        const stackObj = stackObjOverride || action?.data?.stackObj as StackObject || (action?.data?.parentContext?.stackObject as StackObject);
        
        // Reconstruct context from action data if not provided
        let currentCtx: ResolutionContext | undefined = contextOverride;
        if (!currentCtx && action?.data) {
            const data = action.data as any;
            currentCtx = {
                effects: data.effects || [],
                nextEffectIndex: data.nextEffectIndex || 0,
                parentContext: data.parentContext,
                targets: data.targets || [],
                lookingCards: data.lookingCards || [],
                sourceId: sourceId,
                controllerId: action.playerId,
                stackObject: stackObj,
                lastMilledIds: data.lastMilledIds,
                lastDiscardedIds: data.lastDiscardedIds,
            };
        }

        const rootContext = currentCtx;

        if (currentCtx && stackObj) {
            currentCtx.stackObject = stackObj;
        }

        // Clear action ONLY IF it was the global one we just processed
        if (action && state.pendingAction === action) {
            state.pendingAction = undefined;
        }

        while (
            !state.pendingAction &&
            currentCtx &&
            currentCtx.effects &&
            currentCtx.nextEffectIndex !== undefined &&
            currentCtx.nextEffectIndex < currentCtx.effects.length
        ) {
            const resumingCtx = currentCtx;
            const nextIdx = resumingCtx.nextEffectIndex!;
            const effs = resumingCtx.effects;
            const parentTargets = resumingCtx.targets || [];
            const lookingCards = resumingCtx.lookingCards;
            const nextParentCtx = resumingCtx.parentContext;

            currentCtx = nextParentCtx;

            logger.info(state, LogCategory.ACTION, `[RESOLUTION-MGR] Resuming effects at index ${nextIdx}/${effs.length} for ${sourceId}. Next effect: ${effs[nextIdx]?.type}`);

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

            if (stackObj && !completed && state.pendingAction) {
                // Another suspension happened — sync the legacy index from the updated resolution state
                stackObj.nextEffectIndex = stackObj.resolution?.effectIndex;
                if (!stackObj.data) stackObj.data = {};
                stackObj.data.nextEffectIndex = stackObj.nextEffectIndex; // Legacy sync
            }
        }

        // If we're done (no more pending actions), clean up
        if (!state.pendingAction) {
            logger.info(state, LogCategory.ACTION, `[RESOLUTION-MGR] Resolution complete for ${sourceId}. Starting cleanup.`);
            this.postResolutionCleanup(state, stackObj, rootContext, engine);
        } else if (state.pendingAction) {
            const nextAction = state.pendingAction as any;
            logger.debug(state, LogCategory.ACTION, `[RESOLUTION-MGR] Suspension during resumption. Next Action: ${nextAction.type}`);
            state.priorityPlayerId = nextAction.playerId || null;
        }

        return true;
    }

    /**
     * Post-resolution cleanup: Moves spells to graveyard/battlefield,
     * removes abilities/triggers from the stack, fires ON_RESOLVE_SPELL events.
     */
    private static postResolutionCleanup(
        state: GameState,
        stackObj: StackObject,
        parentContext: ResolutionContext | undefined,
        engine: EngineContext
    ): void {
        if (!stackObj) {
            engine.resetPriorityToActivePlayer();
            return;
        }

        const fullStackObj = state.stack.find(s => s.id === stackObj.id);
        if (!fullStackObj) {
            engine.resetPriorityToActivePlayer();
            return;
        }

        const { logger } = getProcessors(state);

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
            // Clean up ability/trigger from stack
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
        if (parentContext?.stackObject && parentContext.stackObject.id !== stackObj.id) {
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

        engine.resetPriorityToActivePlayer();
    }

    /**
     * Centralized logic for stacking a list of triggers, handling any suspensions
     * (like targeting prompts) that may occur during the process.
     */
    public static stackTriggers(state: GameState, triggers: any[]): void {
        const { logger, trigger: TrP } = getProcessors(state);
        
        for (let i = 0; i < triggers.length; i++) {
            const t = triggers[i];
            TrP.stackTrigger(state, t);

            const pendingAfter = state.pendingAction as any;
            // If stacking this trigger caused a targeting prompt or choice,
            // save the REMAINING triggers to be stacked after that interaction is done.
            if (pendingAfter && i < triggers.length - 1) {
                const remaining = triggers.slice(i + 1);
                const data: any = pendingAfter.data || {};
                data.nextTriggersToStack = remaining;
                pendingAfter.data = data;
                return;
            }
        }

        // If we finished stacking everything without suspending, check if there are 
        // more triggers from other players that need to be ordered/stacked.
        TrP.processPendingTriggers(state);
    }
}
