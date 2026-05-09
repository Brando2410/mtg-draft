import { ActionType, CopyEffect, GameObject, NeutralizeEffect, PlayerState, StackObject, Zone } from "@shared/engine_types";
import { LogCategory } from "../../../../utils/EngineLogger";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";
import { TargetingDispatcher } from "../../../actions/targeting/TargetingDispatcher";

export const CounterSpellHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { logger, action: AP } = getProcessors(state);
        const { targets } = context;
        const targetStackId = targets[0];
        const stackObj = state.stack.find((s: StackObject) => s.id === targetStackId);
        if (stackObj && stackObj.sourceObject) {
            logger.info(state, LogCategory.ACTION, `[COUNTER] ${stackObj.sourceObject.definition.name} was countered.`);
            AP.moveCard(state, stackObj.sourceObject, Zone.Graveyard, stackObj.sourceObject.ownerId);
            state.stack = state.stack.filter((s: StackObject) => s.id !== targetStackId);
        }
    }
};

export const CounterAbilityHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        const targetStackId = targets[0];
        const stackObj = state.stack.find((s: StackObject) => s.id === targetStackId);
        if (stackObj) {
            logger.info(state, LogCategory.ACTION, `[COUNTER] Ability on stack was countered.`);
            state.stack = state.stack.filter((s: StackObject) => s.id !== targetStackId);
        }
    }
};

export const CopySpellHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { targets, controllerId, stackObject } = context;
        const { logger, trigger: TrP } = getProcessors(state);
        const copyEffect = effect as CopyEffect;

        targets.forEach((tid: string) => {
            logger.info(state, LogCategory.ACTION, `[COPY-DEBUG] Attempting to copy target ID: ${tid}. Controller: ${controllerId}`);
            let stackObj = state.stack.find((s: StackObject) => s.id === tid || s.sourceId === tid);

            // LKI: If spell is gone, use LKI
            if (!stackObj) {
                const processors = getProcessors(state);
                stackObj = processors.lki.getLki(state, tid, Zone.Stack) as StackObject;
                if (stackObj) logger.info(state, LogCategory.ACTION, `[COPY] Original spell ${tid} not found on stack, using Last Known Information.`);
            }

            if (!stackObj) {
                logger.warn(state, LogCategory.ACTION, `[COPY-DEBUG] FAILED: Could not find stack object for target ${tid}. Stack size: ${state.stack.length}`);
                return;
            }

            const definition = stackObj.definition || stackObj.sourceObject?.definition;
            const cannotCopy = stackObj.cannotBeCopied || definition?.cannotBeCopied;

            if (cannotCopy) {
                logger.info(state, LogCategory.ACTION, `[COPY] ${definition?.name || 'Spell'} cannot be copied.`);
                return;
            }

            const copy = JSON.parse(JSON.stringify(stackObj)) as StackObject;
            copy.id = `copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            copy.isCopy = true;
            copy.controllerId = controllerId;

            // DEBUG LOGGING: Full state capture
            logger.info(state, LogCategory.ACTION, `[COPY-DEBUG] Original Spell: ${stackObj.name} (ID: ${stackObj.id})`);
            logger.debug(state, LogCategory.ACTION, `[COPY-DEBUG] Original Properties: ${JSON.stringify({
                effects: stackObj.effects?.length,
                targetDefinitions: !!stackObj.targetDefinitions,
                targets: stackObj.targets,
                xValue: stackObj.xValue,
                data: Object.keys(stackObj.data || {})
            })}`);

            // Ensure the card instance itself gets a unique ID to avoid collision during zone movements
            if (copy.sourceObject) {
                copy.sourceObject.id = `card_copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                copy.sourceId = copy.sourceObject.id;

                // Allow overriding legend status (Double Major)
                if (copyEffect.isLegendary === false) {
                    copy.sourceObject.definition = {
                        ...copy.sourceObject.definition,
                        supertypes: (copy.sourceObject.definition.supertypes || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                        types: (copy.sourceObject.definition.types || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                        type_line: copy.sourceObject.definition.type_line?.replace(/Legendary /i, '')
                    };
                }
            }

            if (copyEffect.abilitiesToAdd && copy.sourceObject) {
                copy.sourceObject.definition = {
                    ...copy.sourceObject.definition,
                    abilities: [...(copy.sourceObject.definition.abilities || []), ...copyEffect.abilitiesToAdd]
                };
            }
            if (copyEffect.keywordsToAdd && copy.sourceObject) {
                copy.sourceObject.definition = {
                    ...copy.sourceObject.definition,
                    keywords: [...(copy.sourceObject.definition.keywords || []), ...copyEffect.keywordsToAdd]
                };
            }

            copy.name = `Copy of ${stackObj.name || stackObj.sourceObject?.definition.name || 'Spell'}`;
            state.stack.push(copy);
            logger.info(state, LogCategory.ACTION, `[COPY] Created copy of ${stackObj.sourceObject?.definition.name || 'spell'}. (New ID: ${copy.id})`);
            logger.debug(state, LogCategory.ACTION, `[COPY-DEBUG] Copy Root Effects: ${copy.effects?.length || 0}`);

            // Emit copy event for Magecraft
            TrP.onEvent(state, {
                type: 'ON_COPY_SPELL',
                playerId: controllerId,
                payload: {
                    originalId: tid,
                    copyId: copy.id,
                    object: copy.sourceObject,
                    sourceId: copy.id,
                    isInstantOrSorcery: copy.sourceObject && (RuleUtils.isType(copy.sourceObject, 'instant') || RuleUtils.isType(copy.sourceObject, 'sorcery'))
                }
            });

            if (copyEffect.chooseNewTargets) {
                const targetDefinitions = copy.data?.targetDefinitions || copy.targetDefinitions;
                if (targetDefinitions && targetDefinitions.length > 0) {
                    const { targeting: TP } = getProcessors(state);
                    const pool = [
                        ...Object.keys(state.players),
                        ...state.battlefield.map((o: GameObject) => o.id),
                        ...Object.values(state.players).flatMap((p: PlayerState) => p.graveyard.map((c: GameObject) => c.id))
                    ];
                    const legalTargetIds = pool.filter((tid: string) => TP.isLegalTarget(state, {
                        sourceId: copy.id,
                        controllerId: copy.controllerId,
                        stackObject: copy,
                        targetDefinitions,
                        targetIndex: 0,
                        effects: [],
                        targets: []
                    }, tid));

                    if (legalTargetIds.length > 0) {
                        const backupTargets = [...(copy.targets || [])];

                        // CLEAR TARGETS for the re-selection phase
                        copy.targets = [];
                        copy.targetsControllers = [];

                        // Use centralized dispatcher to handle modal shifting, auto-targeting, etc.
                        const targetingResult = TargetingDispatcher.dispatchTargetingStep({
                            state,
                            playerId: controllerId,
                            sourceObj: copy,
                            targetDefinitions,
                            existingTargets: [],
                            xValue: copy.xValue || 0,
                            isSpellCasting: true,
                            isCopyTargeting: true,
                            parentContext: context
                        });

                        // If it's a string[], it means it was auto-selected/skipped
                        if (Array.isArray(targetingResult)) {
                            copy.targets = targetingResult;
                        } else if (state.pendingAction && state.pendingAction.data) {
                            // Ensure the engine knows this targeting is for a copy to avoid ID mismatch blocks
                            if (!state.pendingAction.data.metadata) state.pendingAction.data.metadata = {};
                            state.pendingAction.data.metadata.isCopyTargeting = true;
                        }
                    }
                }
            }
        });
    }
};

