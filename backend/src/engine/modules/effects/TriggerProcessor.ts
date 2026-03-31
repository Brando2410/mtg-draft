import { GameState, GameEvent, TriggeredAbility, PlayerId, GameObjectId, Zone, ZoneRequirement } from '@shared/engine_types';
import { ValidationProcessor } from '../state/ValidationProcessor';

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
      // Logic for event matching (supports legacy and new schemas)
      const eventType = (t as any).triggerEvent || t.eventMatch;
      if (eventType !== event.type) return false;

      // Rule 603.2: Triggered abilities only function in their active zone (usually Battlefield)
      if (!this.checkZoneRequirement(state, t, event.type)) return false;

      // Rule 603.4: "Intervening If" clauses and dynamic conditions
      const condition = (t as any).triggerCondition || t.condition;
      if (condition && !condition(state, event, t)) return false;

      return true;
    });

    if (matchingTriggers.length === 0) return;

    // 2. Sort by APNAP order (Rule 101.4)
    // All triggers belonging to the Active Player go on the stack first, then the Non-Active Players.
    const sortedTriggers = this.sortByAPNAP(state, matchingTriggers);

    // 3. Move triggers from registration to the Stack (Rule 603.3)
    for (const trigger of sortedTriggers) {
      this.putTriggerOnStack(state, trigger, event, log);
    }
  }

  private static putTriggerOnStack(state: GameState, trigger: TriggeredAbility, event: GameEvent, log: (msg: string) => void) {
    const sourceObj = state.battlefield.find(o => o.id === trigger.sourceId) || 
                      state.exile.find(o => o.id === trigger.sourceId);
    
    const sourceName = sourceObj?.definition.name || "Unknown Source";
    
    // Create the Stack Object (Rule 608.2)
    const stackId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const stackObj: any = {
      id: stackId,
      controllerId: trigger.controllerId,
      sourceId: trigger.sourceId,
      type: 'TriggeredAbility',
      name: `${sourceName}'s Trigger`,
      oracleText: (trigger as any).oracleText || `Triggered by ${event.type}`,
      targets: [], 
      abilityIndex: (trigger as any).abilityIndex,
      data: { 
          effects: (trigger as any).effects || [],
          targetDefinition: (trigger as any).targetDefinition
      }
    };

    state.stack.push(stackObj);
    state.consecutivePasses = 0; // Rule 117.4: Reset pass count

    // Rule 603.3d: Choice of targets occurs as the ability is put on the stack.
    const targetDef = (trigger as any).targetDefinition;
    if (targetDef) {
       this.initializeTriggerTargeting(state, trigger, stackId, targetDef, sourceName, log);
    } else {
       log(`[TRIGGER] ${sourceName} triggered by ${event.type}.`);
    }
  }

  private static initializeTriggerTargeting(
    state: GameState, 
    trigger: TriggeredAbility, 
    stackId: string, 
    targetDef: any, 
    sourceName: string, 
    log: (m: string) => void
  ) {
    const legalTargetIds = [
        ...state.battlefield.map(o => o.id),
        ...Object.keys(state.players)
    ].filter(tid => ValidationProcessor.isLegalTarget(state, trigger.sourceId, tid, targetDef));

    if (legalTargetIds.length === 0) {
       // Rule 603.3d: If no legal targets can be chosen, it's removed from the stack unless optional.
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

    // Set up the interactive targeting session (Rule 117)
    state.pendingAction = {
       type: 'TARGETING',
       playerId: trigger.controllerId,
       sourceId: trigger.sourceId,
       data: { 
           stackId: stackId,
           targetDefinition: targetDef,
           legalTargetIds: legalTargetIds,
           optional: targetDef.optional
       }
    };
    state.priorityPlayerId = trigger.controllerId;
    log(`[TARGETING] ${state.players[trigger.controllerId]?.name} choosing targets for ${sourceName}.`);
  }

  private static checkZoneRequirement(state: GameState, trigger: TriggeredAbility, eventType: string): boolean {
    // Rule 603.10: "Leaves-the-battlefield" abilities look back in time.
    if (eventType === 'ON_DEATH' || eventType === 'ON_LEAVE_BATTLEFIELD') return true;

    const activeZone = (trigger as any).activeZone || Zone.Battlefield;
    if (activeZone === 'Any') return true;

    const sourceId = trigger.sourceId;
    
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
