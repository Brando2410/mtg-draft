import { GameObject, GameObjectId, GameState, PlayerId, Zone, TargetType, TargetMapping } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { ActionProcessor } from './ActionProcessor';

/**
 * Rules Engine Module: Targeting (Rule 115)
 * Centralizes all targeting validation, mapping, and interactive flow.
 */
export class TargetingProcessor {

    public static calculateTotalCounts(targetDef: any, xValue: number = 0): { maxCount: number, minCount: number, count: number } {
        let maxCount = 0;
        let minCount = 0;
        let targetCount = 0;
        const defs = Array.isArray(targetDef) ? targetDef : [targetDef];

        defs.forEach(d => {
            if (!d) return;
            let count = d.count;
            if (count === 'X') count = xValue;
            count = count || 1;

            let dMax = d.maxCount || count;
            if (dMax === 'X') dMax = xValue;

            let dMin = d.minCount !== undefined ? d.minCount : count;
            if (dMin === 'X') dMin = xValue;

            maxCount += dMax;
            minCount += dMin;
            targetCount += count;
        });

        return { maxCount, minCount, count: targetCount };
    }

    public static generateTargetPrompt(targetDef: any, selectedCount: number, xValue: number = 0, isSpellCasting: boolean = false): string {
        const def = this.getDefinitionForIndex(targetDef, selectedCount);
        if (!def) return "Select targets";

        const counts = this.calculateTotalCounts(targetDef, xValue);
        // A target is optional if it's explicitly marked optional OR has minCount 0.
        // We also check if we've already fulfilled the mandatory part of a multi-target sequence.
        // TRICKY: Spells being cast are "cancelable" (interface optional) but might be mandatory (rules mandatory).
        // If it's a spell casting and it's mandatory, we DON'T want "You may" even if UI allows cancel.
        const isRulesOptional = def.optional || def.minCount === 0;
        const isSequenceOptional = counts.minCount <= selectedCount;

        const isOptional = isRulesOptional || isSequenceOptional;

        let type = def.type || "target";
        const restrictions = (def.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);

        let typeStr = type.toLowerCase();
        if (restrictions.includes('opponent') || typeStr === 'opponent') typeStr = "an opponent";
        else if (restrictions.includes('you')) typeStr = "yourself";
        else if (type === 'Player' || typeStr === 'player') typeStr = "a player";

        else if (type === 'Creature') typeStr = "a creature";
        else if (type === 'Permanent') typeStr = "a permanent";
        else if (type === 'CardInGraveyard') typeStr = "a card from graveyard";
        else if (type === 'SpellOnStack') typeStr = "a spell on stack";
        else if (type === 'AnyTarget' || typeStr === 'anytarget') typeStr = "any target";

        // If the definition specifies a label, use it! 
        // We prepend "You may " if it's optional for the RULES (not just because it's a cancelable spell).
        if (def.label) {
            let label = def.label;
            if (label.toLowerCase().trim().endsWith('to') || label.toLowerCase().trim().endsWith('select')) {
                label = `${label.trim()} ${typeStr}`;
            }

            if (isRulesOptional && !label.toLowerCase().includes('may') && !label.toLowerCase().includes('optional')) {
                return `You may ${label.toLowerCase().startsWith('select') ? label : `select ${label.toLowerCase()}`}`;
            }
            return label;
        }

        const prefix = (isRulesOptional || (isSequenceOptional && !isSpellCasting)) ? "You may select" : "Select";

        // Handle "Up to" phrasing for targets with minCount 0
        if (def.minCount === 0 && def.count > 0 && !isSequenceOptional) {
            const countStr = def.count === 1 ? "one" : def.count;
            const plural = def.count > 1 ? "s" : "";
            // Special case for type strings that already include "a " or "an "
            let cleanType = typeStr;
            if (cleanType.startsWith('a ')) cleanType = cleanType.substring(2);
            if (cleanType.startsWith('an ')) cleanType = cleanType.substring(3);

            return `Select up to ${countStr} ${cleanType}${plural}`;
        }

        return `${prefix} ${typeStr}`;
    }

    /**
     * CR 608.2b: Checks if a target is still legal as a spell or ability attempts to resolve.
     * Also used during the casting process (CR 601.2c).
     */
    public static findObjectInAnyZone(state: GameState, id: string): GameObject | null {
        // 1. Battlefield
        const bf = state.battlefield.find((o: any) => o.id === id);
        if (bf) return bf;

        // 2. Exile
        const ex = state.exile.find((o: any) => o.id === id);
        if (ex) return ex;

        // 3. Hands, Graveyards, and Virtual Hands
        for (const p of (Object.values(state.players) as any[])) {
            const h = p.hand.find((o: any) => o.id === id);
            if (h) return h;
            const g = p.graveyard.find((o: any) => o.id === id);
            if (g) return g;
            const l = p.library.find((o: any) => o.id === id);
            if (l) return l;
            const v = p.virtualHand?.find((o: any) => o.id === id);
            if (v) return v;
        }

        // 4. Stack
        const st = state.stack.find(s => s.id === id || s.card?.id === id);
        if (st && st.card) return st.card;

        return null;
    }

    /**
     * CR 608.2b: Checks if a target is still legal as a spell or ability attempts to resolve.
     * Also used during the casting process (CR 601.2c).
     */
    public static isLegalTarget(state: GameState, sourceOrId: string | any, targetId: string, abilityTargetDef?: any, targetIndex: number = 0): boolean {
        const sourceId = typeof sourceOrId === 'string' ? sourceOrId : (sourceOrId as any).sourceId || (sourceOrId as any).id;
        const sourceObjProvided = typeof sourceOrId === 'string' ? null : sourceOrId;

        const targetDefForIndex = this.getDefinitionForIndex(abilityTargetDef, targetIndex);

        // 1. If target is a player
        if (state.players[targetId]) {
            const type = (targetDefForIndex?.type || '').toLowerCase();
            const restrictions = (targetDefForIndex?.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);

            if (type === TargetType.Player.toLowerCase() || type === TargetType.Opponent.toLowerCase() || type === TargetType.AnyTarget.toLowerCase() || type === TargetType.PlayerOrPlaneswalker.toLowerCase() || restrictions.includes('player') || restrictions.includes('anytarget')) {

                let sourceControllerId = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId)?.controllerId ||
                    state.battlefield.find(o => o.id === sourceId)?.controllerId;

                if (!sourceControllerId) {
                    for (const pId in state.players) {
                        if (state.players[pId as PlayerId].hand.some(c => c.id === sourceId)) {
                            sourceControllerId = pId;
                            break;
                        }
                    }
                }

                if (restrictions.includes('opponent') || type === TargetType.Opponent.toLowerCase()) {
                    if (sourceControllerId && targetId === sourceControllerId) return false;
                }


                if (restrictions.includes('you')) {
                    if (sourceControllerId && targetId !== sourceControllerId) return false;
                }
                return true;
            }
            return false;
        }

        // 2. Locate target object
        let targetObj: any = state.battlefield.find(o => o.id === targetId);
        let targetZone: Zone = Zone.Battlefield;

