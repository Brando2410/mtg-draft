import { TriggerEvent } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IConditionHandler } from "../IConditionHandler";

export const SpecializedConditions: Record<string, IConditionHandler> = {
    "REPARTEE_TRIGGER": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            if (event?.playerId !== controllerId) return false;
            const targets = event?.payload?.stackSnapshot?.targets || 
                           event?.data?.stackSnapshot?.targets || 
                           event?.payload?.targets ||
                           event?.targets || 
                           event?.data?.targets || [];
            if (!targets.length) return false;
            
            const { targeting: TargetingProcessor } = getProcessors(state);
            return targets.some((tid: string) => {
                const obj = RuleUtils.findObject(state, tid);
                return obj && RuleUtils.isCreature(obj);
            });
        }
    },
    "SELF_COMBAT_DAMAGE_PLAYER_OR_PLANESWALKER": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const isCombat = event?.payload?.isCombat || event?.data?.isCombat;
            if (!event || event.sourceId !== sourceId || !isCombat) return false;
            if (event.type === TriggerEvent.DamageDealtToPlayer || event.type === "ON_DAMAGE_PLAYER") return true;
            if (event.type === TriggerEvent.DamageTaken) {
                const targetObj = state.battlefield.find((o) => o.id === event.targetId);
                return !!targetObj && RuleUtils.isPlaneswalker(targetObj);
            }
            return false;
        }
    },
    "INCREMENT_CHECK": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const spent = event?.payload?.spent || (event as any)?.data?.spent || 0;
            const obj = state.battlefield.find((o) => o.id === sourceId);
            if (!obj) return false;
            const { layer: LayerProcessor } = getProcessors(state);
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            return spent > stats.power || spent > stats.toughness;
        }
    },
    "SPENT_MANA_GT_POWER_OR_TOUGHNESS": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const spent = event?.payload?.card?.paidManaValue || (event as any)?.data?.card?.paidManaValue ?? (event as any)?.amount ?? 0;
            const obj = state.battlefield.find((o) => o.id === sourceId);
            if (!obj) return false;
            const { layer: LayerProcessor } = getProcessors(state);
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            return spent > stats.power || spent > stats.toughness;
        }
    }
};
