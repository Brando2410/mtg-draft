import { IRestrictionHandler } from "../IRestrictionHandler";

const TAPPED: IRestrictionHandler = {
    matches(state, targetObj: any) {
        return targetObj && typeof targetObj === 'object' && 'isTapped' in targetObj && !!targetObj.isTapped;
    }
};

const UNTAPPED: IRestrictionHandler = {
    matches(state, targetObj: any) {
        return targetObj && typeof targetObj === 'object' && 'isTapped' in targetObj && !targetObj.isTapped;
    }
};

const YOUCONTROL: IRestrictionHandler = {
    matches(state, targetObj: any, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId) return false;
        return (targetObj.controllerId || targetObj.ownerId) === controllerId;
    }
};

const YOUOWN: IRestrictionHandler = {
    matches(state, targetObj: any, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId || !targetObj) return false;
        const ownerId = targetObj.ownerId || targetObj.controllerId;
        return String(ownerId) === String(controllerId);
    }
};

const OPPONENTOWNS: IRestrictionHandler = {
    matches(state, targetObj: any, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId || !targetObj) return true;
        const ownerId = targetObj.ownerId || targetObj.controllerId;
        return String(ownerId) !== String(controllerId);
    }
};

const NOTCONTROLLED: IRestrictionHandler = {
    matches(state, targetObj: any, r, context) {
        const controllerId = context.controllerId;
        if (!controllerId) return true; // If no controller context, it's not controlled by "you"
        return targetObj.controllerId !== controllerId;
    }
};

const ATTACKING: IRestrictionHandler = {
    matches(state, targetObj: any) {
        return (state.combat?.attackers || []).some(a => a.attackerId === targetObj.id);
    }
};

const BLOCKING: IRestrictionHandler = {
    matches(state, targetObj: any) {
        return (state.combat?.blockers || []).some(b => b.blockerId === targetObj.id);
    }
};

const OTHER: IRestrictionHandler = {
    matches(state, targetObj: any, r, context) {
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
        matches(state, targetObj: any, r, context) {
            return ATTACKING.matches(state, targetObj, r, context) || BLOCKING.matches(state, targetObj, r, context);
        }
    },
    OTHER,
    ANOTHER: OTHER,
    SELF: {
        matches(state, targetObj: any, r, context) {
            return targetObj.id === context.sourceId;
        }
    },
    HASCOUNTER: {
        matches(state, targetObj: any, restriction: string) {
            if (typeof restriction !== 'string') return false;
            const parts = restriction.split('_');
            if (parts.length < 2) return false;
            const type = parts[1];
            return !!(targetObj.counters && targetObj.counters[type] && targetObj.counters[type] > 0);
        }
    }
};


