import { IRestrictionHandler } from "../IRestrictionHandler";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { Targetable } from "@shared/engine_types";
import { gameObjectRestriction } from "./HandlerUtils";

const TAPPED = gameObjectRestriction((state, obj) => !!obj.isTapped);
const UNTAPPED = gameObjectRestriction((state, obj) => !obj.isTapped);

const YOUCONTROL: IRestrictionHandler = {
    matches(state, targetObj, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId) return false;
        return RuleUtils.getController(targetObj) === controllerId;
    }
};

const YOUOWN: IRestrictionHandler = {
    matches(state, targetObj, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId || !targetObj) return false;
        const ownerId = (targetObj as any).ownerId || RuleUtils.getController(targetObj);
        return String(ownerId) === String(controllerId);
    }
};

const OPPONENTOWNS: IRestrictionHandler = {
    matches(state, targetObj, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId || !targetObj) return true;
        const ownerId = (targetObj as any).ownerId || RuleUtils.getController(targetObj);
        return String(ownerId) !== String(controllerId);
    }
};

const NOTCONTROLLED: IRestrictionHandler = {
    matches(state, targetObj, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId) return true;
        return RuleUtils.getController(targetObj) !== controllerId;
    }
};

const ATTACKING = gameObjectRestriction((state, obj) => {
    return (state.combat?.attackers || []).some(a => a.attackerId === obj.id);
});

const BLOCKING = gameObjectRestriction((state, obj) => {
    return (state.combat?.blockers || []).some(b => b.blockerId === obj.id);
});

const OTHER: IRestrictionHandler = {
    matches(state, targetObj, r, context) {
        return targetObj.id !== context.sourceId;
    }
};

export const StateRestrictions: Record<string, IRestrictionHandler> = {
    TAPPED,
    UNTAPPED,
    YOU_CONTROL: YOUCONTROL,
    YOU_OWN: YOUOWN,
    OPPONENT_OWNS: OPPONENTOWNS,
    NOT_CONTROLLED: NOTCONTROLLED,
    OPPONENT_CONTROL: NOTCONTROLLED,
    ATTACKING,
    BLOCKING,
    ATTACKING_OR_BLOCKING: {
        matches(state, targetObj, r, context) {
            return ATTACKING.matches(state, targetObj, r, context) || BLOCKING.matches(state, targetObj, r, context);
        }
    },
    OTHER,
    SELF: {
        matches(state, targetObj, r, context) {
            return targetObj.id === context.sourceId;
        }
    },
    HASCOUNTER: gameObjectRestriction((state, obj, restriction) => {
        if (typeof restriction !== 'string') return false;
        const parts = restriction.split('_');
        if (parts.length < 2) return false;
        const type = parts[1];
        const counters = obj.counters as Record<string, number | undefined>;
        return !!(counters && counters[type] && (counters[type] || 0) > 0);
    })
};



