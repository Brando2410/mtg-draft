import { GameState, ConditionContext, TriggerEvent, Zone, GameObject } from "@shared/engine_types";
import { IConditionHandler } from "../IConditionHandler";

export const EventConditions: Record<string, IConditionHandler> = {
    "EVENT_OBJECT_MATCHES": {
        matches(state, params, context) {
            const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");
            const { event, sourceId, controllerId, stackObject } = context;
            const obj = event?.payload?.object || event?.payload?.card || event?.data?.object || event?.data?.card || (event as any)?.gameObject || event?.object || state.battlefield.find((o: any) => o.id === event?.sourceId);
            if (!obj) return false;
            return TargetingProcessor.matchesRestrictions(state, obj, params, { sourceId, controllerId, stackObject });
        }
    },
    "EVENT_MANA_VALUE_GE": {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            const { event } = context;
            const obj = event?.data?.object || event?.data?.card || event?.data?.copy || (event as any)?.gameObject;
            if (!obj) return false;
            const { ManaProcessor } = require("../../../magic/ManaProcessor");
            return ManaProcessor.getManaValue(obj.definition.manaCost) >= threshold;
        }
    },
    "IS_FLASHBACK_CAST": {
        matches(state, params, context) {
            const { event, cardToPlay } = context;
            const obj = cardToPlay || event?.data?.object || event?.data?.card || event?.card || (event as any)?.gameObject;
            if (obj) return (obj as any)?.isFlashbackCast === true;
            return (event as any)?.isFlashbackCast === true;
        }
    },
    "EVENT_OBJECT_OWNER_NOT_YOU": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const card = event?.data?.card || event?.data?.object;
            if (!card) return false;
            return card.ownerId !== controllerId;
        }
    },
    "EVENT_COUNTER_TYPE_MATCHES": {
        matches(state, params, context) {
            const { event } = context;
            const expectedType = params[0] === "p1p1" ? "+1/+1" : params[0];
            const actualType = (event as any)?.counterType || (event as any)?.data?.counterType;
            const normalizedActualType = actualType === "p1p1" ? "+1/+1" : actualType;
            return normalizedActualType === expectedType;
        }
    },
    "EVENT_OBJECT_IS_TARGET_1": {
        matches(state, params, context) {
            const { event } = context;
            const objId = event?.data?.object?.id || (event as any)?.gameObject?.id || event?.targetId;
            const targetId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0];
            return objId === targetId;
        }
    },
    "EVENT_OBJECT_IS_TRIGGER_SOURCE": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const objId = event?.data?.object?.id || (event as any)?.gameObject?.id;
            return objId === sourceId;
        }
    },
    "EVENT_OBJECT_CONTROLLER_IS_YOU": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const eObj = event?.data?.object || event?.data?.card || (event as any)?.gameObject || event?.object || state.battlefield.find((o: any) => o.id === (event?.sourceId || (event as any)?.sourceId));
            return String(eObj?.controllerId) === String(controllerId);
        }
    },
    "EVENT_PLAYER_IS_OPPONENT": {
        matches(state, params, context) {
            return context.event?.playerId !== context.controllerId;
        }
    },
    "EVENT_PLAYER_IS_YOU": {
        matches(state, params, context) {
            return String(context.event?.playerId) === String(context.controllerId);
        }
    },
    "PLAYER_IS_CONTROLLER": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const eventPlayerId = event?.playerId || event?.data?.playerId || (event as any)?.payload?.playerId;
            if (eventPlayerId) {
                return String(eventPlayerId) === String(controllerId);
            }
            // Fallback for object-based events
            const obj = event?.payload?.object || event?.payload?.card || event?.data?.object || (event as any)?.gameObject || event?.object;
            if (obj) {
                return String(obj.controllerId) === String(controllerId);
            }
            return false;
        }
    },
    "EVENT_SOURCE_IS_SELF": {
        matches(state, params, context) {
            return (context.event as any)?.sourceId === context.sourceId;
        }
    },
    "EVENT_SPELL_TARGET_MATCHES": {
        matches(state, params, context) {
            const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");
            const { event, sourceId, controllerId, stackObject } = context;
            const targets = event?.data?.stackSnapshot?.targets || [];
            if (!targets.length) return false;
            return targets.some((tid: string) => {
                const obj = TargetingProcessor.findObjectInAnyZone(state, tid);
                if (!obj) return false;
                return TargetingProcessor.matchesRestrictions(state, obj, params, { sourceId, controllerId, stackObject });
            });
        }
    },
    "EVENT_OBJECT_HAS_X": {
        matches(state, params, context) {
            const { event } = context;
            const obj = event?.payload?.object || event?.payload?.card || event?.data?.object || event?.data?.card || (event as any)?.gameObject;
            if (!obj) return false;
            return (obj.definition.manaCost || "").includes("X");
        }
    },
    "TARGET_1_MATCHES": {
        matches(state, params, context) {
            return EventConditions["_TARGET_MATCHES"].matches(state, ["0", ...params], context);
        }
    },
    "TARGET_2_MATCHES": {
        matches(state, params, context) {
            return EventConditions["_TARGET_MATCHES"].matches(state, ["1", ...params], context);
        }
    },
    "_TARGET_MATCHES": {
        matches(state, params, context) {
            const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");
            const { event, sourceId, controllerId, stackObject } = context;
            const targetIdx = parseInt(params[0] as string);
            const restrictions = params.slice(1) as string[];

            const targetId = event?.payload?.targetIds?.[targetIdx] || event?.payload?.targetId || (event as any)?.targetIds?.[targetIdx] || (event as any)?.targets?.[targetIdx] || (event as any)?.targetId;
            if (!targetId) return false;

            const targetObj = state.battlefield.find((o) => o.id === targetId) || state.exile.find((o) => o.id === targetId) || Object.values(state.players).flatMap((p) => [...p.hand, ...p.graveyard, ...p.library]).find((o) => o.id === targetId);
            if (!targetObj) return false;

            return TargetingProcessor.matchesRestrictions(state, targetObj, restrictions, { sourceId, controllerId, stackObject });
        }
    },
    "TARGET_1_COUNTERS_P1P1": {
        matches(state, params, context) {
            const { event } = context;
            const tId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0];
            const obj = state.battlefield.find((o) => o.id === tId);
            return (obj?.counters?.["+1/+1"] || 0) >= parseInt(params[0]);
        }
    },
    "X_LE": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const xValue = (event as any)?.xValue || stackObject?.xValue || 0;
            return xValue <= parseInt(params[0]);
        }
    },
    "X_LT": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const xValue = (event as any)?.xValue || stackObject?.xValue || 0;
            return xValue < parseInt(params[0]);
        }
    },
    "SPENT_MANA_GE": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const threshold = parseInt(params[0]);
            const spent = event?.amount || event?.payload?.card?.paidManaValue || event?.payload?.card?.data?.paidManaValue || (event as any)?.data?.card?.paidManaValue || (event as any)?.eventData?.spent || (event as any)?.data?.spentMana || (stackObject as any)?.data?.paidManaValue || 0;
            return spent >= threshold;
        }
    },
    "SPENT_MANA_LT": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const threshold = parseInt(params[0]);
            const spent = event?.amount || event?.payload?.card?.paidManaValue || event?.payload?.card?.data?.paidManaValue || (event as any)?.data?.card?.paidManaValue || (event as any)?.eventData?.spent || (event as any)?.data?.spentMana || (stackObject as any)?.data?.paidManaValue || 0;
            return spent < threshold;
        }
    },
    "SPENT_MANA_LE": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const threshold = parseInt(params[0]);
            const spent = event?.amount || event?.payload?.card?.paidManaValue || event?.payload?.card?.data?.paidManaValue || (event as any)?.data?.card?.paidManaValue || (event as any)?.eventData?.spent || (event as any)?.data?.spentMana || (stackObject as any)?.data?.paidManaValue || 0;
            return spent <= threshold;
        }
    },
    "CONVERGE_GE": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const threshold = parseInt(params[0]);
            const obj = state.battlefield.find((o) => o.id === sourceId) || (event as any)?.data?.object || (event as any)?.card || (event as any)?.gameObject;
            const converge = obj?.convergeAmount || (event as any)?.convergeAmount || (event as any)?.data?.convergeAmount || 0;
            return converge >= threshold;
        }
    },
    "COUNTER_GE": {
        matches(state, params, context) {
            const { sourceId } = context;
            const countType = params[0];
            const threshold = parseInt(params[1]);
            const obj = state.battlefield.find((o) => o.id === sourceId);
            if (!obj) return false;
            const count = obj.counters?.[countType] || 0;
            return count >= threshold;
        }
    },
    "SPELL_IS_MULTICOLORED": {
        matches(state, params, context) {
            const { event } = context;
            const card = event?.data?.card || event?.data?.object || (event as any)?.gameObject;
            if (!card) return false;
            return (card.definition.colors || []).length > 1;
        }
    },
    "SPELL_TARGETS_SOURCE": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const targets = (event?.data as any)?.targets || [];
            return targets.includes(sourceId);
        }
    },
    "TARGETS_PERMANENT": {
        matches(state, params, context) {
            const { event } = context;
            const targets = (event as any)?.targets || (event as any)?.data?.targets || (event as any)?.targetIds || [];
            if (targets.length === 0) return false;
            return targets.some((tid: string) => {
                const obj = state.battlefield.find((o) => o.id === tid);
                return obj && ["artifact", "creature", "enchantment", "land", "planeswalker"].some((t) => obj.definition.types.some((ot: string) => ot.toLowerCase() === t));
            });
        }
    },
    "SPELL_TARGETS_PERMANENT": {
        matches(state, params, context) {
            return EventConditions["TARGETS_PERMANENT"].matches(state, params, context);
        }
    },
    "SPELL_TARGETS_CREATURE": {
        matches(state, params, context) {
            const { event } = context;
            const targets = (event as any)?.targets || (event as any)?.data?.targets || (event as any)?.targetIds || [];
            if (targets.length === 0) return false;
            return targets.some((tid: string) => {
                const obj = state.battlefield.find((o) => o.id === tid);
                return obj && obj.definition.types.some((t: string) => t.toLowerCase() === "creature");
            });
        }
    },
    "REPARTEE_TRIGGER": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            
            // Check if the player casting the spell is the controller of this trigger.
            const castingPlayerId = event?.playerId || (event as any)?.data?.playerId;
            if (String(castingPlayerId) !== String(controllerId)) return false;

            // Use stackSnapshot from payload (emitted by SpellProcessor)
            const stackObj = event?.payload?.stackSnapshot || (event as any)?.data?.stackSnapshot;
            const targets = stackObj?.targets || [];
            if (!targets.length) return false;

            const { TargetingProcessor } = require("../../../actions/targeting/TargetingProcessor");
            return targets.some((tid: string) => {
                const obj = TargetingProcessor.findObjectInAnyZone(state, tid);
                if (!obj) return false;
                // CR 109.2: "Creature" in rules text refers to a creature permanent on the battlefield.
                return obj.zone === Zone.Battlefield && obj.definition.types.some((t: string) => t.toLowerCase() === "creature");
            });
        }
    },
    "TARGET_1_IS_PREPARED": {
        matches(state, params, context) {
            const { event } = context;
            const targetId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0] || (event as any)?.targetId;
            const targetObj = state.battlefield.find((o) => o.id === targetId);
            return targetObj?.isPrepared || false;
        }
    },
    "SPELL_IS_CREATURE": {
        matches(state, params, context) {
            const { event } = context;
            const card = event?.data?.card || event?.data?.object;
            return card?.definition.types.some((t: string) => t.toLowerCase() === "creature") || false;
        }
    },
    "TARGET_1_IS_CONTROLLER": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const tId = (event as any)?.targetIds?.[0] || (event as any)?.targets?.[0] || (event as any)?.targetId;
            return tId === controllerId;
        }
    },
    "TARGET_1_EXISTS": {
        matches(state, params, context) {
            const { event } = context;
            return !!((event as any)?.targetIds?.[0] || (event as any)?.targets?.[0] || (event as any)?.targetId);
        }
    },
    "TARGET_2_EXISTS": {
        matches(state, params, context) {
            const { event } = context;
            return !!((event as any)?.targetIds?.[1] || (event as any)?.targets?.[1]);
        }
    },
    "TARGET_3_EXISTS": {
        matches(state, params, context) {
            const { event } = context;
            return !!((event as any)?.targetIds?.[2] || (event as any)?.targets?.[2]);
        }
    },
    "TARGET_IS_OPPONENT": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const tId = (event as any)?.targets?.[0] || (event as any)?.targetId;
            if (!tId) return false;
            return tId !== controllerId;
        }
    },
    "TARGET_IS_INSTANT_OR_SORCERY": {
        matches(state, params, context) {
            const { event, state: gameState } = { event: context.event, state };
            const tId = (event as any)?.targets?.[0] || (event as any)?.targetId;
            if (!tId) return false;
            const targetObj = state.stack.find((s) => s.id === tId)?.card || state.battlefield.find((o) => o.id === tId);
            if (!targetObj) return false;
            const types = targetObj.definition.types.map((t: string) => t.toLowerCase());
            return types.includes("instant") || types.includes("sorcery");
        }
    },
    "TARGETS_TAPPED_CREATURE": {
        matches(state, params, context) {
            const { event } = context;
            const tId = (event as any)?.targets?.[0] || (event as any)?.targetId;
            if (!tId) return false;
            const obj = state.battlefield.find((o) => o.id === tId);
            return (obj && obj.isTapped && obj.definition.types.map((t: string) => t.toLowerCase()).includes("creature")) || false;
        }
    },
    "OWN_CREATURE_ENTERS": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const obj = event?.payload?.object || event?.payload?.card || event?.data?.object || (event as any)?.gameObject;
            if (!obj) return false;
            return obj.controllerId === controllerId && obj.definition.types.map((t: string) => t.toLowerCase()).includes("creature");
        }
    },
    "OWN_TOKEN_ENTERS": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const obj = event?.payload?.object || event?.payload?.card || event?.data?.object || (event as any)?.gameObject;
            if (!obj) return false;
            return obj.controllerId === controllerId && !!obj.isToken;
        }
    },
    "OWN_CREATURE_DIES": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const obj = event?.payload?.object || event?.payload?.card || event?.data?.object || (event as any)?.gameObject;
            if (!obj) return false;
            return obj.controllerId === controllerId && obj.definition.types.map((t: string) => t.toLowerCase()).includes("creature");
        }
    },
    "NOT_CAST_FROM_HAND": {
        matches(state, params, context) {
            const { event } = context;
            const zone = (event as any).sourceZone || (event as any).lastNonStackZone || event?.data?.sourceZone || event?.card?.lastNonStackZone;
            return zone !== Zone.Hand;
        }
    },
    "CAST_FROM_GRAVEYARD_OR_EXILE": {
        matches(state, params, context) {
            const { event } = context;
            const zone = (event as any).sourceZone || (event as any).lastNonStackZone || event?.data?.sourceZone || event?.card?.lastNonStackZone;
            return zone === Zone.Graveyard || zone === Zone.Exile;
        }
    },
    "CAST_FROM_HAND": {
        matches(state, params, context) {
            const { event } = context;
            const zone = (event as any).sourceZone || (event as any).lastNonStackZone || event?.data?.sourceZone || event?.card?.lastNonStackZone;
            return zone === Zone.Hand;
        }
    },
    "TRIGGER_SOURCE_POW_OR_TOUGH_LE_1": {
        matches(state, params, context) {
            const { event } = context;
            const tid = event?.data?.object?.id || event?.targetId;
            const obj = state.battlefield.find((o) => o.id === tid);
            if (!obj) return false;
            const { LayerProcessor } = require("../../../state/LayerProcessor");
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            return stats.power <= 1 || stats.toughness <= 1;
        }
    },
    "TRIGGER_TARGET_IS_SELF": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            return event?.targetId === sourceId || event?.data?.targetId === sourceId;
        }
    },
    "IS_CREATURE": {
        matches(state, params, context) {
            const { sourceId, event } = context;
            const tId = (event as any)?.targetId || sourceId;
            const obj = state.battlefield.find((o) => o.id === tId);
            if (!obj) return false;
            const { LayerProcessor } = require("../../../state/LayerProcessor");
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            return stats.types.some((t: string) => t.toLowerCase() === "creature");
        }
    },
    "NOT_CREATURE": {
        matches(state, params, context) {
            return !EventConditions["IS_CREATURE"].matches(state, params, context);
        }
    },
    "SELF_ATTACKS": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            if (!event) return false;
            if (event.type === TriggerEvent.Attack) {
                return String(event.sourceId) === String(sourceId);
            }
            if (event.type === TriggerEvent.EnterBattlefield) {
                const enteringId = event.data?.object?.id || event.payload?.object?.id || event.payload?.sourceId || event.sourceId;
                return String(enteringId) === String(sourceId);
            }
            return false;
        }
    },
    "OBJECT_IS_SELF": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const eventObjId = event?.data?.object?.id || event?.sourceId || (event as any)?.payload?.object?.id;
            return String(sourceId) === String(eventObjId);
        }
    }
};
