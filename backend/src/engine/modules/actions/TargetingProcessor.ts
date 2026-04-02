import { GameState, GameObject, Zone, PlayerId, GameObjectId, AbilityType, DurationType } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';

/**
 * Rules Engine Module: Targeting (Rule 115)
 * Centralizes all targeting validation, mapping, and interactive flow.
 */
export class TargetingProcessor {

    /**
     * CR 608.2b: Checks if a target is still legal as a spell or ability attempts to resolve.
     * Also used during the casting process (CR 601.2c).
     */
    public static isLegalTarget(state: GameState, sourceOrId: string | any, targetId: string, abilityTargetDef?: any): boolean {
        const sourceId = typeof sourceOrId === 'string' ? sourceOrId : (sourceOrId as any).sourceId || (sourceOrId as any).id;
        const sourceObjProvided = typeof sourceOrId === 'string' ? null : sourceOrId;

        // 1. If target is a player
        if (state.players[targetId]) {
            const type = (abilityTargetDef?.type || '').toLowerCase();
            const restrictions = (abilityTargetDef?.restrictions || []).map((r: string) => r.toLowerCase());

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

        let expectedZone = abilityTargetDef?.zone;
        if (!expectedZone) {
            if (targetZone === Zone.Stack) expectedZone = Zone.Stack;
            else if (abilityTargetDef?.type === 'CardInGraveyard') expectedZone = Zone.Graveyard;
            else if (abilityTargetDef?.restrictions?.some((r: string) => r.toLowerCase() === 'graveyard')) expectedZone = Zone.Graveyard;
            else expectedZone = Zone.Battlefield;
        }

        if (expectedZone !== 'Any' && targetZone !== expectedZone) {
            return false;
        }

        const sourceStack = state.stack.find(s => s.id === sourceId || s.sourceId === sourceId);
        const sourceBattlefield = state.battlefield.find(o => o.id === sourceId);
        const sourceGraveyard = Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === sourceId);

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

        const keywords = LayerProcessor.getEffectiveStats(targetObj, state).keywords;

        // Protection (Rule 702.16)
        const protectionKeywords = keywords.filter(k => k.toLowerCase().startsWith('protection from'));
        for (const prot of protectionKeywords) {
            const qualityStr = prot.toLowerCase().replace('protection from ', '');
            const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
            if (source && this.sourceHasQualities(source, qualities)) return false;
        }

        // Hexproof (Rule 702.11)
        const hexproofKeywords = keywords.filter(k => k.toLowerCase().startsWith('hexproof'));
        for (const hp of hexproofKeywords) {
            if (hp.toLowerCase() === 'hexproof') {
                if (sourceControllerId && sourceControllerId !== targetObj.controllerId) return false;
            } else if (hp.toLowerCase().startsWith('hexproof from ')) {
                const qualityStr = hp.toLowerCase().replace('hexproof from ', '');
                const qualities = qualityStr.split(/[\s,]+/).filter(Boolean);
                if (sourceControllerId && sourceControllerId !== targetObj.controllerId) {
                    if (source && this.sourceHasQualities(source, qualities)) return false;
                }
            }
        }

        // Shroud (Rule 702.18)
        if (keywords.includes('Shroud')) return false;

        const targetDef = abilityTargetDef || sourceStack?.data?.targetDefinition || (sourceStack as any)?.targetDefinition;
        if (targetDef?.restrictions) {
            return this.matchesRestrictions(state, targetObj, targetDef.restrictions, sourceControllerId, sourceId);
        }

        return true;
    }

