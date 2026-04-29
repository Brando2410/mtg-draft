import { IRestrictionHandler } from "../IRestrictionHandler";
import { LayerProcessor } from "../../../state/LayerProcessor";
import { ManaProcessor } from "../../../magic/ManaProcessor";

export const NumericRestrictions: Record<string, IRestrictionHandler> = {
    "NUMERIC_REGEX": {
        matches(state, targetObj: any, restriction: string, context) {
            const { sourceId, stackObject } = context;
            const match = restriction.toLowerCase().match(/^(cmc|mv|power|toughness)\s*(<=|>=|==|=|<|>)\s*(\d+|x|power|source_power|source_mv|source_cmc|converge_amount)$/);
            if (!match) return true;

            const [, field, op, valPart] = match;
            let val = 0;

            if (valPart.match(/^\d+$/)) {
                val = parseInt(valPart);
            } else if (valPart === 'x') {
                val = (stackObject?.xValue) || (stackObject as any)?.data?.xValue || (state.pendingAction as any)?.data?.xValue || (state.pendingAction as any)?.xValue || 0;
            } else if (valPart === 'power' || valPart === 'source_power') {
                const source = state.battlefield.find(o => o.id === sourceId) || state.exile.find(o => o.id === sourceId);
                val = source ? LayerProcessor.getEffectiveStats(source, state).power : 0;
            } else if (valPart === 'source_mv' || valPart === 'source_cmc') {
                const source = state.battlefield.find(o => o.id === sourceId) || 
                               state.exile.find(o => o.id === sourceId) ||
                               state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
                val = source ? ManaProcessor.getManaValue(source.definition?.manaCost || '', (source as any).xValue || 0) : 0;
            } else if (valPart === 'converge_amount') {
                const source = state.battlefield.find(o => o.id === sourceId) || state.exile.find(o => o.id === sourceId);
                val = (source as any)?.convergeAmount || 0;
            }

            let currentVal = 0;
            if (field === 'cmc' || field === 'mv') currentVal = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            else if (field === 'power') currentVal = LayerProcessor.getEffectiveStats(targetObj, state).power;
            else if (field === 'toughness') currentVal = LayerProcessor.getEffectiveStats(targetObj, state).toughness;

            if (op === '<=' && !(currentVal <= val)) return false;
            if (op === '>=' && !(currentVal >= val)) return false;
            if (op === '<' && !(currentVal < val)) return false;
            if (op === '>' && !(currentVal > val)) return false;
            if ((op === '==' || op === '=') && !(currentVal === val)) return false;

            return true;
        }
    },
    "MV_LE_POWER": {
        matches(state, targetObj: any, r, context) {
            const { sourceId } = context;
            const source = state.battlefield.find(o => o.id === sourceId);
            const sourcePower = source ? LayerProcessor.getEffectiveStats(source, state).power : 0;
            const targetMV = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return targetMV <= sourcePower;
        }
    },
    "MV_LE_X": {
        matches(state, targetObj: any, r, context) {
            const { stackObject } = context;
            const xValue = (stackObject?.xValue) || (state.pendingAction as any)?.data?.xValue || (state.pendingAction as any)?.xValue || 0;
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv <= xValue;
        }
    },
    "MV_GE_1": {
        matches(state, targetObj: any) {
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv >= 1;
        }
    },
    "MV_GE_4": {
        matches(state, targetObj: any) {
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv >= 4;
        }
    },
    "MV_LE_3": {
        matches(state, targetObj: any) {
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv <= 3;
        }
    },
    "MV_LE_4": {
        matches(state, targetObj: any) {
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv <= 4;
        }
    },
    "MV_GE_6": {
        matches(state, targetObj: any) {
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv >= 6;
        }
    },
    "MV_LE_1": {
        matches(state, targetObj: any) {
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv <= 1;
        }
    },
    "MV_LE_2": {
        matches(state, targetObj: any) {
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv <= 2;
        }
    },
    "POWER_LE_3": {
        matches(state, targetObj: any) {
            const power = LayerProcessor.getEffectiveStats(targetObj, state).power;
            return power <= 3;
        }
    },
    "POWER1ORGREATER": {
        matches(state, targetObj: any) {
            const power = LayerProcessor.getEffectiveStats(targetObj, state).power;
            return power >= 1;
        }
    },
    "POWER2ORGREATER": {
        matches(state, targetObj: any) {
            const power = LayerProcessor.getEffectiveStats(targetObj, state).power;
            return power >= 2;
        }
    },
    "MV_LE_LIFE_GAINED": {
        matches(state, targetObj: any, r, context) {
            const { controllerId } = context;
            const lifeGained = state.turnState.lifeGainedThisTurn[controllerId] || 0;
            const mv = ManaProcessor.getManaValue(targetObj.definition?.manaCost || '', (targetObj as any).xValue || 0);
            return mv <= lifeGained;
        }
    },
    "MV_LT_SOURCE": {
        matches(state, targetObj: any, r, context) {
            return NumericRestrictions["NUMERIC_REGEX"].matches(state, targetObj, "mv < source_mv", context);
        }
    },
    "MV_LE_SOURCE": {
        matches(state, targetObj: any, r, context) {
            return NumericRestrictions["NUMERIC_REGEX"].matches(state, targetObj, "mv <= source_mv", context);
        }
    }
};

