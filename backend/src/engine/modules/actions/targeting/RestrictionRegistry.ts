import { IRestrictionHandler } from "./IRestrictionHandler";
import { NumericRestrictions } from "./handlers/NumericRestrictions";
import { SpecializedRestrictions } from "./handlers/SpecializedRestrictions";
import { StateRestrictions } from "./handlers/StateRestrictions";
import { TypeRestrictions } from "./handlers/TypeRestrictions";

const _RestrictionRegistry: Record<string, IRestrictionHandler> = {
    ...TypeRestrictions,
    ...StateRestrictions,
    ...NumericRestrictions,
    ...SpecializedRestrictions,
};

/**
 * Proxy-based Registry to handle circular dependencies and lazy initialization.
 */
export const RestrictionRegistry: Record<string, IRestrictionHandler> = new Proxy(_RestrictionRegistry, {
    get(target, prop: string) {
        if (typeof prop !== 'string') return undefined;
        const token = prop.toUpperCase();
        return target[token] || 
               TypeRestrictions[token] || 
               StateRestrictions[token] || 
               NumericRestrictions[token] || 
               SpecializedRestrictions[token];
    }
});

/**
 * Helper to check if a string is a numeric restriction.
 */
export function isNumericRestriction(r: string): boolean {
    return !!r.toLowerCase().match(/^(cmc|mv|power|toughness)\s*(<=|>=|==|=|<|>)\s*(\d+|x|power|source_power|source_mv|source_cmc|converge_amount)$/);
}
