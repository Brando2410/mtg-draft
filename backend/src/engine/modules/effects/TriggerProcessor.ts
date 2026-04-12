import { GameState, GameEvent, TriggeredAbility, PlayerId, GameObjectId, Zone, ZoneRequirement, AbilityType, ActionType } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';

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
        (type === 'ON_ETB_OTHER' && event.type === 'ON_ETB') ||
        (type === 'ON_SECOND_DRAW' && event.type === 'ON_SECOND_DRAW') ||
        (type === 'ON_ATTACK_OR_BLOCK' && (event.type === 'ON_ATTACK' || event.type === 'ON_BLOCK')) ||
        (type === 'ON_DAMAGE_DEALT_TO_CREATURE' && event.type === 'ON_DAMAGE_TAKED') ||
        (type === 'ON_DAMAGE_DEALT_TO_PLAYER' && event.type === 'ON_DAMAGE_PLAYER') ||
        (type === 'ON_COUNTERS_ADDED_OTHER' && event.type === 'ON_COUNTERS_ADDED')
      );

      if (!matchesPrimary) return false;

      // Rule 603.2: Triggered abilities only function in their active zone (usually Battlefield)
      if (!this.checkZoneRequirement(state, t, event.type)) {
          return false;
      }

      // Special Logic for ETB filtering (Self vs Other)
      if (event.type === 'ON_ETB') {
        const enteringObjId = event.data?.object?.id;
        if (tEvent === 'ON_ETB') {
           // "When [this] enters" -> must be itself
           if (enteringObjId !== t.sourceId) return false;
        } else if (tEvent === 'ON_ETB_OTHER') {
           // "Whenever another enters" -> must NOT be itself
           if (enteringObjId === t.sourceId) return false;
        }
      }

      // Special Logic for Counter Added (Self vs Other)
      if (event.type === 'ON_COUNTERS_ADDED') {
        const targetId = event.targetId;
        if (tEvent === 'ON_COUNTERS_ADDED') {
            if (targetId !== t.sourceId) return false;
        } else if (tEvent === 'ON_COUNTERS_ADDED_OTHER') {
            if (targetId === t.sourceId) return false;
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
                    const costStr = wardStr.replace(/Ward /i, '').trim();
                    const choiceEffects: any[] = [];
                    
                    if (costStr === '3_LIFE') {
                         choiceEffects.push({ type: 'LoseLife', amount: 3, targetMapping: 'CONTROLLER' });
                    }

                    matchingTriggers.push({
                        id: `ward_gen_${targetObj.id}_${Date.now()}`,
                        sourceId: targetObj.id,
                        controllerId: targetObj.controllerId,
                        triggerEvent: 'ON_BECOME_TARGET',
                        activeZone: 'Battlefield',
                        effects: [{
                            type: 'Choice',
                            label: `Ward Trigger: Pay ${costStr.replace('_', ' ')} or spell will be countered.`,
                            targetId: sourceControllerId, // Specific player who cast the spell
                            choices: [
                                { label: `Pay ${costStr.replace('_', ' ')}`, effects: choiceEffects },
                                { label: "Don't Pay (Counter Spell)", effects: [{ type: 'Counter', targetMapping: 'TRIGGER_SOURCE' }] }
                            ]
                        }]
                    } as any);
                });
            }
        }
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
