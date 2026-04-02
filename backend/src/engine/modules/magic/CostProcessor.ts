import { GameState, GameObject, PlayerId, GameObjectId, AbilityCost, RestrictionType, Zone } from '@shared/engine_types';
import { ManaProcessor } from './ManaProcessor';
import { ActionProcessor } from '../actions/ActionProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { TargetingProcessor } from '../actions/TargetingProcessor';

/**
 * Rules Engine Module: Cost Processing (Rule 601.2h / 101.1)
 * Responsible for verifying if a cost can be paid and performing the payment.
 */
export class CostProcessor {

  /**
   * Returns true if all costs in the list are currently payable.
   * Checks for restrictions like "Cannot Tap" (Rule 101.1).
   */
  public static canPay(state: GameState, costs: AbilityCost[], sourceId: GameObjectId, playerId: PlayerId): boolean {
    const source = this.findObject(state, sourceId);
    if (!source) return false;

    for (const cost of costs) {
      if (!this.canPaySingle(state, cost, source, playerId)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Executes the payment for all costs.
   * Note: This assumes canPay has already been checked.
   */
  public static pay(state: GameState, costs: AbilityCost[], sourceId: GameObjectId, playerId: PlayerId, log: (m: string) => void) {
    const source = this.findObject(state, sourceId);
    if (!source) return;

    for (const cost of costs) {
      this.paySingle(state, cost, source, playerId, log);
    }
  }

  private static canPaySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    switch (cost.type) {
      case 'Tap':
        if (source.isTapped) return false;
        
        // Rule 302.6: Summoning Sickness applies to tap abilities of creatures
        if (source.definition.types.includes('Creature') && source.summoningSickness) {
           const stats = LayerProcessor.getEffectiveStats(source, state);
           if (!stats.keywords.includes('Haste')) {
                return false; 
           }
        }

        const hasRestriction = state.ruleRegistry.restrictions.some(r => 
          r.type === RestrictionType.CannotTap && 
          (r.targetId === source.id || (r.targetControllerId === source.controllerId && !r.targetId))
        );
        if (hasRestriction) return false;
        return true;

      case 'Mana':
        return ManaProcessor.canPayWithTotal(player, state.battlefield, cost.value);

      case 'Loyalty':
        const val = parseInt(cost.value);
        const current = source.counters.loyalty || 0;
        return val >= 0 || current >= Math.abs(val);

      case 'Sacrifice':
        if (cost.targetMapping === 'SELF') {
           return state.battlefield.some(c => c.id === source.id);
        }
        if (cost.restrictions) {
           return state.battlefield.some(c => c.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, c, cost.restrictions!, playerId, source.id));
        }
        return state.battlefield.some(c => c.controllerId === playerId);

      case 'Discard':
        return player.hand.length > 0;

      case 'PayLife':
        return player.life > (parseInt(cost.value) || 0);

      default:
        return false;
    }
  }

  private static paySingle(state: GameState, cost: AbilityCost, source: GameObject, playerId: PlayerId, log: (m: string) => void) {
    const player = state.players[playerId];
    if (!player) return;

    switch (cost.type) {
      case 'Tap':
        source.isTapped = true;
        break;

      case 'Mana':
        // Auto-tap logic is usually handled before calling pay() or inside playCard/activateAbility
        // If we reach here, we assume mana is in the pool or we deduct it directly
        ManaProcessor.deductManaCost(player, cost.value);
        break;

      case 'Loyalty':
        const lVal = parseInt(cost.value);
        const oldL = source.counters.loyalty || 0;
        source.counters.loyalty = oldL + lVal;
        log(`${source.definition.name} loyalty: ${oldL} -> ${source.counters.loyalty}`);
        break;

      case 'Sacrifice':
        // CR 701.17: To sacrifice a permanent, move it to its owner's graveyard.
        let toSac;
        if (cost.targetMapping === 'SELF') {
            toSac = source;
        } else {
            // Simplified: just sacrifice the first valid source if not specified
            // In a real version, this should trigger a pending action or take a parameter
            toSac = state.battlefield.find(c => c.controllerId === playerId && (!cost.restrictions || TargetingProcessor.matchesRestrictions(state, c, cost.restrictions!, playerId, source.id)));
        }
        
        if (toSac) {
            ActionProcessor.moveCard(state, toSac, Zone.Graveyard, playerId, log);
        }
        break;

      case 'Discard':
        // Should trigger DISCARD action
        break;

       case 'PayLife':
         const lifeVal = parseInt(cost.value) || 0;
         player.life -= lifeVal;
         log(`${player.name} pays ${lifeVal} life (${player.life + lifeVal} -> ${player.life})`);
         break;
    }
  }

  private static findObject(state: GameState, id: GameObjectId): GameObject | undefined {
    return state.battlefield.find(o => o.id === id) || 
           state.exile.find(o => o.id === id);
  }
}
