import { CounterType, GameObject, TriggerEvent, Zone } from "@shared/engine_types";
import { getProcessors } from "../../../ProcessorRegistry";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { IConditionHandler } from "../IConditionHandler";
import { LogCategory } from "../../../../utils/EngineLogger";

export const EventConditions: Record<string, IConditionHandler> = {
    "EVENT_OBJECT_MATCHES": {
        matches(state, params, context) {
            const { targeting: TargetingProcessor } = getProcessors(state);
            const { event, sourceId, controllerId, stackObject } = context;
            const obj = RuleUtils.getEventObject(event, state);
            if (!obj) return false;
            return TargetingProcessor.matchesRestrictions(state, obj, params, { sourceId, controllerId, stackObject, effects: [], targets: [] });
        }
    },
    "EVENT_MANA_VALUE_GE": {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            const { event } = context;
            const obj = RuleUtils.getEventObject(event, state);
            if (!RuleUtils.isEntity(obj)) return false;
            const { mana: ManaProcessor } = getProcessors(state);
            return ManaProcessor.getManaValue(obj.definition.manaCost || "") >= threshold;
        }
    },
    "IS_FLASHBACK_CAST": {
        matches(state, params, context) {
            const { event, cardToPlay } = context;
            const obj = cardToPlay || RuleUtils.getEventObject(event, state);
            if (RuleUtils.isEntity(obj)) return obj.isFlashbackCast === true;
            const eventObj = event?.payload?.object;
            return (RuleUtils.isEntity(eventObj) && eventObj.isFlashbackCast === true);
        }
    },
    "EVENT_OBJECT_OWNER_NOT_YOU": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const card = RuleUtils.getEventObject(event, state);
            if (!card) return false;
            return card.ownerId !== controllerId;
        }
    },
    "EVENT_OBJECT_OWNER_IS_YOU": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const card = RuleUtils.getEventObject(event, state);
            if (!card) return false;
            return card.ownerId === controllerId;
        }
    },
    "EVENT_COUNTER_TYPE_MATCHES": {
        matches(state, params, context) {
            const { event } = context;
            const expectedType = params[0] === "p1p1" ? CounterType.P1P1 : params[0];
            const actualType = event?.payload?.counterType;
            const normalizedActualType = actualType === "p1p1" ? CounterType.P1P1 : actualType;
            return normalizedActualType === expectedType;
        }
    },
    "EVENT_OBJECT_IS_TARGET_1": {
        matches(state, params, context) {
            const { event } = context;
            const objId = RuleUtils.getEventObject(event, state)?.id;
            const targetId = RuleUtils.getTargets(event)[0];
            return objId === targetId;
        }
    },
    "EVENT_OBJECT_IS_TRIGGER_SOURCE": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const obj = RuleUtils.getEventObject(event, state);
            const objId = obj?.id;
            return objId === sourceId;
        }
    },
    "EVENT_OBJECT_CONTROLLER_IS_YOU": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const eObj = RuleUtils.getEventObject(event, state);
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
            const eventPlayerId = event?.payload?.playerId || event?.playerId;
            if (eventPlayerId) {
                return String(eventPlayerId) === String(controllerId);
            }
            // Fallback for object-based events
            const obj = RuleUtils.getEventObject(event, state);
            if (obj) {
                return String(obj.controllerId) === String(controllerId);
            }
            return false;
        }
    },
    "EVENT_SOURCE_IS_SELF": {
        matches(state, params, context) {
            return RuleUtils.getSource(context.event) === context.sourceId;
        }
    },
    "EVENT_SPELL_TARGET_MATCHES": {
        matches(state, params, context) {
            const { targeting: TargetingProcessor } = getProcessors(state);
            const { event, sourceId, controllerId, stackObject } = context;
            const targets = event?.payload?.stackSnapshot?.targetIds || event?.payload?.targetIds || [];
            if (!targets.length) return false;
            return targets.some((tid: string) => {
                const obj = RuleUtils.findObject(state, tid);
                if (!obj) return false;
                return TargetingProcessor.matchesRestrictions(state, obj, params, { sourceId, controllerId, stackObject, effects: [], targets: [] });
            });
        }
    },
    "EVENT_OBJECT_HAS_X": {
        matches(state, params, context) {
            const { event } = context;
            const obj = RuleUtils.getEventObject(event, state);
            if (!RuleUtils.isEntity(obj)) return false;
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
            const { targeting: TargetingProcessor } = getProcessors(state);
            const { event, sourceId, controllerId, stackObject } = context;
            const targetIdx = parseInt(params[0] as string);
            const restrictions = params.slice(1) as string[];

            const targets = RuleUtils.getTargets(event);
            const targetId = targets?.[targetIdx];
            if (!targetId) return false;

            const targetObj = RuleUtils.findObject(state, targetId);
            if (!targetObj) return false;

            const matchResult = TargetingProcessor.matchesRestrictions(state, targetObj, restrictions, { sourceId, controllerId, stackObject, effects: [], targets: [] });
            return matchResult;
        }
    },
    "TARGET_1_COUNTERS_P1P1": {
        matches(state, params, context) {
            const { event } = context;
            const tId = RuleUtils.getTargets(event)[0];
            const obj = RuleUtils.findObject(state, tId);
            return (RuleUtils.isEntity(obj) && obj.counters?.["+1/+1"] || 0) >= parseInt(params[0]);
        }
    },
    "X_LE": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const xValue = event?.payload?.xValue ?? stackObject?.xValue ?? 0;
            return xValue <= parseInt(params[0]);
        }
    },
    "X_LT": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const xValue = event?.payload?.xValue ?? stackObject?.xValue ?? 0;
            return xValue < parseInt(params[0]);
        }
    },
    "SPENT_MANA_GE": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const threshold = parseInt(params[0]);
            const obj = event?.payload?.object;
            const spent = event?.payload?.amount || (RuleUtils.isEntity(obj) ? obj.paidManaValue : 0) || event?.payload?.spent || 0;
            return spent >= threshold;
        }
    },
    "SPENT_MANA_LT": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const threshold = parseInt(params[0]);
            const obj = event?.payload?.object;
            const spent = event?.payload?.amount || (RuleUtils.isEntity(obj) ? obj.paidManaValue : 0) || event?.payload?.spent || 0;
            return spent < threshold;
        }
    },
    "SPENT_MANA_LE": {
        matches(state, params, context) {
            const { event, stackObject } = context;
            const threshold = parseInt(params[0]);
            const obj = event?.payload?.object;
            const spent = event?.payload?.amount || (RuleUtils.isEntity(obj) ? obj.paidManaValue : 0) || event?.payload?.spent || 0;
            return spent <= threshold;
        }
    },
    "CONVERGE_GE": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const threshold = parseInt(params[0]);
            const obj = RuleUtils.findObject(state, sourceId) || RuleUtils.getEventObject(event, state);
            const converge = (RuleUtils.isEntity(obj) ? (obj.convergeAmount || 0) : 0) || event?.payload?.convergeAmount || 0;
            return converge >= threshold;
        }
    },
    "COUNTER_GE": {
        matches(state, params, context) {
            const { sourceId } = context;
            const countType = params[0];
            const threshold = parseInt(params[1]);
            const obj = RuleUtils.findObject(state, sourceId);
            if (!RuleUtils.isEntity(obj)) return false;
            const count = obj.counters?.[countType as CounterType] || 0;
            return count >= threshold;
        }
    },
    "SPELL_IS_MULTICOLORED": {
        matches(state, params, context) {
            const { event } = context;
            const card = RuleUtils.getEventObject(event, state);
            if (!RuleUtils.isEntity(card)) return false;
            return (card.definition.colors || []).length > 1;
        }
    },
    "SPELL_TARGETS_SOURCE": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const targets = event?.payload?.targetIds || [];
            return targets.includes(sourceId);
        }
    },
    "TARGETS_PERMANENT": {
        matches(state, params, context) {
            const { event } = context;
            const targets = RuleUtils.getTargets(event);
            if (targets.length === 0) return false;
            return targets.some((tid: string) => {
                const obj = RuleUtils.findObject(state, tid);
                return RuleUtils.isEntity(obj) && obj.zone === Zone.Battlefield && RuleUtils.isPermanent(obj);
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
            const targets = RuleUtils.getTargets(event);
            if (targets.length === 0) return false;
            return targets.some((tid: string) => {
                const obj = RuleUtils.findObject(state, tid);
                return RuleUtils.isEntity(obj) && obj.zone === Zone.Battlefield && RuleUtils.isCreature(obj);
            });
        }
    },
    "REPARTEE_TRIGGER": {
        matches(state, params, context) {
            const { event, controllerId } = context;

            // Check if the player casting the spell is the controller of this trigger.
            const castingPlayerId = event?.playerId || event?.payload?.playerId;
            if (String(castingPlayerId) !== String(controllerId)) return false;

            // Use LKI for the spell on the stack
            const processors = getProcessors(state);
            const stackObjId = RuleUtils.getSource(event) || "";
            const stackObj = processors.lki.getLki(state, stackObjId, Zone.Stack);
            const targets = stackObj?.targets || [];
            if (!targets.length) return false;

            const { targeting: TargetingProcessor } = getProcessors(state);
            return targets.some((tid: string) => {
                const obj = RuleUtils.findObject(state, tid);
                if (!RuleUtils.isEntity(obj)) return false;
                // CR 109.2: "Creature" in rules text refers to a creature permanent on the battlefield.
                return obj.zone === Zone.Battlefield && RuleUtils.isCreature(obj);
            });
        }
    },
    "TARGET_1_IS_PREPARED": {
        matches(state, params, context) {
            const { event } = context;
            const targetId = RuleUtils.getTargets(event)[0];
            const targetObj = RuleUtils.findObject(state, targetId);
            return (RuleUtils.isEntity(targetObj) && targetObj.isPrepared) || false;
        }
    },
    "SPELL_IS_CREATURE": {
        matches(state, params, context) {
            const { event } = context;
            const card = RuleUtils.getEventObject(event, state);
            return RuleUtils.isCreature(card);
        }
    },
    "TARGET_1_IS_CONTROLLER": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const tId = RuleUtils.getTargets(event)[0];
            return tId === controllerId;
        }
    },
    "TARGET_1_EXISTS": {
        matches(state, params, context) {
            const { event } = context;
            return !!RuleUtils.getTargets(event)[0];
        }
    },
    "TARGET_2_EXISTS": {
        matches(state, params, context) {
            const { event } = context;
            return !!RuleUtils.getTargets(event)[1];
        }
    },
    "TARGET_3_EXISTS": {
        matches(state, params, context) {
            const { event } = context;
            return !!RuleUtils.getTargets(event)[2];
        }
    },
    "TARGET_IS_OPPONENT": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const tId = RuleUtils.getTargets(event)[0];
            if (!tId) return false;
            return tId !== controllerId;
        }
    },
    "TARGET_IS_INSTANT_OR_SORCERY": {
        matches(state, params, context) {
            const { event, state: gameState } = { event: context.event, state };
            const tId = RuleUtils.getTargets(event)[0];
            if (!tId) return false;
            const targetObj = state.stack.find((s) => s.id === tId) ||
                Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === tId);
            if (!targetObj) return false;
            return RuleUtils.isType(targetObj, "instant") || RuleUtils.isType(targetObj, "sorcery");
        }
    },
    "TARGETS_TAPPED_CREATURE": {
        matches(state, params, context) {
            const { event } = context;
            const tId = RuleUtils.getTargets(event)[0];
            if (!tId) return false;
            const obj = RuleUtils.getEventObject(event, state) || state.battlefield.find((o) => o.id === tId);
            return (RuleUtils.isGameObject(obj) && obj.isTapped && RuleUtils.isCreature(obj)) || false;
        }
    },
    "OWN_CREATURE_ENTERS": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const obj = RuleUtils.getEventObject(event, state);
            if (!obj) return false;
            return obj.controllerId === controllerId && RuleUtils.isCreature(obj);
        }
    },
    "OWN_TOKEN_ENTERS": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const obj = RuleUtils.getEventObject(event, state);
            if (!obj) return false;
            return obj.controllerId === controllerId && !!obj.isToken;
        }
    },
    "OWN_CREATURE_DIES": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const obj = RuleUtils.getEventObject(event, state);
            if (!obj) return false;
            return obj.controllerId === controllerId && RuleUtils.isCreature(obj);
        }
    },
    "NOT_CAST_FROM_HAND": {
        matches(state, params, context) {
            const { event, sourceId, stackObject } = context;
            const castFromZone = stackObject?.data?.castFromZone || event?.payload?.fromZone;
            if (castFromZone) return castFromZone !== Zone.Hand;

            const objId = event?.payload?.object?.id || RuleUtils.getSource(event) || sourceId || (event as any)?.id;
            if (!objId) return true;
            const processors = getProcessors(state);
            const fromHand = processors.lki.getLki(state, objId, Zone.Hand);
            return !fromHand;
        }
    },
    "CAST_FROM_GRAVEYARD_OR_EXILE": {
        matches(state, params, context) {
            const { event, sourceId, stackObject } = context;
            const castFromZone = stackObject?.data?.castFromZone || event?.payload?.fromZone;
            if (castFromZone) return castFromZone === Zone.Graveyard || castFromZone === Zone.Exile;

            const objId = event?.payload?.object?.id || RuleUtils.getSource(event) || sourceId;
            if (!objId) return false;
            const processors = getProcessors(state);
            const fromGY = processors.lki.getLki(state, objId, Zone.Graveyard);
            const fromExile = processors.lki.getLki(state, objId, Zone.Exile);
            return !!(fromGY || fromExile);
        }
    },
    "CAST_FROM_HAND": {
        matches(state, params, context) {
            const { event, sourceId, stackObject } = context;
            const castFromZone = stackObject?.data?.castFromZone || event?.payload?.fromZone;
            if (castFromZone) return castFromZone === Zone.Hand;

            const objId = event?.payload?.object?.id || RuleUtils.getSource(event) || sourceId || (event as any)?.id;
            if (!objId) return false;
            const processors = getProcessors(state);
            const fromHand = processors.lki.getLki(state, objId, Zone.Hand);
            return !!fromHand;
        }
    },
    "TRIGGER_SOURCE_POW_OR_TOUGH_LE_1": {
        matches(state, params, context) {
            const { event } = context;
            const obj = RuleUtils.getEventObject(event, state);
            if (!obj) return false;

            // If it's a snapshot (LKI), use its recorded stats
            if (RuleUtils.isGameObject(obj) && obj.effectiveStats) {
                return obj.effectiveStats.power <= 1 || obj.effectiveStats.toughness <= 1;
            }

            const { layer: LayerProcessor } = getProcessors(state);
            const stats = LayerProcessor.getEffectiveStats(obj as GameObject, state);
            return stats.power <= 1 || stats.toughness <= 1;
        }
    },
    "TRIGGER_TARGET_IS_SELF": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            return RuleUtils.getTargets(event).includes(sourceId);
        }
    },
    "IS_CREATURE": {
        matches(state, params, context) {
            const { sourceId, event } = context;
            const tId = RuleUtils.getTargets(event)[0] || sourceId;
            const obj = RuleUtils.getEventObject(event, state) || RuleUtils.findObject(state, tId);
            if (!obj) return false;
            return RuleUtils.isCreature(obj);
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
                return String(RuleUtils.getSource(event)) === String(sourceId);
            }
            if (event.type === TriggerEvent.EnterBattlefield) {
                const enteringId = RuleUtils.getEventObject(event, state)?.id;
                return String(enteringId) === String(sourceId);
            }
            return false;
        }
    },
    "OBJECT_IS_SELF": {
        matches(state, params, context) {
            const { event, sourceId } = context;
            const eventObjId = RuleUtils.getEventObject(event, state)?.id;
            return String(sourceId) === String(eventObjId);
        }
    },
    "X_IS": {
        matches(state, params, context) {
            const expected = parseInt(params[0]);
            const xValue = context.event?.payload?.xValue ?? context.stackObject?.xValue ?? 0;
            return xValue === expected;
        }
    },
    "X_IS_GE": {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            const xValue = context.event?.payload?.xValue ?? context.stackObject?.xValue ?? 0;
            return xValue >= threshold;
        }
    },
    "EVENT_SOURCES_CONTROLLED_BY_YOU": {
        matches(state, params, context) {
            const { event, controllerId } = context;
            const sources = event?.payload?.sources || [];
            if (sources.length === 0) {
                const sourceId = RuleUtils.getSource(event);
                if (!sourceId) return false;
                const obj = RuleUtils.findObject(state, sourceId);
                return obj ? String(obj.controllerId) === String(controllerId) : false;
            }
            return sources.some((source: any) => String(source.controllerId) === String(controllerId));
        }
    },
};
