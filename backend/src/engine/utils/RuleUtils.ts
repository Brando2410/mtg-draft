import { GameObject } from "@shared/engine_types";

/**
 * RuleUtils: Centralized logic for common MTG rule checks.
 * Ensures consistent behavior for type-line parsing and keyword detection.
 */
export class RuleUtils {
    /**
     * CR 302: Creatures
     */
    public static isCreature(obj: GameObject): boolean {
        if (!obj || !obj.definition) return false;
        const types = (obj.definition.types || []).map(t => String(t).toLowerCase());
        const typeLine = (obj.definition.type_line || '').toLowerCase();
        return types.includes('creature') || typeLine.includes('creature');
    }

    /**
     * CR 306: Planeswalkers
     */
    public static isPlaneswalker(obj: GameObject): boolean {
        if (!obj || !obj.definition) return false;
        const types = (obj.definition.types || []).map(t => String(t).toLowerCase());
        const typeLine = (obj.definition.type_line || '').toLowerCase();
        return types.includes('planeswalker') || typeLine.includes('planeswalker');
    }

    /**
     * CR 305: Lands
     */
    public static isLand(obj: GameObject): boolean {
        if (!obj || !obj.definition) return false;
        const types = (obj.definition.types || []).map(t => String(t).toLowerCase());
        const typeLine = (obj.definition.type_line || '').toLowerCase();
        return types.includes('land') || typeLine.includes('land');
    }

    /**
     * CR 110.1: Permanents are cards or tokens on the battlefield.
     * This helper checks if a card definition represents a permanent type.
     */
    public static isPermanent(obj: GameObject): boolean {
        if (!obj || !obj.definition) return false;
        return this.isCreature(obj) || 
               this.isLand(obj) || 
               this.isPlaneswalker(obj) || 
               (obj.definition.types || []).some(t => {
                   const lt = String(t).toLowerCase();
                   return lt === 'artifact' || lt === 'enchantment';
               });
    }

    /**
     * Checks if an object has a specific keyword, accounting for both
     * printed keywords and those granted by continuous effects.
     */
    public static hasKeyword(obj: GameObject, keyword: string): boolean {
        if (!obj) return false;
        const search = keyword.toLowerCase();
        const printed = (obj.definition.keywords || []).some(k => k.toLowerCase() === search);
        const effective = (obj.effectiveStats?.keywords || []).some(k => k.toLowerCase() === search);
        return printed || effective;
    }
}
