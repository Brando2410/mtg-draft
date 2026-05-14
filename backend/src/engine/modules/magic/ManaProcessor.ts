import { GameObject, GameState, PlayerState } from '@shared/engine_types';
import { LogCategory, EngineLogger } from '../../utils/EngineLogger';
import { EngineContext } from '../../interfaces/EngineContext';
import { AutoTapEngine } from './mana/AutoTapEngine';
import { ManaParser } from './mana/ManaParser';
import { ManaPoolManager } from './mana/ManaPoolManager';

/**
 * Handle Mana Pool, Cost Analysis, and Payments (Chapters 106 & 117)
 * This class now acts as a facade delegating to specialized mana modules.
 */
export class ManaProcessor {

  /**
   * CR 106.4: Resets all players' mana pools at the end of steps/phases.
   */
  public static emptyAllManaPools(state: GameState) {
    return ManaPoolManager.emptyAllManaPools(state);
  }

  /**
   * Unified check: Can the player pay a cost using all available sources (floating + battlefield)?
   * This is the master validation function for all mana payments.
   */
  public static canPayMana(state: GameState, player: PlayerState, costStr: string, payingFor?: GameObject): boolean {
    return AutoTapEngine.canPayMana(state, player.id, costStr, payingFor);
  }

  /**
   * Retrieves a virtual mana pool combining floating and applicable restricted mana.
   */
  public static getUsableMana(player: PlayerState, payingFor?: GameObject) {
    return ManaPoolManager.getUsableMana(player, payingFor);
  }

  /**
   * Deducts a mana cost from a player's pool, prioritizing restricted mana and spending-as-any-color rules.
   */
  public static deductManaCost(player: PlayerState, costStr: string, state?: GameState, payingFor?: GameObject): string[] {
    return ManaPoolManager.deductManaCost(player, costStr, state, payingFor);
  }

  /**
   * Adds mana back to a player's pool (used for undoing/refunding actions).
   */
  public static refundManaCost(player: PlayerState, costStr: string) {
    return ManaPoolManager.refundManaCost(player, costStr);
  }

  /**
   * Untaps a list of land permanent IDs.
   */
  public static untapLands(state: GameState, landIds: string[]) {
    landIds.forEach(id => {
        const obj = state.battlefield.find(o => o.id === id);
        if (obj) obj.isTapped = false;
    });
  }

  /**
   * Parses a mana cost string (e.g., "{1}{W}{B}") into structured requirements.
   */
  public static parseManaCost(costStr: string) {
    return ManaParser.parseManaCost(costStr);
  }

    /**
     * Calculates the total Mana Value (MV) of a cost string (Rules 107.4, 202.3).
     * @param xValue The value chosen for X (only relevant for objects on the stack).
     */
    public static getManaValue(costStr: string, xValue: number = 0): number {
        return ManaParser.getManaValue(costStr, xValue);
    }

    /**
     * Rule 202.3b: The mana value of a transformed permanent is the mana value of its front face.
     * Rule 202.3e: X is 0 unless the object is on the stack.
     */
    public static getEffectiveManaValue(obj: any, xValueOverride?: number): number {
        const xValue = xValueOverride !== undefined ? xValueOverride : (obj.xValue || 0);
        
        // If it's a transformed permanent (has originalDefinition), use the front face's cost
        if (obj.originalDefinition) {
            return ManaParser.getManaValue(obj.originalDefinition.manaCost || '', xValue);
        }
        
        return ManaParser.getManaValue(obj.definition?.manaCost || '', xValue);
    }

  /**
   * Orchestrates the automated tapping of lands and non-land sources to satisfy a cost.
   * Includes optimizations for source complexity and future hand playability.
   */
  public static autoTapLandsForCost(state: any, playerId: string, costStr: string, engine: EngineContext, payingFor?: GameObject): { tappedIds: string[], producedMana: any } {
    return AutoTapEngine.autoTapLandsForCost(state, playerId, costStr, engine, payingFor);
  }

}
