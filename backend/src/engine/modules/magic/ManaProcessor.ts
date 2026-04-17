import { GameObject, GameState, PlayerState } from '@shared/engine_types';
import { ManaParser } from './mana/ManaParser';
import { ManaPoolManager } from './mana/ManaPoolManager';
import { ManaValidator } from './mana/ManaValidator';
import { AutoTapEngine } from './mana/AutoTapEngine';

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
   * Checks if a player can pay a specific mana cost using only currently floating mana.
   */
  public static canPayManaCost(player: PlayerState, costStr: string, state?: GameState, payingFor?: GameObject): boolean {
    return ManaValidator.canPayManaCost(player, costStr, state, payingFor);
  }

  /**
   * Checks if a player can pay a cost using both floating mana and untapped sources (greedy check).
   */
  public static canPayWithTotal(player: PlayerState, battlefield: any[], costStr: string, payingFor?: GameObject): boolean {
    return ManaValidator.canPayWithTotal(player, battlefield, costStr, payingFor);
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
   */
  public static getManaValue(costStr: string): number {
    return ManaParser.getManaValue(costStr);
  }

  /**
   * Orchestrates the automated tapping of lands and non-land sources to satisfy a cost.
   * Includes optimizations for source complexity and future hand playability.
   */
  public static autoTapLandsForCost(state: any, playerId: string, costStr: string, log: (m: string) => void, tapForManaCallback: (p: string, c: string, aIdx?: number, cIdx?: number) => void, payingFor?: GameObject): { tappedIds: string[], producedMana: any } {
    return AutoTapEngine.autoTapLandsForCost(state, playerId, costStr, log, tapForManaCallback, payingFor);
  }
}
