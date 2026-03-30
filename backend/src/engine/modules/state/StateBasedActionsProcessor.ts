import { GameState, Zone, PlayerId } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ActionProcessor } from '../actions/ActionProcessor';

/**
 * Rules Engine Module: State-Based Actions (Rule 704)
 * SBAs are game processes that happen whenever a player would receive priority.
 */
export class StateBasedActionsProcessor {
  
  /**
   * CR 704.3: Whenever a player would receive priority, the game checks for 
   * any of the listed conditions for state-based actions.
   * Returns true if any action was taken.
   */
  public static resolveSBAs(state: GameState, log: (msg: string) => void): boolean {
    let actionTaken = false;

    // Clone battlefield to avoid mutation issues during iteration
    const objects = [...state.battlefield];

    for (const obj of objects) {
      const stats = LayerProcessor.getEffectiveStats(obj, state);
      const objTypes = obj.definition.types.map(t => t.toLowerCase());
      
      // 1. Rule 704.5f: Toughness <= 0 (State-based death, ignores indestructible)
      if (objTypes.includes('creature') && stats.toughness <= 0) {
        log(`[SBA] ${obj.definition.name} has 0 or less toughness and is put into the graveyard.`);
        ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
        actionTaken = true;
        continue;
      }

      // 2. Rule 704.5g: Lethal Damage (Destruction, respects indestructible)
      const isLethalByDamage = obj.damageMarked >= stats.toughness;
      const isLethalByDeathtouch = obj.deathtouchMarked;
      
      if (objTypes.includes('creature') && (isLethalByDamage || isLethalByDeathtouch)) {
        const isIndestructible = stats.keywords.includes('Indestructible');
        if (!isIndestructible) {
          log(`[SBA] ${obj.definition.name} was destroyed (Lethal: ${isLethalByDamage}, Deathtouch: ${isLethalByDeathtouch}).`);
          ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
          actionTaken = true;
          continue;
        }
      }

      // 3. Rule 704.5i: Planeswalker Loyalty
      if (objTypes.includes('planeswalker')) {
        const loyalty = obj.counters['loyalty'] || 0;
        if (loyalty <= 0) {
          log(`[SBA] ${obj.definition.name} has 0 loyalty and is put into the graveyard.`);
          ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId, log);
          actionTaken = true;
          continue;
        }
      }
    }

    // Rule 704.3: If any SBAs were performed, repeat the process.
    if (actionTaken) {
      this.resolveSBAs(state, log);
    }

    return actionTaken;
  }
}
