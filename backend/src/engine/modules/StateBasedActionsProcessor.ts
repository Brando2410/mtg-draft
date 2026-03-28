import { GameState, PlayerState, GameObject, Zone } from '@shared/engine_types';
import { ActionProcessor } from './ActionProcessor';
import { LayerProcessor } from './LayerProcessor';

/**
 * Sweeping Mechanism that governs game-breaking states (Rule 704)
 */
export class StateBasedActionsProcessor {

  public static checkAndApply(state: GameState, log: (msg: string) => void): boolean {
    let sbaPerformed = false;
    
    // (A) Rule 704.5f/g: Lethal damage and 0-toughness sweep
    for (let i = state.battlefield.length - 1; i >= 0; i--) {
      const obj = state.battlefield[i];
      const typeLine = (obj.definition.type_line || '').toLowerCase();
      if (!typeLine.includes('creature')) continue;

      // 704.5f/g: Extract state-effective stats through Layer System
      const power = LayerProcessor.getEffectivePower(obj);
      const toughness = LayerProcessor.getEffectiveToughness(obj);
      
      // Check death conditions (0 toughness or lethal damage marked)
      if (toughness <= 0 || obj.damageMarked >= toughness) {
        log(`[DEATH] ${obj.definition.name} died (Dmg: ${obj.damageMarked}/${toughness})`);
        ActionProcessor.moveCard(state, obj, Zone.Graveyard, obj.ownerId);
        sbaPerformed = true;
      }
    }
    
    // (B) Rule 704.5a/c: Loss conditions (0 life or 10 poison)
    for (const player of Object.values(state.players) as PlayerState[]) {
      if (player.life <= 0 || player.poisonCounters >= 10) {
          // In a full version, we'd handle the 'Player Leaving the Game' (Chapter 8)
      }
    }
    
    // Rule 704.3: If any SBA were performed, check again immediately
    if (sbaPerformed) {
      return this.checkAndApply(state, log);
    }

    return sbaPerformed;
  }
}
