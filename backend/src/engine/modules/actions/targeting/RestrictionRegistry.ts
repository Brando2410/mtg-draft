import { IRestrictionHandler } from "./IRestrictionHandler";
import { NumericRestrictions } from "./handlers/NumericRestrictions";
import { SpecializedRestrictions } from "./handlers/SpecializedRestrictions";
import { StateRestrictions } from "./handlers/StateRestrictions";
import { TypeRestrictions } from "./handlers/TypeRestrictions";

export const RestrictionRegistry: Record<string, IRestrictionHandler> = {
    ...TypeRestrictions,
    ...StateRestrictions,
    ...NumericRestrictions,
    ...SpecializedRestrictions,
};

/**
 * Helper to check if a string is a numeric restriction.
 */
export function isNumericRestriction(r: string): boolean {
    return !!r.toLowerCase().match(/^(cmc|mv|power|toughness)\s*(<=|>=|==|=|<|>)\s*(\d+|x|power|source_power|source_mv|source_cmc|converge_amount)$/);
}
