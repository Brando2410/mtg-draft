import {
    ActionType,
    CounterEffect,
    CounterType,
    EffectDefinition,
    EmblemDefinition,
    EmblemEffect,
    GameObject,
    GameState,
    PlayerId,
    ResolutionContext,
    TokenEffect,
    Zone
} from '@shared/engine_types';
import { LogCategory } from '../../../../utils/EngineLogger';
import { RuleUtils } from '../../../../utils/RuleUtils';
import { ActionProcessor } from '../../../actions/ActionProcessor';
import { getProcessors } from '../../../ProcessorRegistry';
import { LayerProcessor } from '../../../state/LayerProcessor';
import { ChoiceGenerator } from '../../ChoiceGenerator';
import { TriggerProcessor } from '../../triggers/TriggerProcessor';

/**
 * Strategy for CR 110: Permanents and CR 701: Keyword Actions
 */
export class PermanentHandler {

    public static handleDestroy(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = RuleUtils.findObject(state, tid);
            if (RuleUtils.isEntity(obj) && obj.zone === Zone.Battlefield) {
                if (RuleUtils.hasKeyword(obj, 'Indestructible')) {
                    logger.info(state, LogCategory.ACTION, `${obj.definition.name} is indestructible.`);
                    return;
                }
                logger.info(state, LogCategory.ACTION, `${obj.definition.name} was successfully destroyed.`);
                state.turnState.lastDestroyedCount = (state.turnState.lastDestroyedCount || 0) + 1;
                ActionProcessor.moveCard(state, obj as GameObject, Zone.Graveyard, (obj as GameObject).ownerId);
            }
        });
    }

    public static handleSacrifice(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { targets, sourceId, stackObject } = context;
        if (targets.length === 0) return;

        const [tid, ...nextTargets] = targets;
        const player = state.players[tid as PlayerId];
        if (player) {
            const { targeting: TP, effect: EP } = getProcessors(state);
            const resList = effect.restrictions || ['Creature'];
            let candidates = state.battlefield.filter((o: GameObject) => o.controllerId === tid && TP.matchesRestrictions(state, o, resList, {
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

            const amount = effect?.amount !== undefined ? (typeof effect.amount === 'number' ? effect.amount : (EP.resolveAmount(state, effect.amount, context, [tid]))) : 1;

            if (candidates.length <= amount && amount > 0) {
                candidates.forEach((c: GameObject) => ActionProcessor.moveCard(state, c, Zone.Graveyard, tid as PlayerId));
                this.handleSacrifice(state, effect, { ...context, targets: nextTargets });
                return;
            }

            if (amount <= 0) {
                this.handleSacrifice(state, effect, { ...context, targets: nextTargets });
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
                onSelected: (c: GameObject) => [{ type: 'Sacrifice', targetIds: [c.id] }],
                stackObj: stackObject,
                parentContext: context
            });

            // Store next targets in pendingAction to continue sequence
            if (state.pendingAction && nextTargets.length > 0) {
                state.pendingAction.data!.nextPlayerIds = nextTargets;
                state.pendingAction.data!.isSacrificeSequence = true;
            }
        } else {
            const obj = RuleUtils.findObject(state, tid);
            if (RuleUtils.isEntity(obj) && obj.zone === Zone.Battlefield) ActionProcessor.moveCard(state, obj as GameObject, Zone.Graveyard, (obj as GameObject).controllerId);
            this.handleSacrifice(state, effect, { ...context, targets: nextTargets });
        }
    }

    public static handleUntap(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = RuleUtils.findObject(state, tid) as GameObject | undefined;
            if (obj && obj.zone === Zone.Battlefield) {
                if (!obj.isTapped) return;
                obj.isTapped = false;
                logger.info(state, LogCategory.ACTION, `${obj.definition.name} untapped.`);
            }
        });
    }

    public static handlePrepare(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = RuleUtils.findObject(state, tid) as GameObject | undefined;
            if (obj && obj.zone === Zone.Battlefield) {
                obj.isPrepared = true;
                logger.info(state, LogCategory.ACTION, `${obj.definition.name} is now prepared.`);
                TriggerProcessor.onEvent(state, { type: 'ON_PREPARE', payload: { targetIds: [obj.id], sourceId: obj.id, object: obj } });
            }
        });
    }

    public static handleUnprepare(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = RuleUtils.findObject(state, tid);
            if (RuleUtils.isEntity(obj) && obj.zone === Zone.Battlefield) {
                obj.isPrepared = false;
                logger.info(state, LogCategory.ACTION, `${obj.definition.name} is now unprepared.`);
            }
        });
    }

    public static handleTap(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        targets.forEach((tid: string) => {
            const obj = RuleUtils.findObject(state, tid) as GameObject | undefined;
            if (obj && obj.zone === Zone.Battlefield) {
                if (obj.isTapped) return;
                obj.isTapped = true;
                logger.info(state, LogCategory.ACTION, `${obj.definition.name} tapped.`);
            }
        });
    }

    public static handleFight(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger, damage: DP } = getProcessors(state);
        const { targets } = context;
        if (targets.length < 2) return;
        const c1 = RuleUtils.findObject(state, targets[0]);
        const c2 = RuleUtils.findObject(state, targets[1]);
        if (!RuleUtils.isEntity(c1) || !RuleUtils.isEntity(c2)) return;
        if (c1.zone !== Zone.Battlefield || c2.zone !== Zone.Battlefield) return;

        const p1 = LayerProcessor.getEffectiveStats(c1 as GameObject, state).power;
        const p2 = LayerProcessor.getEffectiveStats(c2 as GameObject, state).power;
        if (RuleUtils.isEntity(c1) && RuleUtils.isEntity(c2)) {
            logger.info(state, LogCategory.ACTION, `[FIGHT] ${c1.definition.name} fights ${c2.definition.name}.`);
        }

        DP.dealDamage(state, c1.id, c2.id, p1, false);
        DP.dealDamage(state, c2.id, c1.id, p2, false);
    }

    public static handleAddCounters(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger, effect: EP } = getProcessors(state);
        const { targets } = context;
        const counterEff = effect as CounterEffect;
        const type = counterEff.counterType || 'p1p1';

        targets.forEach((tid: string) => {
            const obj = RuleUtils.findObject(state, tid);
            if (RuleUtils.isEntity(obj) && obj.zone === Zone.Battlefield) {
                const finalType = (type.toLowerCase() === 'p1p1' || type === '+1/+1') ? '+1/+1' : type;
                const amountStr = counterEff.amount;
                const amount = (amountStr === undefined) ? 1 : (typeof amountStr === 'number' ? amountStr : (EP.resolveAmount(state, amountStr, context, [tid])));

                const counterKey = finalType as CounterType;
                obj.counters[counterKey] = (obj.counters[counterKey] || 0) + amount;
                if (amount > 0) {
                    if (!state.turnState.countersAddedThisTurnIds) state.turnState.countersAddedThisTurnIds = [];
                    if (!state.turnState.countersAddedThisTurnIds.includes(obj.id)) {
                        state.turnState.countersAddedThisTurnIds.push(obj.id);
                    }
                }
                logger.info(state, LogCategory.ACTION, `[COUNTERS] Added ${amount} ${finalType} counter(s) to ${obj.definition.name}.`);
                TriggerProcessor.onEvent(state, { type: 'ON_COUNTERS_ADDED', payload: { targetIds: [obj.id], amount, counterType: finalType, object: obj } });
            }
        });
    }

    public static handleDoubleCounters(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        const counterEff = effect as CounterEffect;
        const type = counterEff.counterType || 'p1p1';
        const finalType = (type.toLowerCase() === 'p1p1' || type === '+1/+1') ? '+1/+1' : type;

        targets.forEach((tid: string) => {
            const obj = RuleUtils.findObject(state, tid);
            if (RuleUtils.isEntity(obj) && obj.zone === Zone.Battlefield) {
                const counterKey = finalType as CounterType;
                const amount = obj.counters[counterKey] || 0;
                if (amount > 0) {
                    obj.counters[counterKey] = amount * 2;
                    logger.info(state, LogCategory.ACTION, `Doubled ${finalType} counters on ${obj.definition.name} (+${amount}).`);
                    if (!state.turnState.countersAddedThisTurnIds) state.turnState.countersAddedThisTurnIds = [];
                    if (!state.turnState.countersAddedThisTurnIds.includes(obj.id)) {
                        state.turnState.countersAddedThisTurnIds.push(obj.id);
                    }
                    TriggerProcessor.onEvent(state, { type: 'ON_COUNTERS_ADDED', payload: { targetIds: [obj.id], amount, counterType: finalType, object: obj } });
                }
            }
        });
    }

    public static handleMoveCounters(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger, effect: EP } = getProcessors(state);
        const { targets, sourceId } = context;
        const counterEff = effect as CounterEffect;

        let rawObj = RuleUtils.findObject(state, sourceId);
        // CR 603.10: If the source is not in a public zone or has no counters (because it died), check LKI
        if (!RuleUtils.isEntity(rawObj) || !rawObj.counters || Object.keys(rawObj.counters).length === 0) {
            const processors = getProcessors(state);
            const snapshot = processors.lki.getLki(state, sourceId, Zone.Battlefield);
            if (snapshot && RuleUtils.isEntity(snapshot)) {
                rawObj = snapshot;
            }
        }

        if (!RuleUtils.isEntity(rawObj) || !rawObj.counters) return;
        const sourceObj = rawObj; // Narrowed to Entity

        let inputType = counterEff.counterType;
        if (inputType && (inputType.toLowerCase() === 'p1p1' || inputType === '+1/+1')) inputType = '+1/+1';
        const counterTypes = inputType ? [inputType] : Object.keys(sourceObj.counters);

        counterTypes.forEach((ctype: string) => {
            const counterKey = ctype as import('@shared/engine_types').CounterType;
            const available = sourceObj.counters[counterKey] || 0;
            if (available <= 0) return;

            const requestedAmount = counterEff.amount !== undefined
                ? EP.resolveAmount(state, counterEff.amount, context, targets)
                : available;

            const amount = Math.min(available, requestedAmount);
            if (amount <= 0) return;

            targets.forEach((tid: string) => {
                const targetObj = RuleUtils.findObject(state, tid);
                if (RuleUtils.isEntity(targetObj) && targetObj.zone === Zone.Battlefield) {
                    targetObj.counters[counterKey] = (targetObj.counters[counterKey] || 0) + amount;
                    logger.info(state, LogCategory.ACTION, `[MOVE-COUNTERS] Moved ${amount} ${ctype} counters from ${sourceObj.definition.name} to ${targetObj.definition.name}.`);
                    TriggerProcessor.onEvent(state, { type: 'ON_COUNTERS_ADDED', payload: { targetIds: [targetObj.id], amount, counterType: ctype, object: targetObj } });
                }
            });

            sourceObj.counters[counterKey] = (sourceObj.counters[counterKey] || 0) - amount;
        });
    }

    public static handleCreateToken(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger, effect: EP } = getProcessors(state);
        const { targets } = context;
        const tokenEff = effect as TokenEffect;
        const blueprint = tokenEff.tokenBlueprint;
        if (!blueprint) return;

        targets.forEach((tid: string) => {
            const pid = tid as PlayerId;
            const pOverride = tokenEff.powerOverride !== undefined ? EP.resolveAmount(state, tokenEff.powerOverride, context) : undefined;
            const tOverride = tokenEff.toughnessOverride !== undefined ? EP.resolveAmount(state, tokenEff.toughnessOverride, context) : undefined;
            const amount = EP.resolveAmount(state, tokenEff.amount || 1, context, [pid]);
            for (let i = 0; i < amount; i++) {
                const token = this.createToken(state, blueprint, pid, pOverride, tOverride, effect);
                state.turnState.lastCreatedTokenId = token.id;

                // Manage starting counters (e.g. Fractal tokens)
                if (tokenEff.startingCounters) {
                    const { type, countersType, amount: cAmount } = tokenEff.startingCounters;
                    const finalType = type || countersType;
                    const resolvedAmount = EP.resolveAmount(state, cAmount, context, [pid]);

                    if (resolvedAmount > 0 && finalType) {
                        const counterKey = ((finalType.toLowerCase() === 'p1p1' || finalType === '+1/+1') ? '+1/+1' : finalType) as CounterType;
                        token.counters[counterKey] = (token.counters[counterKey] || 0) + resolvedAmount;
                        logger.info(state, LogCategory.ACTION, `[TOKEN] ${token.definition.name} enters with ${resolvedAmount} ${counterKey} counters.`);
                    }
                }

                if (tokenEff?.isAttacking && state.combat) {
                    state.combat.attackers.push({ attackerId: token.id, targetId: (tokenEff.attackTargetId || Object.keys(state.players).find(id => id !== pid)!) });
                    token.isTapped = true;
                }
            }
        });
    }

    public static handleCreateTokenCopy(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger } = getProcessors(state);
        const { targets } = context;
        const tokenEff = effect as TokenEffect;
        const { targeting: TP_LOCAL } = getProcessors(state);

        const sourceCardId = (tokenEff.sourceMapping ? TP_LOCAL.resolveTargetMapping(state, tokenEff.sourceMapping, context, effect)[0] : undefined);
        if (!sourceCardId) {
            logger.warn(state, LogCategory.ACTION, `[WARNING] handleCreateTokenCopy: No source card ID resolved.`);
            return;
        }

        const sourceObj = RuleUtils.findObject(state, sourceCardId);

        console.log(`[DEBUG-TOKEN] sourceCardId: ${sourceCardId}`);
        if (RuleUtils.isEntity(sourceObj)) {
            console.log(`[DEBUG-TOKEN] Found source object: ${sourceObj.definition?.name} in zone: ${sourceObj.zone || 'Stack'}`);
        } else {
            console.log(`[DEBUG-TOKEN] Could not find source object for ID: ${sourceCardId}`);
        }

        if (!RuleUtils.isEntity(sourceObj) || !sourceObj.definition) {
            if (RuleUtils.isEntity(sourceObj) && !sourceObj.definition) console.log(`[DEBUG-TOKEN] Source object found but has no definition!`);
            return;
        }

        targets.forEach((pid: string) => {
            const blueprint = {
                ...sourceObj.definition,
                types: [...(sourceObj.definition.types || []), ...(tokenEff.typesToAdd || [])],
                subtypes: [...(sourceObj.definition.subtypes || []), ...(tokenEff.subtypesToAdd || [])],
                abilities: [...(sourceObj.definition.abilities || []), ...(tokenEff.abilitiesToAdd || [])],
                keywords: [...(sourceObj.definition.keywords || []), ...(tokenEff.keywordsToAdd || [])],
                image_url: sourceObj.definition.image_url
            };
            const { effect: EP_LOCAL } = getProcessors(state);
            const pOverride = tokenEff.powerOverride !== undefined ? EP_LOCAL.resolveAmount(state, tokenEff.powerOverride, context) : undefined;
            const tOverride = tokenEff.toughnessOverride !== undefined ? EP_LOCAL.resolveAmount(state, tokenEff.toughnessOverride, context) : undefined;
            const token = this.createToken(state, blueprint, pid as PlayerId, pOverride, tOverride, effect);

            if (tokenEff.storeLinkedId) {
                if (!token.data) token.data = {};
                token.data[tokenEff.storeLinkedId] = sourceCardId;
            }

            if (RuleUtils.isEntity(sourceObj)) {
                logger.info(state, LogCategory.ACTION, `Created token copy of ${sourceObj.definition.name} for ${pid}.`);
            }
        });
    }

    public static handleAttach(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger } = getProcessors(state);
        const { targets, sourceId } = context;
        const source = RuleUtils.findObject(state, sourceId) as GameObject | undefined;
        if (!source || source.zone !== Zone.Battlefield) return;

        targets.forEach((tid: string) => {
            const target = RuleUtils.findObject(state, tid) as GameObject | undefined;
            if (target && target.zone === Zone.Battlefield) {
                source.attachedTo = tid;
                logger.info(state, LogCategory.ACTION, `[ATTACH] ${source.definition.name} attached to ${target.definition.name}.`);
            } else {
                source.attachedTo = undefined;
            }
        });
    }

    private static createToken(state: GameState, blueprint: import('@shared/engine_types').CardDefinition, controllerId: PlayerId, pOverride?: number | string, tOverride?: number | string, effect?: EffectDefinition): GameObject {
        const { mana: MP, registry: RP } = getProcessors(state);
        const token: GameObject = {
            id: `token_${Math.random().toString(36).substr(2, 9)}`,
            ownerId: controllerId,
            controllerId: controllerId,
            definition: {
                name: blueprint.name,
                manaCost: blueprint.manaCost ?? "",
                manaValue: MP.getManaValue(blueprint.manaCost ?? ""),
                colors: (blueprint.colors || []).map((c: string) => {
                    const map: Record<string, string> = { 'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green' };
                    return map[c.toUpperCase()] || c.toLowerCase();
                }),
                supertypes: blueprint.supertypes || [],
                types: [...(blueprint.types || [])],
                subtypes: blueprint.subtypes || [],
                power: pOverride !== undefined ? String(pOverride) : String(blueprint.power || "0"),
                toughness: tOverride !== undefined ? String(tOverride) : String(blueprint.toughness || "0"),
                loyalty: blueprint.loyalty,
                keywords: blueprint.keywords || [],
                abilities: blueprint.abilities || [],
                oracleText: blueprint.oracleText || "",
                image_url: blueprint.image_url || "",
                preparedFace: blueprint.preparedFace,
                faces: blueprint.faces,
                cannotBeCopied: blueprint.cannotBeCopied
            },
            zone: Zone.Battlefield,
            isTapped: false,
            damageMarked: 0,
            deathtouchMarked: false,
            summoningSickness: !(blueprint.keywords || []).some((k) => String(k).toLowerCase() === 'haste'),
            abilitiesUsedThisTurn: 0,
            faceDown: false,
            isPrepared: blueprint.entersPrepared || false,
            keywords: [],
            counters: (blueprint.types || []).some((t) => String(t).toLowerCase() === 'planeswalker') && blueprint.loyalty
                ? { loyalty: typeof blueprint.loyalty === 'number' ? blueprint.loyalty : parseInt(String(blueprint.loyalty), 10) }
                : {}
        };
        const { layer: LayerProcessor } = getProcessors(state);
        token.typeMask = LayerProcessor.calculateTypeMask(token.definition.types);
        token.isToken = true;
        state.turnState.lastCreatedTokenId = token.id;
        state.battlefield.push(token);
        RP.registerAbilities(state, token);
        TriggerProcessor.onEvent(state, { type: 'ON_ETB', payload: { targetIds: [token.id], sourceId: token.id, object: token } });
        return token;
    }

    public static handleCreateEmblem(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger, effect: EP } = getProcessors(state);
        const { controllerId, sourceId, stackObject } = context;
        const emblemEff = effect as EmblemEffect;
        const blueprint = emblemEff.emblemBlueprint;
        if (!blueprint) return;

        const sourceObj = EP.findObject(state, sourceId, stackObject);

        const emblemId = `emblem_${controllerId}_${Date.now()}`;
        const emblem: EmblemDefinition = {
            id: emblemId,
            name: blueprint.name || 'Emblem',
            controllerId,
            oracleText: blueprint.oracleText || '',
            image_url: (sourceObj && 'definition' in sourceObj) ? sourceObj.definition?.image_url : '',
            abilities: blueprint.abilities || []
        };
        if (!state.emblems) state.emblems = [];
        state.emblems.push(emblem);
        blueprint.abilities?.forEach((ability, idx: number) => {
            state.ruleRegistry.triggeredAbilities.push({ ...ability, id: `${emblemId}_${idx}`, sourceId: emblemId, controllerId, activeZone: Zone.Any });
        });
        logger.info(state, LogCategory.ACTION, `[EMBLEM] Created ${emblem.name} for ${state.players[controllerId]?.name}.`);
    }

}



