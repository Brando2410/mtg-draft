import { AbilityType, ActionType, GameState, PlayerId, Zone } from '@shared/engine_types';
import { CombatProcessor } from '../combat/CombatProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { TurnProcessor } from '../core/TurnProcessor';
import { PriorityProcessor } from '../core/PriorityProcessor';
import { LayerProcessor } from '../state/LayerProcessor';
import { ChoiceProcessor } from './ChoiceProcessor';
import { oracle } from '../../OracleLogicMap';

import { EngineContext } from '../../interfaces/EngineContext';

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
    engine: EngineContext
  ): boolean {
    const obj = state.battlefield.find(c => c.id === cardId);
    if (!obj) return false;

    // 1. Intercept for special actions (Combat)
    if (state.pendingAction?.playerId === playerId) {
      if (state.pendingAction.type === 'DECLARE_ATTACKERS') {
        return engine.declareAttacker(playerId, cardId);
      }
      if (state.pendingAction.type === 'DECLARE_BLOCKERS') {
        return engine.handleBlockSelection(playerId, cardId);
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

      const logic = oracle.getCard(obj.definition.name);
      const canActivateAnyTime = logic?.abilities?.some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));

      if (!canActivateAnyTime && (!isMyTurn || !isMainPhase || !stackEmpty)) {
        log(`Cannot activate Planeswalker: Sorcery speed only.`);
        return false;
      }

      if (obj.abilitiesUsedThisTurn > 0) {
        log(`Already used a loyalty ability this turn.`);
        return false;
      }

      const { ActionType } = require('@shared/engine_types');
      state.pendingAction = {
        type: ActionType.ModalSelection,
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
    const logic = oracle.getCard(obj.definition.name);
    
    const typeLine = (obj.definition.types?.join(' ') + ' ' + (obj.definition.type_line || '')).toLowerCase();
    const isLand = typeLine.includes('land');

    const allActivated = (logic?.abilities || [])
        .map((a: any, index: number) => ({ ability: a, index }))
        .filter((entry: any) => entry.ability.type === AbilityType.Activated && PriorityProcessor.canAbilityBeActivated(state, playerId, cardId, entry.index, false));

    if (allActivated.length > 0) {
        if (state.priorityPlayerId !== playerId) {
            log(`Player tried to activate ability without priority.`);
            return false;
        }

        if (allActivated.length === 1) {
            const { ability, index: abilityIdx } = allActivated[0];
            
            if (ability.isManaAbility) {
                // Determine if this mana ability requires choices (like Add {B} or {G})
                const hasChoices = ability.effects.some((e: any) => e.type === 'AddMana' && e.choices);
                
                // If it has no choices and only costs Tap, we just fire it immediate
                // Rules 605.3a: Mana abilities don't use the stack and are resolved immediately.
                return engine.activateAbility(playerId, cardId, abilityIdx);
            }

            // Safety Step: For single non-mana utility abilities, show a confirmation modal 
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardId,
                data: {
                    isContextual: true,
                    choices: [
                        { label: 'Activate Ability', value: abilityIdx },
                        { label: 'Cancel', value: 'none' }
                    ]
                }
            };
            state.priorityPlayerId = null;
            return true;
        }

        // If multiple abilities (common for creatures with utility + mana or multiple utilities)
        if (allActivated.length > 1) {
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardId,
                data: {
                    choices: allActivated.map((entry: any) => ({
                        label: entry.ability.oracleText || entry.ability.id || 'Activate Ability',
                        value: entry.index
                    }))
                }
            };
            state.priorityPlayerId = null;
            return true;
        }
    }

    // 4. Default: Tap for Mana (Undo/Untap) or non-PW interaction
    return engine.tapForMana(playerId, cardId) || false;
  }

  public static autoTapLand(
    state: GameState,
    playerId: PlayerId,
    cardId: string,
    engine: EngineContext,
    abilityIndex?: number,
    choiceIndex?: number
  ): boolean {
    const obj = state.battlefield.find(o => o.id === cardId);
    if (!obj || obj.controllerId !== playerId || obj.isTapped) return false;
    
    // We use a simplified check for the first mana ability to ensure synchronous tapping
    const { oracle } = require('../../OracleLogicMap');
    const logic = oracle.getCard(obj.definition.name);
    if (!logic || !logic.abilities) return false;

    let manaAbilityIdx = abilityIndex !== undefined ? abilityIndex : logic.abilities.findIndex((a: any) => a.isManaAbility);
    if (manaAbilityIdx === -1) {
        // Fallback for cases where index might be wrong or wasn't provided accurately
        manaAbilityIdx = logic.abilities.findIndex((a: any) => a.isManaAbility);
    }
    if (manaAbilityIdx === -1) return false;

    // Standardize ability index and use bypassTargeting=true for silent, synchronous tapping 
    // during the auto-tap sequence.
    return engine.activateAbility(playerId, cardId, manaAbilityIdx, [], true, choiceIndex);
  }

  public static tapForMana(
    state: GameState,
    playerId: PlayerId,
    cardId: string,
    log: (m: string) => void,
    engine: EngineContext

  ): boolean {
    const card = state.battlefield.find(c => c.id === cardId);
    if (!card || card.controllerId !== playerId) return false;

    // We only handle "Undo" here now. Tapping for mana is handled via ActivateAbility (Step 3 above)
    if (!card.isTapped) return false;

    const { m21: mLogic } = require('../../data/m21');
    const logic = mLogic[card.definition.name];
    if (!logic) return false;

    // GENERIC UNDO LOGIC: If a land has exactly one mana ability, we can try to undo it
    const manaAbilities = logic.abilities.filter((a: any) => a.isManaAbility);
    if (manaAbilities.length !== 1) return false; 

    const ability = manaAbilities[0];
    const addManaEffect = ability.effects.find((e: any) => e.type === 'AddMana');
    if (!addManaEffect) return false;

    const player = state.players[playerId];
    const { ManaProcessor } = require('./../magic/ManaProcessor');
    const manaStr = addManaEffect.value || '{C}';
    const requirements = ManaProcessor.parseManaCost(manaStr.startsWith('{') ? manaStr : `{${manaStr}}`);
    
    // Extract the primary color symbol
    const color = (Object.keys(requirements.colored)[0] as keyof typeof player.manaPool) || 'C';

    if (player.manaPool[color] > 0) {
      card.isTapped = false;
      player.manaPool[color]--;
      log(`${player.name} untapping ${card.definition.name} (Undo Mana {${color}})`);
      return true;
    }

    log(`Cannot undo: Mana {${color}} already spent.`);
    return false;
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
       // Requirement Check: MustAttack (Rule 508.1d)
       const mustAttack = state.ruleRegistry.restrictions.some(r => r.targetId === cardId && r.type === 'MustAttack') ||
                         stats.restrictions?.includes('MustAttack');
       if (mustAttack) {
          const canAttack = !card.isTapped && !card.summoningSickness && !stats.keywords.includes('Defender');
          const cannotAttackFlags = state.ruleRegistry.restrictions.some(r => r.targetId === cardId && r.type === 'CannotAttack');
          
          if (canAttack && !cannotAttackFlags) {
             log(`${card.definition.name} must attack and cannot be deselected.`);
             return false;
          }
       }
       state.combat.attackers.splice(existingIndex, 1);
       log(`${card.definition.name} removed from attackers.`);
    } else {
       if (card.isTapped) return false;
       
       // Rule 702.3a: Defender prevents attacking.
       if (stats.keywords.includes('Defender')) {
           log(`[ATTACK] ERR: ${card.definition.name} has Defender and cannot attack.`);
           return false;
       }

       // Check for external "CannotAttack" restrictions
       const cannotAttack = state.ruleRegistry.restrictions.some(r => r.targetId === cardId && r.type === 'CannotAttack');
       if (cannotAttack) {
           log(`[ATTACK] ERR: ${card.definition.name} cannot attack.`);
           return false;
       }

       const opponentId = Object.keys(state.players).find(id => id !== playerId);
       state.combat.attackers.push({ attackerId: cardId, targetId: targetId || opponentId! });
       
       // Rule 702.24: Vigilance prevents tapping when attacking
       // Note: Tapping now happens upon CONFIRMATION in CombatProcessor
       log(`${card.definition.name} selected as attacker.`);
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

    const { legal, reason } = CombatProcessor.isLegalBlocker(state, blockerId, cardId);
    if (!legal) {
        log(`${blockerObj?.definition.name} cannot block ${card.definition.name}${reason ? ` (${reason})` : ''}.`);
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

    // BUG FIX: Prevent race condition where rapid clicking discards more than required.
    // We only allow discard if there's a pending DISCARD action for this player.
    if (state.pendingAction?.type !== 'DISCARD' || state.pendingAction.playerId !== playerId) {
        return { finished: false, success: false };
    }

    if (player.pendingDiscardCount <= 0) {
        return { finished: false, success: false };
    }

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
      if (state.pendingAction && (state.pendingAction as any).count) {
          (state.pendingAction as any).count--;
      }
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

  public static resolveTriggerOrdering(state: GameState, playerId: string, orderedIds: string[], log: (m: string) => void): boolean {
    if (!state.pendingAction || (state.pendingAction.type as any) !== 'ORDER_TRIGGERS' || state.pendingAction.playerId !== playerId) return false;

    const { triggers } = state.pendingAction.data;
    
    // The player sends us the IDs in "Stacking Order" (MTGA UI)
    // index 0 -> Last to resolve (Bottom of stack)
    // index N-1 -> First to resolve (Top of stack)
    const orderedTriggers = orderedIds.map(id => triggers.find((t: any) => t.id === id)).filter(Boolean);
    
    if (state.pendingTriggers) {
      state.pendingTriggers = state.pendingTriggers.filter(t => !orderedIds.includes(t.id));
    }

    state.pendingAction = undefined;

    const { TriggerProcessor } = require('./../effects/TriggerProcessor');
    for (const t of orderedTriggers) {
        TriggerProcessor.stackTrigger(state, t, log);
    }

    // Process remaining if anyone else has triggers
    TriggerProcessor.processPendingTriggers(state, log);
    return true;
  }

  /**
   * CR 603: Resolve a specific target selection from the UI.
   */
  public static resolveTargeting(state: GameState, playerId: PlayerId, targetId: string, engine: EngineContext): boolean {
    const { TargetingProcessor } = require('./TargetingProcessor');
    return TargetingProcessor.resolveInteractiveTargeting(
        state,
        playerId,
        targetId,
        (m: string) => engine.log(m),
        {
            ...engine,
            resetPriorityToActivePlayer: () => engine.resetPriorityToActivePlayer(),
            finaliseTargeting: (p: PlayerId, t: string[]) => TargetingProcessor.finaliseTargeting(state, p, t, engine)
        }
    );
  }
}

