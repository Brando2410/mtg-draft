import { AbilityDefinition, AbilityType, ActionType, AddCounterCost, EffectType, GameState, PlayerId, RemoveCounterCost, TriggerEvent, Zone } from '@shared/engine_types';
import { LogCategory } from '../../utils/EngineLogger';
import { EngineContext } from '../../interfaces/EngineContext';
import { oracle } from '../../OracleLogicMap';
import { CombatProcessor } from '../combat/CombatProcessor';
import { RuleUtils } from "../../utils/RuleUtils";
import { PriorityProcessor } from '../core/turn/PriorityProcessor';
import { getProcessors } from '../ProcessorRegistry';
import { LayerProcessor } from '../state/LayerProcessor';
import { m21 as m21Data } from '../../data/m21/index';

// Need to safely interact with Rule registries without causing circular dependencies.
export class PlayerActionProcessor {
  /**
   * CR 106: Tapping for Mana & Special Actions (Attacking/Blocking)
   */
  public static interactWithPermanent(
    state: GameState,
    playerId: PlayerId,
    cardId: string,
    engine: EngineContext
  ): boolean {
    const { logger, choice } = getProcessors(state);
    const obj = state.battlefield.find(c => c.id === cardId);
    if (!obj) return false;

    // 1. Intercept for special actions (Combat)
    if (state.pendingAction?.playerId === playerId) {
      if (state.pendingAction.type === ActionType.Targeting) {
        return engine.processors.choice.resolveTargeting(state, playerId, cardId, engine);
      }
      if (state.pendingAction.type === ActionType.DeclareAttackers) {
        return engine.declareAttacker(playerId, cardId);
      }
      if (state.pendingAction.type === ActionType.DeclareBlockers) {
        return engine.handleBlockSelection(playerId, cardId);
      }
      if (state.pendingAction.type === ActionType.LegendRule) {
        const involvedIds = (state.pendingAction.data?.involvedIds || []) as string[];
        if (involvedIds.includes(cardId)) {
          return choice.resolveChoice(state, playerId, cardId, engine);
        }
      }
    }

    if (obj.controllerId !== playerId) return false;

    // 2. Planeswalker Logic: Trigger Ability Choice
    if (RuleUtils.isType(obj, 'planeswalker')) {
      if (state.priorityPlayerId !== playerId) {
        logger.warn(state, LogCategory.ACTION, `Player tried to activate PW without priority.`);
        return false;
      }

      const isMainPhase = (state.currentPhase === 'PreCombatMain' || state.currentPhase === 'PostCombatMain');
      const stackEmpty = state.stack.length === 0;
      const isMyTurn = state.activePlayerId === playerId;

      const logic = oracle.getCard(obj.definition.name);
      if (!logic || !logic.abilities) return false;

      const canActivateAnyTime = (logic.abilities as AbilityDefinition[]).some((a) => a.type === AbilityType.Static && String(a.id || "").includes('any_turn'));

      if (!canActivateAnyTime && (!isMyTurn || !isMainPhase || !stackEmpty)) {
        logger.warn(state, LogCategory.ACTION, `Cannot activate Planeswalker: Sorcery speed only.`);
        return false;
      }

      if (obj.abilitiesUsedThisTurn > 0) {
        logger.warn(state, LogCategory.ACTION, `Already used a loyalty ability this turn.`);
        return false;
      }

      const abilities = (logic.abilities as AbilityDefinition[]);
      const filteredEntries = abilities
        .map((a, idx) => ({ ability: a, originalIndex: idx }))
        .filter((entry) => {
          const a = entry.ability;
          const typeStr = String(a.type || "").toLowerCase();
          const isActivated = typeStr.includes('activated');
          const hasLoyalty = a.costs?.some((c) => String(c.type || "").toLowerCase().includes('loyalty'));

          return isActivated && hasLoyalty;
        });

      state.pendingAction = {
        type: ActionType.ModalSelection,
        playerId: playerId,
        sourceId: cardId,
        data: {
          label: `Choose a loyalty ability for ${obj.definition.name}`,
          choices: filteredEntries.map((entry) => {
            const a = entry.ability as AbilityDefinition;
            const lCostObj = a.costs?.find((c) => String(c.type || "").toLowerCase().includes('loyalty'));
            const lCostVal = parseInt(String((lCostObj as AddCounterCost | RemoveCounterCost)?.value || 0));
            const lCostSign = lCostVal > 0 ? `+${lCostVal}` : `${lCostVal}`;

            // Truncate if extreme length for modal safety
            let labelText = a.id || "Ability";
            if (labelText.length > 120) labelText = labelText.substring(0, 117) + "...";

            return {
              label: `${lCostSign}: ${labelText}`,
              value: entry.originalIndex,
              selectable: true
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

    const allActivated = [...(logic?.abilities || [])];

    // --- SUPPORT FOR IN-LINE ABILITIES (Tokens, Virtual Spells) ---
    if (obj.definition.abilities) {
      obj.definition.abilities.forEach((a) => {
        if (typeof a === 'string') return;
        const isDuplicate = allActivated.some(existing => {
          const ex = existing as AbilityDefinition;
          if (a.id !== undefined && ex.id !== undefined) return a.id === ex.id;

          return a.type === ex.type &&
            JSON.stringify(a.effects) === JSON.stringify(ex.effects) &&
            JSON.stringify(a.costs) === JSON.stringify(ex.costs);
        });
        if (!isDuplicate) {
          allActivated.push(a);
        }
      });
    }

    const filtered = allActivated
      .map((a, index) => ({ ability: a as AbilityDefinition, index }))
      .filter((entry) => entry.ability.type === AbilityType.Activated && PriorityProcessor.canAbilityBeActivated(state, playerId, cardId, entry.index, true));

    logger.debug(state, LogCategory.ACTION, `interactWithPermanent: ${obj.definition.name} (${cardId}) found ${allActivated.length} intrinsic abilities, ${filtered.length} are currently legal activated abilities.`);

    if (filtered.length > 0) {
      if (state.priorityPlayerId !== playerId) {
        logger.warn(state, LogCategory.ACTION, `Player tried to activate ability without priority.`);
        return false;
      }

      if (filtered.length === 1) {
        const { ability, index: abilityIdx } = filtered[0];

        if (ability.isManaAbility) {
          // Determine if this mana ability requires choices (like Add {B} or {G})
          const hasChoices = ability.effects?.some((e) => e.type === EffectType.AddMana && e.choices);

          // If it has no choices and only costs Tap, we just fire it immediate
          // Rules 605.3a: Mana abilities don't use the stack and are resolved immediately.
          return engine.activateAbility({
            playerId,
            cardId,
            abilityIndex: abilityIdx,
            bypassPriority: true,
            bypassTargeting: true
          });
        }

        // Safety Step: For single non-mana utility abilities, show a confirmation modal 
        state.pendingAction = {
          type: ActionType.ModalSelection,
          playerId: playerId,
          sourceId: cardId,
          data: {
            label: `Choose an action for ${obj.definition.name}`,
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
      if (filtered.length > 1) {
        state.pendingAction = {
          type: ActionType.ModalSelection,
          playerId: playerId,
          sourceId: cardId,
          data: {
            label: `Choose an ability to activate for ${obj.definition.name}`,
            choices: filtered.map((entry) => ({
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
    const logic = oracle.getCard(obj.definition.name);
    if (!logic || !logic.abilities) return false;

    let manaAbilityIdx = abilityIndex !== undefined ? abilityIndex : (logic.abilities as AbilityDefinition[]).findIndex((a) => a.isManaAbility);
    if (manaAbilityIdx === -1) {
      // Fallback for cases where index might be wrong or wasn't provided accurately
      manaAbilityIdx = (logic.abilities as AbilityDefinition[]).findIndex((a) => a.isManaAbility);
    }
    if (manaAbilityIdx === -1) return false;

    // Standardize ability index and use bypassTargeting=true for silent, synchronous tapping 
    // during the auto-tap sequence.
    return engine.activateAbility({
      playerId,
      cardId,
      abilityIndex: manaAbilityIdx,
      choiceIndex,
      bypassPriority: true,
      bypassTargeting: true
    });
  }

  public static tapForMana(
    state: GameState,
    playerId: PlayerId,
    cardId: string,
    engine: EngineContext

  ): boolean {
    const { logger, mana: ManaProcessor } = getProcessors(state);
    const card = state.battlefield.find(c => c.id === cardId);
    if (!card || card.controllerId !== playerId) return false;

    // We only handle "Undo" here now. Tapping for mana is handled via ActivateAbility (Step 3 above)
    if (!card.isTapped) return false;

    const logic = m21Data[card.definition.name];
    if (!logic) return false;

    // GENERIC UNDO LOGIC: If a land has exactly one mana ability, we can try to undo it
    const manaAbilities = (logic.abilities as AbilityDefinition[]).filter((a) => a.isManaAbility);
    if (manaAbilities.length !== 1) return false;

    const ability = manaAbilities[0];
    const addManaEffect = ability.effects?.find((e) => e.type === EffectType.AddMana);
    if (!addManaEffect) return false;

    const player = state.players[playerId];

    const manaStr = addManaEffect.value || '{C}';
    const requirements = ManaProcessor.parseManaCost(manaStr.startsWith('{') ? manaStr : `{${manaStr}}`);

    // Extract the primary color symbol
    const color = (Object.keys(requirements.colored)[0] as keyof typeof player.manaPool) || 'C';

    if (player.manaPool[color] > 0) {
      card.isTapped = false;
      player.manaPool[color]--;
      logger.info(state, LogCategory.MANA, `${player.name} untapping ${card.definition.name} (Undo Mana {${color}})`);
      return true;
    }

    logger.warn(state, LogCategory.MANA, `Cannot undo: Mana {${color}} already spent.`);
    return false;
  }

  public static declareAttacker(state: GameState, playerId: string, cardId: string, targetId: string | undefined): boolean {
    const { logger, restriction: RP } = getProcessors(state);
    const card = state.battlefield.find(c => c.id === cardId);

    const isPlaneswalker = card && RuleUtils.isPlaneswalker(card) && card.controllerId !== playerId;
    const isOpponent = !!state.players[cardId as PlayerId] && cardId !== playerId;

    if (isPlaneswalker || isOpponent) {
      if (state.combat?.attackers.length) {
        const last = state.combat.attackers[state.combat.attackers.length - 1];
        last.targetId = cardId;
        logger.info(state, LogCategory.COMBAT, `Attack re-targeted to ${isOpponent ? 'Opponent' : card!.definition.name}.`);
        return true;
      }
    }

    if (!card || card.controllerId !== playerId || card.zone !== Zone.Battlefield) return false;

    // CR 302.1: A creature can't attack unless its controller has controlled it... (Summoning Sickness)
    const stats = LayerProcessor.getEffectiveStats(card, state);
    const isCreature = RuleUtils.isCreature(card);

    if (!isCreature) return false;

    if (card.summoningSickness && !RuleUtils.hasKeyword(card, 'Haste')) {
      return false;
    }

    if (!state.combat) state.combat = { attackers: [], blockers: [] };

    const existingIndex = state.combat.attackers.findIndex(a => a.attackerId === cardId);
    if (existingIndex >= 0) {
      // Requirement Check: MustAttack (Rule 508.1d)
      const mustAttack = state.ruleRegistry.restrictions.some(r => r.targetId === cardId && r.type === 'MustAttack') ||
        (stats.restrictions || []).some((r: any) => r.type === 'MustAttack');
      if (mustAttack) {
        const { restriction: RP } = getProcessors(state);
        const canAttack = !card.isTapped && !card.summoningSickness && RP.canAttack(state, card);
        const cannotAttackFlags = state.ruleRegistry.restrictions.some(r => r.targetId === cardId && r.type === 'CannotAttack');

        if (canAttack && !cannotAttackFlags) {
          logger.warn(state, LogCategory.COMBAT, `${card.definition.name} must attack and cannot be deselected.`);
          return false;
        }
      }
      state.combat.attackers.splice(existingIndex, 1);
      logger.info(state, LogCategory.COMBAT, `${card.definition.name} removed from attackers.`);
    } else {
      if (card.isTapped) return false;

      const { restriction: RP } = getProcessors(state);
      if (!RP.canAttack(state, card)) {
        logger.warn(state, LogCategory.COMBAT, `[ATTACK] ERR: ${card.definition.name} cannot attack.`);
        return false;
      }

      const opponentId = Object.keys(state.players).find(id => id !== playerId);
      state.combat.attackers.push({ attackerId: cardId, targetId: targetId || opponentId! });

      // Rule 702.24: Vigilance prevents tapping when attacking
      // Note: Tapping now happens upon CONFIRMATION in CombatProcessor
      logger.info(state, LogCategory.COMBAT, `${card.definition.name} selected as attacker.`);
    }
    return true;
  }

  public static handleBlockSelection(state: GameState, playerId: string, cardId: string): boolean {
    const { logger, trigger: TrP } = getProcessors(state);
    const card = state.battlefield.find(c => c.id === cardId);
    if (!card) return false;

    // A. SELECTION: My creature (the blocker)
    if (card.controllerId === playerId) {
      if (card.isTapped) {
        logger.warn(state, LogCategory.COMBAT, `[BLOCK] ERR: ${card.definition.name} is tapped and cannot block.`);
        return false;
      }
      state.pendingAction!.sourceId = cardId;
      logger.info(state, LogCategory.COMBAT, `Selected ${card.definition.name} to block. Now select an attacking creature.`);
      return true;
    }

    // B. TARGETING: Opponent attacker
    const blockerId = state.pendingAction!.sourceId;
    if (!blockerId) {
      logger.warn(state, LogCategory.COMBAT, "[BLOCK] Choose one of your potential blockers first.");
      return false;
    }

    const blockerObj = state.battlefield.find(c => c.id === blockerId);
    const attackers = state.combat?.attackers || [];
    const isAttacking = attackers.some(a => a.attackerId === cardId);

    if (!isAttacking) {
      logger.warn(state, LogCategory.COMBAT, `[BLOCK] ERR: ${card.definition.name} is not an attacking creature.`);
      return false;
    }

    const { legal, reason } = CombatProcessor.isLegalBlocker(state, blockerId, cardId);
    if (!legal) {
      logger.warn(state, LogCategory.COMBAT, `${blockerObj?.definition.name} cannot block ${card.definition.name}${reason ? ` (${reason})` : ''}.`);
      return false;
    }

    if (!state.combat) state.combat = { attackers: [], blockers: [] };

    const attacker = RuleUtils.findObject(state, cardId) as any;
    const blocker = RuleUtils.findObject(state, blockerId) as any;

    const oldIdx = state.combat.blockers.findIndex(b => b.blockerId === blockerId);
    if (oldIdx >= 0) state.combat.blockers.splice(oldIdx, 1);

    state.combat.blockers.push({ blockerId, attackerId: cardId });
    logger.info(state, LogCategory.COMBAT, `${state.battlefield.find(c => c.id === blockerId)?.definition.name} blocking ${card.definition.name}`);

    TrP.onEvent(state, { 
      type: 'ON_BLOCK', 
      playerId: playerId, 
      payload: { sourceId: blockerId, targetIds: [blockerId], object: blockerObj, attackerId: cardId } 
    });

    state.pendingAction!.sourceId = undefined;
    return true;
  }

  public static discardCard(state: GameState, playerId: PlayerId, cardInstanceId: string): { finished: boolean, success: boolean } {
    const { logger, trigger: TrP, choiceGenerator: ChoiceGenerator } = getProcessors(state);
    const player = state.players[playerId];
    if (!player) return { finished: false, success: false };

    // BUG FIX: Prevent race condition where rapid clicking discards more than required.
    // We only allow discard if there's a pending DISCARD action for this player.
    if (state.pendingAction?.type !== ActionType.Discard) {
      return { finished: false, success: false };
    }
    if (state.pendingAction?.playerId !== playerId) {
      return { finished: false, success: false };
    }

    const isOptionalDiscard = state.pendingAction?.type === ActionType.Discard && (state.pendingAction.data as any)?.minChoices === 0;

    if (player.pendingDiscardCount <= 0 && !isOptionalDiscard) {
      return { finished: false, success: false };
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardInstanceId);
    if (cardIndex === -1) return { finished: false, success: false };

    const card = player.hand[cardIndex];
    if (!card) return { finished: false, success: false };
    
    // CR 701.8: To discard a card, move it from hand to graveyard.
    const { action: ActionProcessor } = getProcessors(state);
    ActionProcessor.moveCard(state, card, Zone.Graveyard, playerId, "top", false, true);

    const sourceId = state.pendingAction?.sourceId;

    if (player.pendingDiscardCount > 0) {
      player.pendingDiscardCount--;

      // Update top-level count (Cleanup phase and unified Discard UI)
      if (state.pendingAction && state.pendingAction.count !== undefined) {
        state.pendingAction.count--;
      }
      // Also update data.count for legacy effects if it exists
      if (state.pendingAction && (state.pendingAction.data as any)?.count !== undefined) {
        (state.pendingAction.data as any).count--;
      }

      logger.info(state, LogCategory.ACTION, `${player.name} discarded ${card.definition.name} (${player.pendingDiscardCount} more to go).`);

      if (player.pendingDiscardCount === 0) {
        logger.info(state, LogCategory.ACTION, `${player.name} finished discarding.`);

        // Handle sequential discards (Next players)
        const nextPlayerIds = (state.pendingAction.data as any)?.nextPlayerIds || [];
        if (nextPlayerIds.length > 0) {
          const discardAmount = (state.pendingAction.data as any)?.discardAmount || 1;
          const label = (state.pendingAction.data as any)?.label || "Discard";
          const stackObj = state.pendingAction.data?.stackObj;
          const parentContext = state.pendingAction.data?.parentContext;
          const onFailureEffects = (state.pendingAction.data as any)?.onFailureEffects;

          const { choiceGenerator: ChoiceGenerator } = getProcessors(state);
          state.pendingAction = ChoiceGenerator.createDiscardChoice(state, nextPlayerIds, sourceId as string, discardAmount, label, stackObj, parentContext, onFailureEffects);
          return { finished: false, success: true };
        }

        // Restore effect index on stack object to ensure we resume at the correct point
        const stackObj = state.pendingAction.data?.stackObj;
        if (stackObj) {
          const realStackObj = state.stack.find(s => s.id === stackObj.id);
          if (realStackObj && realStackObj.data) {
            const currentIndex = (state.pendingAction.data as any)?.nextEffectIndex;
            if (currentIndex !== undefined) {
              realStackObj.data.nextEffectIndex = currentIndex;
              logger.debug(state, LogCategory.ACTION, `[DISCARD-RESOLUTION] Restored nextEffectIndex to ${realStackObj.data.nextEffectIndex} for ${realStackObj.id}`);
            }
          }
        }

        state.pendingAction = undefined;
        return { finished: true, success: true };
      }
    } else {
      logger.info(state, LogCategory.ACTION, `${player.name} discarded ${card.definition.name}.`);
    }

    return { finished: false, success: true };
  }
  public static resolveCombatOrdering(state: GameState, playerId: string, order: string[]) {
    const { combat: CP } = getProcessors(state);
    if (!state.combat || !state.pendingAction) return;

    const sourceId = state.pendingAction.sourceId;
    if (!sourceId) return;

    if (state.pendingAction.type === 'ORDER_BLOCKERS') {
      const attacker = state.combat.attackers.find(a => a.attackerId === sourceId);
      if (attacker) {
        attacker.order = order;
        //  log(`[FLOW] ${state.players[playerId].name} established damage assignment order for ${state.battlefield.find(o => o.id === sourceId)?.definition.name}.`);
      }
    } else if (state.pendingAction.type === 'ORDER_ATTACKERS') {
      const entries = state.combat.blockers.filter(b => b.blockerId === sourceId);
      entries.forEach(e => e.order = order);
      //log(`[FLOW] ${state.players[playerId].name} established damage assignment order for their blocker ${state.battlefield.find(o => o.id === sourceId)?.definition.name}.`);
    }

    state.pendingAction = undefined;

    // Check if more ordering is needed
    if (CP.needsOrdering(state)) {
      CP.setupNextOrderingAction(state);
    }
  }

  public static resolveTriggerOrdering(state: GameState, playerId: PlayerId, orderedIds: string[]): boolean {
    const { logger, trigger: TrP } = getProcessors(state);
    if (!state.pendingAction || state.pendingAction.type !== ActionType.OrderTriggers || state.pendingAction.playerId !== playerId) return false;

    const triggers = state.pendingAction.data?.triggers as any[];

    // The player sends us the IDs in "Stacking Order" (MTGA UI)
    // index 0 -> Last to resolve (Bottom of stack)
    // index N-1 -> First to resolve (Top of stack)
    let orderedTriggers = orderedIds.map(id => triggers.find((t: any) => t.id === id)).filter(Boolean);

    // FALLBACK: If no triggers were found by ID, check if the payload contained indices
    if (orderedTriggers.length === 0 && orderedIds.length > 0) {
      orderedTriggers = orderedIds
        .map(id => {
          const idx = parseInt(id);
          return !isNaN(idx) ? triggers[idx] : null;
        })
        .filter(Boolean);
    }

    // If we still have no triggers to stack, something is wrong
    if (orderedTriggers.length === 0 && (triggers?.length || 0) > 0) {
      logger.warn(state, LogCategory.TRIGGER, `[TRIGGER-ORDERING] Failed to resolve any triggers from IDs: ${orderedIds.join(', ')}`);
      // Emergency fallback: stack them in default order to avoid stalling the game
      orderedTriggers = [...triggers];
    }

    orderedTriggers.forEach(t => {
      logger.debug(state, LogCategory.TRIGGER, `[ORDER-RESOLVED] Ordered trigger ${t.id} has targets: ${t.targets?.join(', ')}`);
    });

    // Get the IDs of the triggers we are actually stacking to clean up pendingTriggers
    const resolvedIds = orderedTriggers.map(t => t.id);

    // Remove these from pending triggers
    if (state.pendingTriggers) {
      state.pendingTriggers = state.pendingTriggers.filter(t => !resolvedIds.includes(t.id));
    }

    state.pendingAction = undefined;

    for (let i = 0; i < orderedTriggers.length; i++) {
      const t = orderedTriggers[i];
      TrP.stackTrigger(state, t);

      const pendingAfter = state.pendingAction as any;
      // If stacking this trigger caused a targeting prompt,
      // we must save the REMAINING triggers to be stacked after targeting is done.
      if (pendingAfter && i < orderedTriggers.length - 1) {
        const remaining = orderedTriggers.slice(i + 1);
        if (pendingAfter.data) {
          pendingAfter.data.nextTriggersToStack = remaining;
        }
        logger.info(state, LogCategory.TRIGGER, `[TRIGGER] Pausing trigger stacking for ${t.id} target selection. ${remaining.length} triggers remaining in queue.`);
        return true;
      }
    }
    // Process remaining if anyone else has triggers
    TrP.processPendingTriggers(state);
    return true;
  }

  /**
   * CR 603: Resolve a specific target selection from the UI.
   */
  public static resolveTargeting(state: GameState, playerId: PlayerId, targetId: string, engine: EngineContext): boolean {
    const { targeting: TP } = getProcessors(state);
    return TP.resolveInteractiveTargeting(
      state,
      playerId,
      targetId,
      {
        ...engine,
        resetPriorityToActivePlayer: () => engine.resetPriorityToActivePlayer(),
        finaliseTargeting: (p: PlayerId, t: string[]) => {
          return TP.finaliseTargeting(state, p, t, engine);
        }
      }
    );
  }
}