import { AbilityType, BaseEntity, EffectDefinition, GameObject, GameState, Restriction, StackObject, Targetable, TargetingContext, TargetDefinition, TargetRestriction, ObjectRestriction, ManaValueRestriction, LogicRestriction, TargetType, Zone, PlayerId } from '@shared/engine_types';
import { TargetMapper } from './TargetMapper';
import { getProcessors } from '../../ProcessorRegistry';
import { LogCategory } from '../../../utils/EngineLogger';
import { RuleUtils } from '../../../utils/RuleUtils';
import { RestrictionRegistry, isNumericRestriction } from './RestrictionRegistry';

export class TargetValidator {

    public static isLegalTarget(state: GameState, context: TargetingContext, targetId: string): boolean {
        const { targetDefinitions, targetIndex } = context;
        const targetDefForIndex = TargetMapper.getDefinitionForIndex(targetDefinitions || [], targetIndex || 0, context.xValue);

        // 1. UNIFIED OBJECT LOOKUP
        const targetObj = RuleUtils.findObject(state, targetId);
        if (!targetObj) return false;
        
        // Phased out check (Rule 702.26)
        if (RuleUtils.isEntity(targetObj) && targetObj.isPhasedOut) return false;

        // 3. ZONE CHECK
        if (RuleUtils.isEntity(targetObj)) {
            const expectedZone = this.getExpectedZone(targetObj as GameObject, targetDefForIndex);
            if (expectedZone !== 'Any' && targetObj.zone !== expectedZone) return false;
        }

        if (targetDefForIndex?.type === TargetType.Player) return false;

        // 4. PROTECTION / HEXPROOF / SHROUD (Rule 702)
        if (!this.checkKeywords(state, context, targetObj as GameObject)) return false;

        // Handle Player objects returned by findObject
        if (state.players[targetId as PlayerId]) {
            return this.isPlayerTargetLegal(state, context, targetId, targetDefForIndex);
        }
        
        // 5. RESTRICTION REGISTRY CHECK
        const restrictions = this.normalizeRestrictions(targetDefForIndex);
        return !!this.matchesRestrictions(state, targetObj, restrictions, context);
    }

    /**
     * CR 608.2b: A spell or ability is countered if all its targets, for every instance 
     * of the word 'target', have become illegal.
     */
    public static shouldFizzle(state: GameState, context: TargetingContext, targets: string[], effects: EffectDefinition[]): boolean {
        if (targets.length === 0) return false;

        const { sourceId, controllerId, stackObject } = context;
        const targetDefinitions = stackObject?.targetDefinitions ||
            effects.find(e => (e as { targetDefinitions?: TargetDefinition[] }).targetDefinitions)?.targetDefinitions || [];

        // If at least one target is legal for the definition associated with its index, the spell does NOT fizzle.
        const hasAnyLegalTarget = targets.some((tid, index) => {
            return this.isLegalTarget(state, {
                sourceId,
                controllerId,
                stackObject,
                targetDefinitions,
                targetIndex: index
            }, tid);
        });

        const fizzle = !hasAnyLegalTarget;
        if (fizzle) {
            getProcessors(state).logger.info(state, LogCategory.ACTION, `[FIZZLE-CHECK] Spell/Ability will FIZZLE (all targets illegal). Source: ${sourceId}`);
        }
        return fizzle;
    }

    private static isPlayerTargetLegal(state: GameState, context: TargetingContext, targetId: string, targetDefinitions: TargetDefinition | null): boolean {
        const { controllerId } = context;
        const restrictions = targetDefinitions?.restrictions || [];

        const isPlayerAllowed =
            targetDefinitions?.type === TargetType.Player ||
            targetDefinitions?.type === TargetType.Opponent ||
            targetDefinitions?.type === TargetType.AnyTarget ||
            targetDefinitions?.type === TargetType.PlayerOrPlaneswalker ||
            restrictions.some((r) => [Restriction.Player as string, Restriction.AnyTarget as string, Restriction.Opponent as string, Restriction.You as string].includes(typeof r === 'string' ? r : (r as any).value));

        if (!isPlayerAllowed) return false;

        if (restrictions.includes(Restriction.Opponent) || targetDefinitions?.type === TargetType.Opponent) {
            if (controllerId && targetId === controllerId) return false;
        }
        if (restrictions.includes(Restriction.You)) {
            if (controllerId && targetId !== controllerId) return false;
        }
        return true;
    }

