import { GameState, PlayerId, Phase, Step, Zone, AbilityType } from '@shared/engine_types';
import { ManaProcessor } from '../magic/ManaProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { SpellProcessor } from '../actions/SpellProcessor';
import { M21_LOGIC } from '../../data/m21_logic';

/**
 * Priority Handling (Rule 117)
 */
export interface PriorityCallbacks {
  log: (m: string) => void;
  getPlayerName: (id: PlayerId) => string;
  resolveTopOrAdvanceStep: () => void;
  confirmAttackers: (pId: string) => void;
  confirmBlockers: (pId: string) => void;
  checkStateBasedActions: () => void;
}

export class PriorityProcessor {

  /**
   * CR 117.4: Timing and Priority
   * Handles the passing of priority and automatic resolution of the stack.
   */
  public static passPriority(
    state: GameState, 
    playerId: PlayerId, 
    callbacks: PriorityCallbacks,
    isAuto = false
  ) {
    // 1. Intercept for special actions
    if (state.pendingAction?.playerId === playerId) {
      if (state.pendingAction.type === 'DECLARE_ATTACKERS') {
        callbacks.confirmAttackers(playerId);
        return;
      }
      if (state.pendingAction.type === 'DECLARE_BLOCKERS') {
        callbacks.confirmBlockers(playerId);
        return;
      }
    }

    if (String(state.priorityPlayerId) !== String(playerId)) {
      console.log(`[PRIORITY-PROC] passPriority IGNORED: current priority is ${state.priorityPlayerId}, but ${playerId} tried to pass.`);
      return;
    }
    
    // CR 117.1: A player must resolve pending mandatory actions before passing
    if (state.pendingAction && String(state.pendingAction.playerId) === String(playerId)) {
      console.log(`[PRIORITY-PROC] passPriority BLOCKED: ${playerId} has pending ${state.pendingAction.type}.`);
      callbacks.log(`Invalid Action: Player must resolve pending ${state.pendingAction.type} first.`);
      return;
    }

    const player = state.players[playerId];
    if (player && player.pendingDiscardCount > 0) {
      if (!isAuto) callbacks.log(`${callbacks.getPlayerName(playerId)} must finish discarding first.`);
      return;
    }

    state.consecutivePasses++;
    
    const prefix = isAuto ? '[Auto-Pass] ' : '[Manual-Pass] ';
    callbacks.log(`${prefix}${callbacks.getPlayerName(playerId)} passed. (${state.consecutivePasses}/${state.playerOrder.length} passes)`);

    if (state.consecutivePasses >= state.playerOrder.length) {
      callbacks.resolveTopOrAdvanceStep();
    } else {
      this.givePriorityToNextPlayer(state, callbacks);
    }
  }

  public static givePriorityToNextPlayer(
    state: GameState, 
    callbacks: PriorityCallbacks
  ) {
    if (!state.priorityPlayerId) return;
    const currentIndex = state.playerOrder.indexOf(state.priorityPlayerId);
    const nextIndex = (currentIndex + 1) % state.playerOrder.length;
    
    callbacks.checkStateBasedActions();
    
    state.priorityPlayerId = state.playerOrder[nextIndex];
    callbacks.log(`[PRIORITY] Shifted to ${callbacks.getPlayerName(state.priorityPlayerId)}.`);
    
    this.checkAutoPass(state, state.priorityPlayerId, callbacks);
  }

  public static resetPriorityToActivePlayer(
    state: GameState, 
    callbacks: PriorityCallbacks
  ) {
    state.consecutivePasses = 0;
    callbacks.checkStateBasedActions();
    
    // Only set priority to active player if an SBA or trigger didn't just set up a mandatory action.
    if (!state.pendingAction) {
      state.priorityPlayerId = state.activePlayerId;
    }
    
    if (state.priorityPlayerId) {
       this.checkAutoPass(state, state.priorityPlayerId, callbacks);
    }
  }

