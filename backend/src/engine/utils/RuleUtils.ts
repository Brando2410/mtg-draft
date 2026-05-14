import { BaseEntity, DynamicAmount, EnginePrefix, GameObject, GameState, GameEvent, EngineFrame, Zone, PlayerId, StackObject, Targetable, PlayerState, CardDefinition } from "@shared/engine_types";
import { getProcessors } from "../modules/ProcessorRegistry";
import { LogCategory } from "./EngineLogger";
/**
 * RuleUtils: Centralized logic for common MTG rule checks.
 * Ensures consistent behavior for type-line parsing and keyword detection.
 */
export class RuleUtils {
    /**
     * Type guard to check if a Targetable is a physical entity (GameObject or StackObject).
     * These objects have a definition and can have xValue, counters, etc.
     */
    public static isEntity(obj: Targetable | undefined): obj is GameObject | StackObject {
        return !!obj && 'definition' in obj;
    }

    /**
     * Type guard to check if a Targetable is a Player.
     */
    public static isPlayer(obj: Targetable | undefined): obj is PlayerState {
        return !!obj && 'hand' in obj;
    }

    /**
     * Type guard to check if a Targetable is a GameObject specifically.
     */
    public static isGameObject(obj: Targetable | undefined): obj is GameObject {
        return !!obj && 'definition' in obj && !('sourceId' in obj);
    }

    /**
     * Type guard to check if a Targetable is a StackObject specifically.
     */
    public static isStackObject(obj: Targetable | undefined): obj is StackObject {
        return !!obj && 'sourceId' in obj && 'type' in obj;
    }
    /**
     * CR 108.4: Determines the controller of an object.
     * Objects on the Battlefield or Stack have a controller.
     * Objects in other zones are controlled by their owner.
     */
    public static getController(obj: Targetable | undefined): PlayerId {
        if (!obj) return "";

        if (this.isStackObject(obj)) {
            return obj.controllerId;
        }

        if (this.isGameObject(obj)) {
            if (obj.zone === Zone.Battlefield || obj.zone === Zone.Stack) {
                return obj.controllerId;
            }
            return obj.ownerId || obj.controllerId || "";
        }

        if (this.isPlayer(obj)) {
            return obj.id;
        }

        return (obj as any).controllerId || "";
    }

    /**
     * Rule 102.2: In a two-player game, a player's opponent is the other player.
     */
    public static getOpponentId(state: GameState, playerId: PlayerId): PlayerId | undefined {
        return Object.keys(state.players).find(id => id !== playerId) as PlayerId;
    }

