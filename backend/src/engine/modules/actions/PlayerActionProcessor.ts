import { GameState, PlayerId, Zone, AbilityType } from '@shared/engine_types';
import { CombatProcessor } from '../combat/CombatProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { TurnProcessor } from '../core/TurnProcessor';
import { PriorityProcessor } from '../core/PriorityProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { ChoiceProcessor } from './ChoiceProcessor';

export interface PlayerActionCallbacks {
    log: (m: string) => void;
    getPlayerName: (id: PlayerId) => string;
    playCard: (pId: PlayerId, cId: string, targets: string[], bypass: boolean) => boolean;
    activateAbility: (pId: PlayerId, cId: string, idx: number, targets: string[], bypass: boolean) => boolean;
    resetPriorityToActivePlayer: () => void;
    checkAutoPass: (pId: PlayerId) => void;
}

// Need to safely interact with Rule registries without causing circular dependencies.
export class PlayerActionProcessor {
  /**
   * CR 106: Tapping for Mana & Special Actions (Attacking/Blocking)
   */
  public static interactWithPermanent(
    state: GameState,
    playerId: PlayerId,
    cardId: string,
    log: (m: string) => void,
    actionHandlers: {
      declareAttacker: (pId: string, cId: string) => boolean;
      handleBlockSelection: (pId: string, cId: string) => boolean;
      tapForMana: (pId: string, cId: string) => boolean;
      activateAbility: (pId: PlayerId, cId: string, idx: number) => boolean;
    }
  ): boolean {
    const obj = state.battlefield.find(c => c.id === cardId);
    if (!obj) return false;

    // 1. Intercept for special actions (Combat)
    if (state.pendingAction?.playerId === playerId) {
      if (state.pendingAction.type === 'DECLARE_ATTACKERS') {
        return actionHandlers.declareAttacker(playerId, cardId);
      }
      if (state.pendingAction.type === 'DECLARE_BLOCKERS') {
        return actionHandlers.handleBlockSelection(playerId, cardId);
      }
    }

    if (obj.controllerId !== playerId) return false;

    // 2. Planeswalker Logic: Trigger Ability Choice
    if (obj.definition.types.includes('Planeswalker')) {
      if (state.priorityPlayerId !== playerId) {
        log(`Player tried to activate PW without priority.`);
        return false;
      }

      const isMainPhase = (state.currentPhase === 'PreCombatMain' || state.currentPhase === 'PostCombatMain');
      const stackEmpty = state.stack.length === 0;
      const isMyTurn = state.activePlayerId === playerId;

      const { M21_LOGIC } = require('../../data/m21_logic');
      const logic = M21_LOGIC[obj.definition.name];
      const canActivateAnyTime = logic?.abilities.some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));

      if (!canActivateAnyTime && (!isMyTurn || !isMainPhase || !stackEmpty)) {
        log(`Cannot activate Planeswalker: Sorcery speed only.`);
        return false;
      }

      if (obj.abilitiesUsedThisTurn > 0) {
        log(`Already used a loyalty ability this turn.`);
        return false;
      }

