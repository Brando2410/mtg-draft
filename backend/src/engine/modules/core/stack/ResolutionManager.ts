import {
    AbilityType,
    EffectDefinition,
    GameState,
    PendingAction,
    PlayerId,
    EngineFrame,
    StackObject,
    Zone,
} from '@shared/engine_types';
import { LogCategory, EngineLogger } from '../../../utils/EngineLogger';
import { RuleUtils } from '../../../utils/RuleUtils';
import { getProcessors, getEngine } from '../../ProcessorRegistry';
import { EngineContext } from '../../../interfaces/EngineContext';
import { TargetingProcessor } from '../../actions/targeting/TargetingProcessor';
import { EffectProcessor } from '../../effects/EffectProcessor';
import { getActionMeta } from '@shared/utils/ActionUtils';

/**
 * ResolutionManager: Centralized module for resuming and completing stack object resolution.
 */
export class ResolutionManager {

    /**
     * CR 608.2: Primary entry point for resolving a spell or ability from the stack.
     * Handles initial checks (fizzling, conditions) and effect execution.
     */
    public static resolve(
        state: GameState,
        stackObj: StackObject,
        effects: EffectDefinition[],
        engine: EngineContext,
        effectIndex: number = 0
    ): boolean {
        const { condition: ConditionProcessor, effect: EffectProcessor } = getProcessors(state);

        const objectName = stackObj.name || stackObj.sourceObject?.definition.name || 'Effect';
        const isResumption = effectIndex > 0;

        if (effectIndex === 0) {
            EngineLogger.info(state, LogCategory.ACTION, `[Stack] Resolving: ${objectName}`);

            // Rule 603.4: Intervening "if" clause re-check
            if (stackObj.condition) {
                const context = EffectProcessor.createEngineFrame(state, {
                    sourceId: stackObj.sourceId,
                    targets: stackObj.targets || [],
                    stackObject: stackObj,
                    effects: []
                });
                if (!ConditionProcessor.matchesCondition(state, stackObj.condition, context)) {
                    EngineLogger.info(state, LogCategory.ACTION, `[Stack] ${objectName} failed to resolve: condition "${stackObj.condition}" no longer met.`);
                    this.postResolutionCleanup(state, stackObj, undefined, engine, true);
                    return true;
                }
            }

            // Rule 608.2b: Target legality re-evaluation
            if (this.areAllTargetsIllegal(state, stackObj)) {
                EngineLogger.info(state, LogCategory.ACTION, `[Stack] ${objectName} fizzled (all targets illegal).`);
                this.postResolutionCleanup(state, stackObj, undefined, engine, true);
                return true;
            }
        } else {
            EngineLogger.info(state, LogCategory.ACTION, `[Stack] Resuming: ${objectName} at index ${effectIndex}...`);
        }

        EngineLogger.info(state, LogCategory.ACTION, `[RESOLVE] ${objectName} (ID: ${stackObj.id}) resolving. Targets: ${stackObj.targets?.join(', ') || 'none'}`);

        const completed = EffectProcessor.resolveEffects({
            state,
            context: EffectProcessor.createEngineFrame(state, {
                effects,
                sourceId: stackObj.sourceId,
                targets: stackObj.targets || [],
                effectIndex,
                isResumption,
                stackObject: stackObj
            })
        });

        if (!completed) {
            return false; // SUSPENDED
        }

        this.postResolutionCleanup(state, stackObj, undefined, engine);
        return true;
    }

