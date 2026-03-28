import { GameState, PlayerId, GameObject, Zone } from '@shared/engine_types';

/**
 * Physical Actions Handling (Rule 400/103)
 */
export class ActionProcessor {

  /**
   * Rule 400.7: Move card to a new zone
   */
  public static moveCard(state: GameState, card: GameObject, to: Zone, ownerId: PlayerId) {
    // 1. Remove from current zone
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

    // 2. Add to new zone
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
    
    // Rule 400.7: Object refresh on zone change
    if (to !== Zone.Battlefield) {
       card.isTapped = false;
       card.damageMarked = 0;
       card.summoningSickness = true;
    }
  }

  public static untapAll(state: GameState, playerId: PlayerId, log?: (m: string) => void) {
    let count = 0;
    state.battlefield.forEach(obj => {
      if (obj.controllerId === playerId) {
        if (obj.isTapped) {
            obj.isTapped = false;
            count++;
        }
        // Summoning sickness wears off at the start of your turn (Rule 302.6)
        obj.summoningSickness = false;
      }
    });
  }
}
