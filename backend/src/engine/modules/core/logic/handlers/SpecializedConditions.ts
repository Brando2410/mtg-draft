import { GameState, ConditionContext, TriggerEvent, Zone } from "@shared/engine_types";
import { IConditionHandler } from "../IConditionHandler";

export const SpecializedConditions: Record<string, IConditionHandler> = {
    "REPARTEE_TRIGGER": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            if (event?.playerId !== controllerId) return false;
            const targets = event?.targets || event?.data?.targets || event?.data?.stackSnapshot?.targets || [];
            if (!targets.length) return false;
            
            const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");
            return targets.some((tid: string) => {
                const obj = TargetingProcessor.findObjectInAnyZone(state, tid);
                return obj && obj.definition.types.some((t: any) => t.toLowerCase() === "creature");
            });
        }
    },
    "SELF_COMBAT_DAMAGE_PLAYER_OR_PLANESWALKER": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            if (!event || event.sourceId !== sourceId || !event.data?.isCombat) return false;
            if (event.type === TriggerEvent.DamageDealtToPlayer || event.type === "ON_DAMAGE_PLAYER") return true;
            if (event.type === TriggerEvent.DamageTaken) {
                const targetObj = state.battlefield.find((o) => o.id === event.targetId);
                return !!targetObj && targetObj.definition.types.some((t) => t.toLowerCase() === "planeswalker");
            }
            return false;
        }
    },
    "INCREMENT_CHECK": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const spent = (event as any)?.data?.spent || 0;
            const obj = state.battlefield.find((o) => o.id === sourceId);
            if (!obj) return false;
            const { LayerProcessor } = require("../../../state/LayerProcessor");
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            return spent > stats.power || spent > stats.toughness;
        }
    },
    "SPENT_MANA_GT_POWER_OR_TOUGHNESS": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const spent = (event as any)?.data?.card?.paidManaValue ?? (event as any)?.amount ?? 0;
            const obj = state.battlefield.find((o) => o.id === sourceId);
            if (!obj) return false;
            const { LayerProcessor } = require("../../../state/LayerProcessor");
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            return spent > stats.power || spent > stats.toughness;
        }
    }
};
