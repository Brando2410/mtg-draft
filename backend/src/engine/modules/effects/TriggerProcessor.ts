import { AbilityType, ActionType, ConditionType, EffectType, GameEvent, GameObjectId, GameState, PlayerId, TargetMapping, TriggeredAbility, TriggerEvent, Zone } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { oracle } from '../../OracleLogicMap';

/**
 * Rules Engine Module: Triggered Abilities (Rule 603)
 * Monitors game events and handles placing triggers on the stack.
 */
export class TriggerProcessor {

    /**
     * Main entry point for any game event (LifeGain, ETB, Death, etc.)
     * Rule 603.3: "Once an ability has triggered, its controller puts it on the stack..."
     */
    public static onEvent(state: GameState, event: GameEvent, log: (msg: string) => void) {
        // 1. Identify all triggered abilities that match this event (Rule 603.2)
        const matchingTriggers = this.collectMatchingTriggers(state, event);

        // 2. Process system-recognized keywords (Prowess, Ward, etc.)
        this.processSystemKeywords(state, event, matchingTriggers, log);

        if (matchingTriggers.length === 0) return;

        // --- DEDUPLICATION (Fix for Issue #2: prevents multiple triggers for the same ability instance) ---
        // We use a composite key of sourceId + ability name (or type) to ensure we don't fire the same thing twice for one card.
        const uniqueTriggersMap = new Map<string, any>();
        matchingTriggers.forEach(t => {
            const key = `${t.id || t.sourceId + '_' + ((t as any).abilityIndex || 0)}`;
            if (!uniqueTriggersMap.has(key)) {
                uniqueTriggersMap.set(key, t);
            }
        });
        const uniqueTriggers = Array.from(uniqueTriggersMap.values());

        if (uniqueTriggers.length < matchingTriggers.length) {
            log(`[DEBUG] Deduplicated ${matchingTriggers.length} triggers down to ${uniqueTriggers.length} for event ${event.type}.`);
        }

        // 2. Queue all triggers in pending state
        if (!state.pendingTriggers) state.pendingTriggers = [];

        for (const trigger of uniqueTriggers) {
            // Increment usage
            if (trigger.limitPerTurn) {
                state.turnState.triggeredAbilitiesUsedThisTurn[trigger.id] = (state.turnState.triggeredAbilitiesUsedThisTurn[trigger.id] || 0) + 1;
            }

            const stackObj = this.createStackObject(state, trigger, event, log);
            state.pendingTriggers.push(stackObj);
        }

        // 3. Process the queue in APNAP order
        this.processPendingTriggers(state, log);

        // 4. Cleanup single-shot delayed triggers (Rule 603.7)
        matchingTriggers.forEach(t => {
            if ((t as any).isDelayed) {
                const startsWithUntil = (t as any).duration && String((t as any).duration).toUpperCase().startsWith('UNTIL');
                const isOneShot = (t as any).oneShot || (t as any).firesOnce;

                if (isOneShot || !startsWithUntil) {
                    state.ruleRegistry.triggeredAbilities = state.ruleRegistry.triggeredAbilities.filter(orig => orig.id !== t.id);
                }
            }
        });
    }

    /**
     * CR 603.3b: "If multiple abilities have triggered... each player, in APNAP order, 
     * puts any abilities they control on the stack in any order they choose."
     */
    public static processPendingTriggers(state: GameState, log: (msg: string) => void) {
        if (!state.pendingTriggers || state.pendingTriggers.length === 0) return;

        // Rule 101.4: APNAP Order
        const apId = state.activePlayerId;
        const order = state.playerOrder;
        const apIndex = order.indexOf(apId);
        const apnapOrder = [...order.slice(apIndex), ...order.slice(0, apIndex)];

        for (const pId of apnapOrder) {
            const playersTriggers = state.pendingTriggers.filter(t => t.controllerId === pId);
            if (playersTriggers.length === 0) continue;

            if (playersTriggers.length === 1) {
                const trigger = playersTriggers[0];
                state.pendingTriggers = state.pendingTriggers.filter(t => t.id !== trigger.id);
                this.stackTrigger(state, trigger, log);
                this.processPendingTriggers(state, log);
                return;
            } else {
                const player = state.players[pId];
                if (player?.autoOrderTriggers) {
                    // Auto-order: Just stack them in the order they arrived (arbitrary but consistent)
                    for (const t of playersTriggers) {
                        state.pendingTriggers = state.pendingTriggers.filter(q => q.id !== t.id);
                        this.stackTrigger(state, t, log);
                    }
                    this.processPendingTriggers(state, log);
                    return;
                }

                state.pendingAction = {
                    type: ActionType.OrderTriggers,
                    playerId: pId,
                    data: { triggers: playersTriggers }
                };
                return;
            }
        }
    }

