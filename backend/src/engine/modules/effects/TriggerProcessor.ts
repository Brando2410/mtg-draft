import { GameState, GameEvent, TriggeredAbility, PlayerId, GameObjectId, Zone, ZoneRequirement, AbilityType, ActionType, ConditionType, TriggerEvent } from '@shared/engine_types';
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
  /**
   * Main entry point for any game event (LifeGain, ETB, Death, etc.)
   * Rule 603.3: "Once an ability has triggered, its controller puts it on the stack..."
   */
  public static onEvent(state: GameState, event: GameEvent, log: (msg: string) => void) {
    // 1. Identify all triggered abilities that match this event (Rule 603.2)
    const matchingTriggers = state.ruleRegistry.triggeredAbilities.filter(t => {
      // Logic for event matching (supports legacy, new schemas, and multi-event triggers)
      const tEvent = (t as any).triggerEvent || t.eventMatch;
      const tEvents = Array.isArray(tEvent) ? tEvent : [tEvent];

      const matchesPrimary = tEvents.some(type => 
        type === event.type || 
        (type === TriggerEvent.EnterBattlefieldOther && event.type === TriggerEvent.EnterBattlefield) ||
        (type === TriggerEvent.SecondDraw && event.type === TriggerEvent.SecondDraw) ||
        (type === TriggerEvent.AttackOrBlock && (event.type === TriggerEvent.Attack || event.type === TriggerEvent.Block)) ||
        (type === TriggerEvent.DamageDealtToCreature && event.type === TriggerEvent.DamageTaken) ||
        (type === TriggerEvent.DamageDealtToPlayer && event.type === TriggerEvent.DamageDealtToPlayerLegacy) ||
        (type === TriggerEvent.DeathOther && event.type === TriggerEvent.Death) ||
        (type === TriggerEvent.CountersAddedOther && event.type === TriggerEvent.CountersAdded) ||
        (type === TriggerEvent.Magecraft && event.playerId === t.controllerId && (event.type === TriggerEvent.CastInstantOrSorcery || (event.type === TriggerEvent.CopySpell && event.data?.isInstantOrSorcery))) ||
        (type === TriggerEvent.MagecraftOpponent && event.playerId !== t.controllerId && (event.type === TriggerEvent.CastInstantOrSorcery || (event.type === TriggerEvent.CopySpell && event.data?.isInstantOrSorcery)))
      );

      if (!matchesPrimary) return false;

      // Rule 603.2: Triggered abilities only function in their active zone (usually Battlefield)
      if (!this.checkZoneRequirement(state, t, event.type)) {
          return false;
      }

      // Special Logic for ETB filtering (Self vs Other)
      if (event.type === TriggerEvent.EnterBattlefield) {
        const enteringObjId = event.data?.object?.id;
        if (tEvent === TriggerEvent.EnterBattlefield) {
           if (enteringObjId !== t.sourceId) return false;
        } else if (tEvent === TriggerEvent.EnterBattlefieldOther) {
           if (enteringObjId === t.sourceId) return false;
        }
      }


      // Special Logic for Counter Added (Self vs Other)
      if (event.type === TriggerEvent.CountersAdded) {
        const targetId = event.targetId;
        if (tEvent === TriggerEvent.CountersAdded) {
            if (targetId !== t.sourceId) return false;
        } else if (tEvent === TriggerEvent.CountersAddedOther) {
            if (targetId === t.sourceId) return false;
        }
      }
      
      // Special Logic for Death (Self vs Other)
      if (event.type === TriggerEvent.Death) {
        const deadObjId = event.targetId;
        if (tEvent === TriggerEvent.Death) {
            if (deadObjId !== t.sourceId) return false;
        } else if (tEvent === TriggerEvent.DeathOther) {
            if (deadObjId === t.sourceId) return false;
        }
      }

      // Rule 603.4: "Intervening If" clauses and dynamic conditions
      const condition = (t as any).triggerCondition || (t as any).condition;
      if (condition) {
          if (typeof condition === 'function') {
              if (!condition(state, event, t)) return false;
          } else if (typeof condition === 'string') {
              const { ConditionProcessor } = require('../core/ConditionProcessor');
              if (!ConditionProcessor.matchesCondition(state, condition, t.sourceId, t.controllerId, event)) return false;
          }
      }

      return true;
    });
    
    // --- SYSTEM RECOGNIZED KEYWORDS: PROWESS ---
    // Rule 702.108: "Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn."
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

    // --- SYSTEM RECOGNIZED KEYWORDS: WARD ---
    if (event.type === 'ON_BECOME_TARGET' && event.targetId) {
        const targetObj = state.battlefield.find(o => o.id === event.targetId);
        if (targetObj) {
            const stats = LayerProcessor.getEffectiveStats(targetObj, state);
            const wards = stats.keywords.filter((k: string) => k.toLowerCase().startsWith('ward'));
            
            const sourceControllerId = event.playerId; // Player who cast the targeting spell
            if (sourceControllerId && sourceControllerId !== targetObj.controllerId) {
                wards.forEach((wardStr: string) => {
                    const match = wardStr.match(/Ward(?:\s+|—\s*(?:Pay\s+)?)(.+)/i);
                    if (!match) return;
                    
                    const costStr = match[1].trim();
                    const choiceEffects: any[] = [];
                    let labelStr = costStr;

                    if (costStr.toLowerCase().includes('life')) {
                        const amount = parseInt(costStr) || 0;
                        choiceEffects.push({ type: 'LoseLife', amount: amount, targetMapping: 'CONTROLLER' });
                        labelStr = `Pay ${amount} life`;
                    } else if (costStr.startsWith('{') && costStr.endsWith('}')) {
                         choiceEffects.push({ type: 'PayMana', value: costStr }); // Hypothetical mana effect in Choice modal
                         labelStr = `Pay ${costStr}`;
                    }

                    matchingTriggers.push({
                        id: `ward_gen_${targetObj.id}_${Date.now()}`,
                        sourceId: targetObj.id,
                        controllerId: targetObj.controllerId,
                        triggerEvent: 'ON_BECOME_TARGET',
                        activeZone: 'Battlefield',
                        effects: [{
                            type: 'Choice',
                            label: `Ward Trigger: ${labelStr} or spell will be countered.`,
                            targetId: sourceControllerId,
                            choices: [
                                { label: labelStr, effects: choiceEffects },
                                { label: "Don't Pay (Counter Spell)", effects: [{ type: 'CounterSpell', targetMapping: 'TRIGGER_SOURCE' }] }
                            ]
                        }]
                    } as any);
                });
            }
        }
    }

    // --- SYSTEM RECOGNIZED KEYWORDS: CASCADE & STORM ---
    if (event.type === 'ON_CAST_SPELL' && event.data?.card) {
        const card = event.data.card;
        const keywords = card.definition.keywords || [];
        
        // 1. Cascade (Rule 702.85)
        if (keywords.includes('Cascade')) {
            matchingTriggers.push({
                id: `cascade_system_${card.id}_${Date.now()}`,
                sourceId: card.id,
                controllerId: event.playerId,
                eventMatch: 'ON_CAST_SPELL',
                effects: [{
                    type: 'SearchLibrary',
                    selectionType: 'TopN',
                    amount: 1,
                    sourceZones: [Zone.Library],
                    restrictions: [{ type: 'ManaValueLess', value: 'SOURCE_MV' }, { type: 'Nonland' }],
                    destination: Zone.Exile,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    effects: [{
                        type: 'Choice',
                        label: 'Cast the revealed card?',
                        choices: [
                            { 
                                label: 'Yes', 
                                effects: [{ 
                                    type: 'MoveToZone', 
                                    zone: Zone.Stack, 
                                    targetMapping: 'SELECTED_CARD', 
                                    isFreeCast: true,
                                    enforceMVCheck: 'SOURCE_MV' 
                                }] 
                            },
                            { label: 'No', effects: [] }
                        ]
                    }]
                }]
            } as any);
        }

        // 2. Storm (Rule 702.40)
        if (keywords.includes('Storm')) {
            const stormCount = (Number(state.turnState.spellsCastThisTurn) || 0) - 1;
            if (stormCount > 0) {
                log(`[STORM] ${card.definition.name} triggering for ${stormCount} copies.`);
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

    // --- SYSTEM RECOGNIZED KEYWORDS: INCREMENT ---
    if (event.type === 'ON_CAST_SPELL' && event.playerId) {
        state.battlefield.forEach(obj => {
            if (obj.controllerId !== event.playerId) return;
            const keywords = obj.definition.keywords || [];
            if (keywords.includes('Increment')) {
                const manaSpent = (event.data?.card?.paidManaValue) || 0;
                const stats = LayerProcessor.getEffectiveStats(obj, state);
                
                // Trigger Check: spent > P or spent > T
                if (manaSpent > stats.power || manaSpent > stats.toughness) {
                    matchingTriggers.push({
                        id: `increment_gen_${obj.id}_${Date.now()}`,
                        sourceId: obj.id,
                        controllerId: obj.controllerId,
                        eventMatch: 'ON_CAST_SPELL',
                        triggerCondition: (s: any, ev: any, t: any) => {
                            const o = s.battlefield.find((p: any) => p.id === t.sourceId);
                            if (!o) return false;
                            const currentStats = LayerProcessor.getEffectiveStats(o, s);
                            const spent = (ev.data?.card?.paidManaValue) || 0;
                            return spent > currentStats.power || spent > currentStats.toughness;
                        },
                        effects: [{ type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'SELF' }]
                    } as any);
                }
            }
        });
    }

    // --- SYSTEM RECOGNIZED KEYWORDS: REPARTEE ---
    if (event.type === 'ON_CAST_INSTANT_SORCERY' && event.playerId) {
        const stackObj = event.data?.stackSnapshot;
        const targets = stackObj?.targets || [];
        const targetsCreature = targets.some((tid: string) => {
            const obj = state.battlefield.find(o => o.id === tid);
            return obj && obj.definition.types.some(t => t.toLowerCase() === 'creature');
        });

        if (targetsCreature) {
            state.battlefield.forEach(obj => {
                if (obj.controllerId !== event.playerId) return;
                const keywords = obj.definition.keywords || [];
                if (keywords.includes('Repartee')) {
                    const logic = oracle.getCard(obj.definition.name);
                    const reparteeAbility = (logic as any)?.abilities?.find((a: any) => a.id?.includes('repartee') || a.triggerEvent === 'ON_REPARTEE' || a.name === 'Repartee');
                    
                    if (reparteeAbility) {
                        matchingTriggers.push({
                            ...reparteeAbility,
                            id: `repartee_gen_${obj.id}_${Date.now()}`,
                            sourceId: obj.id,
                            controllerId: obj.controllerId,
                        } as any);
                    }
                }
            });
        }
    }

    // --- SYSTEM RECOGNIZED KEYWORDS: LANDFALL ---
    if (event.type === 'ON_ETB' && event.data?.object) {
        const obj = event.data.object;
        if (obj.definition.types.some((t: string) => t.toLowerCase() === 'land')) {
            state.battlefield.forEach(p => {
                if (p.controllerId === obj.controllerId) {
                    const logic = oracle.getCard(p.definition.name);
                    const landfallAbility = (logic as any)?.abilities?.find((a: any) => a.triggerEvent === 'ON_LANDFALL' || a.name === 'Landfall');
                    if (landfallAbility) {
                        matchingTriggers.push({
                            ...landfallAbility,
                            id: `landfall_${p.id}_${Date.now()}`,
                            sourceId: p.id,
                            controllerId: p.controllerId
                        } as any);
                    }
                }
            });
        }
    }

    // --- SYSTEM RECOGNIZED KEYWORDS: OPUS ---
    if (event.type === 'ON_CAST_INSTANT_SORCERY' && event.playerId) {
        state.battlefield.forEach(p => {
            if (p.controllerId === event.playerId) {
                const logic = oracle.getCard(p.definition.name);
                const opusAbility = (logic as any)?.abilities?.find((a: any) => a.triggerEvent === 'ON_OPUS' || a.name === 'Opus');
                if (opusAbility) {
                    matchingTriggers.push({
                        ...opusAbility,
                        id: `opus_${p.id}_${Date.now()}`,
                        sourceId: p.id,
                        controllerId: p.controllerId,
                        eventData: { spent: event.data?.card?.paidManaValue || 0 }
                    } as any);
                }
            }
        });
    }

    if (matchingTriggers.length === 0) return;

    // 2. Queue all triggers in pending state
    if (!state.pendingTriggers) state.pendingTriggers = [];
    
    for (const trigger of matchingTriggers) {
        const stackObj = this.createStackObject(state, trigger, event, log);
        state.pendingTriggers.push(stackObj);
    }

    // 3. Process the queue in APNAP order
    this.processPendingTriggers(state, log);

    // 4. Cleanup single-shot delayed triggers (Rule 603.7)
    matchingTriggers.forEach(t => {
        if ((t as any).isDelayed && !(t as any).duration.startsWith('UNTIL')) {
             state.ruleRegistry.triggeredAbilities = state.ruleRegistry.triggeredAbilities.filter(orig => orig.id !== t.id);
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
      triggerCondition: effect.triggerCondition,
      isDelayed: true,
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
        ...state.battlefield.map(o => o.id),
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

  private static checkZoneRequirement(state: GameState, trigger: TriggeredAbility, eventType: string): boolean {
    // Rule 603.10: "Leaves-the-battlefield" abilities look back in time.
    if (eventType === 'ON_DEATH' || eventType === 'ON_LEAVE_BATTLEFIELD') return true;

    const activeZone = (trigger as any).activeZone || Zone.Battlefield;
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

    return false;
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