export const CopyAbilityHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { targets, controllerId } = context;
        const { logger, targeting: TP } = getProcessors(state);
        const copyEffect = effect as CopyEffect;

        targets.forEach((tid: string) => {
            const stackObj = state.stack.find((s: StackObject) => s.id === tid);
            if (!stackObj) return;

            const copyId = `copy_ability_${stackObj.id}_${Date.now()}`;
            const copy = JSON.parse(JSON.stringify(stackObj)) as StackObject;
            copy.id = copyId;
            copy.controllerId = controllerId;
            copy.isCopy = true;

            state.stack.push(copy);
            logger.info(state, LogCategory.ACTION, `[COPY] Copied ability for ${state.players[controllerId].name}.`);

            if (copyEffect.chooseNewTargets && copy.targets && copy.targets.length > 0) {
                const targetDefinitions = copy.data?.targetDefinitions || copy.targetDefinitions;
                if (targetDefinitions) {
                    const pool = [
                        ...Object.keys(state.players),
                        ...state.battlefield.map((o: GameObject) => o.id)
                    ];
                    const legalTargetIds = pool.filter((tid: string) => TP.isLegalTarget(state, {
                        sourceId: copy.id,
                        controllerId: copy.controllerId,
                        stackObject: copy,
                        targetDefinitions,
                        effects: [],
                        targets: []
                    }, tid));

                    if (legalTargetIds.length > 0) {
                        state.pendingAction = {
                            type: ActionType.Targeting,
                            playerId: controllerId,
                            sourceId: copy.id,
                            data: {
                                label: "ChooseNewTargets",
                                metadata: {
                                    isCopyTargeting: true,
                                    stackObj: copy,
                                    parentContext: context
                                },
                                stackId: copy.id,
                                targetDefinitions: targetDefinitions,
                                targets: legalTargetIds,
                                selectedTargets: [],
                                optional: true,
                                originalTargets: [...copy.targets],
                            }
                        };
                    }
                }
            }
        });
    }
};

export const CounterSpellOrAbilityHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { logger, action: AP } = getProcessors(state);
        const { targets } = context;
        targets.forEach((tid: string) => {
            const stackObj = state.stack.find((s: StackObject) => s.id === tid);
            if (stackObj) {
                if (stackObj.sourceObject) {
                    logger.info(state, LogCategory.ACTION, `[COUNTER] Countering spell: ${stackObj.sourceObject.definition.name} (${tid}).`);
                    AP.moveCard(state, stackObj.sourceObject, Zone.Graveyard, stackObj.sourceObject.ownerId);
                } else {
                    logger.info(state, LogCategory.ACTION, `[COUNTER] Removing ability from stack: ${stackObj.name || tid}.`);
                    state.stack = state.stack.filter((s: StackObject) => s.id !== stackObj.id);
                }
            } else {
                logger.info(state, LogCategory.ACTION, `[WARNING] Counter: Could not find object ${tid} on stack.`);
            }
        });
    }
};