    private static getExpectedZone(targetObj: GameObject, targetDefinitions: TargetDefinition | null): Zone | 'Any' {
        let expectedZone = targetDefinitions?.zone;
        if (expectedZone) return expectedZone;

        const typeLineCheck = (targetDefinitions?.type || '').toLowerCase();
        const targetZone = targetObj.zone;

        if (targetZone === Zone.Stack) return Zone.Stack;
        if (([Restriction.Instant, Restriction.Sorcery, Restriction.InstantOrSorcery, Restriction.Spell] as string[]).includes(typeLineCheck)) return Zone.Stack;
        if ([TargetType.CardInGraveyard.toLowerCase()].includes(typeLineCheck)) return Zone.Graveyard;
        if ([TargetType.CardInExile.toLowerCase()].includes(typeLineCheck)) return Zone.Exile;

        const restrictions = (targetDefinitions?.restrictions || []);
        if (restrictions.some((r) => typeof r === 'string' && [Restriction.Graveyard, TargetType.CardInGraveyard.toLowerCase()].includes(r.toLowerCase()))) return Zone.Graveyard;
        if (restrictions.some((r) => typeof r === 'string' && [Restriction.Exile, TargetType.CardInExile.toLowerCase()].includes(r.toLowerCase()))) return Zone.Exile;

        if (typeLineCheck === TargetType.Player.toLowerCase() ||
            typeLineCheck === TargetType.Opponent.toLowerCase() ||
            typeLineCheck === TargetType.AnyTarget.toLowerCase() ||
            typeLineCheck === TargetType.PlayerOrPlaneswalker.toLowerCase()) return 'Any';

        return targetDefinitions ? Zone.Battlefield : 'Any';
    }

    private static checkKeywords(state: GameState, context: TargetingContext, targetObj: GameObject): boolean {
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = LayerProcessor.getEffectiveStats(targetObj, state);
        const keywords = stats.keywords;
        if (RuleUtils.hasShroud(targetObj)) return false;

        const source = RuleUtils.findObject(state, context.sourceId);

        // Hexproof
        if (context.controllerId && RuleUtils.getController(targetObj) !== context.controllerId) {
            if (RuleUtils.hasHexproof(targetObj)) return false;

            if (source) {
                const hexproofFrom = keywords.filter((k: string) => k.toLowerCase().startsWith('hexproof from '));
                for (const hp of hexproofFrom) {
                    const qualities = hp.toLowerCase().replace('hexproof from ', '').split(/[\s,]+/).filter(Boolean);
                    if (this.sourceHasQualities(source, qualities, state)) return false;
                }
            }
        }

        // Protection
        if (source) {
            const protections = keywords.filter((k: string) => k.toLowerCase().startsWith('protection from'));
            for (const prot of protections) {
                const qualities = prot.toLowerCase().replace('protection from ', '').split(/[\s,]+/).filter(Boolean);
                if (this.sourceHasQualities(source, qualities, state)) return false;
            }
        }

        return true;
    }

    private static normalizeRestrictions(targetDefinitions: TargetDefinition | null): (string | any)[] {
        const restrictions = [...(targetDefinitions?.restrictions || [])];
        const primaryType = (targetDefinitions?.type || '').toUpperCase();
        if (primaryType && primaryType !== 'ANY' && primaryType !== 'PLAYER' && primaryType !== TargetType.AnyTarget) {
            if (!restrictions.some(r => typeof r === 'string' && r.toUpperCase() === primaryType)) {
                restrictions.push(primaryType);
            }
        }
        return restrictions;
    }

