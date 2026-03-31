import { GameState, PlayerId, Phase, Step, Zone } from '@shared/engine_types';
import { ManaProcessor } from '../magic/ManaProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { SpellProcessor } from '../actions/SpellProcessor';
import { M21_LOGIC } from '../../data/m21_logic';
import { ValidationProcessor } from '../state/ValidationProcessor';

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
    if (player.pendingDiscardCount > 0) return true;

    // Remove the restrictive pendingAction check that freezes priority inappropriately.
    // if (state.pendingAction) return false;

    const stackEmpty = state.stack.length === 0;

    // Auto-pass Upkeep and Draw steps if the stack is empty (Full Control will still catch them upstream)
    if (state.currentPhase === Phase.Beginning && (state.currentStep === Step.Upkeep || state.currentStep === Step.Draw) && stackEmpty) {
        return false;
    }

    // Check hand for castable spells - IGNORING priority check for engine validation
    const hasCastable = player.hand.some(card => {
        const canPlay = this.canObjectBePlayed(state, playerId, card.id, false);
        return canPlay;
    });
    if (hasCastable) return true;

    // Chapter 3 Check: Battlefield Activated Abilities - IGNORING priority check
    const hasBattlefieldAction = state.battlefield.some(obj => {
      if (obj.controllerId !== playerId) return false;
      const logic = M21_LOGIC[obj.definition.name];
      if (!logic || !logic.abilities) return false;

      return logic.abilities.some((_, index) => this.canAbilityBeActivated(state, playerId, obj.id, index, false));
    });

    return hasBattlefieldAction;
  }

  /**
   * Helper to check if a specific object can be played/activated.
   * Used for highlighting in the UI.
   * @param checkPriority If true, returns false if player doesn't have priority. Use false for engine availability checks.
   */
  public static canObjectBePlayed(state: GameState, playerId: string, objId: string, checkPriority = true): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    // Check hand
    const cardInHand = player.hand.find(o => o.id === objId);
    if (cardInHand) {
       if (state.pendingAction) return false;
       
       const hasPriority = state.priorityPlayerId === playerId;
       if (checkPriority && !hasPriority) return false;

       const typeLine = (cardInHand.definition.type_line || '').toLowerCase();
       const isInstantOrFlash = typeLine.includes('instant') || (cardInHand.definition.oracleText || '').includes('Flash');
       const isLand = typeLine.includes('land');
       const stackEmpty = state.stack.length === 0;
       const isMain = state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain;
       const isYourTurn = state.activePlayerId === playerId;

       let canPlay = false;
       const effectiveCost = SpellProcessor.getEffectiveManaCost(state, cardInHand);

       if (isLand) {
           canPlay = isYourTurn && isMain && stackEmpty && !player.hasPlayedLandThisTurn;
       } else if (isInstantOrFlash) {
           canPlay = ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveCost);
       } else {
           canPlay = isYourTurn && isMain && stackEmpty && ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveCost);
       }

       if (canPlay) {
           const logic = M21_LOGIC[cardInHand.definition.name];
           const targetDefinition = (logic as any)?.targetDefinition || logic?.abilities?.find(a => a.type === 'Spell')?.targetDefinition;
           if (targetDefinition && !targetDefinition.optional) {
               const legalTargetIds = [
                   ...Object.keys(state.players),
                   ...state.battlefield.map(o => o.id)
               ].filter(tid => ValidationProcessor.isLegalTarget(state, cardInHand.id, tid, targetDefinition));
               
               const requiredCount = targetDefinition.count || 0;
               if (legalTargetIds.length < requiredCount) {
                   canPlay = false;
               }
           }
       }

       return canPlay;
    }

    // Check battlefield (for activating abilities)
    const objOnField = state.battlefield.find(o => o.id === objId);
    if (objOnField && objOnField.controllerId === playerId) {
        const logic = M21_LOGIC[objOnField.definition.name];
        if (!logic || !logic.abilities) return false;

        return logic.abilities.some((_, index) => this.canAbilityBeActivated(state, playerId, objId, index, checkPriority));
    }

    return false;
  }

  /**
   * Centralized logic for ability activation checks.
   */
  public static canAbilityBeActivated(state: GameState, playerId: string, objId: string, abilityIndex: number, checkPriority = true): boolean {
    const player = state.players[playerId];
    const obj = state.battlefield.find(o => o.id === objId);
    if (!player || !obj) return false;

    if (state.pendingAction) return false;
    
    if (checkPriority && state.priorityPlayerId !== playerId) return false;

    const logic = M21_LOGIC[obj.definition.name];
    const ability = logic?.abilities?.[abilityIndex];
    if (!ability || ability.type !== 'Activated') return false;

    // Skip purely mana-producing abilities for auto-pass
    if (!checkPriority && ability.isManaAbility) return false;

    // Timing Check (Rule 606.3: Planeswalkers)
    const isPlaneswalker = obj.definition.types.includes('Planeswalker');
    if (isPlaneswalker) {
       const canActivateAnyTime = (logic.abilities || []).some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));
       const isSorcerySpeed = state.activePlayerId === playerId && (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain) && state.stack.length === 0;

       if (!canActivateAnyTime && !isSorcerySpeed) return false;
       if (obj.abilitiesUsedThisTurn > 0) return false;
    }

    // Cost Check
    if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) return false;

    // Target Check
    if (ability.targetDefinition && !ability.targetDefinition.optional) {
        const legalTargetIds = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id)
        ].filter(tid => ValidationProcessor.isLegalTarget(state, obj.id, tid, ability.targetDefinition));
        const requiredCount = ability.targetDefinition.count || 1;
        if (legalTargetIds.length < requiredCount) return false;
    }

    return true;
  }
}
