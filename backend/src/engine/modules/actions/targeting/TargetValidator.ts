import { AbilityType, GameObject, GameState, Restriction, StackObject, Targetable, TargetingContext, TargetRestriction, TargetType, Zone } from '@shared/engine_types';
import { LayerProcessor } from '../../state/LayerProcessor';
import { TargetMapper } from './TargetMapper';
import { oracle } from '../../../OracleLogicMap';
import { getProcessors } from '../../ProcessorRegistry';

import { RuleUtils } from '../../../utils/RuleUtils';
import { RestrictionRegistry, isNumericRestriction } from './RestrictionRegistry';

export class TargetValidator {


    public static isLegalTarget(state: GameState, context: TargetingContext, targetId: string): boolean {
        const { controllerId, targetDef, targetIndex, sourceId } = context;
        const targetDefForIndex = TargetMapper.getDefinitionForIndex(targetDef, targetIndex || 0);

        // 1. PLAYER CHECK
        if (state.players[targetId]) {
            return this.isPlayerTargetLegal(state, context, targetId, targetDefForIndex);
        }

        // 2. OBJECT CHECK
        const targetObj = RuleUtils.findObject(state, targetId);
        if (!targetObj || targetObj.isPhasedOut) return false;

        // 3. ZONE CHECK
        const expectedZone = this.getExpectedZone(targetObj, targetDefForIndex);
        if (expectedZone !== 'Any' && targetObj.zone !== expectedZone) return false;

        if (targetDefForIndex?.type === TargetType.Player) return false;

        // 4. PROTECTION / HEXPROOF / SHROUD (Rule 702)
        if (!this.checkKeywords(state, context, targetObj)) return false;

        // 5. RESTRICTION REGISTRY CHECK
        const restrictions = this.normalizeRestrictions(targetDefForIndex);
        return !!this.matchesRestrictions(state, targetObj, restrictions, context);
    }

    /**
     * CR 608.2b: A spell or ability is countered if all its targets, for every instance 
     * of the word 'target', have become illegal.
     */
    public static shouldFizzle(state: GameState, context: TargetingContext, targets: string[], effects: any[]): boolean {
        if (targets.length === 0) return false;

        const { sourceId, controllerId, stackObject } = context;
        const targetDef = stackObject?.data?.targetDefinition || effects.find(e => e.targetDefinition)?.targetDefinition;
        
        // If at least one target is legal for the definition associated with its index, the spell does NOT fizzle.
        const hasAnyLegalTarget = targets.some((tid, index) => {
            return this.isLegalTarget(state, {
                sourceId,
                controllerId,
                stackObject,
                targetDef,
                targetIndex: index
            }, tid);
        });

        return !hasAnyLegalTarget;
    }

    private static isPlayerTargetLegal(state: GameState, context: TargetingContext, targetId: string, targetDef: any): boolean {
        const { controllerId } = context;
        const restrictions = targetDef?.restrictions || [];

        const isPlayerAllowed =
            targetDef?.type === TargetType.Player ||
            targetDef?.type === TargetType.Opponent ||
            targetDef?.type === TargetType.AnyTarget ||
            targetDef?.type === TargetType.PlayerOrPlaneswalker ||
            restrictions.some((r: any) => [Restriction.Player, Restriction.AnyTarget, Restriction.Opponent, Restriction.You].includes(r));

        if (!isPlayerAllowed) return false;

        if (restrictions.includes(Restriction.Opponent) || targetDef?.type === TargetType.Opponent) {
            if (controllerId && targetId === controllerId) return false;
        }
        if (restrictions.includes(Restriction.You)) {
            if (controllerId && targetId !== controllerId) return false;
        }
        return true;
    }

