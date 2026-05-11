import { IRestrictionHandler } from "../IRestrictionHandler";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { Targetable } from "@shared/engine_types";
import { gameObjectRestriction } from "./HandlerUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { LogCategory } from "../../../../utils/EngineLogger";

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
        const ownerId = targetObj.ownerId || RuleUtils.getController(targetObj);
        return String(ownerId) === String(controllerId);
    }
};

const OPPONENTOWNS: IRestrictionHandler = {
    matches(state, targetObj, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId || !targetObj) return true;
        const ownerId = targetObj.ownerId || RuleUtils.getController(targetObj);
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
        const id = targetObj.id;
        
        // Basic check: is it the exact same object?
        if (id === context.sourceId) return false;
        
        const stackObj = context.stackObject;
        if (stackObj && id === stackObj.sourceId) {
            getProcessors(state).logger.debug(state, LogCategory.TARGETING, `[OTHER-FAIL] Excluding source permanent ${id} for stack object ${stackObj.id}. sourceId match: ${stackObj.sourceId}`);
            return false;
        }

        const sourceObj = RuleUtils.findObject(state, context.sourceId);
        if (sourceObj && RuleUtils.isStackObject(sourceObj) && id === sourceObj.sourceId) {
             getProcessors(state).logger.debug(state, LogCategory.TARGETING, `[OTHER-FAIL] Excluding source permanent ${id} via sourceObj lookup for ${context.sourceId}. Object sourceId: ${sourceObj.sourceId}`);
             return false;
        }

        // Final fallback: check the actual source of the trigger if it's a copy
        const sObj = stackObj || sourceObj;
        if (sObj && RuleUtils.isStackObject(sObj) && (sObj.isCopy || sObj.type.includes('Ability')) && sObj.sourceId === id) {
             getProcessors(state).logger.debug(state, LogCategory.TARGETING, `[OTHER-FAIL] Excluding source permanent ${id} via final fallback. sObj ID: ${sObj.id}, sObj sourceId: ${sObj.sourceId}`);
             return false;
        }

        // Log EVERY check for a while to see what's happening
        getProcessors(state).logger.debug(state, LogCategory.TARGETING, `[OTHER-CHECK] Target: ${id}, context.sourceId: ${context.sourceId}, stackObj.sourceId: ${stackObj?.sourceId || 'None'}, stackObj.isCopy: ${!!stackObj?.isCopy}`);

        return true;
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
    OTHER_RESUME: {
        matches(state, targetObj, r, context) {
            if (!OTHER.matches(state, targetObj, r, context)) return false;
            // Additional logic for resumption handling if needed
            return true;
        }
    },
    SELF: {
        matches(state, targetObj, r, context) {
            const id = targetObj.id;
            if (id === context.sourceId) return true;
            if (context.stackObject && id === context.stackObject.sourceId) return true;
            return false;
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