    /**
     * Evaluates a set of restrictions against a target object or player.
     */
    public static matchesRestrictions(state: GameState, targetObj: any, restrictions: any[], controllerId: string | null, sourceId: string): boolean {
        const objTypes = (targetObj.definition.types || []).map((t: string) => t.toLowerCase());
        const baseTypes = ['creature', 'planeswalker', 'land', 'artifact', 'enchantment', 'instant', 'sorcery', 'permanent', 'card'];
        const isAlternative = (r: any) => typeof r === 'object' || (typeof r === 'string' && baseTypes.includes(r.toLowerCase()));

        for (const r of restrictions) {
            if (typeof r !== 'string' || isAlternative(r)) continue;
            const lr = r.toLowerCase();

            if (lr === 'nonland' && objTypes.includes('land')) return false;
            if (lr === 'noncreature' && objTypes.includes('creature')) return false;
            if (lr === 'nonartifact' && objTypes.includes('artifact')) return false;
            if (lr === 'nonenchantment' && objTypes.includes('enchantment')) return false;
            if (lr === 'nonplaneswalker' && objTypes.includes('planeswalker')) return false;
            if (lr === 'graveyard' && targetObj.zone !== Zone.Graveyard) return false;
            if (lr === 'other' && targetObj.id === sourceId) return false;
            if (lr === 'notcontrolled' || lr === 'opponentcontrol') {
                if (controllerId && targetObj.controllerId === controllerId) return false;
            }
            if (lr === 'youcontrol' && controllerId && targetObj.controllerId !== controllerId) return false;
            if (lr === 'self' && targetObj.id !== sourceId) return false;
            if (lr === 'tapped' && !targetObj.isTapped) return false;
            if (lr === 'untapped' && targetObj.isTapped) return false;
            if (lr === 'yours' && (targetObj.controllerId || targetObj.ownerId) !== controllerId) return false;
            if (lr === 'opponents' && (targetObj.controllerId || targetObj.ownerId) === controllerId) return false;

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

            const isKnownFilter = [
                'nonland', 'noncreature', 'nonartifact', 'nonenchantment', 'nonplaneswalker',
                'graveyard', 'other', 'notcontrolled', 'opponentcontrol', 'youcontrol', 'self',
                'tapped', 'untapped', 'yours', 'opponents', 'attackingorblocking',
                'instantorsorcerycastthisturn', 'player', 'anytarget', 'creature', 'artifact', 'land', 'enchantment', 'planeswalker', 'instant', 'sorcery'
            ].includes(lr) || lr.startsWith('cmc') || lr.startsWith('mv') || lr.startsWith('power') || lr.startsWith('toughness');

            if (!isKnownFilter && !baseTypes.includes(lr)) {
                const objSubtypes = (targetObj.definition.subtypes || []).map((s: string) => s.toLowerCase());
                const singularLr = lr.endsWith('s') ? lr.slice(0, -1) : lr;
                if (!objSubtypes.includes(lr) && !objSubtypes.includes(singularLr)) return false;
            }
        }

        const alternatives = restrictions.filter(r => isAlternative(r));
        if (alternatives.length > 0) {
            return alternatives.some(r => {
                if (typeof r === 'string') {
                    const lr = r.toLowerCase();
                    if (lr === 'card' || lr === 'permanent') return true;
                    return objTypes.includes(lr);
                } else {
                    let match = true;
                    if (r.types && !r.types.some((t: string) => objTypes.includes(t.toLowerCase()))) match = false;
                    if (r.subtypes && !r.subtypes.some((s: string) => targetObj.definition.subtypes.some((ts: string) => ts.toLowerCase() === s.toLowerCase()))) match = false;
                    if (r.nameIncludes && targetObj.definition.name && !targetObj.definition.name.toLowerCase().includes(r.nameIncludes.toLowerCase())) match = false;
                    if (r.nameEquals || r.name) {
                        const targetName = targetObj.definition?.name || targetObj.name;
                        const filterName = r.nameEquals || r.name || "";
                        if (!targetName || targetName.toLowerCase() !== filterName.toLowerCase()) match = false;
                    }
                    return match;
                }
            });
        }
        return true;
    }

