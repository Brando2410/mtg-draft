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
  public static onEvent(state: GameState, event: GameEvent, log: (msg: string) => void) {
    // 1. Find all matching triggers on the "Whiteboard"
    const triggers = state.ruleRegistry.triggeredAbilities.filter(t => {
      // Check if the event type matches (e.g. 'ON_ETB')
      if ((t as any).triggerEvent !== event.type && t.eventMatch !== event.type) return false;

      // Check if the source card is in a valid zone (Rule 603.2)
      if (!this.isSourceInValidZone(state, t, event.type)) return false;

      // Evaluate condition (Rule 603.4)
      const condition = (t as any).triggerCondition || t.condition;
      if (condition && !condition(state, event, t)) return false;

      return true;
    });

    if (triggers.length === 0) return;

    // 2. Sort by APNAP order...
    const sortedTriggers = this.sortByAPNAP(state, triggers);

    // 3. Put them on the stack
    for (const trigger of sortedTriggers) {
      const sourceName = state.battlefield.find(o => o.id === trigger.sourceId)?.definition.name || trigger.sourceId;
      log(`[TRIGGER] ${sourceName} triggered by ${event.type}: ${(trigger as any).oracleText || ''}`);

      const stackId = `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const stackObj: any = {
        id: stackId,
        controllerId: trigger.controllerId,
        sourceId: trigger.sourceId,
        type: 'TriggeredAbility',
        name: (state.battlefield.find(o => o.id === trigger.sourceId)?.definition.name || 'Unknown') + "'s Trigger",
        oracleText: (trigger as any).oracleText || 'Resolving trigger...',
        targets: [], 
        abilityIndex: (trigger as any).abilityIndex,
        data: { 
            effects: (trigger as any).effects || [],
            targetDefinition: (trigger as any).targetDefinition
        }
      };

      state.stack.push(stackObj);
      state.consecutivePasses = 0; // Rule 117.4: Reset pass count when stack is added to

      // Rule 603.3d: If the trigger requires targets, the controller chooses them now.
      const targetDef = (trigger as any).targetDefinition;
      if (targetDef) {
         const legalTargetIds = state.battlefield
            .filter(o => ValidationProcessor.isLegalTarget(state, trigger.sourceId, o.id, targetDef))
            .map(o => o.id);

         if (legalTargetIds.length === 0) {
            if (targetDef.optional) {
               log(`No legal targets found for ${sourceName}'s optional trigger. Continuing with zero targets.`);
               // Ability stays on stack but requires no targets
               const onStack = state.stack.find(s => s.id === stackId);
               if (onStack) onStack.targets = [];
               continue;
            } else {
               log(`[ERROR] No legal targets for ${sourceName}'s required trigger. Trigger removed from stack (Rule 603.3d).`);
               state.stack = state.stack.filter(s => s.id !== stackId);
               continue;
            }
         }

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
         log(`[TARGETING] Player ${state.players[trigger.controllerId]?.name} must choose targets for ${sourceName}'s trigger: ${(trigger as any).oracleText}`);
      }
    }
  }

  private static isSourceInValidZone(state: GameState, trigger: TriggeredAbility, eventType?: string): boolean {
    // Rule 603.10: Leaves-the-battlefield abilities look back in time.
    // If it's a death trigger, it triggers regardless of whether the source is still on the battlefield
    // because it just moved to the graveyard.
    if (eventType === 'ON_DEATH') return true;

    const activeZone = (trigger as any).activeZone || Zone.Battlefield;
    if (activeZone === 'Any') return true;

    const sourceId = trigger.sourceId;

    if (activeZone === Zone.Battlefield) return state.battlefield.some(o => o.id === sourceId);
    if (activeZone === Zone.Graveyard) {
      return Object.values(state.players).some(p => p.graveyard.some(o => o.id === sourceId));
    }
    if (activeZone === Zone.Hand) {
      return Object.values(state.players).some(p => p.hand.some(o => o.id === sourceId));
    }

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