    /**
     * Rule 603.7: Delayed Triggered Abilities
     * Created by effects during resolution. Usually triggers only once.
     */
    public static createDelayedTrigger(
        state: GameState,
        effect: any,
        sourceId: GameObjectId,
        controllerId: PlayerId,
        log: (msg: string) => void
    ) {
        const triggerId = `delayed_${sourceId}_${Date.now()}`;
        const delayedTrigger: any = {
            id: triggerId,
            sourceId,
            controllerId,
            eventMatch: effect.eventMatch,
            effects: effect.effects,
            duration: effect.duration || 'UNTIL_END_OF_TURN',
            condition: effect.condition,
            data: effect.data,
            isDelayed: true,
            oneShot: effect.oneShot,
            firesOnce: effect.firesOnce,
            activeZone: 'Battlefield', // Virtual zone for registry
            type: AbilityType.Triggered
        };

        if (!state.ruleRegistry.triggeredAbilities) state.ruleRegistry.triggeredAbilities = [];
        state.ruleRegistry.triggeredAbilities.push(delayedTrigger);
        log(`[DELAYED TRIGGER] Registered: triggered on ${effect.eventMatch}.`);
    }

    public static cleanupDelayedTriggers(state: GameState, log: (m: string) => void) {
        if (!state.ruleRegistry.triggeredAbilities) return;
        const initialCount = state.ruleRegistry.triggeredAbilities.length;
        state.ruleRegistry.triggeredAbilities = state.ruleRegistry.triggeredAbilities.filter(t => !(t as any).isDelayed || (t as any).duration !== 'UNTIL_END_OF_TURN');
        const removedCount = initialCount - state.ruleRegistry.triggeredAbilities.length;
        if (removedCount > 0) log(`[CLEANUP] Removed ${removedCount} expired delayed triggers.`);
    }

    private static createStackObject(state: GameState, trigger: TriggeredAbility, event: GameEvent, log: (msg: string) => void): any {
        const eventObj = event.data?.object;
        const sourceObj = (eventObj && eventObj.id === trigger.sourceId) ? eventObj : (
            state.battlefield.find(o => o.id === trigger.sourceId) ||
            state.exile.find(o => o.id === trigger.sourceId) ||
            state.stack.find(s => s.id === trigger.sourceId || s.sourceId === trigger.sourceId)?.card ||
            Object.values(state.players).flatMap(p => p.graveyard).find(o => o.id === trigger.sourceId)
        );

        const emblemSource = !sourceObj ? state.emblems?.find(e => e.id === trigger.sourceId) : undefined;
        const sourceName = sourceObj?.definition.name || emblemSource?.name || "Unknown Source";
        const sourceImage = sourceObj?.definition.image_url || emblemSource?.image_url;

        const stackId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const stackObj = {
            id: stackId,
            controllerId: trigger.controllerId,
            sourceId: trigger.sourceId,
            type: AbilityType.Triggered,
            name: `${sourceName}'s Trigger`,
            image_url: sourceImage,
            targets: [],
            abilityIndex: (trigger as any).abilityIndex,
            data: {
                effects: (trigger as any).effects || [],
                targetDefinition: (trigger as any).targetDefinition,
                eventData: event,
                eventAmount: (event as any).amount,
                sourceName: sourceName
            }
        };
        return stackObj;
    }

