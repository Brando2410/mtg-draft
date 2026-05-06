import { TriggerEvent } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IConditionHandler } from "../IConditionHandler";
import { LogCategory } from "../../../../utils/EngineLogger";

export const SpecializedConditions: Record<string, IConditionHandler> = {
    "REPARTEE_TRIGGER": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            if (event?.playerId !== controllerId) return false;
            const targets = RuleUtils.getTargets(event);
            if (!targets.length) return false;

            return targets.some((tid: string) => {
                const obj = RuleUtils.findObject(state, tid);
                return obj && RuleUtils.isCreature(obj);
            });
        }
    },
    "SELF_COMBAT_DAMAGE_PLAYER_OR_PLANESWALKER": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const isCombat = event?.payload?.isCombat;
            if (!event || RuleUtils.getSource(event) !== sourceId || !isCombat) return false;
            if (event.type === TriggerEvent.DamageDealtToPlayer || event.type === "ON_DAMAGE_PLAYER") return true;
            if (event.type === TriggerEvent.DamageTaken) {
                const targetId = RuleUtils.getTargets(event)[0];
                const targetObj = state.battlefield.find((o) => o.id === targetId);
                return !!targetObj && RuleUtils.isPlaneswalker(targetObj);
            }
            return false;
        }
    },
    "SELF_COMBAT_DAMAGE_PLAYER": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const isCombat = event?.payload?.isCombat;
            if (!event || RuleUtils.getSource(event) !== sourceId || !isCombat) return false;
            return event.type === TriggerEvent.DamageDealtToPlayer;
        }
    },
    "INCREMENT_CHECK": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const eventObj = event?.payload?.object;
            const spent = (RuleUtils.isEntity(eventObj) ? eventObj.paidManaValue : 0) ?? 0;
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
            const eventObj = event?.payload?.object;
            const spent = (RuleUtils.isEntity(eventObj) ? (eventObj as any).paidManaValue : undefined) ?? event?.payload?.amount ?? 0;
            const obj = state.battlefield.find((o) => o.id === sourceId);
            if (!obj) return false;
            const { layer: LayerProcessor } = getProcessors(state);
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            return spent > stats.power || spent > stats.toughness;
        }
    }
};