    public static resume(
        state: GameState,
        engine: EngineContext,
        stackObjOverride?: StackObject,
        sourceIdOverride?: string,
        contextOverride?: EngineFrame,
        actionOverride?: PendingAction
    ): boolean {
        const { logger } = getProcessors(state);
        const action = actionOverride || state.pendingAction;

        const sourceId = sourceIdOverride || action?.sourceId || "";
        const meta = getActionMeta(action);
        let stackObj = stackObjOverride || meta.stackObj || meta.parentContext?.stackObject;

        // Sync with the actual stack object if it exists to ensure effectIndex updates are preserved
        if (stackObj?.id) {
            stackObj = state.stack.find(s => s.id === stackObj!.id) || stackObj;
        }

        let currentCtx: EngineFrame | undefined = contextOverride;
        if (!currentCtx && action?.data) {
            currentCtx = {
                effects: meta.effects || [],
                effectIndex: meta.effectIndex ?? 0,
                isResumption: true,
                parentContext: meta.parentContext,
                targets: [], // Clear targets to ensure fresh mapping for the resumed effect index
                originalTargets: meta.targets || [], // Preserve for handlers that might need them
                lookingCards: meta.lookingCards || [],
                sourceId,
                controllerId: meta.controllerId || stackObj?.controllerId || action.playerId,
                stackObject: stackObj,
                lastMilledIds: meta.lastMilledIds,
                lastDiscardedIds: meta.lastDiscardedIds,
                isFreeCast: meta.isFreeCast,
                paidManaValue: meta.paidManaValue,
                xValue: meta.xValue,
                exileOnResolution: meta.exileOnResolution ?? stackObj?.exileOnResolution ?? meta.parentContext?.exileOnResolution
            };
        }

        const rootContext = currentCtx;

        if (currentCtx && stackObj) {
            currentCtx.stackObject = stackObj;
        }

        if (action && state.pendingAction === action) {
            state.pendingAction = undefined;
            state.stateVersion++;
        }

        while (
            !state.pendingAction &&
            currentCtx &&
            currentCtx.effects &&
            currentCtx.effectIndex !== undefined &&
            currentCtx.effectIndex < currentCtx.effects.length
        ) {
            const resumingCtx = currentCtx;
            const nextIdx = resumingCtx.effectIndex!;
            const effs = resumingCtx.effects!;

            logger.info(state, LogCategory.ACTION, `[RESOLUTION-MGR] Resuming effects at index ${nextIdx}/${effs.length} for ${sourceId}. Next effect: ${effs[nextIdx]?.type}`);

            const completed = getProcessors(state).effect.resolveEffects({
                state,
                context: resumingCtx,
                skipFizzleCheck: true,
            });

            if (completed && !state.pendingAction) {
                // This context level is complete. Move up to parent if it exists.
                const parent = resumingCtx.parentContext;
                if (parent) {
                    logger.debug(state, LogCategory.ACTION, `[RESOLUTION-MGR] Level complete. Popping to parent context (Index: ${parent.effectIndex}).`);
                }
                currentCtx = parent;
                if (currentCtx) {
                    currentCtx.effectIndex = (currentCtx.effectIndex || 0) + 1;
                    currentCtx.targets = []; // Ensure next level starts fresh
                }
            } else {
                // Suspended or finished with current stack, we must stop and keep currentCtx for next resume
                break;
            }
        }

        if (!state.pendingAction) {
            // Check if there are triggers waiting to be stacked (from a previous suspension)
            const nextTriggers = meta.nextTriggersToStack;
            if (nextTriggers && nextTriggers.length > 0) {
                logger.info(state, LogCategory.ACTION, `[RESOLUTION-MGR] Resuming trigger stacking for ${nextTriggers.length} remaining triggers.`);
                this.stackTriggers(state, nextTriggers);
                return true;
            }

            logger.info(state, LogCategory.ACTION, `[RESOLUTION-MGR] Resolution complete for ${sourceId}. Starting cleanup.`);
            this.postResolutionCleanup(state, stackObj, rootContext, engine);
        } else if (state.pendingAction) {
            const nextAction = state.pendingAction;
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
        stackObj: StackObject | undefined,
        parentContext: EngineFrame | undefined,
        engine: EngineContext,
        fizzled: boolean = false
    ): void {
        if (stackObj) {
            const { action: ActionProcessor, trigger: TriggerProcessor } = getProcessors(state);

            // 1. Resolve actual object from stack if necessary
            const fullStackObj = state.stack.find(s => s.id === stackObj.id) || stackObj;

            if (fullStackObj && fullStackObj.type === 'Spell' && fullStackObj.sourceObject) {
                const card = fullStackObj.sourceObject;
                const isPermanent = RuleUtils.isPermanent(card);

                if (fizzled) {
                    const shouldExile = fullStackObj.exileOnResolution || fullStackObj.isCopy;
                    if (shouldExile) {
                        EngineLogger.info(state, LogCategory.ACTION, `[RULE 701.5] ${card.definition.name} (fizzled) was exiled instead of being put into graveyard.`);
                        ActionProcessor.removeFromCurrentZone(state, card);
                        if (!fullStackObj.isCopy) {
                            ActionProcessor.moveCard(state, card, Zone.Exile, card.ownerId);
                        }
                    } else {
                        ActionProcessor.moveCard(state, card, Zone.Graveyard, card.ownerId);
                    }
                } else {
                    if (isPermanent) {
                        const isAura = RuleUtils.hasSubtype(card, 'aura');
                        if (isAura && fullStackObj.targets && fullStackObj.targets.length > 0) {
                            card.attachedTo = fullStackObj.targets[0];
                            EngineLogger.info(state, LogCategory.ACTION, `[Stack] ${card.definition.name} enters attached to target ${card.attachedTo}.`);
                        }

                        card.xValue = fullStackObj.xValue;
                        ActionProcessor.moveCard(state, card, Zone.Battlefield, fullStackObj.controllerId);
                    } else if (card.zone === Zone.Stack) {
                        const shouldExile = fullStackObj.exileOnResolution || fullStackObj.isCopy || card.isPreparedCopy || card.definition.exileOnResolution;

                        if (shouldExile) {
                            const reason = card.isPreparedCopy ? 'Prepared spell' : (fullStackObj.isCopy ? 'Copy' : (card.definition.exileOnResolution ? 'Card Definition' : 'Effect'));
                            EngineLogger.info(state, LogCategory.ACTION, `[RULE 701.5] ${card.definition.name} (${reason}) ceases to exist after resolution.`);

                            ActionProcessor.removeFromCurrentZone(state, card);
                            if (!(fullStackObj.isCopy || card.isPreparedCopy)) {
                                ActionProcessor.moveCard(state, card, Zone.Exile, card.ownerId);
                            }
                        } else {
                            ActionProcessor.moveCard(state, card, Zone.Graveyard, card.ownerId);
                        }
                    }
                }

                // Fire ON_RESOLVE_SPELL event
                TriggerProcessor.onEvent(state, {
                    type: 'ON_RESOLVE_SPELL',
                    playerId: fullStackObj.controllerId,
                    payload: { object: card, sourceId: fullStackObj.sourceId, targetIds: [fullStackObj.id] }
                });

            } else {
                // Triggered abilities are already popped from the stack by StackProcessor.resolveTopOrAdvanceStep.
                // We only need to remove by ID if it's still there for some reason (e.g. resumption from another path).
                const stackIdx = state.stack.findIndex(s => s.id === fullStackObj.id);
                if (stackIdx !== -1) {
                    state.stack.splice(stackIdx, 1);
                }
            }

            const parentStackObj = parentContext?.stackObject;
            if (parentStackObj && parentStackObj.id !== stackObj.id) {
                const pIdx = state.stack.findIndex(s => s.id === parentStackObj.id);
                if (pIdx !== -1) {
                    state.stack.splice(pIdx, 1);
                }
            }
        }

        state.isSticky = true;
        engine.resetPriorityToActivePlayer();
    }

    private static areAllTargetsIllegal(state: GameState, stackObj: StackObject): boolean {
        if (!stackObj.targets || stackObj.targets.length === 0) return false;

        const definitions = stackObj.targetDefinitions || [];
        // CR 608.2b: Legality is only checked if the spell or ability specifies targets (has definitions).
        // If we have IDs but no definitions, these are "contextual targets" used for metadata/LKI, not for resolution requirements.
        if (definitions.length === 0) return false;

        return stackObj.targets.every((targetId, index) => {
            return !TargetingProcessor.isLegalTarget(state, {
                sourceId: stackObj.sourceId,
                controllerId: stackObj.controllerId,
                stackObject: stackObj,
                targetDefinitions: definitions,
                targetIndex: index,
                effects: [],
                targets: []
            }, targetId);
        });
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

            const pendingAfter = state.pendingAction;
            if (pendingAfter && i < triggers.length - 1) {
                const remaining = triggers.slice(i + 1);
                const data = (pendingAfter.data || {}) as Record<string, any>;
                data.nextTriggersToStack = remaining;
                pendingAfter.data = data as import('@shared/engine_types').ActionData;
                return;
            }
        }

        TrP.processPendingTriggers(state);
        
        // Rule 117.5: Each time a player would get priority, the game first performs applicable state-based actions, 
        // then any abilities that have triggered are put on the stack.
        // After triggers are stacked, the active player receives priority.
        if (!state.pendingAction) {
            getEngine(state).resetPriorityToActivePlayer();
        }
    }
}