    private static getExpectedZone(targetObj: GameObject, targetDef: any): Zone | 'Any' {
        let expectedZone = targetDef?.zone;
        if (expectedZone) return expectedZone;

        const typeLineCheck = (targetDef?.type || '').toLowerCase();
        const targetZone = targetObj.zone;

        if (targetZone === Zone.Stack) return Zone.Stack;
        if ([Restriction.Instant, Restriction.Sorcery, Restriction.InstantOrSorcery, Restriction.Spell, 'spell_on_stack'].includes(typeLineCheck)) return Zone.Stack;
        if ([TargetType.CardInGraveyard.toLowerCase()].includes(typeLineCheck)) return Zone.Graveyard;
        if ([TargetType.CardInExile.toLowerCase()].includes(typeLineCheck)) return Zone.Exile;

        const restrictions = (targetDef?.restrictions || []);
        if (restrictions.some((r: any) => typeof r === 'string' && [Restriction.Graveyard, TargetType.CardInGraveyard.toLowerCase()].includes(r.toLowerCase()))) return Zone.Graveyard;
        if (restrictions.some((r: any) => typeof r === 'string' && [Restriction.Exile, TargetType.CardInExile.toLowerCase()].includes(r.toLowerCase()))) return Zone.Exile;

        return targetDef ? Zone.Battlefield : 'Any';
    }