      state.pendingAction = {
        type: 'CHOICE',
        playerId: playerId,
        sourceId: cardId,
        data: {
          choices: logic.abilities
            .filter((a: any) => a.type === AbilityType.Activated && a.costs.some((c: any) => c.type === 'Loyalty'))
            .map((a: any) => {
               const lCost = a.costs.find((c: any) => c.type === 'Loyalty').value;
               const effectSummary = a.effects.map((e: any) => {
                  if (e.type === 'DrawCards') return `Draw ${e.amount}`;
                  if (e.type === 'DiscardCard') return `Discard a card`;
                  if (e.type === 'AddCounters') return `Add ${e.amount} ${e.value} counter`;
                  if (e.type === 'CreateToken') return `Create a ${e.tokenBlueprint.name}`;
                  if (e.type === 'PhasedOut') return `Phase out`;
                  return e.type;
               }).join(', ');

               return {
                 label: `${lCost}: ${effectSummary}`,
                 value: logic.abilities.indexOf(a)
               };
            })
        }
      };
      state.priorityPlayerId = null;
      return true;
    }

    // 3. Generic Activated Ability Choice (Non-Planeswalker)
    const { M21_LOGIC: mLogic } = require('../../data/m21_logic');
    const logic = mLogic[obj.definition.name];
    const activatedAbilities = logic?.abilities?.filter((a: any) => a.type === AbilityType.Activated && !a.isManaAbility) || [];

    if (activatedAbilities.length > 0) {
        if (state.priorityPlayerId !== playerId) {
            log(`Player tried to activate ability without priority.`);
            return false;
        }

        // If only one ability, just try to activate it directly (targeting will follow if needed)
        if (activatedAbilities.length === 1) {
            const index = logic.abilities.indexOf(activatedAbilities[0]);
            return actionHandlers.activateAbility(playerId, cardId, index);
        }

        // If multiple, show CHOICE
        state.pendingAction = {
            type: 'CHOICE',
            playerId: playerId,
            sourceId: cardId,
            data: {
                choices: activatedAbilities.map((a: any) => ({
                    label: a.id || 'Activate Ability',
                    value: logic.abilities.indexOf(a)
                }))
            }
        };
        state.priorityPlayerId = null;
        return true;
    }

    // 4. Default: Tap for Mana or non-PW interaction
    return actionHandlers.tapForMana(playerId, cardId);
  }

  public static tapForMana(
    state: GameState,
    playerId: PlayerId,
    cardId: string,
    log: (m: string) => void,
    actionHandlers: {
      declareAttacker: (pId: string, cId: string) => boolean;
      handleBlockSelection: (pId: string, cId: string) => boolean;
    }
  ): boolean {
    if (state.pendingAction?.playerId === playerId) {
      if (state.pendingAction.type === 'DECLARE_ATTACKERS') {
        return actionHandlers.declareAttacker(playerId, cardId);
      }
      if (state.pendingAction.type === 'DECLARE_BLOCKERS') {
        return actionHandlers.handleBlockSelection(playerId, cardId);
      }
    }

    if (state.priorityPlayerId !== playerId && state.pendingAction?.playerId !== playerId) {
      log(`Action error: Player tried to tap for mana without priority.`);
      return false;
    }

    const card = state.battlefield.find(c => c.id === cardId);
    if (!card || card.controllerId !== playerId) return false;

    const typeLine = (card.definition.type_line || '').toLowerCase();
    if (!typeLine.includes('land')) return false;

    const player = state.players[playerId];
    const name = card.definition.name.toLowerCase();
    
    let color: keyof typeof player.manaPool = 'C';
    if (name.includes('plains')) color = 'W';
    else if (name.includes('island')) color = 'U';
    else if (name.includes('swamp')) color = 'B';
    else if (name.includes('mountain')) color = 'R';
    else if (name.includes('forest')) color = 'G';

    if (card.isTapped) {
      if (player.manaPool[color] > 0) {
        card.isTapped = false;
        player.manaPool[color]--;
        log(`${player.name} untapping ${card.definition.name} (Undo Mana {${color}})`);
        return true;
      } else {
        log(`Cannot undo: Mana {${color}} already spent.`);
        return false;
      }
    } else {
      card.isTapped = true;
      player.manaPool[color]++;
      log(`${player.name} tapped ${card.definition.name} for {${color}}`);
      return true;
    }
  }

  public static declareAttacker(state: GameState, playerId: string, cardId: string, targetId: string | undefined, log: (m: string) => void): boolean {
    const card = state.battlefield.find(c => c.id === cardId);
    
    const isPlaneswalker = card && card.definition.types.includes('Planeswalker') && card.controllerId !== playerId;
    const isOpponent = !!state.players[cardId as PlayerId] && cardId !== playerId;

    if (isPlaneswalker || isOpponent) {
        if (state.combat?.attackers.length) {
            const last = state.combat.attackers[state.combat.attackers.length - 1];
            last.targetId = cardId;
            log(`Attack re-targeted to ${isOpponent ? 'Opponent' : card!.definition.name}.`);
            return true;
        }
    }

    if (!card || card.controllerId !== playerId || card.zone !== Zone.Battlefield) return false;
    
    // CR 302.1: A creature can't attack unless its controller has controlled it... (Summoning Sickness)
    const stats = LayerProcessor.getEffectiveStats(card, state);
    const types = (card.definition.types || []).map(t => t.toLowerCase());
    const typeLine = (card.definition.type_line || '').toLowerCase();
    const isCreature = types.includes('creature') || typeLine.includes('creature');

    if (!isCreature) return false;

    if (card.summoningSickness && !stats.keywords.includes('Haste')) {
       log(`${card.definition.name} ha debolezza da evocazione.`);
       return false;
    }

    if (!state.combat) state.combat = { attackers: [], blockers: [] };

    const existingIndex = state.combat.attackers.findIndex(a => a.attackerId === cardId);
    if (existingIndex >= 0) {
       state.combat.attackers.splice(existingIndex, 1);
       card.isTapped = false;
       log(`${card.definition.name} removed from attackers.`);
    } else {
       if (card.isTapped) return false;
       const opponentId = Object.keys(state.players).find(id => id !== playerId);
       state.combat.attackers.push({ attackerId: cardId, targetId: targetId || opponentId! });
       
       // Rule 702.24: Vigilance prevents tapping when attacking
       const hasVigilance = stats.keywords.includes('Vigilance');
       if (!hasVigilance) {
           card.isTapped = true;
           log(`${card.definition.name} attacking ${!!state.players[(targetId || opponentId!) as PlayerId] ? 'Opponent' : 'Planeswalker'}.`);
       } else {
           log(`${card.definition.name} attacking with Vigilance.`);
       }

       const { TriggerProcessor } = require('../effects/TriggerProcessor');
       TriggerProcessor.onEvent(state, { type: 'ON_ATTACK', targetId: cardId, sourceId: cardId, data: { object: card, targetId: (targetId || opponentId!) } }, log);
    }
    return true;
  }

  public static handleBlockSelection(state: GameState, playerId: string, cardId: string, log: (m: string) => void): boolean {
    const card = state.battlefield.find(c => c.id === cardId);
    if (!card) return false;

    // A. SELECTION: My creature (the blocker)
    if (card.controllerId === playerId) {
      if (card.isTapped) {
        log(`[BLOCK] ERR: ${card.definition.name} is tapped and cannot block.`);
        return false;
      }
      state.pendingAction!.sourceId = cardId;
      log(`Selected ${card.definition.name} to block. Now select an attacking creature.`);
      return true;
    }

    // B. TARGETING: Opponent attacker
    const blockerId = state.pendingAction!.sourceId;
    if (!blockerId) {
      log("[BLOCK] Choose one of your potential blockers first.");
      return false;
    }

    const blockerObj = state.battlefield.find(c => c.id === blockerId);
    const attackers = state.combat?.attackers || [];
    const isAttacking = attackers.some(a => a.attackerId === cardId);
    
    if (!isAttacking) {
      log(`[BLOCK] ERR: ${card.definition.name} is not an attacking creature.`);
      return false;
    }

    if (!CombatProcessor.isLegalBlocker(state, blockerId, cardId)) {
        log(`${blockerObj?.definition.name} cannot block ${card.definition.name} due to protection.`);
        return false;
    }

    if (!state.combat) state.combat = { attackers: [], blockers: [] };

    const oldIdx = state.combat.blockers.findIndex(b => b.blockerId === blockerId);
    if (oldIdx >= 0) state.combat.blockers.splice(oldIdx, 1);

    state.combat.blockers.push({ blockerId, attackerId: cardId });
    log(`${state.battlefield.find(c => c.id === blockerId)?.definition.name} blocking ${card.definition.name}`);
    
    const { TriggerProcessor } = require('../effects/TriggerProcessor');
    TriggerProcessor.onEvent(state, { type: 'ON_BLOCK', targetId: blockerId, sourceId: blockerId, data: { object: blockerObj, attackerId: cardId } }, log);

    state.pendingAction!.sourceId = undefined;
    return true;
  }

  public static discardCard(state: GameState, playerId: PlayerId, cardInstanceId: string, log: (m: string) => void): { finished: boolean, success: boolean } {
    const player = state.players[playerId];
    if (!player) return { finished: false, success: false };

    const cardIndex = player.hand.findIndex(c => c.id === cardInstanceId);
    if (cardIndex === -1) return { finished: false, success: false };

    const card = player.hand.splice(cardIndex, 1)[0];
    card.zone = Zone.Graveyard;
    player.graveyard.push(card);
    
    const sourceId = state.pendingAction?.sourceId;
    const { TriggerProcessor } = require('./../effects/TriggerProcessor');
    TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId, data: { card, sourceId } }, log);

    if (player.pendingDiscardCount > 0) {
      player.pendingDiscardCount--;
      log(`${player.name} discarded ${card.definition.name} (${player.pendingDiscardCount} more to go).`);
      
      if (player.pendingDiscardCount === 0) {
        log(`${player.name} finished discarding.`);
        state.pendingAction = undefined; 
        return { finished: true, success: true };
      }
    } else {
      log(`${player.name} discarded ${card.definition.name}.`);
    }

    return { finished: false, success: true };
  }
  public static resolveCombatOrdering(state: GameState, playerId: string, order: string[], log: (m: string) => void) {
    if (!state.combat || !state.pendingAction) return;
    
    const sourceId = state.pendingAction.sourceId;
    if (!sourceId) return;

    if (state.pendingAction.type === 'ORDER_BLOCKERS') {
      const attacker = state.combat.attackers.find(a => a.attackerId === sourceId);
      if (attacker) {
        attacker.order = order;
        log(`[FLOW] ${state.players[playerId].name} established damage assignment order for ${state.battlefield.find(o => o.id === sourceId)?.definition.name}.`);
      }
    } else if (state.pendingAction.type === 'ORDER_ATTACKERS') {
      const entries = state.combat.blockers.filter(b => b.blockerId === sourceId);
      entries.forEach(e => e.order = order);
      log(`[FLOW] ${state.players[playerId].name} established damage assignment order for their blocker ${state.battlefield.find(o => o.id === sourceId)?.definition.name}.`);
    }

    state.pendingAction = undefined;
    
    // Check if more ordering is needed
    // We use a dynamic import or require to avoid circular dependency since CombatProcessor uses this class
    const { CombatProcessor } = require('../combat/CombatProcessor');
    if (CombatProcessor.needsOrdering(state)) {
      CombatProcessor.setupNextOrderingAction(state, log);
    }
  }

  /**
   * CR 603: Resolve a specific target selection from the UI.
   */
  public static resolveTargeting(state: GameState, playerId: PlayerId, targetId: string, callbacks: PlayerActionCallbacks): boolean {
    const { TargetingProcessor } = require('./TargetingProcessor');
    return TargetingProcessor.resolveInteractiveTargeting(
        state,
        playerId,
        targetId,
        (m: string) => callbacks.log(m),
        {
            ...callbacks,
            resetPriorityToActivePlayer: () => callbacks.resetPriorityToActivePlayer(),
            finaliseTargeting: (p: PlayerId, t: string[]) => TargetingProcessor.finaliseTargeting(state, p, t, callbacks)
        }
    );
  }
}
