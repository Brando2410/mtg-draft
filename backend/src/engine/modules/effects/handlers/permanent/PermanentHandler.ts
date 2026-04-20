import { ActionType, CounterEffect, EffectDefinition, EmblemDefinition, GameObject, GameState, PlayerId, PlayerState, ResolutionContext, Zone } from '@shared/engine_types';
import { ActionProcessor } from '../../../actions/ActionProcessor';
import { LayerProcessor } from '../../../state/LayerProcessor';
import { ChoiceGenerator } from '../../ChoiceGenerator';
import { TriggerProcessor } from '../../triggers/TriggerProcessor';

/**
 * Strategy for CR 110: Permanents and CR 701: Keyword Actions
 */
export class PermanentHandler {

    public static handleDestroy(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = state.battlefield.find((o: GameObject) => o.id === tid);
            if (obj) {
                if (LayerProcessor.hasKeyword(obj, state, 'Indestructible')) {
                    log(`${obj.definition.name} is indestructible.`);
                    return;
                }
                log(`${obj.definition.name} was successfully destroyed.`);
                (state.turnState as any).lastDestroyedCount = ((state.turnState as any).lastDestroyedCount || 0) + 1;
                ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
            }
        });
    }

    public static handleSacrifice(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets, sourceId, stackObject } = context;
        if (targets.length === 0) return;

        const [tid, ...nextTargets] = targets;
        const player = state.players[tid as PlayerId];
        if (player) {
            const { TargetingProcessor } = require('../../../actions/targeting/TargetingProcessor');
            const resList = effect?.restrictions || ((effect as any)?.restriction ? [(effect as any).restriction] : ['Creature']);
            let candidates = state.battlefield.filter((o: GameObject) => o.controllerId === tid && TargetingProcessor.matchesRestrictions(state, o, resList, {
                sourceId,
                controllerId: tid,
                stackObject
            }));

            // Apply GreatestPower restriction (Professor Onyx)
            if (effect?.restrictions?.includes('GreatestPower')) {
                const powers = candidates.map((c: GameObject) => LayerProcessor.getEffectiveStats(c, state).power);
                const maxPower = powers.length > 0 ? Math.max(...powers) : 0;
                candidates = candidates.filter((c: GameObject) => LayerProcessor.getEffectiveStats(c, state).power === maxPower);
            }

            const amount = effect?.amount !== undefined ? (typeof effect.amount === 'number' ? effect.amount : (require('../../EffectProcessor').EffectProcessor.resolveAmount(state, effect.amount, context, [tid]))) : 1;

            if (candidates.length <= amount && amount > 0) {
                candidates.forEach((c: GameObject) => ActionProcessor.moveCard(state, c, Zone.Graveyard, tid as PlayerId, log));
                this.handleSacrifice(state, effect, log, { ...context, targets: nextTargets });
                return;
            }

            if (amount <= 0) {
                this.handleSacrifice(state, effect, log, { ...context, targets: nextTargets });
                return;
            }

            state.pendingAction = ChoiceGenerator.createCardChoice(state, candidates, {
                label: effect?.label || `Choose ${amount} object(s) to sacrifice`,
                playerId: tid as PlayerId,
                sourceId: sourceId,
                optional: false,
                minChoices: amount,
                maxChoices: amount,
                actionType: ActionType.ResolutionChoice,
                onSelected: (c: GameObject) => [{ type: 'Sacrifice', targetId: c.id }],
                stackObj: stackObject,
                parentContext: context
            });

            // Store next targets in pendingAction to continue sequence
            if (state.pendingAction && nextTargets.length > 0) {
                state.pendingAction.data!.nextPlayerIds = nextTargets;
                state.pendingAction.data!.isSacrificeSequence = true;
            }
        } else {
            const obj = state.battlefield.find((o: GameObject) => o.id === tid);
            if (obj) ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.controllerId, log);
            this.handleSacrifice(state, effect, log, { ...context, targets: nextTargets });
        }
    }

    public static handleUntap(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = state.battlefield.find((o: GameObject) => o.id === tid);
            if (obj) {
                if (!obj.isTapped) return;
                obj.isTapped = false;
                log(`${obj.definition.name} untapped.`);
            }
        });
    }

    public static handlePrepare(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = state.battlefield.find((o: GameObject) => o.id === tid);
            if (obj) {
                obj.isPrepared = true;
                log(`${obj.definition.name} is now prepared.`);
                TriggerProcessor.onEvent(state, { type: 'ON_PREPARE', targetId: obj.id, sourceId: obj.id, data: { object: obj } }, log);
            }
        });
    }

    public static handleUnprepare(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = state.battlefield.find((o: GameObject) => o.id === tid);
            if (obj) {
                obj.isPrepared = false;
                log(`${obj.definition.name} is now unprepared.`);
            }
        });
    }

    public static handleTap(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = state.battlefield.find((o: GameObject) => o.id === tid);
            if (obj) {
                if (obj.isTapped) return;
                obj.isTapped = true;
                log(`${obj.definition.name} tapped.`);
            }
        });
    }

    public static handleFight(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        if (targets.length < 2) return;
        const c1 = state.battlefield.find((o: GameObject) => o.id === targets[0]);
        const c2 = state.battlefield.find((o: GameObject) => o.id === targets[1]);
        if (!c1 || !c2) return;

        const p1 = LayerProcessor.getEffectiveStats(c1, state).power;
        const p2 = LayerProcessor.getEffectiveStats(c2, state).power;
        log(`[FIGHT] ${c1.definition.name} fights ${c2.definition.name}.`);

        const { DamageProcessor } = require('../../../combat/DamageProcessor');
        DamageProcessor.dealDamage(state, c1.id, c2.id, p1, false, log);
        DamageProcessor.dealDamage(state, c2.id, c1.id, p2, false, log);
    }

    public static handleAddCounters(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        const counterEff = effect as CounterEffect;
        const type = counterEff.counterType || (effect as any).value || effect.type || 'p1p1';
        const { EffectProcessor } = require('../../EffectProcessor');

        targets.forEach((tid: string) => {
            const obj = state.battlefield.find((o: GameObject) => o.id === tid);
            if (obj) {
                const finalType = (type.toLowerCase() === 'p1p1' || type === '+1/+1') ? '+1/+1' : type;
                const amount = typeof counterEff.amount === 'number' ? counterEff.amount : (EffectProcessor.resolveAmount(state, counterEff.amount, context, [tid]));
                
                obj.counters[finalType] = (obj.counters[finalType] || 0) + amount;
                if (amount > 0) {
                    if (!state.turnState.countersAddedThisTurnIds) state.turnState.countersAddedThisTurnIds = [];
                    if (!state.turnState.countersAddedThisTurnIds.includes(obj.id)) {
                        state.turnState.countersAddedThisTurnIds.push(obj.id);
                    }
                }
                log(`[COUNTERS] Added ${amount} ${finalType} counter(s) to ${obj.definition.name}.`);
                TriggerProcessor.onEvent(state, { type: 'ON_COUNTERS_ADDED', targetId: obj.id, amount, counterType: finalType, data: { object: obj } }, log);
            }
        });
    }

    public static handleDoubleCounters(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        const counterEff = effect as CounterEffect;
        const type = counterEff.counterType || 'p1p1';
        const finalType = (type.toLowerCase() === 'p1p1' || type === '+1/+1') ? '+1/+1' : type;
        
        targets.forEach((tid: string) => {
            const obj = state.battlefield.find((o: GameObject) => o.id === tid);
            if (obj) {
                const amount = obj.counters[finalType] || 0;
                if (amount > 0) {
                    obj.counters[finalType] = amount * 2;
                    log(`Doubled ${finalType} counters on ${obj.definition.name} (+${amount}).`);
                    if (!state.turnState.countersAddedThisTurnIds) state.turnState.countersAddedThisTurnIds = [];
                    if (!state.turnState.countersAddedThisTurnIds.includes(obj.id)) {
                        state.turnState.countersAddedThisTurnIds.push(obj.id);
                    }
                    TriggerProcessor.onEvent(state, { type: 'ON_COUNTERS_ADDED', targetId: obj.id, amount, counterType: finalType, data: { object: obj } }, log);
                }
            }
        });
    }

    public static handleMoveCounters(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets, sourceId, stackObject } = context;
        const counterEff = effect as CounterEffect;
        let sourceObj = state.battlefield.find((o: GameObject) => o.id === sourceId) || state.exile.find((o: GameObject) => o.id === sourceId) || Object.values(state.players).flatMap((p: PlayerState) => p.graveyard).find((o: GameObject) => o.id === sourceId);
        
        // CR 603.10: If the source is not in a public zone or has no counters (because it died), check the stack object's event snapshot (LKI)
        if (!sourceObj || !sourceObj.counters || Object.keys(sourceObj.counters).length === 0) {
            const snapshot = stackObject?.data?.event?.payload?.object || stackObject?.data?.event?.data?.object;
            if (snapshot && snapshot.id === sourceId && snapshot.counters && Object.keys(snapshot.counters).length > 0) {
                sourceObj = snapshot;
            }
        }

        if (!sourceObj || !sourceObj.counters) return;

        let inputType = counterEff.counterType;
        if (inputType && (inputType.toLowerCase() === 'p1p1' || inputType === '+1/+1')) inputType = '+1/+1';
        const counterTypes = inputType ? [inputType] : Object.keys(sourceObj.counters);

        counterTypes.forEach((ctype: string) => {
            const amount = sourceObj!.counters[ctype] || 0;
            if (amount <= 0) return;

            targets.forEach((tid: string) => {
                const targetObj = state.battlefield.find((o: GameObject) => o.id === tid);
                if (targetObj) {
                    targetObj.counters[ctype] = (targetObj.counters[ctype] || 0) + amount;
                    log(`[MOVE-COUNTERS] Moved ${amount} ${ctype} counters from ${sourceObj!.definition.name} to ${targetObj.definition.name}.`);
                    TriggerProcessor.onEvent(state, { type: 'ON_COUNTERS_ADDED', targetId: targetObj.id, amount, counterType: ctype, data: { object: targetObj } }, log);
                }
            });
            sourceObj!.counters[ctype] = 0;
        });
    }

    public static handleCreateToken(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { EffectProcessor } = require('../../EffectProcessor');
        const { targets } = context;
        const tokenEff = effect as any; // Using any briefly for deep blueprint access
        const blueprint = tokenEff.tokenBlueprint || (tokenEff as any).definition;
        if (!blueprint) return;

        targets.forEach((tid: string) => {
            const pid = tid as PlayerId;
            const pOverride = tokenEff.powerOverride !== undefined ? EffectProcessor.resolveAmount(state, tokenEff.powerOverride, context) : undefined;
            const tOverride = tokenEff.toughnessOverride !== undefined ? EffectProcessor.resolveAmount(state, tokenEff.toughnessOverride, context) : undefined;
            const amount = EffectProcessor.resolveAmount(state, tokenEff.amount || 1, context, [pid]);
            for (let i = 0; i < amount; i++) {
                const token = this.createToken(state, blueprint, pid, pOverride, tOverride, effect);
                (state as any).lastCreatedTokenId = token.id;

                // Manage starting counters (e.g. Fractal tokens)
                if (tokenEff.startingCounters) {
                    const { type, countersType, amount: cAmount } = tokenEff.startingCounters;
                    const finalType = type || countersType;
                    const resolvedAmount = EffectProcessor.resolveAmount(state, cAmount, context, [pid]);
                    
                    if (resolvedAmount > 0 && finalType) {
                        const counterKey = (finalType.toLowerCase() === 'p1p1' || finalType === '+1/+1') ? '+1/+1' : finalType;
                        token.counters[counterKey] = (token.counters[counterKey] || 0) + resolvedAmount;
                        log(`[TOKEN] ${token.definition.name} enters with ${resolvedAmount} ${counterKey} counters.`);
                    }
                }

                if (tokenEff?.isAttacking && state.combat) {
                    state.combat.attackers.push({ attackerId: token.id, targetId: (tokenEff.attackTargetId || Object.keys(state.players).find(id => id !== pid)!) });
                    token.isTapped = true;
                }
            }
        });
    }

    public static handleCreateTokenCopy(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets } = context;
        const tokenEff = effect as any;
        const sourceCardId = (tokenEff as any).originalCardId || (tokenEff as any).sourceCardId;
        const sourceObj = state.battlefield.find((o: GameObject) => o.id === sourceCardId) || state.exile.find((o: GameObject) => o.id === sourceCardId) || Object.values(state.players).flatMap((p: PlayerState) => p.graveyard).find((o: GameObject) => o.id === sourceCardId);

        if (!sourceObj) return;

        targets.forEach((pid: string) => {
            const blueprint = {
                ...sourceObj.definition,
                types: [...(sourceObj.definition.types || []), ...((tokenEff as any).typesToAdd || [])],
                subtypes: [...(sourceObj.definition.subtypes || []), ...((tokenEff as any).subtypesToAdd || [])],
                abilities: [...(sourceObj.definition.abilities || []), ...((tokenEff as any).abilitiesToAdd || [])],
                image_url: sourceObj.definition.image_url
            };
            const token = this.createToken(state, blueprint, pid as PlayerId, (tokenEff as any).powerOverride, (tokenEff as any).toughnessOverride, effect);

            if ((tokenEff as any).storeLinkedId) {
                if (!token.data) token.data = {};
                token.data[(tokenEff as any).storeLinkedId] = sourceCardId;
            }

            log(`Created token copy of ${sourceObj.definition.name} for ${pid}.`);
        });
    }

    public static handleAttach(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { targets, sourceId } = context;
        const source = state.battlefield.find((o: GameObject) => o.id === sourceId);
        if (!source) return;

        targets.forEach((tid: string) => {
            const target = state.battlefield.find((o: GameObject) => o.id === tid);
            if (target) {
                (source as any).attachedTo = tid;
                log(`[ATTACH] ${source.definition.name} attached to ${target.definition.name}.`);
            } else {
                (source as any).attachedTo = undefined;
            }
        });
    }

    private static createToken(state: GameState, blueprint: any, controllerId: PlayerId, pOverride?: any, tOverride?: any, effect?: any): GameObject {
        const token: GameObject = {
            id: `token_${Math.random().toString(36).substr(2, 9)}`,
            ownerId: controllerId,
            controllerId: controllerId,
            definition: {
                name: blueprint.name,
                manaCost: blueprint.manaCost ?? "",
                manaValue: (require('../../../magic/ManaProcessor').ManaProcessor).getManaValue(blueprint.manaCost ?? ""),
                colors: (blueprint.colors || []).map((c: string) => {
                    const map: Record<string, string> = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
                    return map[c.toUpperCase()] || c.toLowerCase();
                }),
                supertypes: blueprint.supertypes || [],
                types: [...(blueprint.types || []), "Token"],
                subtypes: blueprint.subtypes || [],
                power: pOverride !== undefined ? String(pOverride) : String(blueprint.power || "0"),
                toughness: tOverride !== undefined ? String(tOverride) : String(blueprint.toughness || "0"),
                loyalty: blueprint.loyalty,
                keywords: blueprint.keywords || [],
                abilities: blueprint.abilities || [],
                oracleText: blueprint.oracleText || "",
                image_url: blueprint.image_url || "",
                preparedFace: blueprint.preparedFace,
                faces: blueprint.faces
            },
            zone: Zone.Battlefield,
            isTapped: false,
            damageMarked: 0,
            deathtouchMarked: false,
            summoningSickness: true,
            abilitiesUsedThisTurn: 0,
            faceDown: false,
            isPrepared: blueprint.entersPrepared || false,
            keywords: [],
            counters: (blueprint.types || []).some((t: string) => t.toLowerCase() === 'planeswalker') && blueprint.loyalty
                ? { loyalty: parseInt(blueprint.loyalty, 10) }
                : {}
        };
        (token as any).isToken = true;
        (state as any).lastCreatedTokenId = token.id;
        state.battlefield.push(token);
        const { RegistryProcessor } = require('../../../core/RegistryProcessor');
        RegistryProcessor.registerAbilities(state, token);
        TriggerProcessor.onEvent(state, { type: 'ON_ETB', targetId: token.id, sourceId: token.id, data: { object: token } }, () => { });
        return token;
    }

    public static handleCreateEmblem(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { controllerId, sourceId, stackObject } = context;
        const blueprint = (effect as any).emblemBlueprint;
        if (!blueprint) return;
        
        const { EffectProcessor } = require('../../EffectProcessor');
        const sourceObj = EffectProcessor.findObject(state, sourceId, stackObject);

        const emblemId = `emblem_${controllerId}_${Date.now()}`;
        const emblem: EmblemDefinition = {
            id: emblemId,
            name: blueprint.name || 'Emblem',
            controllerId,
            oracleText: blueprint.oracleText || '',
            image_url: sourceObj?.definition.image_url,
            abilities: blueprint.abilities || []
        };
        if (!state.emblems) state.emblems = [];
        state.emblems.push(emblem);
        blueprint.abilities?.forEach((ability: any, idx: number) => {
            state.ruleRegistry.triggeredAbilities.push({ ...ability, id: `${emblemId}_${idx}`, sourceId: emblemId, controllerId, activeZone: 'Command' });
        });
        log(`[EMBLEM] Created ${emblem.name} for ${state.players[controllerId]?.name}.`);
    }

}



