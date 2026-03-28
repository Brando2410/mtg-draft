import { GameState, PlayerId, Phase, Step, Zone } from '@shared/engine_types';
import { ManaProcessor } from './ManaProcessor';

/**
 * Priority Handling (Rule 117)
 */
export class PriorityProcessor {

  /**
   * Rule 117.1: A player can take action IF: 
   * 1. It's their Main Phase + Stack is empty (Sorcery speed)
   * 2. They have an Instant/Flash card in hand (Instant speed)
   * 3. They have activated abilities or lands (Manual check for now)
   */
  public static canPlayerTakeAnyAction(state: GameState, playerId: string): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    // Rule 117.1: If player has a pending mandatory action, they MUST act.
    if (state.pendingAction && state.pendingAction.playerId === playerId) return true;
    if (player.pendingDiscardCount > 0) return true; // Legacy support

    const activeId = String(state.activePlayerId).trim();
    const callerId = String(playerId).trim();
    const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
    const stackEmpty = state.stack.length === 0;

    // Fast check for mana pool
    const hasManaInPool = Object.values(player.manaPool).some(v => v > 0);
    
    // Check hand for castable spells
    const hasCastable = player.hand.some(card => {
      const typeLine = (card.definition.type_line || '').toLowerCase();
      const isInstantOrFlash = typeLine.includes('instant') || (card.definition.oracleText || '').includes('Flash');
      const isLand = typeLine.includes('land');

      // Land timing (Rule 305)
      if (isLand) {
        return activeId === callerId && isMainPhase && stackEmpty && !player.hasPlayedLandThisTurn;
      }

      // Spell timing (Rule 307/308)
      if (isInstantOrFlash) {
        return ManaProcessor.canPayWithTotal(player, state.battlefield, card.definition.manaCost);
      } else {
        return activeId === callerId && isMainPhase && stackEmpty && ManaProcessor.canPayWithTotal(player, state.battlefield, card.definition.manaCost);
      }
    });

    if (hasCastable) return true;
    if (hasManaInPool) return true; // Could have activated abilities

    // Special case check: If player has untapped non-creature lands, they *might* want to do something 
    // Usually Arena passes here unless Full Control is on.
    return false;
  }
}