    private static checkKeywords(state: GameState, context: TargetingContext, targetObj: GameObject): boolean {
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

    private static normalizeRestrictions(targetDef: any): (TargetRestriction | string)[] {
        const restrictions = [...(targetDef?.restrictions || [])];
        const primaryType = (targetDef?.type || '').toUpperCase();
        if (primaryType && primaryType !== 'ANY' && primaryType !== 'PLAYER' && primaryType !== TargetType.AnyTarget) {
            if (!restrictions.some(r => typeof r === 'string' && r.toUpperCase() === primaryType)) {
                restrictions.push(primaryType);
            }
        }
        return restrictions;
    }

    public static matchesRestrictions(state: GameState, targetObj: Targetable, restrictions: (TargetRestriction | string)[], context: TargetingContext, log?: (msg: string) => void): boolean {
        if (!targetObj) return false;
        const definition = (targetObj as GameObject).definition || (targetObj as any).card?.definition;

        // Player / StackObject Fast Paths
        if (!definition) {
            if (state.players[(targetObj as any).id || targetObj]) {
                return !!(restrictions.includes(Restriction.Player) || restrictions.includes(Restriction.AnyTarget));
            }
            const targetAsStack = targetObj as StackObject;
            if (targetAsStack.type && (targetAsStack.type.includes('Ability') || targetAsStack.type === AbilityType.Spell)) {
                return !!restrictions.some(r => {
                    const rv = (typeof r === 'string' ? r : (r.value || '')).toLowerCase();
                    if (targetAsStack) {
                        return (rv === Restriction.Ability && targetAsStack.type.includes('Ability')) || (rv === Restriction.Spell && targetAsStack.type === AbilityType.Spell);
                    }
                    return false;
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

            // 4. Name / Subtype Fallback
            const targetName = (definition.name || (targetObj as any).name || "").toLowerCase();
            if (targetName !== lr && !RuleUtils.hasSubtype(targetObj, lr) && !RuleUtils.isType(targetObj, lr)) return false;
        }

        // Alternatives pass (Logic OR / Complex types)
        const alternatives = restrictions.filter(r => {
            if (typeof r !== 'string') return true;
            const lr = r.toLowerCase();
            return lr.includes('_or_') || lr === Restriction.OneOrMoreColors || lr === Restriction.ManaValueLessOrEqualToX;
        });

        if (alternatives.length > 0) {
            return alternatives.every(r => this.evaluateComplexRestriction(state, targetObj, r, context, log));
        }

        return true;
    }

    private static evaluateComplexRestriction(state: GameState, targetObj: Targetable, r: TargetRestriction | string, context: TargetingContext, log?: (msg: string) => void): boolean {
        if (typeof r === 'string') {
            const lr = r.toLowerCase();
            const token = r.toUpperCase();
            if (RestrictionRegistry[token]) return !!RestrictionRegistry[token].matches(state, targetObj, lr, context);
            if (lr.includes('_or_')) return lr.split('_or_').some(p => this.matchesRestrictions(state, targetObj, [p.trim()], context, log));
            return this.matchesRestrictions(state, targetObj, [r], context, log);
        }

        const definition = (targetObj as GameObject).definition;
        const restrictionType = (r.type || "").toLowerCase();
        const restrictionValue = r.value !== undefined ? String(r.value) : null;

        if ((r.type === 'Any' || r.type === 'any') && r.restrictions) return r.restrictions.some((subR: any) => this.matchesRestrictions(state, targetObj, [subR], context));
        if ((r.type === 'All' || r.type === 'all') && r.restrictions) return r.restrictions.every((subR: any) => this.matchesRestrictions(state, targetObj, [subR], context));
        if ((r.type === 'Not' || r.type === 'not') && r.restriction) return !this.matchesRestrictions(state, targetObj, [r.restriction], context);

        if (restrictionType === 'manavalue' || restrictionType === 'mv') {
            const { mana: MP } = getProcessors(state);
            const mv = MP.getManaValue(definition?.manaCost || '', (targetObj as any).xValue || 0);
            let val = r.value === 'X' ? (context.stackObject?.xValue || 0) : parseInt(String(r.value));
            const comp = r.comparison || 'Equal';
            if (comp === 'LessOrEqual') return mv <= val;
            if (comp === 'GreaterOrEqual') return mv >= val;
            return mv === val;
        }

        return true; // Default match
    }

    public static sourceHasQualities(source: Targetable, qualities: string[], state?: GameState): boolean {
        const s = (source as any).card || source;
        const definition = (s as GameObject).definition || s;
        const sourceColors = this.getColors(s, state);
        const sourceTypes = (definition.types || []).map((t: string) => t.toLowerCase());
        const sourceSubtypes = (definition.subtypes || []).map((t: string) => t.toLowerCase());

        return qualities.some(q => {
            const lowerQ = q.toLowerCase();
            if (lowerQ === 'and' || lowerQ === 'from') return false;
            if (lowerQ === 'multicolored') return sourceColors.length > 1;
            if (lowerQ === 'colorless') return sourceColors.length === 0;
            return RuleUtils.isType(s, lowerQ) || RuleUtils.hasSubtype(s, lowerQ) || sourceColors.includes(lowerQ);
        });
    }

    public static getColors(obj: any, state?: GameState): string[] {
        const stats = state ? LayerProcessor.getEffectiveStats(obj, state) : null;
        const colors = stats?.colors || obj.definition?.colors || [];
        const map: any = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
        return colors.map((c: string) => map[c.toUpperCase()] || c.toLowerCase());
    }

    public static hasLegalTargets(state: GameState, sourceId: string, targetDef: any, controllerId: string): boolean {
        if (!targetDef) return true;
        const defs = Array.isArray(targetDef) ? targetDef : [targetDef];

        let currentIndex = 0;
        return defs.every(def => {
            const count = typeof def.count === 'number' ? def.count : 1;
            const minCount = def.minCount !== undefined ? def.minCount : (def.optional ? 0 : count);
            if (minCount === 0) { currentIndex += count; return true; }

            const pool = this.getLegalTargetPool(state, sourceId, def, controllerId, currentIndex);
            currentIndex += count;
            return pool.length >= minCount;
        });
    }

    public static getLegalTargetPool(state: GameState, sourceId: string, targetDef: any, controllerId: string, targetIndex: number = 0): string[] {
        const targetDefForIndex = TargetMapper.getDefinitionForIndex(targetDef, targetIndex);
        const expectedZone = this.getExpectedZone({ zone: Zone.Battlefield } as any, targetDefForIndex);

        // OPTIMIZATION: Only scan relevant zones
        let poolIds: string[] = [];
        if (expectedZone === Zone.Battlefield || expectedZone === 'Any') poolIds.push(...state.battlefield.map(o => o.id));
        if (expectedZone === Zone.Graveyard || expectedZone === 'Any') poolIds.push(...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id)));
        if (expectedZone === Zone.Exile || expectedZone === 'Any') poolIds.push(...state.exile.map(o => o.id));
        if (expectedZone === Zone.Stack || expectedZone === 'Any') poolIds.push(...state.stack.map(o => o.id));
        if (expectedZone === 'Any') poolIds.push(...Object.keys(state.players));

        return poolIds.filter(id => this.isLegalTarget(state, { sourceId, controllerId, targetDef, targetIndex }, id));
    }
}
