import { ConditionType } from "@shared/engine_types";
import { IConditionHandler } from "../IConditionHandler";
import { getProcessors } from "../../../ProcessorRegistry";

export const PermanentConditions: Record<string, IConditionHandler> = {
    [ConditionType.HasPermanent]: {
        matches(state, params, context) {
            const { targeting: TargetingProcessor } = getProcessors(state);
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
            const { targeting: TargetingProcessor } = getProcessors(state);
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
            const { layer: LayerProcessor } = getProcessors(state);
            const total = state.battlefield
                .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === "creature"))
                .reduce((sum, obj) => sum + LayerProcessor.getEffectiveStats(obj, state).toughness, 0);
            return total >= threshold;
        }
    },
    "HAS_CREATURE_POWER_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]) || 4;
            return state.battlefield.some(obj =>
                obj.controllerId === controllerId &&
                obj.definition.types.some(t => t.toLowerCase() === "creature") &&
                (Number(obj.definition.power || 0) >= threshold || (obj.effectiveStats?.power || 0) >= threshold)
            );
        }
    },
    "HAS_CREATURE_TOUGHNESS_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]) || 4;
            return state.battlefield.some(obj =>
                obj.controllerId === controllerId &&
                obj.definition.types.some(t => t.toLowerCase() === "creature") &&
                (Number(obj.definition.toughness || 0) >= threshold || (obj.effectiveStats?.toughness || 0) >= threshold)
            );
        }
    },
    "HAS_CREATURE_MANA_VALUE_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]) || 4;
            return state.battlefield.some(obj =>
                obj.controllerId === controllerId &&
                obj.definition.types.some(t => t.toLowerCase() === "creature") &&
                (obj.definition.manaValue || 0) >= threshold
            );
        }
    },
    [ConditionType.HasCreaturePower4Plus]: {
        matches(state, params, context) {
            return PermanentConditions["HAS_CREATURE_POWER_GE"].matches(state, ["4"], context);
        }
    },
    [ConditionType.CONTROLS_COMMANDER]: {
        matches(state, params, context) {
            const { controllerId } = context;
            // For now, we consider any Legendary Creature or Planeswalker as a commander proxy
            // In a real Commander engine, this would check for a specific 'isCommander' property
            return state.battlefield.some(o =>
                String(o.controllerId) === String(controllerId) &&
                (o.definition.supertypes || []).some(t => t.toLowerCase() === "legendary") &&
                (o.definition.types.some(t => t.toLowerCase() === "creature") || o.definition.types.some(t => t.toLowerCase() === "planeswalker"))
            );
        }
    }
};