    public static matchesRestrictions(state: GameState, target: Targetable | string, restrictions: (TargetRestriction | string)[], context: TargetingContext): boolean {
        if (!target) return false;

        // 1. Unify the input into ID and Object (if available)
        const targetId = typeof target === 'string' ? target : target.id;
        const targetObj = typeof target === 'string' ? RuleUtils.findObject(state, target) : target;

        // 2. Player Fast Path (Handles both PlayerState object or PlayerId string)
        const isPlayer = state.players[targetId as PlayerId] !== undefined;
        if (isPlayer) {
            return !!(restrictions.includes(Restriction.Player) || 
                     restrictions.includes(Restriction.AnyTarget) || 
                     restrictions.includes(Restriction.Opponent) ||
                     restrictions.includes(Restriction.You));
        }

        // 3. Object-based validation (Cards, Spells, Abilities)
        if (!targetObj) return false;

        const definition = (targetObj as BaseEntity).definition;
        if (!definition) {
            // StackObjects that might lack a definition but have a type (Abilities)
            const targetAsStack = targetObj as StackObject;
            if (targetAsStack.type && (targetAsStack.type.includes('Ability') || targetAsStack.type === AbilityType.Spell)) {
                return !!restrictions.some(r => {
                    const resObj = r as { value?: string };
                    const rv = (typeof r === 'string' ? r : (resObj.value || '')).toLowerCase();
                    return (rv === Restriction.Ability && targetAsStack.type.includes('Ability')) || 
                           (rv === Restriction.Spell && targetAsStack.type === AbilityType.Spell);
                });
            }
            return false;
        }

        for (const r of restrictions) {
            if (typeof r !== "string") continue;
            const lr = r.toLowerCase();
            const token = r.toUpperCase();

            // 1. Numeric Regex
            if (isNumericRestriction(lr)) {
                if (!RestrictionRegistry["NUMERIC_REGEX"].matches(state, targetObj, lr, context)) return false;
                continue;
            }

            // 2. Registry Handlers
            let handler = RestrictionRegistry[token];
            if (!handler && lr.startsWith("hascounter_")) handler = RestrictionRegistry["HASCOUNTER"];
            if (!handler && lr === Restriction.Other) handler = RestrictionRegistry["OTHER"];

            if (handler) {
                if (!handler.matches(state, targetObj, lr, context)) return false;
                continue;
            }

            // 3. Complex / Legacy Fallback
            if (lr.includes('_or_') || lr === Restriction.OneOrMoreColors || lr === Restriction.ManaValueLessOrEqualToX) {
                continue; // Handled in alternatives pass
            }

            // 4. Name / Quality Fallback
            const targetName = (definition.name || (targetObj as BaseEntity).name || (targetObj as any).name || "").toLowerCase();
            if (targetName !== lr && !RuleUtils.matchesQuality(targetObj, lr, state)) return false;
        }

        // Alternatives pass (Logic OR / Complex types)
        const alternatives = restrictions.filter(r => {
            if (typeof r !== 'string') return true;
            const lr = r.toLowerCase();
            return lr.includes('_or_') || lr === Restriction.OneOrMoreColors || lr === Restriction.ManaValueLessOrEqualToX;
        });

        if (alternatives.length > 0) {
            return alternatives.every(r => this.evaluateComplexRestriction(state, targetObj, r, context));
        }

        return true;
    }

    private static evaluateComplexRestriction(state: GameState, targetObj: Targetable, r: TargetRestriction | string, context: TargetingContext, log?: (msg: string) => void): boolean {
        if (typeof r === 'string') {
            const lr = r.toLowerCase();
            const token = r.toUpperCase();
            if (RestrictionRegistry[token]) return !!RestrictionRegistry[token].matches(state, targetObj, lr, context);
            if (lr.includes('_or_')) return lr.split('_or_').some(p => this.matchesRestrictions(state, targetObj, [p.trim()], context));
            return this.matchesRestrictions(state, targetObj, [r], context);
        }

        if (typeof r === 'function') {
            return r(state, targetObj as GameObject, context);
        }

        const resObj = r as ObjectRestriction;
        const restrictionType = (resObj.type || "").toLowerCase();

        if ((restrictionType === 'any' || restrictionType === 'all' || restrictionType === 'not') && ('restrictions' in resObj || 'restriction' in resObj)) {
            const logicRes = resObj as LogicRestriction;
            if (restrictionType === 'any' && logicRes.restrictions) return logicRes.restrictions.some(subR => this.matchesRestrictions(state, targetObj, [subR], context));
            if (restrictionType === 'all' && logicRes.restrictions) return logicRes.restrictions.every(subR => this.matchesRestrictions(state, targetObj, [subR], context));
            if (restrictionType === 'not' && logicRes.restriction) return !this.matchesRestrictions(state, targetObj, [logicRes.restriction], context);
        }

        if (restrictionType === 'manavalue' || restrictionType === 'mv') {
            const mvRes = resObj as ManaValueRestriction;
            const definition = (targetObj as GameObject).definition;
            const { mana: MP } = getProcessors(state);
            const mv = MP.getManaValue(definition?.manaCost || '', (targetObj as { xValue?: number }).xValue || 0);
            let val = mvRes.value === 'X' ? (context.stackObject?.xValue || 0) : parseInt(String(mvRes.value));
            const comp = mvRes.comparison || 'Equal';

            if (comp === 'LessOrEqual') return mv <= val;
            if (comp === 'GreaterOrEqual') return mv >= val;
            if (comp === 'LessThan') return mv < val;
            if (comp === 'GreaterThan') return mv > val;
            return mv === val;
        }

        return true; // Default match
    }