        if (!targetObj) {
            for (const p of Object.values(state.players) as any[]) {
                targetObj = p.graveyard.find((c: any) => c.id === targetId);
                if (targetObj) { targetZone = Zone.Graveyard; break; }
                targetObj = p.hand.find((c: any) => c.id === targetId);
                if (targetObj) { targetZone = Zone.Hand; break; }
                targetObj = p.library.find((c: any) => c.id === targetId);
                if (targetObj) { targetZone = Zone.Library; break; }
            }
        }

        if (!targetObj) {
            targetObj = state.exile.find(o => o.id === targetId);
            if (targetObj) targetZone = Zone.Exile;
        }

        if (!targetObj) {
            targetObj = state.exile.find(o => o.id === targetId);
            if (targetObj) targetZone = Zone.Exile;
        }

        if (!targetObj) {
            targetObj = state.stack.find(s => s.id === targetId);
            if (targetObj) {
                targetZone = Zone.Stack;
            } else {
                return false;
            }
        }

        if (targetObj.isPhasedOut) return false;

        const typeLineCheck = (targetDefForIndex?.type || '').toLowerCase();
        const isPlayerTargetOnly = typeLineCheck === 'player';
        if (isPlayerTargetOnly) return false;

        const coreTypes = [
            'creature', 'artifact', 'land', 'enchantment', 'planeswalker', 'permanent',
            'instant', 'sorcery', 'instant_or_sorcery', 'instantorsorcery', 'artifact_or_creature', 'artifactorcreature',
            'artifact_or_enchantment', 'artifactorenchantment', 'creature_or_planeswalker', 'creatureorplaneswalker', 'nonland_permanent', 'nonlandpermanent', 'non_land_permanent', 'player_or_planeswalker'
        ];

        if (typeLineCheck === 'spell' || typeLineCheck === 'triggeredability' || typeLineCheck === 'activatedability') {
            if (targetZone !== Zone.Stack) return false;
            if (targetObj.type.toLowerCase() !== typeLineCheck) return false;
        } else if (typeLineCheck === 'anytarget' || coreTypes.includes(typeLineCheck)) {
            const stats = LayerProcessor.getEffectiveStats(targetObj, state);
            const combinedTypes = [
                ...(stats.types || []),
                ...(stats.supertypes || [])
            ].map(t => t.toLowerCase());

            if (typeLineCheck === 'anytarget') {
                const isValidAnyTarget = combinedTypes.some((t: string) => t === 'creature' || t === 'planeswalker');
                if (!isValidAnyTarget) return false;
            } else if (typeLineCheck === 'permanent') {
                const permTypes = ['artifact', 'creature', 'enchantment', 'land', 'planeswalker'];
                if (!combinedTypes.some(t => permTypes.includes(t))) return false;
            } else if (typeLineCheck === 'instant_or_sorcery' || typeLineCheck === 'instantorsorcery') {
                if (!combinedTypes.includes('instant') && !combinedTypes.includes('sorcery')) return false;
            } else if (typeLineCheck === 'artifact_or_creature' || typeLineCheck === 'artifactorcreature') {
                if (!combinedTypes.includes('artifact') && !combinedTypes.includes('creature')) return false;
            } else if (typeLineCheck === 'artifact_or_enchantment' || typeLineCheck === 'artifactorenchantment') {
                if (!combinedTypes.includes('artifact') && !combinedTypes.includes('enchantment')) return false;
            } else if (typeLineCheck === 'creature_or_planeswalker' || typeLineCheck === 'creatureorplaneswalker') {
                if (!combinedTypes.includes('creature') && !combinedTypes.includes('planeswalker')) return false;
            } else if (typeLineCheck === 'nonland_permanent' || typeLineCheck === 'nonlandpermanent' || typeLineCheck === 'non_land_permanent') {
                const permTypes = ['artifact', 'creature', 'enchantment', 'planeswalker'];
                if (!combinedTypes.some(t => permTypes.includes(t))) return false;
            } else if (typeLineCheck === 'player_or_planeswalker') {
                if (!combinedTypes.includes('planeswalker')) return false;
            } else {
                if (!combinedTypes.includes(typeLineCheck)) return false;
            }
        }

        let expectedZone = targetDefForIndex?.zone;
        if (!expectedZone) {
            if (targetZone === Zone.Stack) expectedZone = Zone.Stack;
            else if (['instant', 'sorcery', 'instant_or_sorcery'].includes(typeLineCheck)) expectedZone = Zone.Stack;
            else if (targetDefForIndex?.type === 'CardInGraveyard' || String(targetDefForIndex?.type).toLowerCase() === 'cardingraveyard') expectedZone = Zone.Graveyard;
            else if (targetDefForIndex?.type === 'CardInHand' || String(targetDefForIndex?.type).toLowerCase() === 'cardinhand') expectedZone = Zone.Hand;
            else if (targetDefForIndex?.restrictions?.some((r: any) => typeof r === 'string' && r.toLowerCase() === 'graveyard')) expectedZone = Zone.Graveyard;
            else expectedZone = Zone.Battlefield;
        }

        if (expectedZone !== 'Any' && targetZone !== expectedZone) {
            // Special Case: If no specific definition was provided, allow matching cards in Library/Graveyard/Hand 
            // This is common for MoveEffectHandler searches where we only pass restrictions.
            const isManualSearch = !targetDefForIndex;
            if (isManualSearch && (targetZone === Zone.Library || targetZone === Zone.Graveyard || targetZone === Zone.Hand)) {
                // Proceed
            } else {
                return false;
            }
        }

        const sourceStack = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
        const sourceBattlefield = state.battlefield.find(o => o.id === sourceId);
        const sourceGraveyard = (Object.values(state.players) as any[]).flatMap(p => p.graveyard).find((o: any) => o.id === sourceId);

        let source = sourceObjProvided || (sourceStack?.card) || sourceBattlefield || sourceGraveyard;
        if (!source && sourceStack) source = sourceStack;

        let sourceControllerId = source?.controllerId || (sourceStack as any)?.controllerId;

        if (!sourceControllerId) {
            for (const pId in state.players) {
                const cardInHand = state.players[pId as PlayerId].hand.find(c => c.id === sourceId);
                if (cardInHand) {
                    sourceControllerId = pId;
                    source = cardInHand;
                    break;
                }
            }
        }

        if (!source) {
            // Log missing source if needed
        }

        const keywords = LayerProcessor.getEffectiveStats(targetObj, state).keywords;

        // Protection (Rule 702.16)
        const protectionKeywords = keywords.filter((k: string) => k.toLowerCase().startsWith('protection from'));
        for (const prot of protectionKeywords) {
            const qualityStr = prot.toLowerCase().replace('protection from ', '');
            const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
            if (source && this.sourceHasQualities(source, qualities, state)) return false;
        }

        // Hexproof (Rule 702.11)
        const hexproofKeywords = keywords.filter((k: string) => k.toLowerCase().startsWith('hexproof'));
        for (const hp of hexproofKeywords) {
            if (hp.toLowerCase() === 'hexproof') {
                if (sourceControllerId && sourceControllerId !== targetObj.controllerId) return false;
            } else if (hp.toLowerCase().startsWith('hexproof from ')) {
                const qualityStr = hp.toLowerCase().replace('hexproof from ', '');
                const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
                if (sourceControllerId && sourceControllerId !== targetObj.controllerId) {
                    if (source && this.sourceHasQualities(source, qualities, state)) return false;
                }
            }
        }

