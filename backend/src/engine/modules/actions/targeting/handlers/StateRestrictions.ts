import { GameState, GameObject, TargetingContext } from "@shared/engine_types";
import { IRestrictionHandler } from "../IRestrictionHandler";

export const StateRestrictions: Record<string, IRestrictionHandler> = {
    "TAPPED": {
        matches(state, targetObj: any) {
            return targetObj && typeof targetObj === 'object' && 'isTapped' in targetObj && !!targetObj.isTapped;
        }
    },
    "UNTAPPED": {
        matches(state, targetObj: any) {
            return targetObj && typeof targetObj === 'object' && 'isTapped' in targetObj && !targetObj.isTapped;
        }
    },
    "YOUCONTROL": {
        matches(state, targetObj: any, r, context) {
            const controllerId = context.controllerId;
            if (!controllerId) return false;
            return (targetObj.controllerId || targetObj.ownerId) === controllerId;
        }
    },
    "YOURS": {
        matches(state, targetObj: any, r, context) {
            return StateRestrictions["YOUCONTROL"].matches(state, targetObj, r, context);
        }
    },
    "NOTCONTROLLED": {
        matches(state, targetObj: any, r, context) {
            const controllerId = context.controllerId;
            if (!controllerId) return true; // If no controller context, it's not controlled by "you"
            return targetObj.controllerId !== controllerId;
        }
    },
    "OPPONENTCONTROL": {
        matches(state, targetObj: any, r, context) {
            return StateRestrictions["NOTCONTROLLED"].matches(state, targetObj, r, context);
        }
    },
    "OPPONENTS": {
        matches(state, targetObj: any, r, context) {
            return StateRestrictions["NOTCONTROLLED"].matches(state, targetObj, r, context);
        }
    },
    "ATTACKING": {
        matches(state, targetObj: any) {
            return (state.combat?.attackers || []).some(a => a.attackerId === targetObj.id);
        }
    },
    "BLOCKING": {
        matches(state, targetObj: any) {
            return (state.combat?.blockers || []).some(b => b.blockerId === targetObj.id);
        }
    },
    "ATTACKINGORBLOCKING": {
        matches(state, targetObj: any) {
            const isAttacking = (state.combat?.attackers || []).some(a => a.attackerId === targetObj.id);
            const isBlocking = (state.combat?.blockers || []).some(b => b.blockerId === targetObj.id);
            return isAttacking || isBlocking;
        }
    },
    "OTHER": {
        matches(state, targetObj: any, r, context) {
            return targetObj.id !== context.sourceId;
        }
    },
    "ANOTHER": {
        matches(state, targetObj: any, r, context) {
            return targetObj.id !== context.sourceId;
        }
    },
    "SELF": {
        matches(state, targetObj: any, r, context) {
            return targetObj.id === context.sourceId;
        }
    },
    "HASCOUNTER": {
        matches(state, targetObj: any, restriction: string) {
            if (typeof restriction !== 'string') return false;
            const parts = restriction.split('_');
            if (parts.length < 2) return false;
            const type = parts[1];
            return !!(targetObj.counters && targetObj.counters[type] && targetObj.counters[type] > 0);
        }
    }
};

