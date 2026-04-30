import { ActionType, Zone } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";

export const CounterSpellHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { action: AP } = getProcessors(state);
        const { targets, controllerId } = context;
        const targetStackId = targets[0];
        const stackObj = state.stack.find((s: any) => s.id === targetStackId);
        if (stackObj && stackObj.card) {
          log(`[COUNTER] ${stackObj.card.definition.name} was countered.`);
          AP.moveCard(state, stackObj.card, Zone.Graveyard, stackObj.card.ownerId, log);
          state.stack = state.stack.filter((s: any) => s.id !== targetStackId);
        }
    }
};

export const CounterAbilityHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { targets } = context;
        const targetStackId = targets[0];
        const stackObj = state.stack.find((s: any) => s.id === targetStackId);
        if (stackObj) {
          log(`[COUNTER] Ability on stack was countered.`);
          state.stack = state.stack.filter((s: any) => s.id !== targetStackId);
        }
    }
};

export const CopySpellHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { targets, controllerId, stackObject } = context;
        const { trigger: TrP } = getProcessors(state);

        targets.forEach((tid: string) => {
            let stackObj = state.stack.find((s: any) => s.id === tid || s.sourceId === tid);

            // LKI: If spell is gone, use LKI
            if (!stackObj) {
                const processors = getProcessors(state);
                stackObj = processors.lki.getLki(state, tid, Zone.Stack);
                if (stackObj) log(`[COPY] Original spell ${tid} not found on stack, using Last Known Information.`);
            }

            if (!stackObj) return;

            const definition = stackObj.definition || stackObj.card?.definition;
            const cannotCopy = stackObj.cannotBeCopied || definition?.cannotBeCopied;
            
            if (cannotCopy) {
                log(`[COPY] ${definition?.name || 'Spell'} cannot be copied.`);
                return;
            }

            const copy = JSON.parse(JSON.stringify(stackObj));
            copy.id = `copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            (copy as any).isCopy = true;
            copy.controllerId = controllerId;

            // Ensure the card instance itself gets a unique ID to avoid collision during zone movements
            if (copy.card) {
                copy.card.id = `card_copy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                copy.sourceId = copy.card.id;

                // Allow overriding legend status (Double Major)
                if (effect.isLegendary === false) {
                    copy.card.definition = {
                        ...copy.card.definition,
                        supertypes: (copy.card.definition.supertypes || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                        types: (copy.card.definition.types || []).filter((s: string) => s.toLowerCase() !== 'legendary'),
                        type_line: copy.card.definition.type_line?.replace(/Legendary /i, '')
                    };
                }
            }

            if (effect.abilitiesToAdd && copy.card) {
                copy.card.definition = {
                    ...copy.card.definition,
                    abilities: [...(copy.card.definition.abilities || []), ...effect.abilitiesToAdd]
                };
            }
            if (effect.keywordsToAdd && copy.card) {
                copy.card.definition = {
                    ...copy.card.definition,
                    keywords: [...(copy.card.definition.keywords || []), ...effect.keywordsToAdd]
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
                if (copy.card && copy.card.data) {
                    copy.card.data.targets = [];
                    copy.card.data.selectedTargets = [];
                }
            }

            copy.name = `Copy of ${stackObj.name || stackObj.card?.definition.name || 'Spell'}`;
            state.stack.push(copy);
            log(`[COPY] Created copy of ${stackObj.card?.definition.name || 'spell'}.`);

            // Emit copy event for Magecraft
            TrP.onEvent(state, {
                type: 'ON_COPY_SPELL',
                playerId: controllerId,
                payload: {
                    originalId: tid,
                    copyId: copy.id,
                    object: copy.card,
                    sourceId: copy.id,
                    isInstantOrSorcery: copy.card && (RuleUtils.isType(copy.card, 'instant') || RuleUtils.isType(copy.card, 'sorcery'))
                }
            }, log);

            if (effect.chooseNewTargets) {
                const targetDef = copy.data?.targetDefinition || copy.targetDefinition;
                if (targetDef) {
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
                        targetDef,
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
                                targetDefinition: targetDef,
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
    handle(state, effect, log, context) {
        const { targets, controllerId } = context;
        const { targeting: TP } = getProcessors(state);

        targets.forEach((tid: string) => {
            const stackObj = state.stack.find((s: any) => s.id === tid);
            if (!stackObj) return;

            const copyId = `copy_ability_${stackObj.id}_${Date.now()}`;
            const copy = JSON.parse(JSON.stringify(stackObj));
            copy.id = copyId;
            copy.controllerId = controllerId;
            (copy as any).isCopy = true;

            state.stack.push(copy);
            log(`[COPY] Copied ability for ${state.players[controllerId].name}.`);

            if (effect.chooseNewTargets && copy.targets && copy.targets.length > 0) {
                const targetDef = copy.data?.targetDefinition || copy.targetDefinition;
                if (targetDef) {
                    const pool = [
                        ...Object.keys(state.players),
                        ...state.battlefield.map((o: any) => o.id)
                    ];
                    const legalTargetIds = pool.filter(tid => TP.isLegalTarget(state, {
                        sourceId: copy.id,
                        controllerId: copy.controllerId,
                        stackObject: copy,
                        targetDef
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
                                targetDefinition: targetDef,
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
    handle(state, effect, log, context) {
        const { action: AP } = getProcessors(state);
        const { targets } = context;
        targets.forEach((tid: string) => {
          const stackObj = state.stack.find((s: any) => s.id === tid);
          if (stackObj) {
            if (stackObj.card) {
              log(`[COUNTER] Countering spell: ${stackObj.card.definition.name} (${tid}).`);
              AP.moveCard(state, stackObj.card, Zone.Graveyard, stackObj.card.ownerId, log);
            } else {
              log(`[COUNTER] Removing ability from stack: ${stackObj.name || tid}.`);
              state.stack = state.stack.filter((s: any) => s.id !== stackObj.id);
            }
          } else {
            log(`[WARNING] Counter: Could not find object ${tid} on stack.`);
          }
        });
    }
};