    public static stackTrigger(state: GameState, stackObj: any, log: (msg: string) => void) {
        state.stack.push(stackObj);
        state.consecutivePasses = 0;

        const targetDef = stackObj.data.targetDefinition;
        const sourceName = stackObj.data.sourceName;

        if (targetDef) {
            this.initializeTriggerTargeting(state, stackObj.id, targetDef, sourceName, log, stackObj);
        } else {
            log(`[TRIGGER] ${sourceName} triggered.`);
        }
    }

    private static initializeTriggerTargeting(
        state: GameState,
        stackId: string,
        targetDef: any,
        sourceName: string,
        log: (m: string) => void,
        stackObj: any
    ) {
        const { TargetingProcessor } = require('../actions/TargetingProcessor');
        const legalTargetIds = [
            ...state.battlefield.map((o: any) => o.id),
            ...(Object.values(state.players) as any[]).flatMap(p => p.graveyard.map((c: any) => c.id)),
            ...state.exile.map((o: any) => o.id),
            ...state.stack.map((o: any) => o.id),
            ...Object.keys(state.players)
        ].filter(tid => TargetingProcessor.isLegalTarget(state, stackObj.sourceId, tid, targetDef));

        if (legalTargetIds.length === 0) {
            if (targetDef.optional) {
                log(`[TRIGGER] ${sourceName}: No legal targets. Optional trigger skipped.`);
                const onStack = state.stack.find(s => s.id === stackId);
                if (onStack) onStack.targets = [];
            } else {
                log(`[ERROR] ${sourceName}: No legal targets for required trigger. Ability removed (Rule 603.3d).`);
                state.stack = state.stack.filter(s => s.id !== stackId);
            }
            return;
        }

        state.pendingAction = {
            type: ActionType.Targeting,
            playerId: stackObj.controllerId,
            sourceId: stackObj.sourceId,
            data: {
                targetDefinition: targetDef,
                targets: legalTargetIds,
                stackId: stackObj.id,
                stackObj: stackObj
            }
        };
        state.priorityPlayerId = stackObj.controllerId;
        log(`[TARGETING] ${state.players[stackObj.controllerId]?.name} choosing targets for ${sourceName}.`);
    }

    private static checkZone(state: GameState, trigger: TriggeredAbility, eventType: string): boolean {
        // Rule 603.10: "Leaves-the-battlefield" abilities look back in time.
        if (eventType === 'ON_DEATH' || eventType === 'ON_LEAVE_BATTLEFIELD') return true;

        const activeZone = trigger.activeZone || Zone.Battlefield;
        if (activeZone === 'Any') return true;

        const sourceId = trigger.sourceId;

        // CR 114: Emblem abilities function from the Command Zone (always active)
        if (activeZone === 'Command') {
            return state.emblems?.some(e => e.id === sourceId) ?? false;
        }

        // Check if source object is currently in the required zone
        const isInBattlefield = state.battlefield.some(o => o.id === sourceId);
        if (activeZone === Zone.Battlefield) return isInBattlefield;

        const isInGraveyard = Object.values(state.players).some(p => p.graveyard.some(o => o.id === sourceId));
        if (activeZone === Zone.Graveyard) return isInGraveyard;

        const isInHand = Object.values(state.players).some(p => p.hand.some(o => o.id === sourceId));
        if (activeZone === Zone.Hand) return isInHand;

        const isInStack = state.stack.some(o => o.id === sourceId);
        if (activeZone === Zone.Stack) return isInStack;

        return false;
    }


