import { GameState, GameObject, Zone, PlayerId, GameObjectId, AbilityType, DurationType } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { ActionProcessor } from './ActionProcessor';

/**
 * Rules Engine Module: Targeting (Rule 115)
 * Centralizes all targeting validation, mapping, and interactive flow.
 */
export class TargetingProcessor {

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

        // 3. Hands & Graveyards
        for (const p of (Object.values(state.players) as any[])) {
            const h = p.hand.find((o: any) => o.id === id);
            if (h) return h;
            const g = p.graveyard.find((o: any) => o.id === id);
            if (g) return g;
            const l = p.library.find((o: any) => o.id === id);
            if (l) return l;
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

        // 1. If target is a player
        if (state.players[targetId]) {
            const type = (abilityTargetDef?.type || '').toLowerCase();
            const restrictions = (abilityTargetDef?.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);

            if (type === 'player' || type === 'anytarget' || restrictions.includes('player') || restrictions.includes('anytarget')) {
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

                if (restrictions.includes('opponent')) {
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
            }
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

        const typeLineCheck = (abilityTargetDef?.type || '').toLowerCase();
        const isPlayerTargetOnly = typeLineCheck === 'player';
        if (isPlayerTargetOnly) return false;

        const coreTypes = [
            'creature', 'artifact', 'land', 'enchantment', 'planeswalker', 'permanent', 
            'instant', 'sorcery', 'instant_or_sorcery', 'artifact_or_creature', 
            'artifact_or_enchantment', 'creature_or_planeswalker', 'nonland_permanent'
        ];
        
        if (typeLineCheck === 'anytarget' || coreTypes.includes(typeLineCheck)) {
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
            } else if (typeLineCheck === 'instant_or_sorcery') {
                if (!combinedTypes.includes('instant') && !combinedTypes.includes('sorcery')) return false;
            } else if (typeLineCheck === 'artifact_or_creature') {
                if (!combinedTypes.includes('artifact') && !combinedTypes.includes('creature')) return false;
            } else if (typeLineCheck === 'artifact_or_enchantment') {
                if (!combinedTypes.includes('artifact') && !combinedTypes.includes('enchantment')) return false;
            } else if (typeLineCheck === 'creature_or_planeswalker') {
                if (!combinedTypes.includes('creature') && !combinedTypes.includes('planeswalker')) return false;
            } else if (typeLineCheck === 'nonland_permanent') {
                const permTypes = ['artifact', 'creature', 'enchantment', 'planeswalker'];
                if (!combinedTypes.some(t => permTypes.includes(t))) return false;
            } else {
                if (!combinedTypes.includes(typeLineCheck)) return false;
            }
        }

        let expectedZone = abilityTargetDef?.zone;
        if (!expectedZone) {
            if (targetZone === Zone.Stack) expectedZone = Zone.Stack;
            else if (['instant', 'sorcery', 'instant_or_sorcery'].includes(typeLineCheck)) expectedZone = Zone.Stack;
            else if (abilityTargetDef?.type === 'CardInGraveyard' || String(abilityTargetDef?.type).toLowerCase() === 'cardingraveyard') expectedZone = Zone.Graveyard;
            else if (abilityTargetDef?.restrictions?.some((r: any) => typeof r === 'string' && r.toLowerCase() === 'graveyard')) expectedZone = Zone.Graveyard;
            else expectedZone = Zone.Battlefield;
        }

        if (expectedZone !== 'Any' && targetZone !== expectedZone) {
            return false;
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

        let targetDef = abilityTargetDef || sourceStack?.data?.targetDefinition || (sourceStack as any)?.targetDefinition;

        // If no target definition provided (common in SBAs checking Auras), try to find the Enchant restriction
        if (!targetDef && source) {
            const types = source.definition.types.map((t: string) => t.toLowerCase());
            const subtypes = (source.definition.subtypes || []).map((s: string) => s.toLowerCase());
            const { oracle } = require('./../../OracleLogicMap');
            if (types.includes('enchantment') && subtypes.includes('aura')) {
                const logic = oracle.getCard(source.definition.name);
                targetDef = (logic as any)?.targetDefinition || (logic as any)?.enchant;
            }
        }

        let restrictions = targetDef?.restrictions;
        if (targetDef?.perTargetRestrictions && targetDef.perTargetRestrictions[targetIndex]) {
            restrictions = targetDef.perTargetRestrictions[targetIndex];
        }

        if (restrictions) {
            return this.matchesRestrictions(state, targetObj, restrictions, sourceControllerId, sourceId);
        }

        return true;
    }

    /**
     * Evaluates a set of restrictions against a target object or player.
     */
    public static hasLegalTargets(state: GameState, sourceId: string, targetDef: any, controllerId: string): boolean {
        if (!targetDef || targetDef.optional) return true;

        const count = targetDef.count || 1;
        const minCount = targetDef.minCount !== undefined ? targetDef.minCount : count;
        if (minCount === 0) return true;

        const perTarget = targetDef.perTargetRestrictions;

        // Collect all potential targetable IDs
        const allPotentialTargets = [
            ...Object.keys(state.players),
            ...state.battlefield.map((o: any) => o.id),
            ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((o: any) => o.id)),
            ...state.exile.map(o => o.id),
            ...state.stack.map(o => o.id)
        ];

        if (!perTarget) {
            const legalTargets = allPotentialTargets.filter(tid => this.isLegalTarget(state, sourceId, tid, targetDef, 0));
            if (legalTargets.length < minCount) {
                console.log(`[TARGET-DEBUG] hasLegalTargets FAILED for ${sourceId}. Found: ${legalTargets.length}, Required: ${minCount}. DEF:`, JSON.stringify(targetDef));
            }
            return legalTargets.length >= minCount;
        }

        // Heterogeneous targets (e.g. Primal Might: 1 you control, 1 you don't)
        // We need to find if there's a valid assignment of distinct targets to each slot.
        // For correctness with minCount, we check if we can satisfy at least the first 'minCount' slots.

        const legalPerIndex: string[][] = [];
        for (let i = 0; i < count; i++) {
            const legal = allPotentialTargets.filter(tid => this.isLegalTarget(state, sourceId, tid, targetDef, i));
            if (i < minCount && legal.length === 0) return false; // Mandatory slot i has no candidates
            legalPerIndex.push(legal);
        }

        // Distinctness check (Simulating a simple bipartite matching)
        // For efficiency in common MTG cases (minCount=1, count=2), we just need to ensure slot 0 is filled.
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
    public static matchesRestrictions(state: GameState, targetObj: any, restrictions: any[], controllerId: string | null, sourceId: string): boolean {
        if (!targetObj) return false;

        // Extract definition: either direct (GameObject) or from card property (Stack Spell)
        const definition = targetObj.definition || targetObj.card?.definition;

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
        const isAlternative = (r: any) => typeof r === 'object' || (typeof r === 'string' && (baseTypes.includes(r.toLowerCase()) || r.toLowerCase().includes('_or_')));

        for (const r of restrictions) {
            if (typeof r !== 'string' || isAlternative(r)) continue;
            const lr = r.toLowerCase();

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
                if (zone !== Zone.Hand && lastZone !== Zone.Hand) return false;
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

            const isKnownFilter = [
                'nonland', 'noncreature', 'nonartifact', 'nonenchantment', 'nonplaneswalker',
                'graveyard', 'other', 'another', 'notcontrolled', 'opponentcontrol', 'youcontrol', 'self', 'legendary',
                'tapped', 'untapped', 'yours', 'opponents', 'attackingorblocking', 'basic',
                'instantorsorcerycastthisturn', 'player', 'anytarget', 'creature', 'artifact', 'land', 'enchantment', 'planeswalker', 
                'instant', 'sorcery', 'hasxinmanacost', 'monocolored', 'multicolored', 'colorless'
            ].includes(lr) || lr.startsWith('cmc') || lr.startsWith('mv') || lr.startsWith('power') || lr.startsWith('toughness') || lr.startsWith('hascounter');

            if (['monocolored', 'multicolored', 'colorless'].includes(lr)) {
                if (!this.sourceHasQualities(targetObj, [lr], state)) return false;
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

        const alternatives = restrictions.filter(r => isAlternative(r));
        if (alternatives.length > 0) {
            return alternatives.some(r => {
                if (typeof r === 'string') {
                    const lr = r.toLowerCase();
                    if (lr === 'card') return true;
                    if (lr === 'instant_or_sorcery') {
                        return objTypes.includes('instant') || objTypes.includes('sorcery');
                    }
                    if (lr === 'permanent') {
                        const permTypes = ['artifact', 'creature', 'enchantment', 'land', 'planeswalker'];
                        return objTypes.some((t: string) => permTypes.includes(t.toLowerCase()));
                    }
                    if (lr === 'artifact_or_creature') {
                        return objTypes.includes('artifact') || objTypes.includes('creature');
                    }
                    if (lr === 'artifact_or_enchantment') {
                        return objTypes.includes('artifact') || objTypes.includes('enchantment');
                    }
                    if (lr === 'creature_or_planeswalker') {
                        return objTypes.includes('creature') || objTypes.includes('planeswalker');
                    }
                    if (lr === 'nonland_permanent') {
                        const permTypes = ['artifact', 'creature', 'enchantment', 'planeswalker'];
                        return objTypes.some((t: string) => permTypes.includes(t.toLowerCase()));
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
                    let match = true;
                    const rTypes = r.types || (r.type ? [r.type] : []);
                    const rSubtypes = r.subtypes || (r.subtype ? [r.subtype] : []);

                    if (rTypes.length > 0 && !rTypes.some((t: string) => objTypes.includes(t.toLowerCase()))) match = false;
                    if (rSubtypes.length > 0 && !rSubtypes.some((s: string) => (definition.subtypes || []).some((ts: string) => ts.toLowerCase() === s.toLowerCase()))) match = false;
                    if (r.nameIncludes && definition.name && !definition.name.toLowerCase().includes(r.nameIncludes.toLowerCase())) match = false;
                    if (r.nameEquals || r.name) {
                        const targetName = definition?.name || targetObj.name;
                        const filterName = r.nameEquals || r.name || "";
                        if (!targetName || targetName.toLowerCase() !== filterName.toLowerCase()) match = false;
                    }
                    if (r.hasxinmanacost && !definition.manaCost?.includes('X')) match = false;
                    if (r.type === 'ManaValue' || r.type === 'MV' || r.type === 'ManaValueLe') {
                        const mv = ManaProcessor.getManaValue(definition.manaCost || '');
                        let val = r.value;
                        if (val === 'X') {
                            val = (state.stack.find(s => s.id === sourceId || s.sourceId === sourceId)?.xValue ||
                                ((state.pendingAction as any)?.sourceId === sourceId ? (state.pendingAction as any)?.xValue : 0));
                        } else if (val === 'GAINED_LIFE_AMOUNT') {
                            val = state.turnState.lifeGainedThisTurn[controllerId || ''] || 0;
                        } else if (val === 'CONVERGE_AMOUNT') {
                            const sourceObj = this.findObjectInAnyZone(state, sourceId);
                            val = (sourceObj as any)?.convergeAmount || 0;
                        }
                        
                        const comp = r.type === 'ManaValueLe' ? 'LessOrEqual' : (r.comparison || 'Equal');
                        if (comp === 'LessOrEqual' && mv > val) match = false;
                        if (comp === 'GreaterOrEqual' && mv < val) match = false;
                        if (comp === 'Equal' && mv !== val) match = false;
                        if (comp === 'LessThan' && mv >= val) match = false;
                        if (comp === 'GreaterThan' && mv <= val) match = false;
                    }
                    return match;
                }
            });
        }
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

        let targetCount = targetDef?.count;
        if (targetCount === 'X') {
            targetCount = actionData.xValue !== undefined ? actionData.xValue : (actionData.stackObj?.xValue || 0);
        }
        targetCount = targetCount || 1;

        let maxCount = targetDef?.maxCount || targetCount;
        if (maxCount === 'X') {
            maxCount = actionData.xValue !== undefined ? actionData.xValue : (actionData.stackObj?.xValue || 0);
        }

        let minCount = targetDef?.minCount !== undefined ? targetDef.minCount : targetCount;
        if (minCount === 'X') {
            minCount = actionData.xValue !== undefined ? actionData.xValue : (actionData.stackObj?.xValue || 0);
        }

        actionData.selectedTargets = actionData.selectedTargets || [];

        if (isUndoing) {
            if (actionData.selectedTargets.length > 0) {
                const removed = actionData.selectedTargets.pop();
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
        log(`Target ${actionData.selectedTargets.length}/${maxCount} selected: ${targetId}`);

        // Update legal targets for the next index if there are more targets to select
        if (actionData.selectedTargets.length < maxCount) {
            const nextIndex = actionData.selectedTargets.length;
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
            case 'SELF':
            case 'SOURCE_OBJECT':
                return [sourceId];
            case 'CONTROLLER':
                return [controllerId];
            case 'LINKED_OBJECT':
                const linkKey = effect.linkKey || 'linkedCardId';
                const lSource = state.battlefield.find((o: any) => o.id === sourceId) ||
                    (Object.values(state.players) as any[]).flatMap(p => p.graveyard).find((o: any) => o.id === sourceId) ||
                    state.exile.find((o: any) => o.id === sourceId);
                return lSource?.data?.[linkKey] ? [lSource.data[linkKey]] : [];
            case 'ENCHANTED_CREATURE':
            case 'ENCHANTED_PERMANENT': {
                const aura = state.battlefield.find(o => o.id === sourceId);
                return aura?.attachedTo ? [aura.attachedTo] : [];
            }
            case 'LAST_CREATED_TOKEN':
                return (state as any).lastCreatedTokenId ? [(state as any).lastCreatedTokenId] : [];
            case 'LAST_EXILED_IDS':
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
                    .filter(o => o.controllerId === controllerId && this.matchesRestrictions(state, o, effect.restrictions, controllerId, sourceId))
                    .map(o => o.id);
            case 'MATCHING_PERMANENTS':
                if (!effect?.restrictions) return [];
                return state.battlefield
                    .filter(o => this.matchesRestrictions(state, o, effect.restrictions, controllerId, sourceId))
                    .map(o => o.id);
            case 'TRIGGER_SOURCE':
                return eventData?.sourceId ? [eventData.sourceId] : (stackData?.sourceId ? [stackData.sourceId] : []);
            case 'TRIGGER_TARGET':
                return eventData?.targetId ? [eventData.targetId] : (stackData?.targetId ? [stackData.targetId] : []);
            case 'EVENT_TARGET':
                return eventData?.object?.id ? [eventData.object.id] : (eventData?.targetId ? [eventData.targetId] : []);
            case 'EVENT_PLAYER':
                return eventData?.playerId ? [eventData.playerId] : [];
            case 'TARGET_1_CONTROLLER': {
                const targetId = targets[0];
                const obj = state.battlefield.find(o => o.id === targetId) ||
                    state.stack.find(s => s.id === targetId || s.card?.id === targetId) ||
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
            case 'ALL_CREATURES':
                return state.battlefield
                    .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature'))
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
            case 'ALL_CREATURES_CONTROLLED_BY_TARGET_1':
                const targetPlayerId = targets[0];
                return state.battlefield
                    .filter(o => o.controllerId === targetPlayerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
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
            default:
                return [];
        }
    }
}
