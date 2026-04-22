import { GameState, ConditionContext, PlayerId, GameObject, ConditionType } from "@shared/engine_types";
import { IConditionHandler } from "../IConditionHandler";

export const PermanentConditions: Record<string, IConditionHandler> = {
    [ConditionType.HasPermanent]: {
        matches(state, params, context) {
            const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");
            const { sourceId, controllerId, stackObject } = context;
            const targetingContext = { sourceId, controllerId, stackObject };
            return state.battlefield.some((obj) =>
                TargetingProcessor.matchesRestrictions(state, obj, params, targetingContext)
            );
        }
    },
    [ConditionType.NotHasPermanent]: {
        matches(state, params, context) {
            return !PermanentConditions[ConditionType.HasPermanent].matches(state, params, context);
        }
    },
    [ConditionType.ControlCountGe]: {
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
    [ConditionType.ControlSubtypeGe]: {
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
    [ConditionType.ArtifactCountGe]: {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]);
            return state.battlefield.filter(o =>
                o.controllerId === controllerId &&
                (o.definition.types || []).some(t => t.toLowerCase() === "artifact")
            ).length >= threshold;
        }
    },
    [ConditionType.LandCountGe]: {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]);
            return state.battlefield.filter(o =>
                o.controllerId === controllerId &&
                (o.definition.types || []).some(t => t.toLowerCase() === "land")
            ).length >= threshold;
        }
    },
    [ConditionType.OtherLandsLe]: {
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
    [ConditionType.HasCounters]: {
        matches(state, params, context) {
            const { sourceId, event } = context;
            const obj = state.battlefield.find(o => o.id === sourceId) || event?.data?.object;
            return obj ? Object.values(obj.counters || {}).some(v => (v as number) > 0) : false;
        }
    },
    [ConditionType.TotalToughnessGe]: {
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
    [ConditionType.HasCreaturePower4Plus]: {
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