    private static collectMatchingTriggers(state: GameState, event: GameEvent): TriggeredAbility[] {
        const triggers: any[] = [];

        // 1. Emblems (Rule 114)
        if (state.emblems) {
            state.emblems.forEach(emblem => {
                if (emblem.abilities) {
                    emblem.abilities.forEach((ability: any, index: number) => {
                        if (ability.type === AbilityType.Triggered) {
                            triggers.push({
                                ...ability,
                                id: `emblem_trigger_${emblem.id}_${index}`,
                                sourceId: emblem.id,
                                controllerId: emblem.controllerId,
                                activeZone: 'Command',
                                abilityIndex: index
                            });
                        }
                    });
                }
            });
        }

        // 2. Continuous Effects (Granted Abilities - Rule 611.3)
        state.ruleRegistry.continuousEffects.forEach(effect => {
            const { EffectType } = require('@shared/engine_types');
            if (effect.type === EffectType.AddTriggeredAbility && (effect as any).value) {
                const targetIds = effect.targetIds || [];
                targetIds.forEach(tid => {
                    triggers.push({
                        ...(effect as any).value,
                        id: `granted_trigger_${effect.id}_${tid}`,
                        sourceId: tid,
                        controllerId: effect.controllerId
                    });
                });
            }
        });

        // 3. Registered Triggered Abilities (Rule 603.2, 603.7)
        // This includes permanent battlefield triggers and delayed triggers
        if (state.ruleRegistry.triggeredAbilities) {
            state.ruleRegistry.triggeredAbilities.forEach(t => {
                triggers.push(t);
            });
        }

        return triggers.filter(t => {
            const tEvent = t.eventMatch;
            const tEvents = Array.isArray(tEvent) ? tEvent : [tEvent];

            const matchesPrimary = tEvents.some(type => {
                const { TriggerEvent } = require('@shared/engine_types');
                return type === event.type ||
                    (type === TriggerEvent.EnterBattlefieldOther && event.type === TriggerEvent.EnterBattlefield) ||
                    (type === TriggerEvent.AttackOrBlock && (event.type === TriggerEvent.Attack || event.type === TriggerEvent.Block)) ||
                    (type === TriggerEvent.DamageDealtToCreature && event.type === TriggerEvent.DamageTaken) ||
                    (type === TriggerEvent.DamageDealtToPlayer && (event.type === TriggerEvent.DamageDealtToPlayer || event.type === 'ON_DAMAGE_DEALT_TO_PLAYER')) ||
                    (type === TriggerEvent.DeathOther && event.type === TriggerEvent.Death) ||
                    (type === TriggerEvent.CountersAddedOther && event.type === TriggerEvent.CountersAdded) ||
                    (type === TriggerEvent.Magecraft && event.playerId === t.controllerId && (event.type === TriggerEvent.CastInstantOrSorcery || (event.type === TriggerEvent.CopySpell && event.data?.isInstantOrSorcery))) ||
                    (type === TriggerEvent.MagecraftOpponent && event.playerId !== t.controllerId && (event.type === TriggerEvent.CastInstantOrSorcery || (event.type === TriggerEvent.CopySpell && event.data?.isInstantOrSorcery)));
            });

            if (!matchesPrimary) return false;

            // Identity Filtering (Rule 603.2)
            const { TriggerEvent } = require('@shared/engine_types');
            if (event.type === TriggerEvent.EnterBattlefield) {
                const enteringId = event.data?.object?.id || event.sourceId;
                if (tEvent === TriggerEvent.EnterBattlefield && enteringId !== t.sourceId) return false;
                if (tEvent === TriggerEvent.EnterBattlefieldOther && enteringId === t.sourceId) return false;
            }
            if (event.type === TriggerEvent.Death) {
                const deadId = event.targetId;
                if (tEvent === TriggerEvent.Death && deadId !== t.sourceId) return false;
                if (tEvent === TriggerEvent.DeathOther && deadId === t.sourceId) return false;
            }
            if (event.type === TriggerEvent.CountersAdded) {
                const targetId = event.targetId;
                if (tEvent === TriggerEvent.CountersAdded && targetId !== t.sourceId) return false;
                if (tEvent === TriggerEvent.CountersAddedOther && targetId === t.sourceId) return false;
            }
            if (event.type === TriggerEvent.Attack || event.type === TriggerEvent.Block) {
                if (tEvent === TriggerEvent.Attack || tEvent === TriggerEvent.Block || tEvent === TriggerEvent.AttackOrBlock) {
                    // Only check identity if card is not using global condition (convention)
                    // Or if the event source is one of the targeted objects for this trigger (granted abilities fallback)
                    if (event.sourceId !== t.sourceId && !t.isGlobal && !t.condition?.includes('EVENT_SOURCE') && !t.targetIds?.includes(event.sourceId)) return false;
                }
            }

            if (!this.checkZone(state, t, event.type)) return false;

            // Rule 603.4: Intervening If
            const condition = t.condition;
            if (condition) {
                if (typeof condition === 'function') {
                    if (!condition(state, event, t)) return false;
                } else if (typeof condition === 'string') {
                    const { ConditionProcessor } = require('../core/ConditionProcessor');
                    if (!ConditionProcessor.matchesCondition(state, condition, t.sourceId, t.controllerId, event)) return false;
                }
            }

            if (t.limitPerTurn) {
                const usedCount = (state.turnState.triggeredAbilitiesUsedThisTurn[t.id] || 0);
                if (usedCount >= t.limitPerTurn) return false;
            }

            return true;
        });
    }

