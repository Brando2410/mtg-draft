import { EnginePrefix, GameObject, GameState, GameEvent, ResolutionContext } from "@shared/engine_types";
import { getProcessors } from "../modules/ProcessorRegistry";

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

    public static hasHaste(obj: any): boolean { return this.hasKeyword(obj, 'haste'); }
    public static hasFlash(obj: any): boolean { return this.hasKeyword(obj, 'flash'); }
    public static hasFlying(obj: any): boolean { return this.hasKeyword(obj, 'flying'); }
    public static hasTrample(obj: any): boolean { return this.hasKeyword(obj, 'trample'); }
    public static hasLifelink(obj: any): boolean { return this.hasKeyword(obj, 'lifelink'); }
    public static hasDeathtouch(obj: any): boolean { return this.hasKeyword(obj, 'deathtouch'); }
    public static hasIndestructible(obj: any): boolean { return this.hasKeyword(obj, 'indestructible'); }
    public static hasVigilance(obj: any): boolean { return this.hasKeyword(obj, 'vigilance'); }
    public static hasMenace(obj: any): boolean { return this.hasKeyword(obj, 'menace'); }
    public static hasReach(obj: any): boolean { return this.hasKeyword(obj, 'reach'); }
    public static hasFirstStrike(obj: any): boolean { return this.hasKeyword(obj, 'firststrike'); }
    public static hasDoubleStrike(obj: any): boolean { return this.hasKeyword(obj, 'doublestrike'); }
    public static hasDefender(obj: any): boolean { return this.hasKeyword(obj, 'defender'); }
    public static hasWard(obj: any): boolean { return this.hasKeyword(obj, 'ward'); }
    public static hasHexproof(obj: any): boolean { return this.hasKeyword(obj, 'hexproof'); }
    public static hasShroud(obj: any): boolean { return this.hasKeyword(obj, 'shroud'); }

    /**
     * Centralized numeric resolution for engine effects.
     * Rule 107: Numbers and Symbols.
     */
    public static resolveAmount(state: GameState, amount: any, context: ResolutionContext): number {
        if (typeof amount === 'number') return amount;
        if (!amount) return 0;

        const { controllerId, sourceId, stackObject, parentContext } = context;
        const targetIds = context.targets || [];
        const { layer: LayerProcessor } = getProcessors(state);

        if (typeof amount === 'string' && !isNaN(Number(amount))) return Number(amount);

        switch (amount) {
            case "X":
                return stackObject?.xValue ??
                    (stackObject?.data as any)?.xValue ??
                    (stackObject?.data as any)?.event?.payload?.object?.xValue ??
                    (parentContext?.event as any)?.payload?.object?.xValue ??
                    0;
            case "X_PLUS_1": return (this.resolveAmount(state, "X", context) || 0) + 1;
            case "2_POW_X": return Math.pow(2, this.resolveAmount(state, "X", context) || 0);

            case "SOURCE_POWER":
            case "SOURCE_TOUGHNESS": {
                const obj = this.findObject(state, sourceId);
                if (!obj) return 0;
                const stats = LayerProcessor.getEffectiveStats(obj, state);
                return amount === "SOURCE_POWER" ? stats.power : stats.toughness;
            }

            case "CREATURES_YOU_CONTROL":
            case "CREATURE_COUNT_YOU_CONTROL":
                return state.battlefield.filter(o => String(o.controllerId) === String(controllerId) && this.isCreature(o)).length;

            case "LANDS_YOU_CONTROL":
                return state.battlefield.filter(o => String(o.controllerId) === String(controllerId) && this.isLand(o)).length;

            case "GRAVEYARD_SIZE":
                return state.players[controllerId]?.graveyard.length || 0;

            case "HAND_SIZE":
            case "CARDS_IN_HAND_COUNT":
                return state.players[controllerId]?.hand.length || 0;

            case "EVENT_AMOUNT":
                return (stackObject?.data as any)?.eventAmount ??
                    (stackObject?.data as any)?.eventData?.spent ??
                    state.turnState.lastDamageAmount ?? 0;

            case "CONVERGE_AMOUNT":
                return stackObject?.convergeAmount ?? (stackObject?.card as any)?.convergeAmount ?? 0;

            default:
                if (typeof amount === 'string') {
                    if (amount.startsWith("COUNT_") || amount.startsWith("AFFINITY_")) {
                        const type = amount.split("_")[1].toLowerCase();
                        const singular = type.endsWith("s") ? type.slice(0, -1) : type;
                        return state.battlefield.filter(o =>
                            o.controllerId === controllerId &&
                            (this.isType(o, type) || this.isType(o, singular) || this.hasSubtype(o, type) || this.hasSubtype(o, singular))
                        ).length;
                    }
                }
                return 0;
        }
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
