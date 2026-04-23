import { GameObject, GameState, PlayerId, PlayerState, StackObject, Targetable, TargetRestriction, TargetingContext, TargetType, Zone } from '@shared/engine_types';
import { LayerProcessor } from '../../state/LayerProcessor';
import { TargetMapper } from './TargetMapper';

export class TargetValidator {

    /**
     * CR 608.2b: Checks if a target is still legal as a spell or ability attempts to resolve.
     */
    public static findObjectInAnyZone(state: GameState, id: string): GameObject | null {
        const bf = state.battlefield.find(o => o.id === id);
        if (bf) return bf;
        const ex = state.exile.find(o => o.id === id);
        if (ex) return ex;

        for (const p of (Object.values(state.players))) {
            const h = p.hand.find(o => o.id === id);
            if (h) return h;
            const g = p.graveyard.find(o => o.id === id);
            if (g) return g;
            const l = p.library.find(o => o.id === id);
            if (l) return l;
            const v = p.virtualHand?.find(o => o.id === id);
            if (v) return v;
        }

        const st = state.stack.find(s => s.id === id || s.card?.id === id);
        if (st && st.card) return st.card;

        const lb = state.limbo?.find(o => o.id === id);
        if (lb) return lb;

        // Check Dynamic/Paradigm Virtual Copies (Used by Prepared faces, copies on stack, etc.)
        if ((state as any).dynamicCopies && (state as any).dynamicCopies[id]) {
            return (state as any).dynamicCopies[id];
        }
        if ((state as any).paradigmCopies && (state as any).paradigmCopies[id]) {
            return (state as any).paradigmCopies[id];
        }

        return null;
    }

