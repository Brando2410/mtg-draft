import { ActionType, Zone } from "@shared/engine_types";
import { LogCategory } from "../../../../utils/EngineLogger";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";

export const CounterSpellHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { logger, action: AP } = getProcessors(state);
        const { targets, controllerId } = context;
        const targetStackId = targets[0];
        const stackObj = state.stack.find((s: any) => s.id === targetStackId);
        if (stackObj && stackObj.sourceObject) {
          logger.info(state, LogCategory.ACTION, `[COUNTER] ${stackObj.sourceObject.definition.name} was countered.`);
          AP.moveCard(state, stackObj.sourceObject, Zone.Graveyard, stackObj.sourceObject.ownerId);
          state.stack = state.stack.filter((s: any) => s.id !== targetStackId);
        }
    }
};

export const CounterAbilityHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        const targetStackId = targets[0];
        const stackObj = state.stack.find((s: any) => s.id === targetStackId);
        if (stackObj) {
          logger.info(state, LogCategory.ACTION, `[COUNTER] Ability on stack was countered.`);
          state.stack = state.stack.filter((s: any) => s.id !== targetStackId);
        }
    }
};

export const CopySpellHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { targets, controllerId, stackObject } = context;
        const { logger, trigger: TrP } = getProcessors(state);

        targets.forEach((tid: string) => {
            let stackObj = state.stack.find((s: any) => s.id === tid || s.sourceId === tid);

            // LKI: If spell is gone, use LKI
            if (!stackObj) {
                const processors = getProcessors(state);
                stackObj = processors.lki.getLki(state, tid, Zone.Stack);
                if (stackObj) logger.info(state, LogCategory.ACTION, `[COPY] Original spell ${tid} not found on stack, using Last Known Information.`);
            }

            if (!stackObj) return;

            const definition = stackObj.definition || stackObj.sourceObject?.definition;
            const cannotCopy = stackObj.cannotBeCopied || definition?.cannotBeCopied;
            
            if (cannotCopy) {
                logger.info(state, LogCategory.ACTION, `[COPY] ${definition?.name || 'Spell'} cannot be copied.`);
                return;
            }

            const copy = JSON.parse(JSON.stringify(stackObj));
            copy.id = `copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            (copy as any).isCopy = true;
            copy.controllerId = controllerId;

            // Ensure the card instance itself gets a unique ID to avoid collision during zone movements
            if (copy.sourceObject) {
                copy.sourceObject.id = `card_copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                copy.sourceId = copy.sourceObject.id;

                // Allow overriding legend status (Double Major)
                if (effect.isLegendary === false) {
                    copy.sourceObject.definition = {
                        ...copy.sourceObject.definition,
                        supertypes: (copy.sourceObject.definition.supertypes || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                        types: (copy.sourceObject.definition.types || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                        type_line: copy.sourceObject.definition.type_line?.replace(/Legendary /i, '')
                    };
                }
            }

            if (effect.abilitiesToAdd && copy.sourceObject) {
                copy.sourceObject.definition = {
                    ...copy.sourceObject.definition,
                    abilities: [...(copy.sourceObject.definition.abilities || []), ...effect.abilitiesToAdd]
                };
            }
            if (effect.keywordsToAdd && copy.sourceObject) {
                copy.sourceObject.definition = {
                    ...copy.sourceObject.definition,
                    keywords: [...(copy.sourceObject.definition.keywords || []), ...effect.keywordsToAdd]
                };
            }

            // PRE-CLEAR TARGETS if choosing new ones (prevents UI arrows during re-selection)
            let backupTargets: string[] = [];
            if (effect.chooseNewTargets && copy.targets) {
                backupTargets = [...copy.targets];
                copy.targets = [];

                // Aggressively clear all target-related metadata
                if (copy.data) {
                    copy.data.targets = [];
                    copy.data.selectedTargets = [];
                    copy.data.declaredTargets = [];
                    copy.data.targetsControllers = [];
                }
                
                // Clear nested card targets to be safe
                if (copy.sourceObject && copy.sourceObject.data) {
                    copy.sourceObject.data.targets = [];
                    copy.sourceObject.data.selectedTargets = [];
                }
            }

            copy.name = `Copy of ${stackObj.name || stackObj.sourceObject?.definition.name || 'Spell'}`;
            state.stack.push(copy);
            logger.info(state, LogCategory.ACTION, `[COPY] Created copy of ${stackObj.sourceObject?.definition.name || 'spell'}.`);

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

            if (effect.chooseNewTargets) {
                const targetDefinitions = copy.data?.targetDefinitions || copy.targetDefinitions;
                if (targetDefinitions) {
                    const { targeting: TP } = getProcessors(state);
                    const pool = [
                        ...Object.keys(state.players),
                        ...state.battlefield.map((o: any) => o.id),
                        ...Object.values(state.players).flatMap((p: any) => p.graveyard.map((c: any) => c.id))
                    ];
                    const legalTargetIds = pool.filter(tid => TP.isLegalTarget(state, {
                        sourceId: copy.id,
                        controllerId: copy.controllerId,
                        stackObject: copy,
                        targetDefinitions,
                        targetIndex: 0
                    }, tid));

                    if (legalTargetIds.length > 0) {
                        state.pendingAction = {
                            type: ActionType.Targeting,
                            playerId: controllerId,
                            sourceId: copy.id,
                            data: {
                                label: "ChooseNewTargets",
                                isCopyTargeting: true,
                                stackId: copy.id,
                                targetDefinitions: targetDefinitions,
                                targets: legalTargetIds,
                                selectedTargets: [],
                                declaredTargets: [], // Force empty for UI
                                optional: true,
                                _backupTargets: backupTargets, // Use internal field
                                stackObj: copy
                            }
                        };
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

        targets.forEach((tid: string) => {
            const stackObj = state.stack.find((s: any) => s.id === tid);
            if (!stackObj) return;

            const copyId = `copy_ability_${stackObj.id}_${Date.now()}`;
            const copy = JSON.parse(JSON.stringify(stackObj));
            copy.id = copyId;
            copy.controllerId = controllerId;
            (copy as any).isCopy = true;

            state.stack.push(copy);
            logger.info(state, LogCategory.ACTION, `[COPY] Copied ability for ${state.players[controllerId].name}.`);

            if (effect.chooseNewTargets && copy.targets && copy.targets.length > 0) {
                const targetDefinitions = copy.data?.targetDefinitions || copy.targetDefinitions;
                if (targetDefinitions) {
                    const pool = [
                        ...Object.keys(state.players),
                        ...state.battlefield.map((o: any) => o.id)
                    ];
                    const legalTargetIds = pool.filter(tid => TP.isLegalTarget(state, {
                        sourceId: copy.id,
                        controllerId: copy.controllerId,
                        stackObject: copy,
                        targetDefinitions
                    }, tid));

                    if (legalTargetIds.length > 0) {
                        state.pendingAction = {
                            type: ActionType.Targeting,
                            playerId: controllerId,
                            sourceId: copy.id,
                            data: {
                                label: "ChooseNewTargets",
                                isCopyTargeting: true,
                                stackId: copy.id,
                                targetDefinitions: targetDefinitions,
                                targets: legalTargetIds,
                                selectedTargets: [],
                                optional: true,
                                originalTargets: [...copy.targets]
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
          const stackObj = state.stack.find((s: any) => s.id === tid);
          if (stackObj) {
            if (stackObj.sourceObject) {
              logger.info(state, LogCategory.ACTION, `[COUNTER] Countering spell: ${stackObj.sourceObject.definition.name} (${tid}).`);
              AP.moveCard(state, stackObj.sourceObject, Zone.Graveyard, stackObj.sourceObject.ownerId);
            } else {
              logger.info(state, LogCategory.ACTION, `[COUNTER] Removing ability from stack: ${stackObj.name || tid}.`);
              state.stack = state.stack.filter((s: any) => s.id !== stackObj.id);
            }
          } else {
            logger.info(state, LogCategory.ACTION, `[WARNING] Counter: Could not find object ${tid} on stack.`);
          }
        });
    }
};