    /**
     * Helper: Collects all object IDs across visible zones (Battlefield, Stack, Graveyard, Exile, Players).
     * Used for building targeting pools.
     */
    public static getAllVisibleObjectIds(state: GameState): string[] {
        return [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id),
            ...state.exile.map(o => o.id),
            ...state.stack.map(o => o.id),
            ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
        ];
    }

    /**
     * Internal helper to extract definition from various sources.
     */
    private static getDef(obj: Targetable | undefined): CardDefinition | null {
        if (!obj) return null;
        if ((obj as any).definition) return (obj as any).definition;
        if ((obj as any).types && (obj as any).name) return obj as any as CardDefinition;
        return null;
    }

    /**
     * Checks if an object has a specific type (e.g., Creature, Artifact).
     */
    public static isType(obj: Targetable | undefined, type: string): boolean {
        const def = this.getDef(obj);
        if (!def) return false;
        const search = type.toLowerCase().trim();

        // 1. Check static definition types
        if ((def.types || []).some((t: any) => String(t).toLowerCase().trim() === search)) return true;

        // 2. Check dynamic effective types (CR 613 Layer 4)
        if (this.isGameObject(obj) && obj.effectiveStats && (obj.effectiveStats.types || []).some((t) => String(t).toLowerCase().trim() === search)) return true;

        return false;
    }

    /**
     * Checks if a card definition has a specific type.
     */
    public static isDefinitionType(def: CardDefinition | undefined, type: string): boolean {
        if (!def) return false;
        const search = type.toLowerCase().trim();
        return (def.types || []).some((t) => String(t).toLowerCase().trim() === search);
    }

    /**
     * Checks if an object has a specific subtype (e.g., Elf, Equipment).
     */
    public static hasSubtype(obj: Targetable | undefined, subtype: string): boolean {
        const def = this.getDef(obj);
        if (!def) return false;
        const search = subtype.toLowerCase();
        return (def.subtypes || []).some((s: any) => String(s).toLowerCase() === search);
    }

    /**
     * Checks if an object has a specific supertype (e.g., Legendary, Basic).
     */
    public static hasSupertype(obj: Targetable | undefined, supertype: string): boolean {
        const def = this.getDef(obj);
        if (!def) return false;
        const search = supertype.toLowerCase();
        return (def.supertypes || []).some((s: any) => String(s).toLowerCase() === search);
    }

    /**
     * CR 302: Creatures
     */
    public static isCreature(obj: Targetable | undefined): boolean {
        return this.isType(obj, 'creature');
    }

    /**
     * CR 306: Planeswalkers
     */
    public static isPlaneswalker(obj: Targetable | undefined): boolean {
        return this.isType(obj, 'planeswalker');
    }

    /**
     * CR 305: Lands
     */
    public static isLand(obj: Targetable | undefined): boolean {
        return this.isType(obj, 'land');
    }

    /**
     * CR 304: Artifacts
     */
    public static isArtifact(obj: Targetable | undefined): boolean {
        return this.isType(obj, 'artifact');
    }

    /**
     * CR 303: Enchantments
     */
    public static isEnchantment(obj: Targetable | undefined): boolean {
        return this.isType(obj, 'enchantment');
    }

    /**
     * CR 110.1: Permanents are cards or tokens on the battlefield.
     */
    public static isPermanent(obj: Targetable | undefined): boolean {
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
    public static hasKeyword(obj: Targetable | undefined, keyword: string): boolean {
        const def = this.getDef(obj);
        if (!def) return false;
        const search = keyword.toLowerCase().replace(/\s/g, '');
        
        const check = (k: string) => {
            const normalized = k.toLowerCase().replace(/\s/g, '');
            return normalized === search || normalized.startsWith(search + '{') || (normalized.startsWith(search) && !isNaN(Number(normalized.substring(search.length, search.length + 1))));
        };

        const printed = (def.keywords || []).some(check);
        const effective = (this.isGameObject(obj) && obj.effectiveStats?.keywords || []).some(check);

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
     * Rule 105: Colors.
     */
    public static getColors(obj: Targetable | undefined, state?: GameState): string[] {
        const def = this.getDef(obj);
        return def?.colors || [];
    }

    /**
     * Checks if an object matches a specific quality (color, type, supertype, subtype, etc.).
     */
    public static matchesQuality(obj: Targetable | undefined, quality: string, state?: GameState): boolean {
        const q = quality.toLowerCase();

        // Color check
        const colors = this.getColors(obj, state).map(c => c.toLowerCase());
        if (colors.includes(q)) return true;

        // Type/Subtype/Supertype check
        if (this.isType(obj, q)) return true;
        if (this.hasSubtype(obj, q)) return true;
        if (this.hasSupertype(obj, q)) return true;

        // Keyword check
        if (this.hasKeyword(obj, q)) return true;

        // Specialized qualities
        if (q === 'nonland' && !this.isLand(obj)) return true;
        if (q === 'multicolored' && this.getColors(obj, state).length >= 2) return true;
        if (q === 'colorless' && this.getColors(obj, state).length === 0) return true;
        if (q === 'monocolored' && this.getColors(obj, state).length === 1) return true;
        if (q === 'instant_or_sorcery' && (this.isType(obj, 'instant') || this.isType(obj, 'sorcery'))) return true;

        return false;
    }

    /**
     * Helper to count Instant and Sorcery cards in a player's graveyard.
     * CR 304/307: These are specific card types.
     */
    public static getInstantSorceryInGraveyardCount(state: GameState, playerId: PlayerId): number {
        const player = state.players[playerId];
        if (!player) return 0;
        return player.graveyard.filter(c =>
            this.isType(c, 'instant') || this.isType(c, 'sorcery')
        ).length;
    }

    /**
     * Centralized numeric resolution for engine effects.
     * Rule 107: Numbers and Symbols.
     */
    public static resolveAmount(state: GameState, amount: import('@shared/engine_types').NumericProperty | any, context: EngineFrame): number {
        if (typeof amount === 'number') return amount;
        if (!amount) return 0;

        const { controllerId, sourceId, stackObject, parentContext } = context;
        const targetIds = context.targets || [];
        const { layer: LayerProcessor } = getProcessors(state);

        if (typeof amount === 'string' && !isNaN(Number(amount))) return Number(amount);

        if (typeof amount === 'function') {
            return amount(state, context, targetIds);
        }

        if (typeof amount === 'object' && amount !== null) {
            const resolverObj = amount as import('@shared/engine_types').AmountResolver;
            if (resolverObj.type === 'SCRIPT' && resolverObj.resolver) {
                return resolverObj.resolver(state, context);
            }
            if (resolverObj.type === 'CONSTANT') return resolverObj.baseValue || 0;

            let base = 0;
            if (resolverObj.type === 'POWER' || resolverObj.type === 'TOUGHNESS') {
                const obj = this.findObject(state, sourceId);
                if (obj) {
                    const stats = LayerProcessor.getEffectiveStats(obj as GameObject, state);
                    base = resolverObj.type === 'POWER' ? stats.power : stats.toughness;
                }
            } else if (resolverObj.type === 'PLAYER_LIFE') {
                const pid = targetIds[0] as PlayerId || controllerId;
                base = state.players[pid]?.life || 0;
            } else if (resolverObj.type === 'PLAYER_HAND_SIZE') {
                const pid = targetIds[0] as PlayerId || controllerId;
                base = state.players[pid]?.hand.length || 0;
            } else if (resolverObj.type === 'COUNT_PLAYER_PERMANENTS') {
                const pid = targetIds[0] as PlayerId || controllerId;
                base = state.battlefield.filter(o => o.controllerId === pid).length;
            } else if (resolverObj.type === 'X_VALUE') {
                base = stackObject?.xValue ?? context.event?.payload?.xValue ?? 0;
            }

            const val = (base * (resolverObj.multiplier ?? 1)) + (resolverObj.offset ?? 0);
            if (resolverObj.rounding === 'floor') return Math.floor(val);
            if (resolverObj.rounding === 'ceil') return Math.ceil(val);
            return val;
        }

        switch (amount) {
            case DynamicAmount.X:
                return stackObject?.xValue ??
                    stackObject?.data?.xValue ??
                    context.event?.payload?.xValue ??
                    stackObject?.data?.event?.payload?.xValue ??
                    parentContext?.event?.payload?.xValue ??
                    0;
            case DynamicAmount.XPlus1: return (this.resolveAmount(state, DynamicAmount.X, context) || 0) + 1;
            case DynamicAmount.XPowerOf2:
                return Math.pow(2, this.resolveAmount(state, DynamicAmount.X, context) || 0);

            case DynamicAmount.SourcePower:
            case DynamicAmount.SourceToughness: {
                const obj = this.findObject(state, sourceId);
                if (!obj) return 0;
                const stats = LayerProcessor.getEffectiveStats(obj as GameObject, state);
                return amount === DynamicAmount.SourcePower ? stats.power : stats.toughness;
            }

            case DynamicAmount.CreaturesYouControl:
                return state.battlefield.filter(o => String(o.controllerId) === String(controllerId) && this.isCreature(o)).length;

            case DynamicAmount.LandsYouControl:
                return state.battlefield.filter(o => String(o.controllerId) === String(controllerId) && this.isLand(o)).length;

            case DynamicAmount.GraveyardSize:
                return state.players[controllerId]?.graveyard.length || 0;

            case DynamicAmount.HandSize:
                return state.players[controllerId]?.hand.length || 0;

            case DynamicAmount.CardsDrawnThisTurn:
                return state.turnState.cardsDrawnThisTurn[controllerId] || 0;

            case DynamicAmount.LifeGainedThisTurn:
                return state.turnState.lifeGainedThisTurn[controllerId] || 0;

            case DynamicAmount.SpellsCastThisTurn:
                return state.turnState.spellsCastThisTurn[controllerId] || 0;

            case DynamicAmount.CreaturesDiedThisTurnCount:
                return state.turnState.creaturesDiedThisTurn?.length || 0;

            case DynamicAmount.DiscardedCount:
                return state.turnState.lastDiscardedIds?.length || 0;

            case DynamicAmount.InstantSorceryInGraveyardCount:
                return this.getInstantSorceryInGraveyardCount(state, controllerId);

            case DynamicAmount.EventAmount:
                return context.eventAmount ??
                    stackObject?.data?.eventAmount ??
                    stackObject?.data?.event?.payload?.amount ??
                    stackObject?.data?.event?.payload?.spent ??
                    context.event?.payload?.amount ??
                    state.turnState.lastDamageAmount ??
                    0;

            case DynamicAmount.ConvergeAmount:
                return stackObject?.sourceObject?.convergeAmount ?? 0;

            default:
                if (typeof amount === 'string') {
                    if (amount.startsWith("COUNT_") || amount.startsWith("AFFINITY_")) {
                        const { targeting: TargetingProcessor } = getProcessors(state);
                        const prefix = amount.startsWith("COUNT_") ? "COUNT_" : "AFFINITY_";
                        const filterToken = amount.substring(prefix.length).toUpperCase();

                        // We support both "COUNT_DOGS" (simple type) and complex restriction tokens
                        return state.battlefield.filter(o => {
                            if (o.controllerId !== controllerId) return false;

                            // 1. Check if it's a simple type/subtype (legacy fallback)
                            const singular = filterToken.endsWith("S") ? filterToken.slice(0, -1) : filterToken;
                            if (this.isType(o, filterToken) || this.isType(o, singular) ||
                                this.hasSubtype(o, filterToken) || this.hasSubtype(o, singular) ||
                                this.hasSupertype(o, filterToken) || this.hasSupertype(o, singular)) {
                                return true;
                            }

                            // 2. Try the restriction engine for complex tokens (e.g. COUNT_POWER4PLUS_CREATURE)
                            const EngineFrame = { sourceId, controllerId, stackObject, effects: [], targets: [] };
                            const restrictions = filterToken.split('_');
                            return TargetingProcessor.matchesRestrictions(state, o, restrictions, EngineFrame);
                        }).length;
                    }

                    if (amount === DynamicAmount.PaidManaSpent) {
                        return stackObject?.sourceObject?.paidManaValue ?? context.event?.payload?.amount ?? 0;
                    }
                    if (amount === 'CAPTURED_AMOUNT' || amount === 'CAPTURED_MV') {
                        const val = stackObject?.data?.capturedMV ?? stackObject?.data?.event?.payload?.metadata?.capturedMV ?? 0;
                        getProcessors(state).logger.debug(state, LogCategory.SYSTEM, `[RESOLVE-AMOUNT] Resolved ${amount} to ${val}`);

                        return val;
                    }
                }

                return 0;
        }
    }

    /**
     * Standardized object lookup across all zones.
     * Searches Battlefield, then Stack, then Hands, Graveyards, and Exile.
     */
    public static findObject(state: GameState, id: string): Targetable | undefined {
        if (!id) return undefined;

        // 1. O(1) Cache Lookup (Maintained by ActionProcessor)
        if (state._entityMap && state._entityMap[id]) {
            return state._entityMap[id] as Targetable;
        }

        // 2. Check Players (Rule 102.1)
        if (state.players[id as PlayerId]) {
            return state.players[id as PlayerId];
        }

        // 3. Fallback Scan (if cache is missing or desynced)
        // Check Battlefield
        const bf = state.battlefield.find(o => o.id === id);
        if (bf) return bf;

        // Check Stack
        const stackObj = state.stack.find(s => s.id === id);
        if (stackObj) {
            // For historical compatibility, if we find a StackObject, 
            // return its sourceObject if it's the target of a generic find.
            // But since both implement BaseEntity, we can return the StackObject itself.
            return stackObj;
        }

        // Check All Zones for all players
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

        // Check Exile
        const exiled = state.exile.find(o => o.id === id);
        if (exiled) return exiled;

        // Check Limbo (cards in transition)
        const limbo = state.limbo?.find(o => o.id === id);
        if (limbo) return limbo;

        // Check Engine Caches (Copies)
        if (state.dynamicCopies && state.dynamicCopies[id]) return state.dynamicCopies[id];
        if (state.paradigmCopies && state.paradigmCopies[id]) return state.paradigmCopies[id];

        return undefined;
    }

    /**
     * Standardizes extraction of the primary GameObject involved in an event.
     * 
     * The subject is prioritized in this order:
     * 1. Explicitly provided 'object' or 'card' in payload (ETB, Death, Move events)
     * 2. The sourceId (Attack, Cast, Activate events)
     * 3. The first targetId (Targeting, Damage, Exile events)
     */
    public static getEventObject(event: GameEvent | undefined, state: GameState): GameObject | StackObject | undefined {
        if (!event || !event.payload) return undefined;

        // Priority 1: Explicit object in payload
        if (this.isEntity(event.payload.object)) return event.payload.object;

        // Priority 2: sourceId or first targetId
        const id = event.payload.sourceId || event.payload.targetIds?.[0];
        if (!id) return undefined;

        const obj = this.findObject(state, id);
        // Ensure we only return physical game objects or stack objects, not players
        if (obj && !state.players[id as PlayerId]) {
            return obj as GameObject | StackObject;
        }
        return undefined;
    }

    /**
     * Standardizes target extraction across various event schemas.
     * Prioritizes modern 'payload' over legacy root and 'data' properties.
     */
    public static getTargets(event: GameEvent | undefined): string[] {
        const targetIds = event?.payload?.targetIds || [];
        return Array.from(new Set(targetIds.filter(id => !!id && typeof id === 'string')));
    }

    public static getSource(event: GameEvent | undefined): string | undefined {
        return event?.payload?.sourceId;
    }

    /**
     * Standardized token identification.
     */
    public static isToken(obj: Targetable | undefined): boolean {
        if (!obj) return false;
        return (this.isGameObject(obj) && obj.isToken === true) || (typeof obj.id === 'string' && obj.id.startsWith(EnginePrefix.Token));
    }
    /**
     * Rule 603.10: Creates a robust snapshot of an object's state at a specific moment.
     * Essential for "leaves-the-battlefield" triggers which must look back in time.
     */
    public static createSnapshot(obj: GameObject): GameObject {
        return {
            ...obj,
            definition: { ...obj.definition },
            counters: { ...obj.counters },
            effectiveStats: obj.effectiveStats ? { ...obj.effectiveStats } : undefined,
            // Transient properties that shouldn't persist in LKI snapshots
            isAttacking: false,
            isBlocking: false,
            isGoaded: false,
        };
    }
}

