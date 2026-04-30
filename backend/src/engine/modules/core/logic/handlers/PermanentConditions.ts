import { ConditionType } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IConditionHandler } from "../IConditionHandler";

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
                .filter(o => o.controllerId === controllerId && RuleUtils.isCreature(o))
                .reduce((sum, obj) => sum + LayerProcessor.getEffectiveStats(obj, state).toughness, 0);
            return total >= threshold;
        }
    },
    "HAS_CREATURE_POWER_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]) || 4;
            const { layer: LP } = getProcessors(state);
            return state.battlefield.some(obj =>
                obj.controllerId === controllerId && RuleUtils.isCreature(obj) &&
                LP.getEffectiveStats(obj, state).power >= threshold
            );
        }
    },
    "HAS_CREATURE_TOUGHNESS_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]) || 4;
            const { layer: LP } = getProcessors(state);
            return state.battlefield.some(obj =>
                obj.controllerId === controllerId && RuleUtils.isCreature(obj) &&
                LP.getEffectiveStats(obj, state).toughness >= threshold
            );
        }
    },
    "HAS_CREATURE_MANA_VALUE_GE": {
        matches(state, params, context) {
            const { controllerId } = context;
            const threshold = parseInt(params[0]) || 4;
            return state.battlefield.some(obj =>
                obj.controllerId === controllerId && RuleUtils.isCreature(obj) &&
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
            return false;
        }
    }
};