  public static checkAutoPass(
    state: GameState, 
    playerId: PlayerId, 
    callbacks: PriorityCallbacks
  ) {
    if (!state.priorityPlayerId || String(state.priorityPlayerId) !== String(playerId)) return;

    const player = state.players[playerId];
    const canAct = this.canPlayerTakeAnyAction(state, playerId);

    if (player && !player.fullControl && !canAct) {
      callbacks.log(`[Auto-Pass] ${callbacks.getPlayerName(playerId)} skipped: no legal actions found.`);
      console.log(`[ENGINE] Auto-Pass triggered for ${playerId}`);
      this.passPriority(state, playerId, callbacks, true);
    } else if (player && canAct) {
      console.log(`[ENGINE] Priority held by ${playerId} (Actions available)`);
    }
  }


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
       const isInstantOrFlash = typeLine.includes('instant') || 
                                (cardInHand.definition.oracleText || '').includes('Flash') ||
                                (cardInHand.definition.keywords || []).includes('Flash');
       const isLand = typeLine.includes('land');
       const stackEmpty = state.stack.length === 0;
       const isMain = state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain;
       const isYourTurn = state.activePlayerId === playerId;

        let canPlay = false;
        const { totalMana: effectiveCost, additionalCosts } = SpellProcessor.getEffectiveCosts(state, cardInHand);

        if (isLand) {
            canPlay = isYourTurn && isMain && stackEmpty && !player.hasPlayedLandThisTurn;
        } else if (isInstantOrFlash) {
            canPlay = ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveCost);
        } else {
            canPlay = isYourTurn && isMain && stackEmpty && ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveCost);
        }

        // --- CHECK ADDITIONAL COSTS (e.g. Goremand) ---
        if (canPlay && additionalCosts.length > 0) {
            const canPayAllExtras = additionalCosts.every(cost => {
                if (cost.type === 'Sacrifice') {
                    // Check if there is at least one permanent that can be sacrificed
                    const { TargetingProcessor } = require('../actions/TargetingProcessor');
                    const candidates = state.battlefield.filter(o => 
                        o.controllerId === playerId && 
                        TargetingProcessor.matchesRestrictions(state, o, cost.restrictions || [], playerId, cardInHand.id)
                    );
                    return candidates.length > 0;
                }
                // (Add other cost checks here if needed)
                return true;
            });
            if (!canPayAllExtras) canPlay = false;
        }

        if (canPlay) {
            const logic = M21_LOGIC[cardInHand.definition.name];
            const targetDefinition = (logic as any)?.targetDefinition || logic?.abilities?.find(a => a.type === 'Spell')?.targetDefinition;
            if (targetDefinition && !targetDefinition.optional) {
                const { TargetingProcessor } = require('../actions/TargetingProcessor');
                const legalTargetIds = [
                    ...Object.keys(state.players),
                    ...state.battlefield.map(o => o.id)
                ].filter(tid => TargetingProcessor.isLegalTarget(state, cardInHand.id, tid, targetDefinition));
                
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

    const cardLogic = M21_LOGIC[obj.definition.name];
    const ability = cardLogic.abilities[abilityIndex];
    if (ability.type !== AbilityType.Activated) return false;

    // Requirement Check (Rule 602.5b)
    if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) {
        console.log(`Illegal Activation: Activation requirements for ${obj.definition.name} are not met.`);
        return false;
    }

    // Skip purely mana-producing abilities for auto-pass
    if (!checkPriority && ability.isManaAbility) return false;

    // Timing Check (Rule 606.3: Planeswalkers)
    const isPlaneswalker = obj.definition.types.includes('Planeswalker');
    if (isPlaneswalker) {
       const canActivateAnyTime = (cardLogic.abilities || []).some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));
       const isSorcerySpeed = state.activePlayerId === playerId && (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain) && state.stack.length === 0;

       if (!canActivateAnyTime && !isSorcerySpeed) return false;
       if (obj.abilitiesUsedThisTurn > 0) return false;
    }

    // Cost Check
    if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) return false;

    // Requirement Check (Rule 602.5b)
    if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) return false;

    // Target Check
    if (ability.targetDefinition && !ability.targetDefinition.optional) {
        const { TargetingProcessor } = require('../actions/TargetingProcessor');
        const legalTargetIds = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id)
        ].filter(tid => TargetingProcessor.isLegalTarget(state, obj.id, tid, ability.targetDefinition));
        const requiredCount = ability.targetDefinition.count || 1;
        if (legalTargetIds.length < requiredCount) return false;
    }

    return true;
  }
}
