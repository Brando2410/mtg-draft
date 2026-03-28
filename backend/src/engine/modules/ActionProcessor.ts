import { GameState, PlayerId, GameObject, Zone } from '@shared/engine_types';

/**
 * Physical Actions Handling (Rule 400/103)
 */
export class ActionProcessor {

  /**
   * CR 400.1 / 400.7: An object that moves from one zone to another 
   * becomes a new object with no memory of or relation to its previous existence.
   */
  public static moveCard(state: GameState, card: GameObject, to: Zone, ownerId: PlayerId) {
    // 1. CR 400.7: Remove from the current zone
    if (card.zone === Zone.Battlefield) {
      state.battlefield = state.battlefield.filter(c => c.id !== card.id);
    } else if (card.zone === Zone.Stack) {
      state.stack = state.stack.filter(s => s.sourceId !== card.id);
    } else {
      const player = state.players[card.ownerId];
      if (player) {
         if (card.zone === Zone.Hand) player.hand = player.hand.filter(c => c.id !== card.id);
         else if (card.zone === Zone.Graveyard) player.graveyard = player.graveyard.filter(c => c.id !== card.id);
         else if (card.zone === Zone.Library) player.library = player.library.filter(c => c.id !== card.id);
      }
    }

    // 2. CR 400.7: Add to the new zone
    card.zone = to;
    if (to === Zone.Battlefield) {
      state.battlefield.push(card);
    } else if (to === Zone.Exile) {
      state.exile.push(card);
    } else {
      const player = state.players[ownerId];
      if (player) {
         if (to === Zone.Hand) player.hand.push(card);
         else if (to === Zone.Graveyard) player.graveyard.push(card);
         else if (to === Zone.Library) player.library.push(card);
      }
    }
    
    // Rule 400.7: Reset characteristics on zone change (except for cards staying on the battlefield)
    if (to !== Zone.Battlefield) {
       card.isTapped = false;
       card.damageMarked = 0;
       // 302.6: Summoning sickness is refreshed only when entering the battlefield or changing controllers
       card.summoningSickness = true;
    }
  }

  /**
   * CR 502.2: The Untap Step
   * The active player untaps all permanents they control.
   */
  public static untapAll(state: GameState, playerId: PlayerId, log?: (m: string) => void) {
    let count = 0;
    state.battlefield.forEach(obj => {
      if (obj.controllerId === playerId) {
        if (obj.isTapped) {
            obj.isTapped = false;
            count++;
        }
        // CR 302.6: Summoning sickness wears off at the beginning of the controller's turn
        obj.summoningSickness = false;
      }
    });
  }
}
