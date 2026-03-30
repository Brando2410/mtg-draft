import { GameState, PlayerId, Phase, Step, Zone } from '@shared/engine_types';
import { ManaProcessor } from '../magic/ManaProcessor';
import { M21_LOGIC } from '../../data/m21_logic';

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
    if (state.pendingAction && String(state.pendingAction.playerId) === String(playerId)) {
        return true; 
    }
    if (player.pendingDiscardCount > 0) return true; // Legacy support

    const activeId = String(state.activePlayerId).trim();
    const callerId = String(playerId).trim();
    const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
    const stackEmpty = state.stack.length === 0;

    // Auto-pass Upkeep and Draw steps if the stack is empty (Full Control will still catch them upstream)
    if (state.currentPhase === Phase.Beginning && (state.currentStep === Step.Upkeep || state.currentStep === Step.Draw) && stackEmpty) {
        return false;
    }

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

    // Chapter 3 Check: Battlefield Activated Abilities (e.g. Planeswalkers, Mana dorks)
    const hasBattlefieldAction = state.battlefield.some(obj => {
      if (obj.controllerId !== playerId) return false;
      
      const logic = M21_LOGIC[obj.definition.name];
      if (!logic || !logic.abilities) return false;

      return logic.abilities.some((ability: any, index: number) => {
        if (ability.type !== 'Activated') return false;

        // Skip purely mana-producing abilities to avoid holding priority just to float mana
        if (ability.isManaAbility === true) return false;
        const isOnlyMana = ability.effects && ability.effects.every((e: any) => e.type === 'AddMana');
        if (isOnlyMana) return false;

        // Timing Check (Rule 606.3: Planeswalkers)
        const isPlaneswalker = obj.definition.types.includes('Planeswalker');
        if (isPlaneswalker) {
          const canActivateAnyTime = (logic.abilities || []).some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));
          const isSorcerySpeed = activeId === callerId && isMainPhase && stackEmpty === true;
          
          if (!canActivateAnyTime && !isSorcerySpeed) return false;
          if (obj.abilitiesUsedThisTurn > 0) return false;
        }

        // Cost Check
        for (const cost of (ability.costs || [])) {
          if (cost.type === 'Loyalty') {
             const val = parseInt(cost.value);
             const current = obj.counters.loyalty || 0;
             if (val < 0 && current < Math.abs(val)) return false;
          }
          else if (cost.type === 'Mana') {
             if (!ManaProcessor.canPayWithTotal(player, state.battlefield, cost.value)) return false;
          }
          else if (cost.type === 'Tap') {
             if (obj.isTapped) return false;
             // Rule 302.6: Summoning Sickness applies to tap abilities of creatures
             if (obj.definition.types.includes('Creature') && obj.summoningSickness) return false;
          }
          else if (cost.type === 'Sacrifice') {
             if (cost.restrictions && cost.restrictions.includes('Creature')) {
                const hasCreature = state.battlefield.some(c => c.controllerId === playerId && c.definition.types.includes('Creature'));
                if (!hasCreature) return false;
             }
          }
          else if (cost.type === 'Discard') {
             if (player.hand.length === 0) return false;
          }
          else if (cost.type === 'PayLife') {
             if (player.life <= (cost.value || 0)) return false;
          }
        }

        return true;
      });
    });

    if (hasBattlefieldAction) return true;

    // Default to false for auto-pass
    return false;
  }

  /**
   * Helper to check if a specific object can be played/activated.
   * Used for highlighting in the UI.
   */
  public static canObjectBePlayed(state: GameState, playerId: string, objId: string): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    // Check hand
    const cardInHand = player.hand.find(o => o.id === objId);
    if (cardInHand) {
       const typeLine = (cardInHand.definition.type_line || '').toLowerCase();
       const isInstantOrFlash = typeLine.includes('instant') || (cardInHand.definition.oracleText || '').includes('Flash');
       const isLand = typeLine.includes('land');
       const stackEmpty = state.stack.length === 0;
       const isMain = state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain;
       const isYourTurn = state.activePlayerId === playerId;

       if (isLand) return isYourTurn && isMain && stackEmpty && !player.hasPlayedLandThisTurn;
       if (isInstantOrFlash) return ManaProcessor.canPayWithTotal(player, state.battlefield, cardInHand.definition.manaCost);
       return isYourTurn && isMain && stackEmpty && ManaProcessor.canPayWithTotal(player, state.battlefield, cardInHand.definition.manaCost);
    }

    // Check battlefield (for activating abilities)
    const objOnField = state.battlefield.find(o => o.id === objId);
    if (objOnField && objOnField.controllerId === playerId) {
        const logic = M21_LOGIC[objOnField.definition.name];
        if (!logic || !logic.abilities) return false;

        return logic.abilities.some((ability: any) => {
            if (ability.type !== 'Activated') return false;
            if (ability.isManaAbility) return false;

            // Simple checks from canPlayerTakeAnyAction
            const isPlaneswalker = objOnField.definition.types.includes('Planeswalker');
            if (isPlaneswalker) {
               const canActivateAnyTime = (logic.abilities || []).some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));
               const isSorcerySpeed = state.activePlayerId === playerId && (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain) && state.stack.length === 0;

               if (!canActivateAnyTime && !isSorcerySpeed) return false;
               if (objOnField.abilitiesUsedThisTurn > 0) return false;
            }

            // Cost Check
            for (const cost of (ability.costs || [])) {
                if (cost.type === 'Tap' && (objOnField.isTapped || (objOnField.definition.types.includes('Creature') && objOnField.summoningSickness))) return false;
                if (cost.type === 'Mana' && !ManaProcessor.canPayWithTotal(player, state.battlefield, cost.value)) return false;
                if (cost.type === 'Loyalty') {
                    const val = parseInt(cost.value);
                    if (val < 0 && (objOnField.counters.loyalty || 0) < Math.abs(val)) return false;
                }
            }
            return true;
        });
    }

    return false;
  }
}
