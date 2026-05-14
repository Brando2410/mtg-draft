import { ConditionType } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IConditionHandler } from "../IConditionHandler";

const _PermanentConditions: Record<string, IConditionHandler> = {
    [ConditionType.HasPermanent]: {
        matches(state, params, context) {
            const { targeting: TargetingProcessor } = getProcessors(state);
            const { sourceId, controllerId, stackObject } = context;
            const EngineFrame = { sourceId, controllerId, stackObject, effects: [], targets: [] };
            return state.battlefield.some((obj) =>
                TargetingProcessor.matchesRestrictions(state, obj, params, EngineFrame)
            );
        }
    },
    [ConditionType.NotHasPermanent]: {
        matches(state, params, context) {
            return !_PermanentConditions[ConditionType.HasPermanent].matches(state, params, context);
        }
    },
    [ConditionType.ControlCountGe]: {
        matches(state, params, context) {
            const { targeting: TargetingProcessor } = getProcessors(state);
            const { sourceId, controllerId, stackObject } = context;
            const EngineFrame = { sourceId, controllerId, stackObject, effects: [], targets: [] };

            const threshold = parseInt(params[params.length - 1]);
            const realRestrictions = params.slice(0, -1);

            const count = state.battlefield.filter((obj) =>
                String(obj.controllerId) === String(controllerId) &&
                TargetingProcessor.matchesRestrictions(state, obj, realRestrictions, EngineFrame)
            ).length;

            return count >= threshold;
        }
    },
    [ConditionType.ControlSubtypeGe]: {
        matches(state, params, context) {
            const { controllerId } = context;
            const subtype = params[0];
            const threshold = parseInt(params[1]) || 1;
            return state.battlefield.filter((o) =>
                String(o.controllerId) === String(controllerId) &&
                RuleUtils.hasSubtype(o, subtype)
            ).length >= threshold;
        }
    },
    [ConditionType.ArtifactCountGe]: {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]);
            return state.battlefield.filter(o =>
                o.controllerId === controllerId && RuleUtils.isArtifact(o)
            ).length >= threshold;
        }
    },
    [ConditionType.LandCountGe]: {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]);
            return state.battlefield.filter(o =>
                o.controllerId === controllerId && RuleUtils.isLand(o)
            ).length >= threshold;
        }
    },
    [ConditionType.OtherLandsLe]: {
        matches(state, params, context) {
            const { controllerId, sourceId } = context;
            const threshold = parseInt(params[0]);
            const count = state.battlefield.filter(o =>
                o.id !== sourceId &&
                o.controllerId === controllerId && RuleUtils.isLand(o)
            ).length;
            return count <= threshold;
        }
    },
    [ConditionType.HasCounters]: {
        matches(state, params, context) {
            const { sourceId, event } = context;
            const obj = state.battlefield.find(o => o.id === sourceId) || event?.payload?.object;
            return RuleUtils.isEntity(obj) ? Object.values(obj.counters || {}).some(v => (v as number) > 0) : false;
        }
    },
    [ConditionType.TotalToughnessGe]: {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]);
            const { layer: LayerProcessor } = getProcessors(state);
            const total = state.battlefield
                .filter(o => o.controllerId === controllerId && RuleUtils.isCreature(o))
                .reduce((sum, obj) => sum + LayerProcessor.getEffectiveStats(obj, state).toughness, 0);
            return total >= threshold;
        }
    },
    [ConditionType.CONTROLS_COMMANDER]: {
        matches(state, params, context) {
            return false;
        }
    }
};

/**
 * PermanentConditions Proxy - MTG Boolean logic for battlefield state.
 * Supports dynamic patterns:
 * - [SUBJECT]_CONTROLS_[TYPE]: e.g. OPPONENT_CONTROLS_ARTIFACT
 * - [SUBJECT]_HAS_[RESTRICTION]: e.g. TARGET_1_HAS_FLYING, TRIGGER_SOURCE_HAS_COUNTER
 */
export const PermanentConditions: Record<string, IConditionHandler> = new Proxy(_PermanentConditions, {
    get(target, prop: string) {
        if (prop in target) return target[prop];

        return {
            matches(state: import('@shared/engine_types').GameState, params: string[], context: import('@shared/engine_types').EngineFrame) {
                const { targeting: TargetingProcessor } = getProcessors(state);
                const { sourceId, controllerId, stackObject, event } = context;
                const EngineFrame = { sourceId, controllerId, stackObject, effects: [], targets: [] };

                // 1. Parse Subject and Action
                const parts = prop.split('_');
                let subjectId: string | undefined = sourceId;
                let subjectControllerId: string | undefined = controllerId;
                let actionIndex = -1;

                // Identify Subject (e.g. TARGET_1, OPPONENT, TRIGGER_SOURCE)
                if (prop.startsWith('TARGET_')) {
                    const idx = parseInt(parts[1]) - 1;
                    const targets = stackObject?.targets || event?.payload?.targetIds || [];
                    subjectId = targets[idx];
                    actionIndex = 2;
                } else if (prop.startsWith('OPPONENT_')) {
                    subjectControllerId = RuleUtils.getOpponentId(state, controllerId);
                    actionIndex = 1;
                } else if (prop.startsWith('TRIGGER_SOURCE_')) {
                    subjectId = RuleUtils.getSource(event);
                    actionIndex = 2;
                } else if (prop.startsWith('EVENT_OBJECT_')) {
                    subjectId = RuleUtils.getEventObject(event, state)?.id;
                    actionIndex = 2;
                } else if (prop.startsWith('HAS_')) {
                    actionIndex = 0;
                } else if (prop.startsWith('CONTROL_')) {
                    actionIndex = 0;
                }

                if (actionIndex === -1) return false;

                const action = parts[actionIndex];
                const filterToken = parts.slice(actionIndex + 1).join('_');
                const restrictions = filterToken.split('_');

                // 2. Execute Action (CONTROLS, HAS, or EXISTS)
                if (action === 'CONTROLS' || action === 'CONTROL') {
                    const singular = filterToken.endsWith('S') ? filterToken.slice(0, -1) : filterToken;
                    return state.battlefield.some(obj =>
                        String(obj.controllerId) === String(subjectControllerId || obj.controllerId) &&
                        (RuleUtils.isType(obj, filterToken) || RuleUtils.isType(obj, singular) ||
                            RuleUtils.hasSubtype(obj, filterToken) || RuleUtils.hasSubtype(obj, singular) ||
                            TargetingProcessor.matchesRestrictions(state, obj, restrictions, EngineFrame))
                    );
                }

                if (action === 'HAS') {
                    const obj = subjectId ? RuleUtils.findObject(state, subjectId) : undefined;
                    if (!obj) return false;
                    return TargetingProcessor.matchesRestrictions(state, obj, restrictions, EngineFrame);
                }

                if (action === 'EXISTS') {
                    return !!subjectId && (!!RuleUtils.findObject(state, subjectId) || !!state.players[subjectId]);
                }

                return false;
            }
        } as IConditionHandler;
    }
});