    public static sourceHasQualities(source: any, qualities: string[]): boolean {
        const s = source.card || source;
        let definition = s.definition || s;

        const sourceTypes = (definition.types || []).map((t: string) => t.toLowerCase());
        const sourceSubtypes = (definition.subtypes || []).map((t: string) => t.toLowerCase());
        const sourceColors = (Array.isArray(definition.colors) ? definition.colors : []).map((c: string) => {
            const map: any = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
            return map[c.toUpperCase()] || c.toLowerCase();
        });

        return qualities.some(q => {
            const lowerQ = q.toLowerCase();
            if (lowerQ === 'and' || lowerQ === 'from') return false;
            if (lowerQ === 'multicolored') return sourceColors.length > 1;
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
        const isOptional = actionData?.optional;
        const isSkipping = targetId === 'skip' || targetId === 'none';
        const isUndoing = targetId === 'undo' || targetId === 'back';
        const targetDef = actionData?.targetDefinition;
        const targetCount = targetDef?.count || 1;

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
                        stackObj.card.zone = Zone.Hand;
                        player.hand.push(stackObj.card);
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
                        const { M21_LOGIC } = require('../../data/m21_logic');
                        const logic = M21_LOGIC[sourceOnField.definition.name];
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

        if (isSkipping) {
            if (!isOptional && actionData.selectedTargets.length === 0) {
                log(`Targeting is required, cannot skip.`);
                return false;
            }
            return engine.finaliseTargeting(playerId, actionData.selectedTargets);
        }

        const legalTargetIds = actionData.legalTargetIds || [];
        if (!legalTargetIds.includes(targetId)) {
            log(`Invalid target selected.`);
            return false;
        }

        if (actionData.selectedTargets.includes(targetId)) {
            log(`Target already selected.`);
            return false;
        }

        actionData.selectedTargets.push(targetId);
        log(`Target ${actionData.selectedTargets.length}/${targetCount} selected: ${targetId}`);

        if (actionData.selectedTargets.length >= targetCount) {
            return this.finaliseTargeting(state, playerId, actionData.selectedTargets, engine);
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
            const savedTargets = [...(actionData.targets || []), ...resolvedTargets];
            const savedEffects = actionData.effects || [];
            const useSourceId = actionData.sourceId || sourceId!;

            const { EffectProcessor } = require('./../effects/EffectProcessor');
            EffectProcessor.resolveEffects(state, savedEffects, useSourceId, savedTargets, (m: string) => engine.log(m), actionData.nextEffectIndex, stackObj, actionData.parentContext);

            // --- RESUME PARENT CONTEXTS (NESTED RESOLUTION) ---
            let currentCtx = actionData.parentContext;
            while (!state.pendingAction && currentCtx && currentCtx.nextEffectIndex < currentCtx.effects.length) {
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

        if (stackId) {
            const existingTrigger = state.stack.find(s => s.id === stackId);
            if (existingTrigger) {
                existingTrigger.targets = resolvedTargets;
                engine.log(`[TARGETING] Targets confirmed for Trigger: ${resolvedTargets.join(', ')}`);
                state.pendingAction = undefined;
                state.priorityPlayerId = playerId;
                engine.checkAutoPass(playerId);
                return true;
            }
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
        effect?: any
    ): string[] {
        const eventData = stackData?.eventData;

        switch (mapping) {
            case 'SELF': return [sourceId];
            case 'CONTROLLER': return [controllerId];
            case 'ENCHANTED_CREATURE': {
                const aura = state.battlefield.find(o => o.id === sourceId);
                return aura?.attachedTo ? [aura.attachedTo] : [];
            }
            case 'TARGET_1': return [targets[0]];
            case 'SELF_AND_TARGET_1': return [sourceId, targets[0]];
            case 'TARGET_2': return [targets[1]];
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
            case 'TARGET_1_CONTROLLER':
                const obj = state.battlefield.find(o => o.id === targets[0]) || Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === targets[0]);
                return obj ? [obj.controllerId] : [];
            case 'ALL_CREATURES_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.controllerId === controllerId && o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'ALL_PERMANENTS_YOU_CONTROL':
                return state.battlefield
                    .filter(o => o.controllerId === controllerId)
                    .map(o => o.id);
            case 'ALL_CREATURES':
                return state.battlefield
                    .filter(o => o.definition.types.some(t => t.toLowerCase() === 'creature'))
                    .map(o => o.id);
            case 'EACH_OPPONENT':
                return Object.keys(state.players).filter(pid => pid !== controllerId);
            case 'EACH_PLAYER':
                return Object.keys(state.players);
            case 'SELECTED_CARD':
                return [targets[0]];
            case 'CONTROLLER_GRAVEYARD':
                const cp = state.players[controllerId];
                return cp ? cp.graveyard.map(c => c.id) : [];
            case 'CONTROLLER_GRAVEYARD_AND_LIBRARY':
                const pc = state.players[controllerId];
                return pc ? [...pc.graveyard.map(c => c.id), ...pc.library.map(c => c.id)] : [];
            case 'ALL_PLAYERS':
                return Object.keys(state.players);
            case 'ANY_TARGET':
                return targets;
            default:
                return [];
        }
    }

    /**
     * CR 602.5b: Check if an ability or spell has ANY legal targets available.
     */
    public static hasLegalTargets(state: GameState, sourceId: string, targetDef: any): boolean {
        if (!targetDef) return true;

        const pool = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id),
            ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
        ];

        return pool.some(tid => this.isLegalTarget(state, sourceId, tid, targetDef));
    }
}
