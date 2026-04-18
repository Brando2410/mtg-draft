import { GameObject, GameObjectId, GameState, PlayerId, Zone, TargetType, TargetMapping } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { TargetMapper } from './TargetMapper';

export class TargetValidator {

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

        // 5. Limbo (Zone.None)
        const lb = (state as any).limbo?.find((o: any) => o.id === id);
        if (lb) return lb;

        return null;
    }

    /**
     * CR 608.2b: Checks if a target is still legal as a spell or ability attempts to resolve.
     * Also used during the casting process (CR 601.2c).
     */
    public static isLegalTarget(state: GameState, sourceOrId: string | any, targetId: string, abilityTargetDef?: any, targetIndex: number = 0): boolean {
        const sourceId = typeof sourceOrId === 'string' ? sourceOrId : (sourceOrId as any).sourceId || (sourceOrId as any).id;
        const sourceObjProvided = typeof sourceOrId === 'string' ? null : sourceOrId;

        const targetDefForIndex = TargetMapper.getDefinitionForIndex(abilityTargetDef, targetIndex);

        // 1. If target is a player
        if (state.players[targetId]) {
            const type = (targetDefForIndex?.type || '').toLowerCase();
            const restrictions = (targetDefForIndex?.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);

            if (type === TargetType.Player.toLowerCase() ||
                type === TargetType.Opponent.toLowerCase() ||
                type === TargetType.AnyTarget.toLowerCase() ||
                type === TargetType.PlayerOrPlaneswalker.toLowerCase() ||
                restrictions.includes('player') ||
                restrictions.includes('anytarget')) {

                let sourceControllerId = (sourceOrId as any)?.controllerId ||
                    (sourceOrId as any)?.ownerId ||
                    state.stack.find(s => s.id === sourceId || s.sourceId === sourceId)?.controllerId ||
                    state.battlefield.find(o => o.id === sourceId)?.controllerId;

                if (!sourceControllerId) {
                    for (const pId in state.players) {
                        const player = state.players[pId as PlayerId];
                        const isInZone = player.hand.some(c => c.id === sourceId) ||
                            player.graveyard.some(c => c.id === sourceId) ||
                            player.library.some(c => c.id === sourceId);
                        if (isInZone) {
                            sourceControllerId = pId;
                            break;
                        }
                    }
                    if (!sourceControllerId) {
                        const exiled = state.exile.find(o => o.id === sourceId);
                        if (exiled) {
                            sourceControllerId = exiled.controllerId || exiled.ownerId;
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
            'artifact_or_enchantment', 'artifactorenchantment', 'creature_or_planeswalker', 'creatureorplaneswalker',
            'nonland_permanent', 'nonlandpermanent', 'non_land_permanent', 'nonland', 'player_or_planeswalker',
            'artifact_enchantment_or_planeswalker', 'artifactenchantmentorplaneswalker'
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
                const isValidAnyTarget = combinedTypes.some((t: string) => t === 'creature' || t === 'planeswalker') || targetZone === Zone.Stack;
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
            } else if (typeLineCheck === 'artifact_enchantment_or_planeswalker' || typeLineCheck === 'artifactenchantmentorplaneswalker') {
                if (!combinedTypes.includes('artifact') && !combinedTypes.includes('enchantment') && !combinedTypes.includes('planeswalker')) return false;
            } else if (typeLineCheck === 'creature_or_planeswalker' || typeLineCheck === 'creatureorplaneswalker') {
                if (!combinedTypes.includes('creature') && !combinedTypes.includes('planeswalker')) return false;
            } else if (typeLineCheck === 'nonland_permanent' || typeLineCheck === 'nonlandpermanent' || typeLineCheck === 'non_land_permanent' || typeLineCheck === 'nonland') {
                if (targetZone !== Zone.Battlefield) return false;
                if (combinedTypes.includes('land')) return false;
                // A permanent is any object on the battlefield. If it's not a land, it matches.
                const permTypes = ['artifact', 'creature', 'enchantment', 'planeswalker', 'permanent'];
                if (!combinedTypes.some(t => permTypes.includes(t)) && combinedTypes.length > 0) return false;
            } else if (typeLineCheck === 'player_or_planeswalker') {
                if (!combinedTypes.includes('planeswalker')) return false;
            } else {
                if (!combinedTypes.includes(typeLineCheck)) return false;
            }
        }

        let expectedZone = targetDefForIndex?.zone;
        if (!expectedZone) {
            if (targetZone === Zone.Stack) expectedZone = Zone.Stack;
            else if (['instant', 'sorcery', 'instant_or_sorcery', 'spell_on_stack', 'spellonstack', 'spell'].includes(typeLineCheck)) expectedZone = Zone.Stack;
            else if (['card_in_graveyard', 'cardingraveyard'].includes(typeLineCheck)) expectedZone = Zone.Graveyard;
            else if (['card_in_hand', 'cardinhand'].includes(typeLineCheck)) expectedZone = Zone.Hand;
            else if (targetDefForIndex?.restrictions?.some((r: any) => typeof r === 'string' && ['graveyard', 'in_graveyard'].includes(r.toLowerCase()))) expectedZone = Zone.Graveyard;
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

            // Handle abilities on the stack (which don't have a Card definition)
            if (targetObj.type === 'TriggeredAbility' || targetObj.type === 'ActivatedAbility' || targetObj.type === 'Spell') {
                const isAbility = targetObj.type.includes('Ability');
                return restrictions.some(r => {
                    const rType = (typeof r === 'string' ? r : (r.type || '')).toLowerCase();
                    const rValue = (typeof r === 'string' ? '' : (r.value || '')).toLowerCase();

                    if (rType === 'type' && rValue === 'ability' && isAbility) return true;
                    if (rType === 'ability' || rValue === 'ability') return isAbility;
                    if (rType === 'spell' || rValue === 'spell') return targetObj.type === 'Spell';
                    return false;
                });
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
                if (base === 'token' && targetObj.isToken) return false;
            }
            if (lr === 'token' && !targetObj.isToken) return false;
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
            if (lr === 'youcontrol' || lr === 'yours') {
                if (controllerId && (targetObj.controllerId || targetObj.ownerId) !== controllerId) return false;
            }
            if (lr.startsWith('controlled_by_target_')) {
                const targetIdx = parseInt(lr.substring(21)) - 1;
                const targetList = stackObject?.targets || [];
                const targetId = targetList[targetIdx];
                if (targetId && targetObj.controllerId !== targetId) return false;
            }
            if (lr === 'opponentcontrol' && controllerId && (targetObj.controllerId || targetObj.ownerId) === controllerId) return false;
            if (lr === 'legendary' && !objTypes.includes('legendary')) return false;
            if (lr === 'basic' && !objTypes.includes('basic')) return false;
            if (lr === 'self' && targetObj.id !== sourceId) return false;
            if (lr === 'tapped' && !targetObj.isTapped) return false;
            if (lr === 'untapped' && targetObj.isTapped) return false;
            if (lr === 'opponents' || lr === 'opponentcontrol') {
                if (controllerId && (targetObj.controllerId || targetObj.ownerId) === controllerId) return false;
            }

            if (lr === 'fromhand' || lr === 'castfromhand') {
                const zone = targetObj.zone || targetObj.card?.zone;
                const lastZone = targetObj.lastNonStackZone || targetObj.card?.lastNonStackZone;
                const match = zone === Zone.Hand || lastZone === Zone.Hand;
                if (log) log(`[DEBUG] matchesRestrictions: ${definition?.name || targetObj.name} is ${match ? 'MATCHED' : 'NOT MATCHED'} by fromhand (Zone=${zone}, Last=${lastZone})`);
                if (!match) return false;
                continue;
            }

            if (lr === 'mv_le_power' && sourceId) {
                const source = state.battlefield.find(o => o.id === sourceId);
                const sourcePower = source ? LayerProcessor.getEffectiveStats(source, state).power : 0;
                const targetMV = ManaProcessor.getManaValue(targetObj.definition.manaCost || '');
                if (targetMV > sourcePower) return false;
            }


            const numericMatch = lr.match(/^(cmc|mv|power|toughness)\s*(<=|>=|==|=|<|>)\s*(\d+|x|power|source_power|source_mv|source_cmc|converge_amount)$/);
            if (numericMatch) {
                const [, field, op, valPart] = numericMatch;
                let val = 0;
                if (valPart.match(/^\d+$/)) {
                    val = parseInt(valPart);
                } else if (valPart === 'x') {
                    val = stackObject?.xValue || (state.pendingAction as any)?.data?.xValue || (state.pendingAction as any)?.xValue || 0;
                } else if (valPart === 'power' || valPart === 'source_power') {
                    const source = this.findObjectInAnyZone(state, sourceId);
                    val = source ? LayerProcessor.getEffectiveStats(source, state).power : 0;
                } else if (valPart === 'source_mv' || valPart === 'source_cmc') {
                    const source = this.findObjectInAnyZone(state, sourceId);
                    val = source ? ManaProcessor.getManaValue(source.definition.manaCost || '') : 0;
                } else if (valPart === 'converge_amount') {
                    const source = this.findObjectInAnyZone(state, sourceId);
                    val = (source as any)?.convergeAmount || 0;
                }

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

            if (lr === 'shares_color_with_source') {
                const source = this.findObjectInAnyZone(state, sourceId);
                if (source) {
                    const sourceColors = source.definition.colors || [];
                    const targetColors = targetObj.definition.colors || [];
                    if (!sourceColors.some(c => targetColors.includes(c))) return false;
                }
                continue;
            }

            const isKnownFilter = [
                'nonland', 'noncreature', 'nonartifact', 'nonenchantment', 'nonplaneswalker',
                'graveyard', 'other', 'another', 'notcontrolled', 'opponentcontrol', 'youcontrol', 'self', 'legendary',
                'tapped', 'untapped', 'yours', 'opponents', 'attackingorblocking', 'basic',
                'instantorsorcerycastthisturn', 'player', 'anytarget', 'creature', 'artifact', 'land', 'enchantment', 'planeswalker',
                'instant', 'sorcery', 'hasxinmanacost', 'monocolored', 'multicolored', 'colorless', 'oneormorecolors',
                'fromhand', 'castfromhand', 'nontoken', 'token', 'mv_le_power', 'mv_le_x', 'shares_color_with_source', 'spell_or_permanent',
                'nonlandpermanent', 'non_land_permanent'
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
                        if (lr === 'nonland_permanent' || lr === 'nonlandpermanent' || lr === 'non_land_permanent' || lr === 'nonland') {
                            if (objTypes.includes('land')) return false;
                            const permTypes = ['artifact', 'creature', 'enchantment', 'planeswalker', 'permanent'];
                            return objTypes.some((t: string) => permTypes.includes(t.toLowerCase()));
                        }
                        if (lr === 'spell_or_permanent' || lr === 'spellorpermanent') {
                            const permTypes = ['artifact', 'creature', 'enchantment', 'land', 'planeswalker'];
                            const isSpell = objTypes.includes('instant') || objTypes.includes('sorcery') || (targetObj as any).isOnStack;
                            const isPermanent = objTypes.some((t: string) => permTypes.includes(t.toLowerCase())) && targetObj.zone === Zone.Battlefield;
                            return isSpell || isPermanent;
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

                        // Normalized extraction of type/value
                        const restrictionType = (r.type || "").toLowerCase();
                        const restrictionValue = r.value !== undefined ? String(r.value) : null;

                        const rTypes = r.types || (restrictionType === 'type' && restrictionValue ? [restrictionValue] : (r.type ? [r.type] : []));
                        const rSubtypes = r.subtypes || (restrictionType === 'subtype' && restrictionValue ? [restrictionValue] : (r.subtype ? [r.subtype] : []));


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

                        // --- SOS: Handle Control Restriction Objects ---
                        if (restrictionType === 'control' && restrictionValue) {
                            const lValue = restrictionValue.toLowerCase();
                            if (lValue === 'youcontrol' && controllerId && targetObj.controllerId !== controllerId) match = false;
                            if (lValue === 'opponentcontrol' && controllerId && (targetObj.controllerId || targetObj.ownerId) === controllerId) match = false;
                            if (lValue === 'notcontrolled' && controllerId && targetObj.controllerId === controllerId) match = false;
                            if (lValue === 'yours' && controllerId && targetObj.controllerId !== controllerId) match = false;
                            if (lValue === 'opponents' && controllerId && (targetObj.controllerId || targetObj.ownerId) === controllerId) match = false;
                        }

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
                            } else if (val === 'SOURCE_POWER') {
                                const source = this.findObjectInAnyZone(state, sourceId);
                                val = source ? (source.effectiveStats?.power || 0) : 0;
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
        const sourceSupertypes = (definition.supertypes || []).map((t: string) => t.toLowerCase());

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
            const matchesSupertype = sourceSupertypes.includes(lowerQ) || sourceSupertypes.includes(singularQ);
            const matchesColor = sourceColors.includes(lowerQ) || sourceColors.includes(singularQ);
            return matchesType || matchesSubtype || matchesSupertype || matchesColor;
        });
    }
}
