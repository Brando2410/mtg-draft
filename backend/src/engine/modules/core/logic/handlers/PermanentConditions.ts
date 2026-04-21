import { GameState, ConditionContext, PlayerId, GameObject } from "@shared/engine_types";
import { IConditionHandler } from "../IConditionHandler";

export const PermanentConditions: Record<string, IConditionHandler> = {
    "HAS_PERMANENT": {
        matches(state, params, context) {
            const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");
            const { sourceId, controllerId, stackObject } = context;
            const targetingContext = { sourceId, controllerId, stackObject };
            return state.battlefield.some((obj) =>
                TargetingProcessor.matchesRestrictions(state, obj, params, targetingContext)
            );
        }
    },
    "NOT_HAS_PERMANENT": {
        matches(state, params, context) {
            return !PermanentConditions["HAS_PERMANENT"].matches(state, params, context);
        }
    },
    "CONTROL_COUNT_GE": {
        matches(state, params, context) {
            const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");
            const { sourceId, controllerId, stackObject } = context;
            const targetingContext = { sourceId, controllerId, stackObject };

            const threshold = parseInt(params[params.length - 1]);
            const realRestrictions = params.slice(0, -1);

            const count = state.battlefield.filter((obj) =>
                String(obj.controllerId) === String(controllerId) &&
                TargetingProcessor.matchesRestrictions(state, obj, realRestrictions, targetingContext)
            ).length;

            return count >= threshold;
        }
    },
    "CONTROL_SUBTYPE_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const subtype = params[0];
            const threshold = parseInt(params[1]) || 1;
            return state.battlefield.filter((o) =>
                String(o.controllerId) === String(controllerId) &&
                (o.definition.subtypes || []).some(s => s.toLowerCase() === subtype.toLowerCase())
            ).length >= threshold;
        }
    },
    "ARTIFACT_COUNT_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]);
            return state.battlefield.filter(o =>
                o.controllerId === controllerId &&
                (o.definition.types || []).some(t => t.toLowerCase() === "artifact")
            ).length >= threshold;
        }
    },
    "LAND_COUNT_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]);
            return state.battlefield.filter(o =>
                o.controllerId === controllerId &&
                (o.definition.types || []).some(t => t.toLowerCase() === "land")
            ).length >= threshold;
        }
    },
    "OTHER_LANDS_LE": {
        matches(state, params, context) {
            const { controllerId, sourceId } = context;
            const threshold = parseInt(params[0]);
            const count = state.battlefield.filter(o =>
                o.id !== sourceId &&
                o.controllerId === controllerId &&
                o.definition.types.some(t => t.toLowerCase() === "land")
            ).length;
            return count <= threshold;
        }
    },
    "HAS_COUNTERS": {
        matches(state, params, context) {
            const { sourceId, event } = context;
            const obj = state.battlefield.find(o => o.id === sourceId) || event?.data?.object;
            return obj ? Object.values(obj.counters || {}).some(v => (v as number) > 0) : false;
        }
    },
    "TOTAL_TOUGHNESS_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]);
            const { LayerProcessor } = require("../../../state/LayerProcessor");
            const total = state.battlefield
                .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === "creature"))
                .reduce((sum, obj) => sum + LayerProcessor.getEffectiveStats(obj, state).toughness, 0);
            return total >= threshold;
        }
    },
    "HAS_CREATURE_POWER_4_PLUS": {
        matches(state, params, context) {
            const { controllerId } = context;
            return state.battlefield.some(obj =>
                obj.controllerId === controllerId &&
                obj.definition.types.some(t => t.toLowerCase() === "creature") &&
                (Number(obj.definition.power || 0) >= 4 || (obj.effectiveStats?.power || 0) >= 4)
            );
        }
    }
};