    public static isLegalTarget(state: GameState, context: TargetingContext, targetId: string): boolean {
        const { controllerId, targetDef, targetIndex, sourceId } = context;
        const targetDefForIndex = TargetMapper.getDefinitionForIndex(targetDef, targetIndex || 0);

        if (sourceId?.includes('copy')) {
            console.log(`[TARGET-DEBUG] Checking legality for ${targetId} from source ${sourceId}. targetDef:`, JSON.stringify(targetDefForIndex));
        }

        if (state.players[targetId]) {
            const type = (targetDefForIndex?.type || '').toLowerCase();
            const restrictions = (targetDefForIndex?.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);

            if (type === TargetType.Player.toLowerCase() ||
                type === TargetType.Opponent.toLowerCase() ||
                type === TargetType.AnyTarget.toLowerCase() ||
                type === TargetType.PlayerOrPlaneswalker.toLowerCase() ||
                restrictions.includes('player') ||
                restrictions.includes('anytarget')) {

                if (restrictions.includes('opponent') || type === TargetType.Opponent.toLowerCase()) {
                    if (controllerId && targetId === controllerId) return false;
                }
                if (restrictions.includes('you')) {
                    if (controllerId && targetId !== controllerId) return false;
                }
                return true;
            }
            return false;
        }

        const targetObj = this.findObjectInAnyZone(state, targetId);
        if (!targetObj) {
            if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] FAILED: Target ${targetId} not found in any zone.`);
            return false;
        }
        if (targetObj.isPhasedOut) return false;

        const targetZone = targetObj.zone;
        const stats = LayerProcessor.getEffectiveStats(targetObj, state);
        const keywords = stats.keywords;
        const isOpponentTarget = controllerId && targetObj.controllerId !== controllerId;
        const source = this.findObjectInAnyZone(state, context.sourceId);

        if (keywords.includes('Shroud')) {
            if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] FAILED: Target ${targetId} has Shroud.`);
            return false;
        }

        const hexproofKeywords = keywords.filter((k: string) => k.toLowerCase().startsWith('hexproof'));
        for (const hp of hexproofKeywords) {
            if (hp.toLowerCase() === 'hexproof' && isOpponentTarget) {
                if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] FAILED: Target ${targetId} has Hexproof.`);
                return false;
            }
            if (hp.toLowerCase().startsWith('hexproof from ')) {
                const qualities = hp.toLowerCase().replace('hexproof from ', '').split(/[\s,]+/).filter(Boolean);
                if (isOpponentTarget && source && this.sourceHasQualities(source, qualities, state)) {
                    if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] FAILED: Target ${targetId} has Hexproof from source qualities.`);
                    return false;
                }
            }
        }

        const protectionKeywords = keywords.filter((k: string) => k.toLowerCase().startsWith('protection from'));
        if (protectionKeywords.length > 0 && source) {
            for (const prot of protectionKeywords) {
                const qualities = prot.toLowerCase().replace('protection from ', '').split(/[\s,]+/).filter(Boolean);
                if (this.sourceHasQualities(source, qualities, state)) {
                    if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] FAILED: Target ${targetId} has Protection from source qualities.`);
                    return false;
                }
            }
        }

        const typeLineCheck = (targetDefForIndex?.type || '').toLowerCase();
        if (typeLineCheck === 'player') return false;

        let expectedZone = targetDefForIndex?.zone;
        if (!expectedZone) {
            if (targetZone === Zone.Stack) expectedZone = Zone.Stack;
            else if (['instant', 'sorcery', 'instant_or_sorcery', 'spell', 'spellonstack'].includes(typeLineCheck)) expectedZone = Zone.Stack;
            else if (['card_in_graveyard', 'cardingraveyard'].includes(typeLineCheck)) expectedZone = Zone.Graveyard;
            else if (['card_in_exile', 'cardinexile'].includes(typeLineCheck)) expectedZone = Zone.Exile;
            else if (targetDefForIndex?.restrictions?.some((r: any) => typeof r === 'string' && ['graveyard', 'in_graveyard'].includes(r.toLowerCase())))
                expectedZone = Zone.Graveyard;
            else if (targetDefForIndex?.restrictions?.some((r: any) => typeof r === 'string' && ['exile', 'in_exile'].includes(r.toLowerCase())))
                expectedZone = Zone.Exile;
            else expectedZone = targetDefForIndex ? Zone.Battlefield : 'Any';
        }

        if (expectedZone !== 'Any' && targetZone !== expectedZone) {
            if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] FAILED: Zone mismatch for ${targetId}. Expected ${expectedZone}, got ${targetZone}.`);
            return false;
        }

        const restrictions = [...(targetDefForIndex?.restrictions || [])];
        const primaryType = (targetDefForIndex?.type || '').toUpperCase();
        if (primaryType && primaryType !== 'ANY' && primaryType !== 'PLAYER' && primaryType !== 'ANYTARGET') {
            if (!restrictions.some(r => typeof r === 'string' && r.toUpperCase() === primaryType)) {
                restrictions.push(primaryType);
            }
        }

        const result = !!this.matchesRestrictions(state, targetObj, restrictions, context);
        if (!result && sourceId?.includes('copy')) {
            console.log(`[TARGET-DEBUG] FAILED: matchesRestrictions returned false for ${targetId}. Restrictions checked:`, restrictions);
        }
        return result;
    }

    public static matchesRestrictions(state: GameState, targetObj: Targetable, restrictions: (TargetRestriction | string)[], context: TargetingContext, log?: (msg: string) => void): boolean {
        const { sourceId, controllerId, stackObject } = context;
        if (!targetObj) return false;
        const targetAsPlayer = targetObj as PlayerState;
        const targetAsGameObject = targetObj as GameObject;
        const definition = targetAsGameObject.definition || (targetObj as any).card?.definition;

        if (!definition && state.players[targetAsPlayer.id || (targetObj as any)]) {
            return !!(restrictions.includes('player') || restrictions.includes('anytarget'));
        }

        // Ability/Spell on stack check
        const targetAsStack = targetObj as StackObject;
        if (!definition && targetAsStack.type && (targetAsStack.type.includes('Ability') || targetAsStack.type === 'Spell')) {
            return !!restrictions.some(r => {
                const rv = (typeof r === 'string' ? r : (r.value || '')).toLowerCase();
                if (rv === 'ability' && targetAsStack.type.includes('Ability')) return true;
                if (rv === 'spell' && targetAsStack.type === 'Spell') return true;
                return false;
            });
        }

        if (!definition) return false;

        const { RestrictionRegistry, isNumericRestriction } = require("./RestrictionRegistry");

        for (const r of restrictions) {
            if (typeof r !== "string") continue;
            const lr = r.toLowerCase();
            const token = r.toUpperCase();

            let matched = false;
            if (isNumericRestriction(lr)) {
                matched = RestrictionRegistry["NUMERIC_REGEX"].matches(state, targetObj, lr, context);
                if (!matched) {
                    if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] Restriction FAILED: ${r} (Numeric)`);
                    return false;
                }
                continue;
            }

            let handler = RestrictionRegistry[token];
            if (!handler && lr.startsWith("hascounter_")) handler = RestrictionRegistry["HASCOUNTER"];
            if (!handler && (lr === "other" || lr === "another")) handler = RestrictionRegistry["OTHER"];

            if (handler) {
                matched = handler.matches(state, targetObj, lr, context);
                if (!matched) {
                    if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] Restriction FAILED: ${r} (Handler: ${token})`);
                    return false;
                }
                continue;
            }

            // Skip strict fallback for complex/alternative restrictions that are handled below
            if (lr.includes('_or_') || lr.includes('orsorcery') || lr === 'oneormorecolors' || lr === 'mv_le_x' || lr === 'anytarget') {
                continue;
            }

            // Fallback to name/subtype check (Rule 109.2)
            const targetName = (definition.name || (targetObj as any).name || "").toLowerCase();
            const objSubtypes = (definition.subtypes || []).map((s: string) => s.toLowerCase());
            if (targetName !== lr && !objSubtypes.includes(lr)) {
                // ARCHITECTURAL NOTE: If we reach here, we are doing a fuzzy name/subtype match.
                // If the intention was a specialized restriction, a handler should have been registered.
                if (lr.includes('_') || lr.includes('source') || lr.includes('greater')) {
                    console.warn(`[TARGET-WARN] Potential missing restriction handler for: "${lr}". Falling back to name check.`);
                }
                
                if (sourceId?.includes('copy')) console.log(`[TARGET-DEBUG] Restriction FAILED: ${r} (Fallback: Name/Subtype mismatch)`);
                return false;
            }
        }

        const alternatives = restrictions.filter(r => {
            if (typeof r !== 'string') return true;
            const lr = r.toLowerCase();
            return lr.includes('_or_') || lr.includes('orsorcery') || lr === 'oneormorecolors' || lr === 'mv_le_x';
        });

        if (alternatives.length > 0) {
            return !!alternatives.every(r => {
                if (typeof r === 'string') {
                    const lr = r.toLowerCase();
                    const token = r.toUpperCase();
                    if (RestrictionRegistry[token]) return !!RestrictionRegistry[token].matches(state, targetObj, lr, context);
                    if (lr.includes('_or_')) return !!lr.split('_or_').some(p => this.matchesRestrictions(state, targetObj, [p.trim()], context));
                    if (lr === 'instantorsorcery' || lr === 'instant_or_sorcery') return !!(this.matchesRestrictions(state, targetObj, ['instant'], context) || this.matchesRestrictions(state, targetObj, ['sorcery'], context));
                    if (lr === 'artifactorcreature' || lr === 'artifact_or_creature') return !!(this.matchesRestrictions(state, targetObj, ['artifact'], context) || this.matchesRestrictions(state, targetObj, ['creature'], context));
                    if (lr === 'creatureorplaneswalker' || lr === 'creature_or_planeswalker') return !!(this.matchesRestrictions(state, targetObj, ['creature'], context) || this.matchesRestrictions(state, targetObj, ['planeswalker'], context));
                    return !!this.matchesRestrictions(state, targetObj, [r], context);
                } else {
                    if ((r.type === 'Any' || r.type === 'any') && r.restrictions) return !!r.restrictions.some((subR: any) => this.matchesRestrictions(state, targetObj, [subR], context));
                    if ((r.type === 'All' || r.type === 'all') && r.restrictions) return !!r.restrictions.every((subR: any) => this.matchesRestrictions(state, targetObj, [subR], context));
                    if ((r.type === 'Not' || r.type === 'not') && r.restriction) return !this.matchesRestrictions(state, targetObj, [r.restriction], context);

                    let match = true;
                    const restrictionType = (r.type || "").toLowerCase();
                    const restrictionValue = r.value !== undefined ? String(r.value) : null;
                    if (r.types && !r.types.some((t: string) => this.matchesRestrictions(state, targetObj, [t], context))) match = false;
                    if (restrictionType === 'type' && restrictionValue && !this.matchesRestrictions(state, targetObj, [restrictionValue], context)) match = false;
                    if (r.subtypes && !r.subtypes.some((s: string) => (definition.subtypes || []).some((ts: string) => ts.toLowerCase() === s.toLowerCase()))) match = false;
                    if (r.nameIncludes && definition.name && !definition.name.toLowerCase().includes(r.nameIncludes.toLowerCase())) match = false;
                    if (r.nameEquals || r.name || (restrictionType === 'name' && r.value)) {
                        const tName = definition?.name || (targetObj as any).name;
                        const fName = (r.nameEquals || r.name || r.value || "") as string;
                        if (!tName || tName.toLowerCase() !== fName.toLowerCase()) match = false;
                    }
                    if (restrictionType === 'control' && restrictionValue && !this.matchesRestrictions(state, targetObj, [restrictionValue], context)) match = false;
                    if (['manavalue', 'mv', 'cmc'].includes(restrictionType)) {
                        const { ManaProcessor } = require('../../../magic/ManaProcessor');
                        const mv = ManaProcessor.getManaValue(definition.manaCost || '', (targetObj as any).xValue || 0);
                        let val = r.value;
                        if (val === 'X') val = stackObject?.xValue || (state.pendingAction as any)?.data?.xValue || 0;
                        else if (val === 'SOURCE_POWER') {
                            const src = this.findObjectInAnyZone(state, sourceId);
                            val = src ? (require('../../../state/LayerProcessor').LayerProcessor.getEffectiveStats(src, state).power || 0) : 0;
                        }
                        
                        const comp = r.comparison || 'Equal';
                        if (comp === 'LessOrEqual' && mv > val) match = false;
                        if (comp === 'GreaterOrEqual' && mv < val) match = false;
                        if (comp === 'Equal' && mv !== val) match = false;
                        if (comp === 'Less' && mv >= val) match = false;
                        if (comp === 'Greater' && mv <= val) match = false;
                    }

                    if (restrictionType === 'color') {
                        const targetColors = this.getColors(targetObj, state);
                        const val = restrictionValue?.toLowerCase();
                        const map: any = { 'w': 'white', 'u': 'blue', 'b': 'black', 'r': 'red', 'g': 'green' };
                        const finalVal = map[val!] || val;
                        if (!targetColors.includes(finalVal)) match = false;
                    }

                    if (restrictionType === 'noncolor') {
                        const targetColors = this.getColors(targetObj, state);
                        const val = restrictionValue?.toLowerCase();
                        const map: any = { 'w': 'white', 'u': 'blue', 'b': 'black', 'r': 'red', 'g': 'green' };
                        const finalVal = map[val!] || val;
                        if (targetColors.includes(finalVal)) match = false;
                    }
                    return match;
                }
            });
        }
        return true;
    }

    public static getColors(obj: any, state?: GameState): string[] {
        const stats = state ? LayerProcessor.getEffectiveStats(obj, state) : null;
        const colors = stats?.colors || obj.definition?.colors || (obj as any).card?.definition?.colors || [];
        const map: any = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
        return colors.map((c: string) => map[c.toUpperCase()] || c.toLowerCase());
    }

    public static sourceHasQualities(source: Targetable, qualities: string[], state?: GameState): boolean {
        const s = (source as any).card || source;
        const sAsGameObject = s as GameObject;
        const definition = sAsGameObject.definition || sAsGameObject;
        const sourceColors = this.getColors(s, state);
        const sourceTypes = (definition.types || []).map((t: string) => t.toLowerCase());
        const sourceSubtypes = (definition.subtypes || []).map((t: string) => t.toLowerCase());
        const sourceSupertypes = (definition.supertypes || []).map((t: string) => t.toLowerCase());
        return qualities.some(q => {
            const lowerQ = q.toLowerCase();
            if (lowerQ === 'and' || lowerQ === 'from') return false;
            if (lowerQ === 'multicolored') return sourceColors.length > 1;
            if (lowerQ === 'monocolored') return sourceColors.length === 1;
            if (lowerQ === 'colorless') return sourceColors.length === 0;
            if (lowerQ === 'oneormorecolors') return sourceColors.length > 0;
            const singularQ = lowerQ.endsWith('s') ? lowerQ.slice(0, -1) : lowerQ;
            return sourceTypes.includes(lowerQ) || sourceTypes.includes(singularQ) || sourceSubtypes.includes(lowerQ) || sourceSubtypes.includes(singularQ) || sourceSupertypes.includes(lowerQ) || sourceSupertypes.includes(singularQ) || sourceColors.includes(lowerQ) || sourceColors.includes(singularQ);
        });
    }

    public static hasLegalTargets(state: GameState, sourceId: string, targetDef: any, controllerId: string): boolean {
        if (!targetDef) return true;

        if (Array.isArray(targetDef)) {
            let currentIndex = 0;
            return targetDef.every((def) => {
                const count = typeof def.count === 'number' ? def.count : 1;
                const minCount = def.minCount !== undefined ? def.minCount : (def.optional ? 0 : count);

                if (minCount === 0) {
                    currentIndex += count;
                    return true;
                }

                const pool = this.getLegalTargetPool(state, sourceId, targetDef, controllerId, currentIndex);
                currentIndex += count;
                return pool.length >= minCount;
            });
        }

        const count = typeof targetDef.count === 'number' ? targetDef.count : 1;
        const minCount = targetDef.minCount !== undefined ? targetDef.minCount : (targetDef.optional ? 0 : count);
        if (minCount === 0) return true;

        const pool = this.getLegalTargetPool(state, sourceId, targetDef, controllerId, 0);
        return pool.length >= minCount;
    }

    public static getLegalTargetPool(state: GameState, sourceId: string, targetDef: any, controllerId: string, targetIndex: number = 0): string[] {
        const pool = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id),
            ...state.exile.map(o => o.id),
            ...state.stack.map(o => o.id),
            ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
        ];

        return pool.filter(id => this.isLegalTarget(state, {
            sourceId,
            controllerId,
            targetDef,
            targetIndex
        }, id));
    }
}
