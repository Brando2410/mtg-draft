import { EnginePrefix, GameObject, GameState, Zone, GameEvent } from "@shared/engine_types";

/**
 * RuleUtils: Centralized logic for common MTG rule checks.
 * Ensures consistent behavior for type-line parsing and keyword detection.
 */
export class RuleUtils {
    /**
     * Internal helper to extract definition from various sources.
     */
    private static getDef(obj: any): any {
        if (!obj) return null;
        return (obj as GameObject).definition || obj;
    }

    /**
     * Checks if an object has a specific type (e.g., Creature, Artifact).
     */
    public static isType(obj: any, type: string): boolean {
        const def = this.getDef(obj);
        if (!def) return false;
        const search = type.toLowerCase();
        return (def.types || []).some((t: any) => String(t).toLowerCase() === search);
    }

    /**
     * Checks if an object has a specific subtype (e.g., Elf, Equipment).
     */
    public static hasSubtype(obj: any, subtype: string): boolean {
        const def = this.getDef(obj);
        if (!def) return false;
        const search = subtype.toLowerCase();
        return (def.subtypes || []).some((s: any) => String(s).toLowerCase() === search);
    }

    /**
     * Checks if an object has a specific supertype (e.g., Legendary, Basic).
     */
    public static hasSupertype(obj: any, supertype: string): boolean {
        const def = this.getDef(obj);
        if (!def) return false;
        const search = supertype.toLowerCase();
        return (def.supertypes || []).some((s: any) => String(s).toLowerCase() === search);
    }

    /**
     * CR 302: Creatures
     */
    public static isCreature(obj: any): boolean {
        return this.isType(obj, 'creature');
    }

    /**
     * CR 306: Planeswalkers
     */
    public static isPlaneswalker(obj: any): boolean {
        return this.isType(obj, 'planeswalker');
    }

    /**
     * CR 305: Lands
     */
    public static isLand(obj: any): boolean {
        return this.isType(obj, 'land');
    }

    /**
     * CR 304: Artifacts
     */
    public static isArtifact(obj: any): boolean {
        return this.isType(obj, 'artifact');
    }

    /**
     * CR 303: Enchantments
     */
    public static isEnchantment(obj: any): boolean {
        return this.isType(obj, 'enchantment');
    }

    /**
     * CR 110.1: Permanents are cards or tokens on the battlefield.
     */
    public static isPermanent(obj: any): boolean {
        if (!obj) return false;
        return this.isCreature(obj) ||
            this.isLand(obj) ||
            this.isPlaneswalker(obj) ||
            this.isArtifact(obj) ||
            this.isEnchantment(obj);
    }

    /**
     * Checks if an object has a specific keyword, accounting for both
     * printed keywords and those granted by continuous effects.
     */
    public static hasKeyword(obj: any, keyword: string): boolean {
        const def = this.getDef(obj);
        if (!def) return false;
        const search = keyword.toLowerCase();
        const printed = (def.keywords || []).some((k: any) => k.toLowerCase() === search);
        const effective = (obj.effectiveStats?.keywords || []).some((k: any) => k.toLowerCase() === search);
        
        if (printed || effective) return true;

        // Fallback: Oracle Text check for keywords (CR 702)
        // Note: This is a heuristic for simple keywords.
        const oracle = def.oracleText || "";
        const regex = new RegExp(`\\b${keyword}\\b`, "i");
        return regex.test(oracle);
    }

    /**
     * Standardized object lookup across all zones.
     * Searches Battlefield, then Stack, then Hands, Graveyards, and Exile.
     */
    public static findObject(state: GameState, id: string): GameObject | undefined {
        if (!id) return undefined;

        // FAST PATH: Check the state-level lookup cache
        if (state._objectCache && state._objectCache.version === state.stateVersion && state._objectCache.has(id)) {
            return state._objectCache.get(id);
        }

        // 1. Check Battlefield (most common)
        const bf = state.battlefield.find(o => o.id === id);
        if (bf) return bf;

        // 2. Check Stack
        const stackObj = state.stack.find(s => s.id === id);
        if (stackObj?.card) return stackObj.card;

        // 3. Check All Zones for all players
        for (const player of Object.values(state.players)) {
            const inHand = player.hand.find(c => c.id === id);
            if (inHand) return inHand;

            const virtual = player.virtualHand?.find(c => c.id === id);
            if (virtual) return virtual;

            const inGrave = player.graveyard.find(c => c.id === id);
            if (inGrave) return inGrave;

            const inLibrary = player.library.find(c => c.id === id);
            if (inLibrary) return inLibrary;
        }

        // 4. Check Exile
        const exiled = state.exile.find(o => o.id === id);
        if (exiled) return exiled;

        // 5. Check Limbo (cards in transition)
        const limbo = state.limbo?.find(o => o.id === id);
        if (limbo) return limbo;

        // 6. Check Engine Caches (Copies)
        if (state.dynamicCopies && state.dynamicCopies[id]) return state.dynamicCopies[id];
        if (state.paradigmCopies && state.paradigmCopies[id]) return state.paradigmCopies[id];

        return undefined;
    }

    /**
     * Standardizes event object extraction across various event schemas.
     */
    public static getEventObject(event: GameEvent | any, state: GameState): GameObject | undefined {
        if (!event) return undefined;
        
        const obj = 
            event.payload?.object || 
            event.payload?.card || 
            event.data?.object || 
            event.data?.card || 
            event.data?.copy || 
            event.gameObject || 
            event.object || 
            event.card;
            
        if (obj) return obj;
        
        const id = event.sourceId || event.targetId || event.data?.sourceId || event.data?.targetId;
        if (id && state) {
            return this.findObject(state, id);
        }
        
        return undefined;
    }

    /**
     * Standardized token identification.
     */
    public static isToken(obj: any): boolean {
        if (!obj) return false;
        return obj.isToken === true || (typeof obj.id === 'string' && obj.id.startsWith(EnginePrefix.Token));
    }
}