        // Shroud (Rule 702.18)
        if (keywords.includes('Shroud')) return false;

        let restrictions = targetDefForIndex?.restrictions;
        if (targetDefForIndex?.perTargetRestrictions && targetDefForIndex.perTargetRestrictions[targetIndex]) {
            restrictions = targetDefForIndex.perTargetRestrictions[targetIndex];
        }

        if (restrictions) {
            return this.matchesRestrictions(state, targetObj, restrictions, sourceControllerId, sourceId, undefined, (targetDefForIndex as any)?.stackObj);
        }

        return true;
    }

    /**
     * Evaluates a set of restrictions against a target object or player.
     */
    public static hasLegalTargets(state: GameState, sourceId: string, targetDef: any, controllerId: string): boolean {
        if (!targetDef || (Array.isArray(targetDef) ? targetDef.every(d => d.optional) : targetDef.optional)) return true;

        let count = 0;
        let minCount = 0;

        if (Array.isArray(targetDef)) {
            targetDef.forEach(d => {
                count += (typeof d.count === 'number' ? d.count : 1);
                minCount += (d.minCount !== undefined ? d.minCount : (typeof d.count === 'number' ? d.count : 1));
            });
        } else {
            count = targetDef.count || 1;
            minCount = targetDef.minCount !== undefined ? targetDef.minCount : count;
        }

        if (minCount === 0) return true;

        // Collect all potential targetable IDs
        const allPotentialTargets = [
            ...Object.keys(state.players),
            ...state.battlefield.map((o: any) => o.id),
            ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((o: any) => o.id)),
            ...state.exile.map(o => o.id),
            ...state.stack.map(o => o.id)
        ];

        const legalPerIndex: string[][] = [];
        for (let i = 0; i < count; i++) {
            const legal = allPotentialTargets.filter(tid => this.isLegalTarget(state, sourceId, tid, targetDef, i));
            if (i < minCount && legal.length === 0) return false; // Mandatory slot i has no candidates
            legalPerIndex.push(legal);
        }

        // Distinctness check (Simulating a simple bipartite matching)
        if (minCount === 1 && count >= 2) {
            return legalPerIndex[0].length > 0;
        }

        // For minCount=2: Exists x in legal[0], y in legal[1] s.t. x != y
        if (count === 2 && minCount === 2) {
            const l0 = legalPerIndex[0];
            const l1 = legalPerIndex[1];
            if (l0.length > 1 || l1.length > 1) return true; // If either has multiple, we can always pick two distinct
            return l0[0] !== l1[0]; // If both have only one, they must be different
        }

        // Fallback for larger counts: just ensure we have at least 'minCount' unique IDs across mandatory slots
        const allUniqueLegal = new Set(legalPerIndex.slice(0, minCount).flat());
        return allUniqueLegal.size >= minCount;
    }

    /**
     * Evaluates a set of restrictions against a target object or player.
     */
    public static matchesRestrictions(state: GameState, targetObj: any, restrictions: any[], controllerId: string | null, sourceId: string, log?: (msg: string) => void, stackObject?: any): boolean {
        if (!targetObj) return false;
        const definition = targetObj.definition || targetObj.card?.definition;
        if (log) log(`[DEBUG] matchesRestrictions for ${definition?.name || targetObj.name}: [${restrictions.join(', ')}]`);

        // Extract definition: either direct (GameObject) or from card property (Stack Spell)

        // If no definition and not a player, this object cannot match most restrictions
        if (!definition) {
            if (state.players[targetObj.id || targetObj]) {
                // Handle player-specific target checks if necessary
                return restrictions.includes('player') || restrictions.includes('anytarget');
            }
            return false;
        }

        const objTypes = [
            ...(definition.types || []),
            ...(definition.supertypes || [])
        ].map((t: string) => t.toLowerCase());

        const baseTypes = ['creature', 'planeswalker', 'land', 'artifact', 'enchantment', 'instant', 'sorcery', 'permanent', 'card'];
        const isAlternative = (r: any) => typeof r === 'object' ||
            (typeof r === 'string' && (
                r.toLowerCase().includes('_or_') ||
                r.toLowerCase().includes('orsorcery') ||
                r.toLowerCase().includes('orplaneswalker') ||
                r.toLowerCase().includes('orcreature') ||
                r.toLowerCase().includes('orenchantment') ||
                r.toLowerCase() === 'oneormorecolors' ||
                r.toLowerCase() === 'mv_le_x'
            ));

        for (const r of restrictions) {
            if (typeof r !== 'string' || isAlternative(r)) continue;
            const lr = r.toLowerCase();
            // Silence most frequent logs, but for debugging Quandrix we need to see why it fails
            if (log && (lr.includes('hand') || lr.includes('instant') || lr.includes('sorcery'))) {
                log(`[DEBUG] Checking standard restriction: ${definition?.name || targetObj.name} against ${lr}`);
            }

            if (lr === 'nonland' && objTypes.includes('land')) return false;
            if (lr === 'noncreature' && objTypes.includes('creature')) return false;
            if (lr === 'nonartifact' && objTypes.includes('artifact')) return false;
            if (lr === 'nonenchantment' && objTypes.includes('enchantment')) return false;
            if (lr === 'nonplaneswalker' && objTypes.includes('planeswalker')) return false;

            if (lr.startsWith('non')) {
                const base = lr.substring(3);
                if (objTypes.includes(base) || (targetObj.definition.subtypes || []).some((s: string) => s.toLowerCase() === base)) return false;
            }
            if (lr === 'anytarget') {
                const stats = LayerProcessor.getEffectiveStats(targetObj, state);
                const isValidAnyTarget = stats.types.some((t: string) => {
                    const lt = t.toLowerCase();
                    return lt === 'creature' || lt === 'planeswalker';
                });
                if (!isValidAnyTarget) return false;
            }
            if (lr === 'graveyard' && targetObj.zone !== Zone.Graveyard) return false;
            if ((lr === 'other' || lr === 'another') && targetObj.id === sourceId) return false;
            if (lr === 'notcontrolled' || lr === 'opponentcontrol') {
                if (controllerId && targetObj.controllerId === controllerId) return false;
            }
            if (lr === 'youcontrol' && controllerId && targetObj.controllerId !== controllerId) return false;
            if (lr === 'legendary' && !objTypes.includes('legendary')) return false;
            if (lr === 'basic' && !objTypes.includes('basic')) return false;
            if (lr === 'self' && targetObj.id !== sourceId) return false;
            if (lr === 'tapped' && !targetObj.isTapped) return false;
            if (lr === 'untapped' && targetObj.isTapped) return false;
            if (lr === 'opponents' && (targetObj.controllerId || targetObj.ownerId) === controllerId) return false;
            if (lr === 'fromhand' || lr === 'castfromhand') {
                const zone = targetObj.zone || targetObj.card?.zone;
                const lastZone = targetObj.lastNonStackZone || targetObj.card?.lastNonStackZone;
                const match = zone === Zone.Hand || lastZone === Zone.Hand;
                if (log) log(`[DEBUG] fromhand check for ${definition?.name || targetObj.name}: Zone=${zone}, LastZone=${lastZone} -> ${match}`);
                if (!match) return false;
                continue;
            }

            if (lr === 'mv_le_power' && sourceId) {
                const source = state.battlefield.find(o => o.id === sourceId);
                const sourcePower = source ? LayerProcessor.getEffectiveStats(source, state).power : 0;
                const targetMV = ManaProcessor.getManaValue(targetObj.definition.manaCost || '');
                if (targetMV > sourcePower) return false;
            }


            const numericMatch = lr.match(/^(cmc|mv|power|toughness)\s*(<=|>=|==|=|<|>)\s*(\d+)$/);
            if (numericMatch) {
                const [, field, op, valStr] = numericMatch;
                const val = parseInt(valStr);
                let currentVal = 0;
                if (field === 'cmc' || field === 'mv') currentVal = ManaProcessor.getManaValue(targetObj.definition.manaCost || '');
                else if (field === 'power') currentVal = LayerProcessor.getEffectiveStats(targetObj, state).power;
                else if (field === 'toughness') currentVal = LayerProcessor.getEffectiveStats(targetObj, state).toughness;

                if (op === '<=' && !(currentVal <= val)) return false;
                if (op === '>=' && !(currentVal >= val)) return false;
                if (op === '<' && !(currentVal < val)) return false;
                if (op === '>' && !(currentVal > val)) return false;
                if ((op === '==' || op === '=') && !(currentVal === val)) return false;
                continue;
            }

            if (lr === 'attackingorblocking') {
                const isAttacking = (state.combat?.attackers || []).some(a => a.attackerId === targetObj.id);
                const isBlocking = (state.combat?.blockers || []).some(b => b.blockerId === targetObj.id);
                if (!isAttacking && !isBlocking) return false;
            }
            if (lr === 'attacking') {
                const isAttacking = (state.combat?.attackers || []).some(a => a.attackerId === targetObj.id);
                if (!isAttacking) return false;
            }
            if (lr === 'blocking') {
                const isBlocking = (state.combat?.blockers || []).some(b => b.blockerId === targetObj.id);
                if (!isBlocking) return false;
            }
            if (lr === 'instantorsorcerycastthisturn') {
                if (controllerId && !state.turnState.instantOrSorceryCastThisTurn[controllerId]) return false;
            }
            if (lr === 'hasxinmanacost') {
                if (!definition.manaCost?.includes('X')) return false;
            }

            // --- COUNTER CHECK (Rule 122) ---
            if (lr.startsWith('hascounter_')) {
                const counterType = r.split('_')[1]; // Keep original case for counter type if needed
                if (!targetObj.counters || !targetObj.counters[counterType] || targetObj.counters[counterType] <= 0) {
                    return false;
                }
            }

            // --- KEYWORD CHECK (Rule 702) ---
            const knownKeywords = ['defender', 'flying', 'haste', 'vigilance', 'lifelink', 'deathtouch', 'trample', 'menace', 'reach', 'first strike', 'double strike', 'indestructible'];
            if (knownKeywords.includes(lr)) {
                const stats = LayerProcessor.getEffectiveStats(targetObj, state);
                const hasKeyword = stats.keywords.some((k: string) => k.toLowerCase() === lr);
                if (!hasKeyword) return false;
                continue;
            }

            if (lr === 'oneormorecolors') {
                if (!this.sourceHasQualities(targetObj, ['oneormorecolors'], state)) return false;
                continue;
            }

            if (lr === 'mv_le_x') {
                const xValue = stackObject?.xValue || (state.pendingAction as any)?.data?.xValue || (state.pendingAction as any)?.xValue || 0;
                const { ManaProcessor } = require('../magic/ManaProcessor');
                const mv = ManaProcessor.getManaValue(definition.manaCost || '');
                if (mv > xValue) return false;
                continue;
            }

            const isKnownFilter = [
                'nonland', 'noncreature', 'nonartifact', 'nonenchantment', 'nonplaneswalker',
                'graveyard', 'other', 'another', 'notcontrolled', 'opponentcontrol', 'youcontrol', 'self', 'legendary',
                'tapped', 'untapped', 'yours', 'opponents', 'attackingorblocking', 'basic',
                'instantorsorcerycastthisturn', 'player', 'anytarget', 'creature', 'artifact', 'land', 'enchantment', 'planeswalker',
                'instant', 'sorcery', 'hasxinmanacost', 'monocolored', 'multicolored', 'colorless', 'oneormorecolors',
                'fromhand', 'castfromhand', 'nontoken', 'token', 'mv_le_power', 'mv_le_x'
            ].includes(lr) || lr.startsWith('cmc') || lr.startsWith('mv') || lr.startsWith('power') || lr.startsWith('toughness') || lr.startsWith('hascounter');


            if (['monocolored', 'multicolored', 'colorless'].includes(lr)) {
                if (!this.sourceHasQualities(targetObj, [lr], state)) return false;
                continue;
            }

            if (lr === 'permanent') {
                const permTypes = ['artifact', 'creature', 'enchantment', 'land', 'planeswalker'];
                if (!objTypes.some((t: string) => permTypes.includes(t.toLowerCase()))) return false;
                continue;
            }

            if (lr === 'card') {
                continue; // Everything is a card usually
            }

            if (baseTypes.includes(lr)) {
                if (!objTypes.includes(lr)) return false;
                continue;
            }

            if (!isKnownFilter && !baseTypes.includes(lr)) {
                const targetName = (definition?.name || targetObj.name || "").toLowerCase();
                const objSubtypes = (definition?.subtypes || []).map((s: string) => s.toLowerCase());
                const singularLr = lr.endsWith('s') ? lr.slice(0, -1) : lr;

                const isNameMatch = targetName === lr || targetName === singularLr;
                const isSubtypeMatch = objSubtypes.includes(lr) || objSubtypes.includes(singularLr);

                if (!isNameMatch && !isSubtypeMatch) return false;
            }
        }
        if (log) log(`[DEBUG] Loop finished for ${definition?.name || targetObj.name}, alternatives count: ${restrictions.filter(r => isAlternative(r)).length}`);

        const alternatives = restrictions.filter(r => isAlternative(r));
        if (log && alternatives.length > 0) log(`[DEBUG] Processing ${alternatives.length} alternatives for ${definition?.name || targetObj.name}: ${alternatives.join(', ')}`);
        if (alternatives.length > 0) {
            return alternatives.every(r => {
                const lr = typeof r === 'string' ? r.toLowerCase() : JSON.stringify(r);
                const isMatch = (() => {
                    if (typeof r === 'string') {
                        const lr = r.toLowerCase();
                        if (lr === 'card') return true;
                        if (lr === 'instant_or_sorcery' || lr === 'instantorsorcery') {
                            return objTypes.includes('instant') || objTypes.includes('sorcery');
                        }
                        if (lr === 'permanent') {
                            const permTypes = ['artifact', 'creature', 'enchantment', 'land', 'planeswalker'];
                            return objTypes.some((t: string) => permTypes.includes(t.toLowerCase()));
                        }
                        if (lr === 'artifact_or_creature' || lr === 'artifactorcreature') {
                            return objTypes.includes('artifact') || objTypes.includes('creature');
                        }
                        if (lr === 'artifact_or_enchantment' || lr === 'artifactorenchantment') {
                            return objTypes.includes('artifact') || objTypes.includes('enchantment');
                        }
                        if (lr === 'creature_or_planeswalker' || lr === 'creatureorplaneswalker') {
                            return objTypes.includes('creature') || objTypes.includes('planeswalker');
                        }
                        if (lr === 'nonland_permanent' || lr === 'nonlandpermanent' || lr === 'non_land_permanent') {
                            const permTypes = ['artifact', 'creature', 'enchantment', 'planeswalker'];
                            return objTypes.some((t: string) => permTypes.includes(t.toLowerCase()));
                        }
                        if (lr === 'oneormorecolors') {
                            return this.sourceHasQualities(targetObj, ['oneormorecolors'], state);
                        }
                        if (lr === 'mv_le_x') {
                            const xValue = (state.pendingAction as any)?.data?.xValue || (state.pendingAction as any)?.xValue || (targetObj as any).xValue || 0;
                            const mv = ManaProcessor.getManaValue(definition.manaCost || '');
                            return mv <= xValue;
                        }


                        if (lr.includes('_or_')) {
                            const parts = lr.split('_or_');
                            return parts.some(p => {
                                const lp = p.trim();
                                const singular = lp.endsWith('s') ? lp.slice(0, -1) : lp;
                                return objTypes.includes(lp) ||
                                    (definition.subtypes || []).some((s: string) => s.toLowerCase() === lp || s.toLowerCase() === singular);
                            });
                        }

                        const singularLr = lr.endsWith('s') ? lr.slice(0, -1) : lr;
                        return objTypes.includes(lr) ||
                            (definition.subtypes || []).some((s: string) => s.toLowerCase() === lr || s.toLowerCase() === singularLr) ||
                            (definition.name || "").toLowerCase() === lr;
                    } else {
                        // Recursion for Any/All blocks
                        if (r.type === 'Any' || r.type === 'any') {
                            return r.restrictions.some((subR: any) => this.matchesRestrictions(state, targetObj, [subR], controllerId, sourceId, log, stackObject));
                        }
                        if (r.type === 'All' || r.type === 'all') {
                            return r.restrictions.every((subR: any) => this.matchesRestrictions(state, targetObj, [subR], controllerId, sourceId, log, stackObject));
                        }

                        let match = true;
                        const rTypes = r.types || (r.type ? [r.type] : []);
                        const rSubtypes = r.subtypes || (r.subtype ? [r.subtype] : []);

                        const functionalTypes = ['manavalue', 'mv', 'manavaluele', 'manavalueless', 'mvless', 'power', 'toughness', 'cmc'];
                        if (rTypes.length > 0 && !rTypes.some((t: string) => {
                            const lt = t.toLowerCase();
                            if (functionalTypes.includes(lt)) return true; // Skip type check for functional restrictions
                            if (lt.startsWith('non')) {
                                const base = lt.substring(3);
                                return !objTypes.includes(base);
                            }
                            return objTypes.includes(lt);
                        })) match = false;
                        if (rSubtypes.length > 0 && !rSubtypes.some((s: string) => (definition.subtypes || []).some((ts: string) => ts.toLowerCase() === s.toLowerCase()))) match = false;
                        if (r.nameIncludes && definition.name && !definition.name.toLowerCase().includes(r.nameIncludes.toLowerCase())) match = false;
                        if (r.nameEquals || r.name) {
                            const targetName = definition?.name || targetObj.name;
                            const filterName = r.nameEquals || r.name || "";
                            if (!targetName || targetName.toLowerCase() !== filterName.toLowerCase()) match = false;
                        }
                        if (r.hasxinmanacost && !definition.manaCost?.includes('X')) match = false;
                        if (r.type === 'ManaValue' || r.type === 'MV' || r.type === 'ManaValueLe' || r.type === 'ManaValueLess' || r.type === 'MVLess') {
                            const mv = ManaProcessor.getManaValue(definition.manaCost || '');
                            let val = r.value;
                            if (val === 'X') {
                                const stackObj = stackObject || state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
                                if (stackObj) {
                                    val = stackObj.xValue || 0;
                                } else {
                                    // Fallback to pending action metadata
                                    val = (state.pendingAction as any)?.xValue ||
                                        (state.pendingAction as any)?.data?.xValue ||
                                        (state.pendingAction as any)?.data?.stackObj?.xValue || 0;
                                }
                            } else if (val === 'GAINED_LIFE_AMOUNT') {
                                val = state.turnState.lifeGainedThisTurn[controllerId || ''] || 0;
                            } else if (val === 'CONVERGE_AMOUNT') {
                                const sourceObj = this.findObjectInAnyZone(state, sourceId);
                                val = (sourceObj as any)?.convergeAmount || 0;
                            } else if (val === 'SOURCE_MV') {
                                const source = this.findObjectInAnyZone(state, sourceId);
                                val = source ? ManaProcessor.getManaValue(source.definition.manaCost || '') : 0;
                            }

                            const comp = (r.type === 'ManaValueLe' ? 'LessOrEqual' : (r.type === 'ManaValueLess' ? 'LessThan' : (r.comparison || 'Equal')));
                            if (comp === 'LessOrEqual' && mv > val) match = false;
                            if (comp === 'GreaterOrEqual' && mv < val) match = false;
                            if (comp === 'Equal' && mv !== val) match = false;
                            if (comp === 'LessThan' && mv >= val) match = false;
                            if (comp === 'GreaterThan' && mv <= val) match = false;
                        }
                        return match;
                    }
                })();
                if (log) log(`[DEBUG] Alternative check: ${definition?.name || targetObj.name} against ${lr} -> ${isMatch}`);
                return isMatch;
            });
        }
        if (log) log(`[DEBUG] matchesRestrictions final result for ${definition?.name || targetObj.name}: true`);
        return true;
    }

    public static sourceHasQualities(source: any, qualities: string[], state?: GameState): boolean {
        const s = source.card || source;
        let definition = s.definition || s;

        let sourceColors: string[] = [];
        if (state && s.id && state.battlefield.some(o => o.id === s.id)) {
            const stats = LayerProcessor.getEffectiveStats(s, state);
            sourceColors = stats.colors.map((c: string) => {
                const map: any = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
                return map[c.toUpperCase()] || c.toLowerCase();
            });
        } else {
            sourceColors = (Array.isArray(definition.colors) ? definition.colors : []).map((c: string) => {
                const map: any = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
                return map[c.toUpperCase()] || c.toLowerCase();
            });
        }

        const sourceTypes = (definition.types || []).map((t: string) => t.toLowerCase());
        const sourceSubtypes = (definition.subtypes || []).map((t: string) => t.toLowerCase());

        return qualities.some(q => {
            const lowerQ = q.toLowerCase();
            if (lowerQ === 'and' || lowerQ === 'from') return false;

            // Multicolored check
            if (lowerQ === 'multicolored') return sourceColors.length > 1;
            if (lowerQ === 'monocolored') return sourceColors.length === 1;
            if (lowerQ === 'colorless') return sourceColors.length === 0;
            if (lowerQ === 'oneormorecolors') return sourceColors.length > 0;


            const singularQ = lowerQ.endsWith('s') ? lowerQ.slice(0, -1) : lowerQ;
            const matchesType = sourceTypes.includes(lowerQ) || sourceTypes.includes(singularQ);
            const matchesSubtype = sourceSubtypes.includes(lowerQ) || sourceSubtypes.includes(singularQ);
            const matchesColor = sourceColors.includes(lowerQ) || sourceColors.includes(singularQ);
            return matchesType || matchesSubtype || matchesColor;
        });
    }

    /**
     * CR 603: Resolve a specific target selection from the UI.
     */
    public static resolveInteractiveTargeting(
        state: GameState,
        playerId: PlayerId,
        targetId: string,
        log: (m: string) => void,
        engine: {
            resetPriorityToActivePlayer: () => void;
            finaliseTargeting: (p: PlayerId, targets: string[]) => boolean;
        }
    ): boolean {
        if (state.pendingAction?.type !== 'TARGETING' || state.pendingAction.playerId !== playerId) return false;

        const actionData = state.pendingAction.data;
        const targetDef = actionData?.targetDefinition;
        const isOptional = targetDef?.optional || targetDef?.minCount === 0;
        const isSkipping = targetId === 'skip' || targetId === 'none' || targetId === 'confirm';
        const isUndoing = targetId === 'undo' || targetId === 'back';

        const counts = TargetingProcessor.calculateTotalCounts(targetDef, (actionData.xValue !== undefined ? actionData.xValue : (actionData.stackObj?.xValue || 0)));
        const { maxCount, minCount, count } = counts;

        actionData.selectedTargets = actionData.selectedTargets || [];
        actionData.maxCount = maxCount;
        actionData.minCount = minCount;
        actionData.count = count;

        // Helper to refresh prompt based on CURRENT selection state
        const updatePrompt = () => {
            actionData.prompt = TargetingProcessor.generateTargetPrompt(
                targetDef,
                actionData.selectedTargets.length,
                (actionData.xValue !== undefined ? actionData.xValue : (actionData.stackObj?.xValue || 0)),
                actionData.isSpellCasting
            );
        };

        updatePrompt();

        if (isUndoing) {
            if (actionData.selectedTargets.length > 0) {
                const removed = actionData.selectedTargets.pop();
                updatePrompt();
                log(`Removed last target: ${removed}`);
                return true;
            } else {
                log(`Targeting cancelled.`);
                const sourceId = state.pendingAction.sourceId;
                const stackId = actionData.stackId;
                const stackObj = actionData.stackObj;

                if (stackObj && stackObj.card) {
                    const player = state.players[stackObj.controllerId];
                    if (player) {
                        stackObj.card.xValue = undefined; // Explicitly clear before move
                        ActionProcessor.moveCard(state, stackObj.card, Zone.Hand, stackObj.controllerId, log);
                        ManaProcessor.refundManaCost(player, stackObj.card.definition.manaCost);
                        log(`Refunding mana for ${stackObj.card.definition.name}: ${stackObj.card.definition.manaCost}`);
                    }
                }
                state.stack = state.stack.filter(s => s.id !== stackId);

                const sourceOnField = state.battlefield.find(o => o.id === sourceId);
                if (sourceOnField) {
                    if (sourceOnField.abilitiesUsedThisTurn > 0) sourceOnField.abilitiesUsedThisTurn--;
                    const abilityIndex = actionData.abilityIndex;
                    if (abilityIndex !== undefined) {
                        const { m21 } = require('../../data/m21');
                        const logic = m21[sourceOnField.definition.name];
                        const ability = logic?.abilities[abilityIndex];
                        const lCost = ability?.costs?.find((c: any) => c.type === 'Loyalty')?.value;
                        if (lCost !== undefined) {
                            sourceOnField.counters['Loyalty'] = (sourceOnField.counters['Loyalty'] || 0) - lCost;
                            log(`Refunding loyalty for ${sourceOnField.definition.name}: ${lCost > 0 ? '+' : ''}${lCost}`);
                        }
                    }
                }

                state.pendingAction = undefined;
                state.priorityPlayerId = playerId;
                return true;
            }
        }

        if (targetId === 'clear') {
            actionData.selectedTargets = [];
            updatePrompt();
            log(`Targeting selection cleared.`);
            return true;
        }

        if (isSkipping) {
            if (actionData.selectedTargets.length < minCount) {
                log(`Targeting is required (minimum ${minCount}), cannot finalize yet.`);
                return false;
            }
            return engine.finaliseTargeting(playerId, actionData.selectedTargets);
        }

        const validTargets = actionData.targets || [];
        if (!validTargets.includes(targetId)) {
            log(`Invalid target selected.`);
            return false;
        }

        if (actionData.selectedTargets.includes(targetId)) {
            log(`Target already selected.`);
            return false;
        }

        // Prevent adding more than the max allowed targets
        if (actionData.selectedTargets.length >= maxCount) {
            log(`Maximum targets (${maxCount}) reached. Please confirm your selection.`);
            return false;
        }

        actionData.selectedTargets = [...actionData.selectedTargets, targetId];
        updatePrompt();
        log(`Target ${actionData.selectedTargets.length}/${maxCount} selected: ${targetId}`);

        // Update legal targets for the next index if there are more targets to select
        if (actionData.selectedTargets.length < maxCount) {
            const nextIndex = actionData.selectedTargets.length;
            const currentDef = this.getDefinitionForIndex(targetDef, nextIndex);
            if (currentDef?.label) {
                state.pendingAction!.data.label = currentDef.label;
            }
            const pool = [
                ...Object.keys(state.players),
                ...state.battlefield.map((o: any) => o.id),
                ...state.exile.map((o: any) => o.id),
                ...state.stack.map((o: any) => o.id),
                ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((c: any) => c.id))
            ];
            actionData.targets = pool.filter(tid => this.isLegalTarget(state, state.pendingAction!.sourceId, tid, targetDef, nextIndex));
        }

        return true;
    }

    /**
     * CR 603: Finalize a targeting sequence and resume the effect chain.
     */
    public static finaliseTargeting(state: GameState, playerId: PlayerId, resolvedTargets: string[], engine: any): boolean {
        const actionData = state.pendingAction?.data;
        const sourceId = state.pendingAction?.sourceId;
        const abilityIndex = actionData?.abilityIndex;
        const stackObj = actionData?.stackObj;
        const stackId = actionData?.stackId;

        if (actionData?.isCostTargeting) {
            if (actionData.costType === 'Sacrifice') {
                (state as any).lastChosenSacrificeId = resolvedTargets[0];
            }
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            return engine.playCard(playerId, sourceId!, actionData.declaredTargets || [], false);
        }

        if (actionData?.nextEffectIndex !== undefined) {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            const finalTargets = (actionData.isCopyTargeting && resolvedTargets.length === 0)
                ? (actionData.originalTargets || [])
                : resolvedTargets;

            const savedTargets = [...(actionData.targets || []), ...finalTargets];
            const savedEffects = actionData.effects || [];
            const useSourceId = actionData.sourceId || sourceId!;

            if (actionData.stackId) {
                const existingObject = state.stack.find(s => s.id === actionData.stackId);
                if (existingObject) {
                    existingObject.targets = finalTargets;
                    // Persist target controller IDs
                    if (!existingObject.data) existingObject.data = {};
                    existingObject.data.targetsControllers = finalTargets.map((tid: string) => {
                        const obj = this.findObjectInAnyZone(state, tid);
                        return obj ? obj.controllerId : null;
                    });
                    engine.log(`[TARGETING] Targets confirmed for ${existingObject.type === 'TriggeredAbility' ? 'Trigger' : 'Spell'}: ${finalTargets.join(', ')}`);
                }
            }

            const { EffectProcessor } = require('./../effects/EffectProcessor');
            EffectProcessor.resolveEffects(state, savedEffects, useSourceId, savedTargets, (m: string) => engine.log(m), actionData.nextEffectIndex, stackObj, actionData.parentContext);

            // --- RESUME PARENT CONTEXTS (NESTED RESOLUTION) ---
            let currentCtx = actionData.parentContext;
            while (!state.pendingAction && currentCtx && currentCtx.effects && currentCtx.nextEffectIndex < currentCtx.effects.length) {
                engine.log(`[RESOLVING] Returning to parent context for ${useSourceId}...`);
                const pEffs = currentCtx.effects;
                const pNext = currentCtx.nextEffectIndex;
                const pSource = currentCtx.sourceId || sourceId!;
                const pTargets = currentCtx.targets || [];
                const pStackObj = currentCtx.stackObj;
                const pGrantContext = currentCtx.parentContext;

                currentCtx = pGrantContext;
                EffectProcessor.resolveEffects(state, pEffs, pSource, pTargets, (m: string) => engine.log(m), pNext, pStackObj, pGrantContext);
            }

            if (!state.pendingAction) {
                engine.resetPriorityToActivePlayer();
            }
            return true;
        }

        if (stackObj) {
            stackObj.targets = resolvedTargets;
            state.stack.push(stackObj);
            state.consecutivePasses = 0;

            engine.log(`--------------------------------------------------`);
            engine.log(`[STACK] + ${engine.getPlayerName(stackObj.controllerId)} cast/activated ${stackObj.card?.definition.name || stackObj.type}`);
            if (resolvedTargets.length > 0) {
                engine.log(`[STACK] Target(s): ${resolvedTargets.join(', ')}`);
            }
            engine.log(`--------------------------------------------------`);

            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            engine.checkAutoPass(playerId);
            return true;
        }

        if (abilityIndex !== undefined) {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            const success = engine.activateAbility(playerId, sourceId!, abilityIndex, resolvedTargets, true);
            engine.checkAutoPass(playerId);
            return success;
        } else {
            state.pendingAction = undefined;
            state.priorityPlayerId = playerId;
            const success = engine.playCard(playerId, sourceId!, resolvedTargets, true);
            engine.checkAutoPass(playerId);
            return success;
        }
    }


    /**
     * CR 114: Resolve target mapping for effects.
     */
    public static resolveTargetMapping(
        state: GameState,
        mapping: string,
        targets: string[],
        sourceId: GameObjectId,
        controllerId: PlayerId,
        stackData?: any,
        effect?: any,
        parentContext?: any
    ): string[] {
        const eventData = stackData?.eventData;

        switch (mapping) {
            case TargetMapping.Self:
            case 'SOURCE_OBJECT':
                return [sourceId];
            case TargetMapping.Controller:
                return [controllerId];
            case 'LINKED_OBJECT':
                const linkKey = effect.linkKey || 'linkedCardId';
                const lSource = state.battlefield.find((o: any) => o.id === sourceId) ||
                    (Object.values(state.players) as any[]).flatMap(p => p.graveyard).find((o: any) => o.id === sourceId) ||
                    state.exile.find((o: any) => o.id === sourceId);
                return lSource?.data?.[linkKey] ? [lSource.data[linkKey]] : [];
            case TargetMapping.EnchantedCreature:
            case 'ENCHANTED_PERMANENT': {
                const aura = state.battlefield.find(o => o.id === sourceId);
                return aura?.attachedTo ? [aura.attachedTo] : [];
            }
            case TargetMapping.LastCreatedToken:
                return (state as any).lastCreatedTokenId ? [(state as any).lastCreatedTokenId] : [];
            case TargetMapping.LastExiledIds:
                return (state as any).lastExiledIds || [];
            case 'PARENT_CONTEXT_EXILED_IDS':

                return parentContext?.exiledIds || [];
            case 'PARENT_CONTEXT_EXILED_IDS_OWNERS': {
                const ids = parentContext?.exiledIds || [];
                const owners = ids.map((id: string) => this.findObjectInAnyZone(state, id)?.ownerId).filter(Boolean) as string[];
                return [...new Set(owners)];
            }
            case 'LAST_MILLED_IDS':
                return (state as any).lastMilledIds || [];
            case 'TARGET_1': return [targets[0]];
            case 'SELF_AND_TARGET_1': return [sourceId, targets[0]];
            case 'TARGET_2': return [targets[1]];
            case 'TARGET_3': return [targets[2]];
            case 'TARGET_4': return [targets[3]];
            case 'TARGET_5': return [targets[4]];
            case 'TARGET_6': return [targets[5]];
            case 'TARGET_7': return [targets[6]];
            case 'TARGET_8': return [targets[7]];
            case 'TARGET_ALL': return targets;
            case 'MATCHING_PERMANENTS_YOU_CONTROL':
                if (!effect?.restrictions) return [];
                return state.battlefield
                    .filter(o => o.controllerId === controllerId && this.matchesRestrictions(state, o, effect.restrictions, controllerId, sourceId, undefined, stackData))
                    .map(o => o.id);
            case 'ALL_PLANESWALKERS_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'planeswalker'))
                    .map(o => o.id);
            case 'ALL_CREATURES':
                return state.battlefield
                    .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'ALL_PLANESWALKERS':
                return state.battlefield
                    .filter(o => o.definition.types.some(t => t.toLowerCase() === 'planeswalker'))
                    .map(o => o.id);
            case 'MATCHING_PERMANENTS':
            case 'ALL_MATCHING_PERMANENTS':
                if (!effect?.restrictions) return [];
                return state.battlefield
                    .filter(o => this.matchesRestrictions(state, o, effect.restrictions, controllerId, sourceId, undefined, stackData))
                    .map(o => o.id);

            case 'TRIGGER_SOURCE': {
                const eData = eventData || parentContext?.eventData || (stackData as any)?.eventData;
                return eData?.sourceId ? [eData.sourceId] : (stackData?.sourceId ? [stackData.sourceId] : []);
            }
            case 'TRIGGER_TARGET': {
                const eData = eventData || parentContext?.eventData || (stackData as any)?.eventData;
                return eData?.targetId ? [eData.targetId] : (stackData?.targetId ? [stackData.targetId] : []);
            }
            case 'EVENT_TARGET': {
                const eData = eventData || parentContext?.eventData || (stackData as any)?.eventData;
                return eData?.object?.id ? [eData.object.id] : (eData?.targetId ? [eData.targetId] : []);
            }
            case 'EVENT_PLAYER': {
                const eData = eventData || parentContext?.eventData || (stackData as any)?.eventData;
                return eData?.playerId ? [eData.playerId] : [];
            }
            case 'EVENT_OBJECT_CONTROLLER': {
                const eData = eventData || parentContext?.eventData || (stackData as any)?.eventData;
                const obj = eData?.object || eData?.card || (eData as any)?.gameObject;
                return obj?.controllerId ? [obj.controllerId] : [];
            }
            case 'TARGET_1_CONTROLLER': {
                const targetId = targets[0];
                // Check if we have persisted controller information first
                if (stackData?.targetsControllers && stackData.targetsControllers[0]) {
                    return [stackData.targetsControllers[0]];
                }
                if (state.players[targetId as PlayerId]) return [targetId];
                const obj = state.battlefield.find(o => o.id === targetId) ||
                    state.stack.find(s => s.id === targetId || s.card?.id === targetId || (s as any).targetId === targetId) ||
                    Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === targetId) ||
                    state.exile.find(o => o.id === targetId);
                return obj ? [obj.controllerId] : [];
            }
            case 'TRIGGER_TARGET_CONTROLLER': {
                const tId = eventData?.targetId || (stackData?.data?.eventData?.targetId);
                const obj = state.battlefield.find(o => o.id === tId) ||
                    (Object.values(state.players) as any[]).flatMap(p => p.graveyard).find((o: any) => o.id === tId);
                return obj ? [obj.controllerId] : [];
            }
            case 'ALL_CREATURES_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'OTHER_CREATURES_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.id !== sourceId && o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'OTHER_SPIRITS_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.id !== sourceId && o.controllerId === controllerId && o.definition.subtypes?.some(t => t.toLowerCase() === 'spirit'))
                    .map(o => o.id);
            case 'ALL_PERMANENTS_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.controllerId === controllerId)
                    .map(o => o.id);
            case 'ALL_FRACTALS_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.controllerId === controllerId && o.definition.subtypes?.some(s => s.toLowerCase() === 'fractal'))
                    .map(o => o.id);
            case 'OTHER_CREATURES':
            case 'ALL_OTHER_CREATURES':
                return state.battlefield
                    .filter(o => o.id !== sourceId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'ALL_CREATURES_WITHOUT_FLYING':

                return state.battlefield
                    .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature') && !LayerProcessor.hasKeyword(o, state, 'Flying'))
                    .map(o => o.id);
            case 'EACH_CREATURE_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'OPPONENT':
            case 'OPPONENTS':
            case 'EACH_OPPONENT':
                return Object.keys(state.players).filter(pid => pid !== controllerId);
            case 'OPPONENT_1':
            case 'TARGET_OPPONENT':
                return [Object.keys(state.players).filter(pid => pid !== controllerId)[0]];
            case 'EACH_OPPONENT_CREATURE':
                return state.battlefield
                    .filter(o => o.controllerId !== controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'EACH_PLAYER':
                return Object.keys(state.players);
            case 'ALL_CREATURES_CONTROLLED_BY_TARGET_1': {
                const targetPlayerId = targets[0] as PlayerId;
                if (!targetPlayerId) return [];
                return state.battlefield
                    .filter(o => o.controllerId === targetPlayerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            }
            case 'SELECTED_CARD':
                return [targets[0]];
            case 'LAST_CREATED_TOKEN':
                return (state as any).lastCreatedTokenId ? [(state as any).lastCreatedTokenId] : [];
            case 'CONTROLLER_GRAVEYARD':
                const cp = state.players[controllerId];
                return cp ? cp.graveyard.map(c => c.id) : [];
            case 'CONTROLLER_GRAVEYARD_AND_LIBRARY':
                const pc = state.players[controllerId];
                return pc ? [...pc.graveyard.map(c => c.id), ...pc.library.map(c => c.id)] : [];
            case 'LAST_EXILED_OBJECT':
                return (state as any).lastExiledIds || [];
            case 'LAST_DISCARDED_CARDS':
                return state.turnState.lastDiscardedIds || [];
            case 'ALL_PLAYERS':
                return Object.keys(state.players);
            case 'ANY_TARGET':
                return targets;
            case 'OTHER_CREATURES_AND_PLANESWALKERS':
                const chosenId = targets[0];
                return state.battlefield
                    .filter(o => o.id !== chosenId && (o.definition.types.some(t => t.toLowerCase() === 'creature') || o.definition.types.some(t => t.toLowerCase() === 'planeswalker')))
                    .map(o => o.id);
            case 'ALL_CREATURES_AND_PLANESWALKERS':
                return state.battlefield
                    .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature') || o.definition.types.some(t => t.toLowerCase() === 'planeswalker'))
                    .map(o => o.id);
            case 'ALL_CREATURES':
                return state.battlefield
                    .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'ALL_PLANESWALKERS':
                return state.battlefield
                    .filter(o => o.definition.types.some(t => t.toLowerCase() === 'planeswalker'))
                    .map(o => o.id);
            case 'ALL_PLANESWALKERS_YOU_CONTROL':

                return state.battlefield
                    .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'planeswalker'))
                    .map(o => o.id);
            case 'OTHER_PLANESWALKERS_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.id !== sourceId && o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'planeswalker'))
                    .map(o => o.id);
            case 'TARGET_1_HIGHEST_MV_CREATURE_PLANESWALKER': {
                const targetPlayerId = targets[0];
                const candidates = state.battlefield.filter(o =>
                    o.controllerId === targetPlayerId &&
                    (o.definition.types.some(t => t.toLowerCase() === 'creature') || o.definition.types.some(t => t.toLowerCase() === 'planeswalker'))
                );
                if (candidates.length === 0) return [];
                const mvs = candidates.map(o => ManaProcessor.getManaValue(o.definition.manaCost || ''));
                const maxMV = Math.max(...mvs);
                return candidates.filter(o => ManaProcessor.getManaValue(o.definition.manaCost || '') === maxMV).map(o => o.id);
            }
            case 'EVENT_OBJECT':
                return eventData?.object?.id ? [eventData.object.id] : [];
            case 'EXILED_CARD': {
                // Return the ID of the object that was just exiled by this effect chain
                return parentContext?.exiledIds || [];
            }
            case 'MATCHING_CARDS': {
                if (!effect?.restrictions) return [];
                const pool = [
                    ...state.battlefield.map((o: any) => o.id),
                    ...state.exile.map((o: any) => o.id),
                    ...(Object.values(state.players) as any[]).flatMap(p => [...p.hand, ...p.graveyard, ...p.library]).map((c: any) => c.id)
                ];
                return pool.filter(tid => {
                    const obj = this.findObjectInAnyZone(state, tid);
                    return obj && this.matchesRestrictions(state, obj, effect.restrictions, controllerId, sourceId);
                });
            }
            case 'REMAINDER_OF_POOL':
            case 'REMAINDER_OF_LOOKING_CARDS': {
                const pool = (parentContext?.lookingCards || stackData?.lookingCards || state.pendingAction?.data?.lookingCards || []) as GameObject[];
                // A card is part of the 'remainder' if it is still in the library (or exile if that's where we look from)
                // whereas selected cards will have been moved to Hand/Battlefield by now.
                return pool.filter(c => c.zone === Zone.Library || c.zone === Zone.Exile).map(c => c.id);
            }
            default:
                return [];
        }
    }

    public static getDefinitionForIndex(targetDef: any, targetIndex: number): any {
        if (!Array.isArray(targetDef)) return targetDef;
        let cumulative = 0;
        for (const def of targetDef) {
            const count = typeof def.count === 'number' ? def.count : 1;
            if (targetIndex >= cumulative && targetIndex < cumulative + count) {
                return def;
            }
            cumulative += count;
        }
        return targetDef[targetDef.length - 1];
    }
}

