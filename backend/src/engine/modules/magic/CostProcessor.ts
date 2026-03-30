import { GameState, GameObject, PlayerId, GameObjectId, AbilityCost, RestrictionType } from '@shared/engine_types';
import { ManaProcessor } from './ManaProcessor';

/**
 * Rules Engine Module: Cost Processing (Rule 601.2h / 101.1)
 * Responsible for verifying if a cost can be paid and performing the payment.
 */
export class CostProcessor {

  /**
   * Returns true if all costs in the list are currently payable.
   * Checks for restrictions like "Cannot Tap" (Rule 101.1).
   */
  public static canPay(state: GameState, costs: AbilityCost[], sourceId: GameObjectId): boolean {
    const source = this.findObject(state, sourceId);
    if (!source) return false;

    for (const cost of costs) {
      if (!this.canPaySingle(state, cost, source)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Executes the payment for all costs.
   * Note: This assumes canPay has already been checked.
   */
  public static pay(state: GameState, costs: AbilityCost[], sourceId: GameObjectId) {
    const source = this.findObject(state, sourceId);
    if (!source) return;

    for (const cost of costs) {
      this.paySingle(state, cost, source);
    }
  }

  private static canPaySingle(state: GameState, cost: AbilityCost, source: GameObject): boolean {
    switch (cost.type) {
      case 'Tap':
        // 1. Is it already tapped?
        if (source.isTapped) return false;

        // 2. Summoning Sickness (Rule 302.6)
        const typeLine = (source.definition.type_line || '').toLowerCase();
        if (typeLine.includes('creature') && source.summoningSickness) {
           // Note: Unless it has Haste (Layer 6 keyword check)
           return false; 
        }

        // 3. Global Restrictions (The "Can't Tap" aura scenario)
        const hasRestriction = state.ruleRegistry.restrictions.some(r => 
          r.type === RestrictionType.CannotTap && 
          (r.targetId === source.id || (r.targetControllerId === source.controllerId && !r.targetId))
        );
        if (hasRestriction) return false;

        return true;

      case 'Mana':
        // Check if player has the mana in pool
        return this.canAffordMana(state, source.controllerId, cost.value);

      default:
        return false;
    }
  }

  private static paySingle(state: GameState, cost: AbilityCost, source: GameObject) {
    switch (cost.type) {
      case 'Tap':
        source.isTapped = true;
        break;
      case 'Mana':
        this.deductMana(state, source.controllerId, cost.value);
        break;
    }
  }

  /**
   * Scans all available activated abilities to see if the player COULD 
   * produce enough mana to pay a cost.
   */
  public static calculatePotentialMana(state: GameState, playerId: PlayerId): Record<string, number> {
    const potential: Record<string, number> = { ...state.players[playerId].manaPool };
    
    // Find all mana abilities controlled by this player
    const manaAbilities = state.ruleRegistry.activatedAbilities.filter(a => 
      a.controllerId === playerId && a.isManaAbility
    );

    for (const ability of manaAbilities) {
      if (this.canPay(state, ability.costs, ability.sourceId)) {
        // Simple proxy: assume fixed mana production for now
        // In a real version, we'd parse the effect of the ability
        potential['G'] = (potential['G'] || 0) + 1; 
      }
    }

    return potential;
  }

  // --- Utilities ---

  private static findObject(state: GameState, id: GameObjectId): GameObject | undefined {
    return state.battlefield.find(o => o.id === id) || 
           state.exile.find(o => o.id === id);
  }

  private static canAffordMana(state: GameState, playerId: PlayerId, manaCostStrings: string): boolean {
    const player = state.players[playerId];
    if (!player) return false;
    return ManaProcessor.canPayManaCost(player, manaCostStrings);
  }

  private static deductMana(state: GameState, playerId: PlayerId, manaCostStrings: string) {
    const player = state.players[playerId];
    if (!player) return;
    ManaProcessor.deductManaCost(player, manaCostStrings);
  }
}