    private static processSystemKeywords(state: GameState, event: GameEvent, matchingTriggers: TriggeredAbility[], log: (m: string) => void) {
        this.processProwess(state, event, matchingTriggers);
        this.processIncrement(state, event, matchingTriggers);
        this.processWard(state, event, matchingTriggers, log);
        this.processCascadeAndStorm(state, event, matchingTriggers, log);
        this.processRepartee(state, event, matchingTriggers);
        this.processLandfall(state, event, matchingTriggers);
        this.processOpus(state, event, matchingTriggers);
    }

    private static processProwess(state: GameState, event: GameEvent, matchingTriggers: TriggeredAbility[]) {
        if (event.type === 'ON_CAST_NON_CREATURE' && event.playerId) {
            state.battlefield.forEach(obj => {
                const stats = LayerProcessor.getEffectiveStats(obj, state);
                if (stats.keywords.includes('Prowess') && obj.controllerId === event.playerId) {
                    matchingTriggers.push({
                        id: `prowess_system_${obj.id}_${Date.now()}`,
                        sourceId: obj.id,
                        controllerId: obj.controllerId,
                        eventMatch: 'ON_CAST_NON_CREATURE',
                        effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 1, toughnessModifier: 1, layer: 7, targetMapping: 'SELF' }]
                    } as any);
                }
            });
        }
    }

    private static processIncrement(state: GameState, event: GameEvent, matchingTriggers: TriggeredAbility[]) {
        if (event.type === TriggerEvent.CastSpell && event.playerId) {
            state.battlefield.forEach(obj => {
                const stats = LayerProcessor.getEffectiveStats(obj, state);
                if (stats.keywords.includes('Increment') && obj.controllerId === event.playerId) {
                    const { ConditionProcessor } = require('../core/ConditionProcessor');
                    if (ConditionProcessor.matchesCondition(state, 'SPENT_MANA_GT_POWER_OR_TOUGHNESS', obj.id, obj.controllerId, event)) {
                        matchingTriggers.push({
                            id: `increment_system_${obj.id}_${Date.now()}`,
                            sourceId: obj.id,
                            controllerId: obj.controllerId,
                            eventMatch: TriggerEvent.CastSpell,
                            condition: 'SPENT_MANA_GT_POWER_OR_TOUGHNESS',
                            effects: [{ type: EffectType.AddCounters, amount: 1, counterType: '+1/+1', targetMapping: TargetMapping.Self }]
                        } as any);
                    }
                }
            });
        }
    }

    private static processWard(state: GameState, event: GameEvent, matchingTriggers: TriggeredAbility[], log: (m: string) => void) {
        if (event.type === 'ON_BECOME_TARGET' && event.targetId) {
            const targetObj = state.battlefield.find(o => o.id === event.targetId);
            if (targetObj) {
                const stats = LayerProcessor.getEffectiveStats(targetObj, state);
                const wards = stats.keywords.filter((k: string) => k.toLowerCase().startsWith('ward'));
                const sourceControllerId = event.playerId;
                if (sourceControllerId && sourceControllerId !== targetObj.controllerId) {
                    wards.forEach((wardStr: string) => {
                        const match = wardStr.match(/Ward(?:\s+|—\s*|:\s*)(?:Pay\s+)?(.+)/i);
                        if (!match) return;
                        const costStr = match[1].trim();
                        const choiceEffects: any[] = [];
                        let labelStr = costStr;

                        if (costStr.toLowerCase().includes('life')) {
                            const amount = parseInt(costStr.replace(/\D/g, '')) || 0;
                            choiceEffects.push({ type: 'LoseLife', amount: amount, targetMapping: 'TARGET_1' });
                            labelStr = `Pay ${amount} life`;
                        } else if (costStr.toLowerCase().includes('discard')) {
                            const amount = parseInt(costStr.replace(/\D/g, '')) || 1;
                            choiceEffects.push({ type: 'DiscardCards', amount: amount, targetMapping: 'TARGET_1' });
                            labelStr = `Discard ${amount} card${amount > 1 ? 's' : ''}`;
                        } else if (costStr.includes('{') || !isNaN(parseInt(costStr))) {
                            const manaVal = costStr.startsWith('{') ? costStr : `{${costStr}}`;
                            choiceEffects.push({ type: 'PayMana', value: manaVal, targetMapping: 'TARGET_1' });
                            labelStr = `Pay ${manaVal}`;
                        }

                        if (log) log(`[DEBUG] Ward triggering for ${targetObj.definition.name}. Cost: ${labelStr}`);
                        matchingTriggers.push({
                            id: `ward_gen_${targetObj.id}_${Date.now()}`,
                            sourceId: targetObj.id,
                            controllerId: targetObj.controllerId,
                            eventMatch: 'ON_BECOME_TARGET',
                            activeZone: 'Battlefield',
                            effects: [{
                                type: 'Choice',
                                label: `Ward Trigger: ${labelStr} or spell/ability will be countered.`,
                                targetMapping: 'EVENT_PLAYER',
                                choices: [
                                    { label: labelStr, effects: choiceEffects },
                                    { label: "Don't Pay (Counter)", effects: [{ type: EffectType.CounterSpellOrAbility, targetMapping: 'TRIGGER_SOURCE' }] }
                                ]
                            }]
                        } as any);
                    });
                }
            }
        }
    }

    private static processCascadeAndStorm(state: GameState, event: GameEvent, matchingTriggers: TriggeredAbility[], log: (m: string) => void) {
        if (event.type === 'ON_CAST_SPELL' && event.data?.card) {
            const card = event.data.card;
            const stats = LayerProcessor.getEffectiveStats(card, state, log);
            const { keywords } = stats;

            // Cascade
            const cascadeInstances = keywords.filter((k: string) => k.toLowerCase() === 'cascade');
            cascadeInstances.forEach((_: any, i: number) => {
                matchingTriggers.push({
                    id: `cascade_system_${card.id}_${Date.now()}_${i}`,
                    sourceId: card.id,
                    controllerId: event.playerId,
                    eventMatch: 'ON_CAST_SPELL',
                    effects: [{
                        type: 'RevealUntilCondition',
                        restrictions: ['Nonland', { type: 'ManaValueLess', value: 'SOURCE_MV' }],
                        zone: Zone.Exile, remainderZone: Zone.Library, remainderPosition: 'bottom', shuffleRemainder: true,
                        next: {
                            type: 'Choice', label: 'Cast the revealed card?',
                            choices: [
                                { label: 'Yes', effects: [{ type: 'CastSpell', targetMapping: 'TARGET_1', isFreeCast: true }] },
                                { label: 'No', effects: [{ type: 'MoveToZone', zone: Zone.Library, libraryPosition: 'bottom', targetMapping: 'TARGET_1' }] }
                            ]
                        }
                    }]
                } as any);
            });

            // Storm
            if (keywords.includes('Storm')) {
                const totalSpells = Object.values(state.turnState.spellsCastThisTurn).reduce((a, b) => a + (b as number), 0);
                const stormCount = totalSpells - 1;
                if (stormCount > 0) {
                    for (let i = 0; i < stormCount; i++) {
                        matchingTriggers.push({
                            id: `storm_copy_${card.id}_${i}_${Date.now()}`,
                            sourceId: card.id,
                            controllerId: event.playerId,
                            eventMatch: 'ON_CAST_SPELL',
                            effects: [{ type: 'CopySpellOnStack', targetMapping: 'TRIGGER_EVENT_SOURCE' }]
                        } as any);
                    }
                }
            }
        }
    }

    private static processRepartee(state: GameState, event: GameEvent, matchingTriggers: TriggeredAbility[]) {
        if (event.type === 'ON_CAST_INSTANT_SORCERY' && event.playerId) {
            const stackObj = event.data?.stackSnapshot;
            const targets = stackObj?.targets || [];
            if (targets.some((tid: string) => state.battlefield.find(o => o.id === tid)?.definition.types.some(t => t.toLowerCase() === 'creature'))) {
                state.battlefield.forEach(obj => {
                    if (String(obj.controllerId) === String(event.playerId) && obj.definition.keywords?.includes('Repartee')) {
                        const reparteeAbility = oracle.getCard(obj.definition.name)?.abilities?.find((a: any) => a.id?.includes('repartee') || a.eventMatch === 'ON_REPARTEE' || a.name === 'Repartee');
                        if (reparteeAbility) {
                            matchingTriggers.push({ ...reparteeAbility, id: `repartee_gen_${obj.id}_${Date.now()}`, sourceId: obj.id, controllerId: obj.controllerId } as any);
                        }
                    }
                });
            }
        }
    }

    private static processLandfall(state: GameState, event: GameEvent, matchingTriggers: TriggeredAbility[]) {
        if (event.type === 'ON_ETB' && event.data?.object?.definition.types.some((t: string) => t.toLowerCase() === 'land')) {
            const obj = event.data.object;
            state.battlefield.forEach(p => {
                if (String(p.controllerId) === String(obj.controllerId)) {
                    const landfallAbility = oracle.getCard(p.definition.name)?.abilities?.find((a: any) => a.eventMatch === 'ON_LANDFALL' || a.name === 'Landfall');
                    if (landfallAbility) {
                        matchingTriggers.push({ ...landfallAbility, id: `landfall_${p.id}_${Date.now()}`, sourceId: p.id, controllerId: p.controllerId } as any);
                    }
                }
            });
        }
    }

    private static processOpus(state: GameState, event: GameEvent, matchingTriggers: TriggeredAbility[]) {
        if (event.type === 'ON_CAST_INSTANT_SORCERY' && event.playerId) {
            state.battlefield.forEach(p => {
                if (String(p.controllerId) === String(event.playerId)) {
                    const opusAbility = oracle.getCard(p.definition.name)?.abilities?.find((a: any) => a.eventMatch === 'ON_OPUS' || a.name === 'Opus');
                    if (opusAbility) {
                        // Avoid adding duplicate trigger if collectMatchingTriggers already found it
                        const alreadyAdded = matchingTriggers.some(t => t.sourceId === p.id && (t.name === 'Opus' || t.oracleText?.includes('Opus')));
                        if (!alreadyAdded) {
                            matchingTriggers.push({
                                ...opusAbility,
                                id: `opus_sys_${p.id}_${Date.now()}`,
                                sourceId: p.id,
                                controllerId: p.controllerId,
                                eventData: { spent: event.data?.card?.paidManaValue || 0 }
                            } as any);
                        }
                    }
                }
            });
        }
    }

    private static sortByAPNAP(state: GameState, triggers: TriggeredAbility[]): TriggeredAbility[] {
        const activePlayerId = state.activePlayerId;

        // This is a simplified sort: 
        // Active player triggers go on the stack FIRST (resolving LAST)
        // Non-active player triggers go on the stack LAST (resolving FIRST)
        return [...triggers].sort((a, b) => {
            if (a.controllerId === activePlayerId && b.controllerId !== activePlayerId) return -1;
            if (a.controllerId !== activePlayerId && b.controllerId === activePlayerId) return 1;
            return 0; // Same player - in a real engine, the player would choose
        });
    }
}