    public static sourceHasQualities(source: Targetable, qualities: string[], state?: GameState): boolean {
        const s = source as BaseEntity;
        const definition = (s as GameObject).definition || s;
        const sourceColors = this.getColors(s as GameObject, state);
        const sourceTypes = (definition.types || []).map((t: string) => t.toLowerCase());
        const sourceSubtypes = (definition.subtypes || []).map((t: string) => t.toLowerCase());

        return qualities.some(q => {
            const lowerQ = q.toLowerCase();
            if (lowerQ === 'and' || lowerQ === 'from') return false;
            if (lowerQ === 'multicolored') return sourceColors.length > 1;
            if (lowerQ === 'colorless') return sourceColors.length === 0;
            return RuleUtils.isType(s as any, lowerQ) || RuleUtils.hasSubtype(s as any, lowerQ) || sourceColors.includes(lowerQ);
        });
    }

    public static getColors(obj: Targetable, state?: GameState): string[] {
        const stats = state ? getProcessors(state).layer.getEffectiveStats(obj as GameObject, state) : null;
        const colors = stats?.colors || (obj as GameObject).definition?.colors || [];
        const map: Record<string, string> = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
        return colors.map((c: string) => map[c.toUpperCase()] || c.toLowerCase());
    }

    public static hasLegalTargets(state: GameState, sourceId: string, targetDefinitions: TargetDefinition[], controllerId: string, xValue: number = 0): boolean {
        let currentIndex = 0;
        return targetDefinitions.every(def => {
            const count = typeof def.count === 'number' ? def.count : 1;
            const minCount = def.minCount !== undefined ? def.minCount : (def.optional ? 0 : count);
            if (minCount === 0) { currentIndex += count; return true; }

            const pool = this.getLegalTargetPool(state, sourceId, targetDefinitions, controllerId, currentIndex, xValue);
            currentIndex += count;
            const effectiveMin = typeof minCount === 'number' ? minCount : (minCount === 'X' ? xValue : 0);
            return pool.length >= effectiveMin;
        });
    }

    public static getLegalTargetPool(state: GameState, sourceId: string, targetDefinitions: TargetDefinition[], controllerId: string, targetIndex: number = 0, xValue: number = 0): string[] {
        const targetDefForIndex = TargetMapper.getDefinitionForIndex(targetDefinitions, targetIndex, xValue);
        const expectedZone = this.getExpectedZone({ zone: Zone.Battlefield } as any, targetDefForIndex);

        // OPTIMIZATION: Only scan relevant zones
        let poolIds: string[] = [];
        if (expectedZone === Zone.Battlefield || expectedZone === 'Any') poolIds.push(...state.battlefield.map(o => o.id));
        if (expectedZone === Zone.Graveyard || expectedZone === 'Any') poolIds.push(...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id)));
        if (expectedZone === Zone.Exile || expectedZone === 'Any') poolIds.push(...state.exile.map(o => o.id));
        if (expectedZone === Zone.Stack || expectedZone === 'Any') poolIds.push(...state.stack.map(o => o.id));
        if (expectedZone === 'Any') poolIds.push(...Object.keys(state.players));

        return poolIds.filter(id => this.isLegalTarget(state, { sourceId, controllerId, targetDefinitions, targetIndex, xValue }, id));
    }
}
