import { ManaProcessor } from "../../../magic/ManaProcessor";
import { LayerProcessor } from "../../../state/LayerProcessor";
import { IRestrictionHandler } from "../IRestrictionHandler";
import { Targetable, Zone, StackObject, PlayerState, GameState, GameObject } from "@shared/engine_types";
import { gameObjectRestriction, isGameObject, isStackObject } from "./HandlerUtils";

const evaluateNumeric = (
    state: GameState,
    obj: GameObject,
    field: 'mv' | 'power' | 'toughness',
    op: string,
    value: number
): boolean => {
    let currentVal = 0;
    if (field === 'mv') currentVal = ManaProcessor.getEffectiveManaValue(obj);
    else if (field === 'power') currentVal = LayerProcessor.getEffectiveStats(obj, state).power;
    else if (field === 'toughness') currentVal = LayerProcessor.getEffectiveStats(obj, state).toughness;

    if (op === '<=' || op === 'le') return currentVal <= value;
    if (op === '>=' || op === 'ge') return currentVal >= value;
    if (op === '<' || op === 'lt') return currentVal < value;
    if (op === '>' || op === 'gt') return currentVal > value;
    if (op === '==' || op === '=' || op === 'eq') return currentVal === value;
    return false;
};

const StaticNumericRestrictions: Record<string, IRestrictionHandler> = {
    "NUMERIC_REGEX": gameObjectRestriction((state, obj, restriction, context) => {
        const { sourceId, stackObject } = context;
        const match = restriction.toLowerCase().match(/^(cmc|mv|power|toughness)\s*(<=|>=|==|=|<|>)\s*(\d+|x|power|source_power|source_mv|source_cmc|converge_amount)$/);
        if (!match) return true;

        const [, field, op, valPart] = match;
        let val = 0;

        if (valPart.match(/^\d+$/)) {
            val = parseInt(valPart);
        } else if (valPart === 'x') {
            val = context.xValue || 0;
        } else if (valPart === 'power' || valPart === 'source_power') {
            const source = state.battlefield.find(o => o.id === sourceId) || state.exile.find(o => o.id === sourceId);
            val = source ? LayerProcessor.getEffectiveStats(source, state).power : 0;
        } else if (valPart === 'source_mv' || valPart === 'source_cmc') {
            const source = state.battlefield.find(o => o.id === sourceId) || 
                           state.exile.find(o => o.id === sourceId) ||
                           state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
            if (source) {
                const effectiveObj = isStackObject(source) ? ((source as StackObject).card || source) : source;
                val = ManaProcessor.getEffectiveManaValue(effectiveObj);
            }
        } else if (valPart === 'converge_amount') {
            const source = state.battlefield.find(o => o.id === sourceId) || state.exile.find(o => o.id === sourceId);
            val = (source as any)?.convergeAmount || 0;
        }

        return evaluateNumeric(state, obj, field as any, op, val);
    }),

    "MV_LE_POWER": gameObjectRestriction((state, obj, r, context) => {
        const { sourceId } = context;
        const source = state.battlefield.find(o => o.id === sourceId);
        const sourcePower = source ? LayerProcessor.getEffectiveStats(source, state).power : 0;
        return evaluateNumeric(state, obj, 'mv', '<=', sourcePower);
    }),
    "MV_LE_X": gameObjectRestriction((state, obj, r, context) => {
        const xValue = context.xValue || 0;
        return evaluateNumeric(state, obj, 'mv', '<=', xValue);
    }),
    "MV_LE_LIFE_GAINED": gameObjectRestriction((state, obj, r, context) => {
        const { controllerId } = context;
        const lifeGained = state.turnState.lifeGainedThisTurn[controllerId] || 0;
        return evaluateNumeric(state, obj, 'mv', '<=', lifeGained);
    }),
    "MV_LT_SOURCE": gameObjectRestriction((state, obj, r, context) => {
        return StaticNumericRestrictions["NUMERIC_REGEX"].matches(state, obj, "mv < source_mv", context);
    }),
    "MV_LE_SOURCE": gameObjectRestriction((state, obj, r, context) => {
        return StaticNumericRestrictions["NUMERIC_REGEX"].matches(state, obj, "mv <= source_mv", context);
    })
};

/**
 * Dynamic Proxy for Numeric Restrictions.
 * Allows for any arbitrary MV_LE_N, POWER_N_OR_GREATER, etc. without manual registration.
 */
export const NumericRestrictions = new Proxy(StaticNumericRestrictions, {
    get(target, prop: string) {
        if (prop in target) return target[prop];

        // Try to parse dynamic patterns
        // 1. MV_LE_N
        const mvLeMatch = prop.match(/^MV_LE_(\d+)$/i);
        if (mvLeMatch) return gameObjectRestriction((state, obj) => evaluateNumeric(state, obj, 'mv', '<=', parseInt(mvLeMatch[1])));

        // 2. MV_GE_N
        const mvGeMatch = prop.match(/^MV_GE_(\d+)$/i);
        if (mvGeMatch) return gameObjectRestriction((state, obj) => evaluateNumeric(state, obj, 'mv', '>=', parseInt(mvGeMatch[1])));

        // 3. POWER_N_OR_GREATER
        const powerGeMatch = prop.match(/^POWER(\d+)ORGREATER$/i);
        if (powerGeMatch) return gameObjectRestriction((state, obj) => evaluateNumeric(state, obj, 'power', '>=', parseInt(powerGeMatch[1])));

        // 4. POWER_LE_N
        const powerLeMatch = prop.match(/^POWER_LE_(\d+)$/i);
        if (powerLeMatch) return gameObjectRestriction((state, obj) => evaluateNumeric(state, obj, 'power', '<=', parseInt(powerLeMatch[1])));

        return undefined;
    }
});






