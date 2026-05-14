import { AbilityDefinition, AbilityType, ActionType, ContinuousEffect, EffectType, EnginePrefix, GameObject, GameState, Phase, PlayerId, Step, TargetMapping, TriggerEvent, Zone, GameEvent, PlayerState, BaseEntity, TargetDefinition } from '@shared/engine_types';
import type { SpellProcessor } from '../../actions/spells/SpellProcessor';
import type { RestrictionValidator } from '../../core/RestrictionValidator';
import type { CostProcessor } from '../../magic/CostProcessor';
import type { ManaProcessor } from '../../magic/ManaProcessor';
import { RuleUtils } from '../../../utils/RuleUtils';
import type { LayerProcessor } from '../../state/LayerProcessor';
import type { ConditionProcessor } from '../logic/ConditionProcessor';
import { EngineValidator } from '../logic/EngineValidator';
import type { TurnProcessor } from './TurnProcessor';
import { getProcessors } from '../../ProcessorRegistry';
import { LogCategory } from '../../../utils/EngineLogger';
import type { ResolutionManager } from '../stack/ResolutionManager';
import type { SpellValidator } from '../../actions/spells/SpellValidator';
import type { SpellCostCalculator } from '../../actions/spells/SpellCostCalculator';



/**
 * Priority Handling (Rule 117)
 */
import { EngineContext } from '../../../interfaces/EngineContext';

export class PriorityProcessor {

  /**
   * CR 117.4: Timing and Priority
   * Handles the passing of priority and automatic resolution of the stack.
   */
  public static passPriority(
    state: GameState,
    playerId: PlayerId,
    engine: EngineContext,
    isAuto = false
  ) {
    const { logger } = getProcessors(state);
    if (state.status === 'completed') return;

    // 1. Intercept for special actions
    if (state.pendingAction?.playerId === playerId) {
      if (state.pendingAction.type === 'DECLARE_ATTACKERS') {
        engine.confirmAttackers(playerId);
        return;
      }
      if (state.pendingAction.type === 'DECLARE_BLOCKERS') {
        engine.confirmBlockers(playerId);
        return;
      }
    }

    if (String(state.priorityPlayerId) !== String(playerId)) {
      console.log(`[PRIORITY-PROC] passPriority IGNORED: current priority is ${state.priorityPlayerId}, but ${playerId} tried to pass.`);
      return;
    }

    // CR 117.1: A player must resolve pending mandatory actions before passing
    // Exception: Optional discards (e.g. "discard any number") can be completed by passing.
    const pendingAction = state.pendingAction;
    const isOptionalDiscardAction = (pendingAction?.type === ActionType.Discard && (pendingAction.data as Record<string, any>)?.isOptionalDiscard === true);

    if (EngineValidator.isSuspended(state) && EngineValidator.isPlayerRequiredToAct(state, playerId) && !isOptionalDiscardAction) {
      console.log(`[PRIORITY-PROC] passPriority BLOCKED: ${playerId} has pending ${state.pendingAction?.type}.`);
      logger.info(state, LogCategory.PRIORITY, `Invalid Action: Player must resolve pending ${state.pendingAction?.type} first.`);
      return;
    }

    const player = state.players[playerId];
    if (player && player.pendingDiscardCount > 0 && !isOptionalDiscardAction) {
      if (!isAuto) logger.info(state, LogCategory.PRIORITY, `${engine.getPlayerName(playerId)} must finish discarding first.`);
      return;
    }

    // --- OPTIONAL DISCARD RESUMPTION ---
    // If we're passing priority while an optional discard is active, it means the player is "Done".
    // Zero out the remaining count and resume the resolution chain.
    if (isOptionalDiscardAction) {
      const { choice: ChoiceProcessor, resolution: ResolutionManager } = getProcessors(state);
      const actionData = state.pendingAction?.data as Record<string, any>;
      const sourceId = state.pendingAction?.sourceId;
      const stackObj = actionData?.stackObj;
      const parentContext = actionData?.parentContext;

      player.pendingDiscardCount = 0;
      state.pendingAction = undefined;
      logger.info(state, LogCategory.PRIORITY, `${engine.getPlayerName(playerId)} finished optional discard. Discarded ${state.turnState.lastDiscardedIds?.length || 0} cards.`);
      if (sourceId && stackObj && parentContext) {
        ResolutionManager.resume(state, engine, stackObj, sourceId, parentContext);
        return;
      }
    }

    // --- STOPPER LOGIC: Untoggle stop after it "did its work" ---
    if (!isAuto && player?.stops) {
      const isYourTurn = state.activePlayerId === playerId;
      const currentStepId = state.currentStep.toLowerCase();
      const stopKey = isYourTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;
      const beginKey = isYourTurn ? `my_beginning` : `opp_beginning`;
      const isBeginning = currentStepId === 'upkeep' || currentStepId === 'draw';

      if (player.stops[stopKey] || (isBeginning && player.stops[beginKey])) {
        if (player.stops[stopKey]) player.stops[stopKey] = false;
        if (isBeginning && player.stops[beginKey]) player.stops[beginKey] = false;
        logger.info(state, LogCategory.PRIORITY, `Stop cleared for ${state.currentStep}.`);
      }
    }

    state.consecutivePasses++;

    const prefix = isAuto ? '[Auto-Pass] ' : '[Manual-Pass] ';
    logger.info(state, LogCategory.PRIORITY, `${prefix}${engine.getPlayerName(playerId)} passed. (${state.consecutivePasses}/${state.playerOrder.length} passes)`);

    if (state.consecutivePasses >= state.playerOrder.length) {
      engine.resolveTopOrAdvanceStep();
    } else {
      this.givePriorityToNextPlayer(state, engine);
    }
  }

  public static givePriorityToNextPlayer(
    state: GameState,
    engine: EngineContext
  ) {
    if (!state.priorityPlayerId) return;
    const currentIndex = state.playerOrder.indexOf(state.priorityPlayerId);
    const nextIndex = (currentIndex + 1) % state.playerOrder.length;

    engine.checkStateBasedActions();

    // CR 117.5: Process pending triggers before giving priority
    const { trigger: TrP, layer: LayerProcessor } = getProcessors(state);
    TrP.processPendingTriggers(state);

    if (state.pendingAction) return;

    state.priorityPlayerId = state.playerOrder[nextIndex];

    // CR 613: Refresh playability NOW that priority is shifted.
    LayerProcessor.updateDerivedStats(state, PriorityProcessor);

    this.checkAutoPass(state, state.priorityPlayerId, engine);
  }

  public static resetPriorityToActivePlayer(
    state: GameState,
    engine: EngineContext
  ) {
    state.consecutivePasses = 0;
    engine.checkStateBasedActions();

    // CR 117.5: Process pending triggers before giving priority
    const { trigger: TrP } = getProcessors(state);
    TrP.processPendingTriggers(state);

    // Only set priority to active player if an SBA or trigger didn't just set up a mandatory action.
    if (!state.pendingAction) {
      state.priorityPlayerId = state.activePlayerId;
    }

    // CR 613: Refresh playability NOW that priority is assigned.
    // This ensures auto-pass and UI highlighting are based on the new priority state.
    const { layer: LayerProcessor } = getProcessors(state);
    LayerProcessor.updateDerivedStats(state, PriorityProcessor);

    if (state.priorityPlayerId) {
      this.checkAutoPass(state, state.priorityPlayerId, engine);
    }
  }

  public static checkAutoPass(
    state: GameState,
    playerId: PlayerId,
    engine: EngineContext
  ) {
    const isPriority = state.priorityPlayerId && String(state.priorityPlayerId) === String(playerId);
    const isPending = state.pendingAction && String(state.pendingAction.playerId) === String(playerId);
    const { logger } = getProcessors(state);

    if (state.status === 'completed') return;
    if (!isPriority && !isPending) return;

    const player = state.players[playerId];
    if (!player) return;

    // --- COMBAT DECLARATION AUTO-CONFIRMS ---
    // These steps (Attackers/Blockers) often have null priority while selecting.
    if (isPending && !player.fullControl) {
      const isYourTurn = state.activePlayerId === playerId;
      const currentStepId = state.currentStep.toLowerCase();
      const stopKey = isYourTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;
      const hasManualStop = player?.stops?.[stopKey];

      if (!hasManualStop) {
        const { turn: TurnProcessor } = getProcessors(state);
        if (state.pendingAction?.type === 'DECLARE_ATTACKERS' && !TurnProcessor.hasPotentialAttackers(state, playerId)) {
          engine.confirmAttackers(playerId);
          return;
        }
        if (state.pendingAction?.type === 'DECLARE_BLOCKERS' && !TurnProcessor.hasPotentialBlockers(state, playerId)) {
          engine.confirmBlockers(playerId);
          return;
        }
      }
    }

    if (!isPriority) return; // Priority logic below

    const canAct = this.canPlayerTakeAnyAction(state, playerId);

    const isYourTurn = state.activePlayerId === playerId;
    const currentStepId = state.currentStep.toLowerCase();
    const stopKey = isYourTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;

    // Support for consolidated "Beginning" and "Ending" stops (Arena-style auto-pass)
    const beginKey = isYourTurn ? `my_beginning` : `opp_beginning`;
    const isAutoSkipStep = currentStepId === 'upkeep' || currentStepId === 'draw' || currentStepId === 'end' || (currentStepId === 'cleanup' && state.stack.length === 0);
    const isAdministrative = currentStepId === 'untap' || (currentStepId === 'cleanup' && state.stack.length === 0);
    const hasManualStop = !isAdministrative && (player?.stops?.[stopKey] || (isAutoSkipStep && player?.stops?.[beginKey]));
    const isSkipActive = player?.passUntilEndOfTurn;

    // --- STICKY PRIORITY: Pause once after stack changes (CR 117.4) ---
    // This prevents "blink and you miss it" resolution when no actions are available.
    if (state.isSticky) {
      const shouldPause = !isSkipActive && !player.fullControl && !hasManualStop && !isAdministrative;
      state.isSticky = false;
      if (shouldPause) {
        logger.info(state, LogCategory.ACTION, `[STICKY-PRIORITY] Sticky pause for ${player.name} to allow viewing stack resolution.`);
        return;
      }
    }

    // Skip if:
    // 1. No actions found (canAct = false)
    // 2. "Pass Turn" is active and we haven't hit a manual stop
    // 3. We are in an auto-skip step (Upkeep/Draw/End) and NO manual stop is set
    const shouldSkip = !canAct || (isSkipActive && !hasManualStop) || (isAutoSkipStep && !hasManualStop);

    if (player && !player.fullControl && !hasManualStop && shouldSkip) {
      // logger.info(state, LogCategory.ACTION, `[AUTO-PASS-DEBUG] Skipping priority for ${player.name}. canAct=${canAct}, isSkipActive=${isSkipActive}, hasManualStop=${hasManualStop}. StopKey=${stopKey}`);
      //logger.info(state, LogCategory.ACTION, `[AUTO-PASS] Skipping priority for ${player.name} (${canAct ? "Yield" : "No actions"}).`);

      // Safety: If skip was triggered by "No actions", do a deeper scan log for debugging
      if (!canAct) {
        //logger.debug(state, LogCategory.ACTION, `[AUTO-PASS-DEBUG] Deeper scan: HandSize=${player.hand.length}, BattlefieldSize=${state.battlefield.length}, StackSize=${state.stack.length}, PlayedLand=${player.hasPlayedLandThisTurn}`);
      }

      this.passPriority(state, playerId, engine, true);
    } else if (player) {
      const reason = player.fullControl ? "Full Control" : (hasManualStop ? `Manual Stop (${stopKey})` : (canAct ? "Legal Actions available" : "Unknown"));
      if (canAct || hasManualStop || player.fullControl) {
        logger.info(state, LogCategory.ACTION, `[PRIORITY-PAUSE] Pausing for ${player.name}. Reason: ${reason}.`);
        if (canAct) {
          this.canPlayerTakeAnyAction(state, playerId, true);
        }
      }
    }
  }


  /**
   * Rule 117.1: A player can take action IF: 
   * 1. It's their Main Phase + Stack is empty (Sorcery speed)
   * 2. They have an Instant/Flash card in hand (Instant speed)
   * 3. They have activated abilities or lands (Manual check for now)
   */
  /**
   * Refactored Action Availability Check
   * Determines if the player has any legal actions they could take if granted priority.
   * This is used by the auto-pass system.
   */
  public static canPlayerTakeAnyAction(state: GameState, playerId: string, logActions = false): boolean {
    const player = state.players[playerId];
    if (!player) return false;
    const { logger } = getProcessors(state);

    if (EngineValidator.isPlayerRequiredToAct(state, playerId)) return true;
    if (player.pendingDiscardCount > 0) return true;

    // 2. Manual Stops
    const isYourTurn = state.activePlayerId === playerId;
    const currentStepId = state.currentStep.toLowerCase();
    const stopKey = isYourTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;
    const isAdministrative = currentStepId === 'untap' || (currentStepId === 'cleanup' && state.stack.length === 0);
    if (!isAdministrative && player?.stops?.[stopKey] && state.stack.length === 0) {
      return true;
    }

    // 3. Spells
    const potentialSpells = [
      ...player.hand,
      ...player.virtualHand,
      ...player.graveyard,
      ...state.exile.filter(o => o.controllerId === playerId),
      ...(player.library.length > 0 ? [player.library[player.library.length - 1]] : [])
    ];

    const playableSpells = potentialSpells.filter(obj => this.canObjectBePlayed(state, playerId, obj.id, false));
    if (playableSpells.length > 0) {
      if (logActions) {
        logger.info(state, LogCategory.ACTION, `[PRIORITY-DETAIL] Playable spells: ${playableSpells.map(s => s.definition.name).join(', ')}`);
      }
      return true;
    }

    // 4. Activated Abilities
    const potentialAbilitySources = [
      ...state.battlefield.filter(o => o.controllerId === playerId),
      ...player.hand,
      ...player.graveyard,
      ...state.exile.filter(o => o.controllerId === playerId)
    ];

    const activatableSources: { name: string, zone: string }[] = [];
    potentialAbilitySources.forEach(obj => {
      if (RuleUtils.isGameObject(obj) && obj.isPrepared) {
        if (this.canCastPreparedFace(state, player, obj, false)) {
          activatableSources.push({ name: `${obj.definition.name} (Prepared)`, zone: obj.zone || "Unknown" });
        }
      }

      const abilities = this.getAbilitiesForObject(state, obj);
      const hasAny = abilities.some((_, idx) => this.canAbilityBeActivated(state, playerId, obj.id, idx, false));
      if (hasAny) {
        activatableSources.push({ name: obj.name || obj.definition.name || "Unknown", zone: obj.zone || "Unknown" });
      }
    });

    if (activatableSources.length > 0) {
      if (logActions) {
        logger.info(state, LogCategory.ACTION, `[PRIORITY-DETAIL] Activatable abilities from: ${activatableSources.map(s => `${s.name} (Zone: ${s.zone})`).join(', ')}`);
      }
      return true;
    }

    return false;
  }

  /**
   * Refactored Playability Check (CR 300-307)
   * Determines if a card or virtual object can be played/cast.
   */
  public static canObjectBePlayed(state: GameState, playerId: string, objId: string, checkPriority = true, preComputedStats?: any, preComputedCost?: string, skipAbilities = false): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    const { logger, spellValidator: SpellValidator } = getProcessors(state);

    // 1. Locate the object and identify its context (Permission check)
    let cardToPlay: GameObject | undefined;
    let isFlashback = false;

    // Handle Virtual Cards (Flashback, Permission, FreeCast)
    if (objId.startsWith(EnginePrefix.VirtualPrepared) ||
      objId.startsWith(EnginePrefix.Flashback) ||
      objId.startsWith(EnginePrefix.Permission) ||
      objId.startsWith(EnginePrefix.FreeCast) ||
      objId.startsWith(EnginePrefix.VirtualHand)) {
      cardToPlay = SpellValidator.resolveCardToPlay(state, playerId, objId) || undefined;
      if (cardToPlay) {
        // Rule: Only treat as flashback if ID explicitly starts with Flashback or is already flagged.
        // VirtualHand (v_) specifically implies a normal cast permission.
        isFlashback = (cardToPlay.isFlashbackCast || objId.startsWith(EnginePrefix.Flashback)) && !objId.startsWith(EnginePrefix.VirtualHand);
      }
    }

    // Search visible zones
    if (!cardToPlay) {
      cardToPlay = player.hand.find(o => o.id === objId) || player.virtualHand.find(o => o.id === objId);
    }

    if (!cardToPlay) {
      // Library top (e.g. Snoop, Radha)
      if (player.library.length > 0 && player.library[player.library.length - 1].id === objId) {
        if (this.findPermissionEffect(state, playerId, EffectType.AllowPlayFromTop, objId)) {
          cardToPlay = player.library[player.library.length - 1];
        }
      }

      // Graveyard (Flashback, Escape, Permissions)
      if (!cardToPlay) {
        const graveCard = player.graveyard.find(c => c.id === objId);
        if (graveCard) {
          const hasPermission = this.findPermissionEffect(state, playerId, EffectType.AllowCastFromGraveyard, objId);
          const { layer: LayerProcessor } = getProcessors(state);
          const stats = LayerProcessor.getEffectiveStats(graveCard, state);
          const flashback = (stats.keywords || []).some(k => k.toLowerCase() === 'flashback');
          if (hasPermission || flashback) {
            cardToPlay = graveCard;
            isFlashback = flashback;
          }
        }
      }

      // Exile (Adventure, Foretell, Permissions)
      if (!cardToPlay) {
        const exileCard = state.exile.find(c => c.id === objId);
        if (exileCard && exileCard.controllerId === playerId) {
          if (this.findPermissionEffect(state, playerId, EffectType.AllowPlayExiled, objId)) {
            cardToPlay = exileCard;
          }
        }
      }
    }

    // 2. Check for activated abilities on the object regardless of zone
    const objForAbilities = cardToPlay || RuleUtils.findObject(state, objId);
    if (!skipAbilities && objForAbilities && RuleUtils.isEntity(objForAbilities) && RuleUtils.getController(objForAbilities) === playerId) {
      if (RuleUtils.isGameObject(objForAbilities) && objForAbilities.isPrepared) {
        if (this.canCastPreparedFace(state, player, objForAbilities, checkPriority)) return true;
      }
      const abilities = this.getAbilitiesForObject(state, objForAbilities);
      if (abilities.some((_, idx) => this.canAbilityBeActivated(state, playerId, objId, idx, checkPriority))) {
        return true;
      }
    }

    if (!cardToPlay) return false;

    if (state.pendingAction) {
      // If there's a pending action, you can ONLY "play" (glow/click) if it's a DISCARD action for YOU.
      // This is specifically to support the London Mulligan and standard discard effects via hand interaction.
      if (state.pendingAction.type !== ActionType.Discard || state.pendingAction.playerId !== playerId) {
        return false;
      }
    }

    if (!this.validateTiming(state, playerId, cardToPlay, false, checkPriority)) {
      return false;
    }

    // 3. Casting Restrictions (Rule 613.11)
    const { restriction: RestrictionValidator } = getProcessors(state);
    if (!RestrictionValidator.canCastSpells(state, playerId, cardToPlay)) {
      return false;
    }

    // 4. Affordability (Mana and Additional Costs)
    const { layer: LayerProc, spellCostCalculator: SpellCostCalculator } = getProcessors(state);
    const stats = preComputedStats || cardToPlay!.effectiveStats || LayerProc.getEffectiveStats(cardToPlay!, state);

    // Capture both mana and additional costs from the calculator
    const costSummary = SpellCostCalculator.getEffectiveCosts(state, cardToPlay!, [], undefined, isFlashback, stats);
    const effectiveCost = preComputedCost || stats.manaCost || costSummary.totalMana;
    const additionalCosts = costSummary.additionalCosts;

    const isLand = RuleUtils.isLand(cardToPlay!);
    if (isLand) {
      if (player.hasPlayedLandThisTurn || state.stack.length > 0) {
        return false;
      }
    } else if (!player.manaCheat) {
      const { priority: PriorityProcessor } = getProcessors(state);
      const canFreeCast = PriorityProcessor.findFreeCastPermission(state, playerId, cardToPlay!.id);

      const { mana: ManaProcessor } = getProcessors(state);
      // Mana Check
      if (!canFreeCast && !ManaProcessor.canPayMana(state, player, effectiveCost, cardToPlay!)) {
        return false;
      }

      // Check for mandatory additional costs (e.g. Sacrifice a creature)
      if (additionalCosts.length > 0) {
        const { targeting: TargetingProcessor } = getProcessors(state);
        const canPayExtras = (additionalCosts as any[]).every(cost => {
          if (cost.type === 'Sacrifice') {
            return state.battlefield.some((o: GameObject) => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, cost.restrictions || [], { sourceId: cardToPlay!.id, controllerId: playerId, effects: [], targets: [] }));
          }
          if (cost.type === 'Discard') {
            return player.hand.some((c: GameObject) => c.id !== cardToPlay!.id && TargetingProcessor.matchesRestrictions(state, c, cost.restrictions || [], { sourceId: cardToPlay!.id, controllerId: playerId, effects: [], targets: [] }));
          }
          if (cost.type === 'PayLife') {
            const lifeVal = cost.value === 'X' ? 0 : (parseInt(cost.value || '0'));
            return player.life >= lifeVal;
          }
          if (cost.type === 'Exile') {
            const zones = cost.sourceZones || [Zone.Battlefield];
            const pool = zones.flatMap((z: Zone) => {
              if (z === Zone.Battlefield) return state.battlefield.filter((o: GameObject) => o.controllerId === playerId);
              if (z === Zone.Graveyard) return player.graveyard;
              if (z === Zone.Hand) return player.hand;
              return [] as GameObject[];
            });
            return pool.some((o: GameObject) => o.id !== cardToPlay!.id && TargetingProcessor.matchesRestrictions(state, o, cost.restrictions || [], { sourceId: cardToPlay!.id, controllerId: playerId, effects: [], targets: [] }));
          }
          if (cost.type === 'TapSelection') {
            return state.battlefield.some((o: GameObject) => o.controllerId === playerId && !o.isTapped && TargetingProcessor.matchesRestrictions(state, o, cost.restrictions || [], { sourceId: cardToPlay!.id, controllerId: playerId, effects: [], targets: [] }));
          }
          return true;
        });
        if (!canPayExtras) {
          return false;
        }
      }
    }

    // 5. Targeting (Rule 601.2c)
    const { targeting: TargetingProc } = getProcessors(state);
    const spellAbility = (cardToPlay.definition.abilities?.find((a: any) => a.type === AbilityType.Spell)) as AbilityDefinition;

    if (spellAbility) {
      if (spellAbility.modes) {
        const hasValidMode = spellAbility.modes!.some(mode => {
          const tDefs = (mode.targetDefinitions || []) as TargetDefinition[];
          if (!tDefs || tDefs.length === 0 || tDefs.every((td) => td.optional)) return true;
          return TargetingProc.hasLegalTargets(state, cardToPlay!.id, tDefs, playerId);
        });
        if (!hasValidMode) return false;
      } else if (spellAbility.targetDefinitions && spellAbility.targetDefinitions.length > 0) {
        if (!spellAbility.targetDefinitions!.every((td) => td.optional) && !TargetingProc.hasLegalTargets(state, cardToPlay!.id, spellAbility.targetDefinitions!, playerId)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Dedicated helper for SOS Prepared face casting.
   */
  private static canCastPreparedFace(state: GameState, player: PlayerState, obj: GameObject, checkPriority: boolean): boolean {
    const face = obj.definition.preparedFace || obj.definition.faces?.[1];
    if (!face) return false;

    // 1. Timing Validation
    // We treat the face as a virtual object for timing purposes.
    // Since RuleUtils.getDef is now robust, this will correctly identify speed (Instant vs Sorcery).
    if (!this.validateTiming(state, player.id, face, false, checkPriority)) return false;

    // 2. Cost Validation
    const { spell: SpellProcessor, mana: ManaProcessor, logger } = getProcessors(state);
    const { totalMana } = SpellProcessor.getEffectiveCosts(state, obj, [], face);

    const canPay = player.manaCheat || ManaProcessor.canPayMana(state, player, totalMana, obj);

    if (canPay) {
      // 3. Target Validation (Rule 601.2c)
      const faceAbilities = (face as any).abilities || [];
      const spellAbility = faceAbilities.find((a: any) => a.type === AbilityType.Spell);
      if (spellAbility?.targetDefinitions) {
        const { targeting: TargetingProcessor } = getProcessors(state);
        if (!TargetingProcessor.hasLegalTargets(state, obj.id, spellAbility.targetDefinitions, player.id)) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  /**
   * Centralized helper to collect all abilities for an object (logic, definition, and granted).
   */
  private static getAbilitiesForObject(state: GameState, obj: BaseEntity): (AbilityDefinition | string)[] {
    const abilities: (AbilityDefinition | string)[] = [...(obj.definition.abilities || [])];

    // Granted abilities (Continuous Effects)
    const { layer: LayerProcessor } = getProcessors(state);
    const stats = LayerProcessor.getEffectiveStats(obj as GameObject, state);
    if (stats.abilities) {
      stats.abilities.forEach((a: string | AbilityDefinition) => {
        const isDuplicate = abilities.some(existing => {
          if (typeof a === 'string' || typeof existing === 'string') return a === existing;
          return (a.id !== undefined && existing.id !== undefined) ? a.id === existing.id : (a.type === existing.type && JSON.stringify(a.effects) === JSON.stringify(existing.effects));
        });
        if (!isDuplicate) abilities.push(a);
      });
    }

    return abilities;
  }

  /**
   * Refactored Ability Activation Check (CR 602)
   * Validates if an activated ability can be put onto the stack.
   */
  public static canAbilityBeActivated(state: GameState, playerId: string, objId: string, abilityIndex: number, checkPriority = true): boolean {
    const { logger } = getProcessors(state);
    const player = state.players[playerId];
    const obj = RuleUtils.findObject(state, objId);
    if (!RuleUtils.isEntity(obj)) return false;

    // Optimization: Skip checking if a pending action is waiting for this player
    if (state.pendingAction && state.pendingAction.playerId === playerId) {
      return false;
    }

    // 1. Find and validate the ability
    const abilities = this.getAbilitiesForObject(state, obj);
    const ability = abilities[abilityIndex];
    if (!ability) return false;
    if (typeof ability === 'string') return false;
    if (ability.type !== AbilityType.Activated) return false;

    // 2. Timing & Priority (includes Loyalty CR 606.3 via validateTiming)
    if (!this.validateTiming(state, playerId, ability, true, checkPriority)) {
      return false;
    }

    // 3. Zone Check (CR 113.6)
    const activeZone = ability.activeZone || Zone.Battlefield;
    if (activeZone !== (Zone.Any as Zone) && obj.zone !== activeZone) {
      return false;
    }

    // 4. Restrictions (Silence, Limits, Conditions)
    const dummyEvent: GameEvent = { type: 'NONE', playerId };
    if (ability.triggerCondition && !ability.triggerCondition(state, dummyEvent, { sourceId: obj.id, controllerId: playerId, effects: [], targets: [] })) return false;

    const { condition: ConditionProcessor } = getProcessors(state);
    if (ability.condition && !ConditionProcessor.matchesCondition(state, ability.condition, { sourceId: obj.id, controllerId: playerId, effects: [], targets: [] })) return false;

    if (ability.limitPerTurn) {
      const usedCount = state.turnState.triggeredAbilitiesUsedThisTurn[`ability_${obj.id}_${abilityIndex}`] || 0;
      if (usedCount >= ability.limitPerTurn) return false;
    }

    if (RuleUtils.isPlaneswalker(obj) && ('abilitiesUsedThisTurn' in obj) && (obj as any).abilitiesUsedThisTurn > 0) return false;

    const { restriction: RestrictionValidator } = getProcessors(state);
    if (RuleUtils.isGameObject(obj) && !RestrictionValidator.canActivateAbility(state, playerId, ability, obj)) return false;

    // Skip mana abilities for auto-pass scan (Optimization)
    // CR 605.3a: During cost payment (pendingAction), we must NOT skip mana abilities.
    if (!checkPriority && ability.isManaAbility && !state.pendingAction) return false;

    // 5. Cost Check
    const { cost: CostProcessor } = getProcessors(state);
    if (!player.manaCheat && !CostProcessor.canPay(state, ability.costs || [], obj, playerId)) {
      return false;
    }

    // 6. Target Check
    const { targeting: TargetingProcessor } = getProcessors(state);
    if (ability.modes) {
      const hasValidMode = ability.modes.some(mode => {
        const tDefs = (mode.targetDefinitions || []) as TargetDefinition[];
        if (tDefs.length === 0 || tDefs.every((td: TargetDefinition) => td.optional)) return true;
        return TargetingProcessor.hasLegalTargets(state, obj.id, tDefs, playerId);
      });
      if (!hasValidMode) return false;
    } else if (ability.targetDefinitions && ability.targetDefinitions.length > 0) {
      if (!ability.targetDefinitions.every((td: TargetDefinition) => td.optional) && !TargetingProcessor.hasLegalTargets(state, obj.id, ability.targetDefinitions, playerId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Refactored Timing Validation (CR 300-307, 602.1, 606.3)
   * Determines if the current game state allows the action based on its speed and the player's priority.
   */
  public static validateTiming(state: GameState, playerId: string, objOrAbility: any, isActivatedAbility = false, checkPriority = true): boolean {
    const player = state.players[playerId];
    if (!player) return false;


    // 1. Priority Check (Rule 117.1)
    // If checkPriority is false, we are doing a "potential action" scan for auto-pass.
    if (checkPriority && state.priorityPlayerId !== playerId) {
      return false;
    }

    // 2. Identify Timing Speed
    const def = objOrAbility?.definition || objOrAbility;
    const isInstantOrFlash = RuleUtils.isType(objOrAbility, 'instant') || RuleUtils.hasFlash(objOrAbility);
    const isLand = RuleUtils.isLand(def);

    // Loyalty abilities (Planeswalkers) have unique sorcery-speed restrictions (CR 606.3)
    const isLoyalty = (objOrAbility.type === AbilityType.Activated && (objOrAbility.loyalty !== undefined || objOrAbility.isLoyaltyAbility)) || RuleUtils.isPlaneswalker(objOrAbility);

    // Sorcery speed applies to:
    // - Lands
    // - Loyalty abilities
    // - Abilities explicitly marked "Activate only as a sorcery"
    // - Non-instant/flash spells
    // - Non-instant activated abilities (default is instant-speed, but we check the flag)
    const onlyAsSorcery = objOrAbility.activatedOnlyAsSorcery;
    const isSorcerySpeed = isLand || isLoyalty || onlyAsSorcery || (!isInstantOrFlash && !isActivatedAbility);

    // 3. Evaluate Speed Requirements
    if (isSorcerySpeed) {
      const isYourTurn = state.activePlayerId === playerId;
      const isPre = state.currentPhase === Phase.PreCombatMain;
      const isPost = state.currentPhase === Phase.PostCombatMain;
      const isMain = isPre || isPost;
      const stackEmpty = state.stack.length === 0;

      // Check for out-of-turn permission effects (e.g. Teferi, Leyline of Anticipation)
      const hasPermission = state.ruleRegistry.continuousEffects.some(e =>
        (e.type === EffectType.AllowOutOfTurnActivation) &&
        (e.targetIds?.includes(objOrAbility.id) || e.sourceId === objOrAbility.id || (RuleUtils.isEntity(objOrAbility) && e.targetIds?.includes(objOrAbility.id)))
      ) || false;

      if (!hasPermission && (!isYourTurn || !isMain || !stackEmpty)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Specialized helper to find free-cast permissions (e.g. Zaffai, "without paying its mana cost").
   */
  public static findFreeCastPermission(state: GameState, playerId: string, targetId: string): ContinuousEffect | undefined {
    const { layer: LayerProcessor } = getProcessors(state);
    return state.ruleRegistry.continuousEffects.find(e => {
      const matchesType = e.isFreeCast || e.value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING";
      if (!matchesType) return false;

      const effectiveControllerId = e.targetControllerId || e.controllerId;
      if (effectiveControllerId !== playerId) return false;

      // Limit check
      if (e.limitPerTurn) {
        const used = state.turnState.triggeredAbilitiesUsedThisTurn[e.id] || 0;
        if (used >= e.limitPerTurn) return false;
      }

      // Condition check
      const { condition: ConditionProcessor } = getProcessors(state);
      if (e.condition && !ConditionProcessor.matchesCondition(state, e.condition, {
        sourceId: e.sourceId,
        controllerId: e.controllerId,
        effects: [],
        targets: []
      })) return false;

      // Target check
      return LayerProcessor.isTarget(state, e, targetId);
    });
  }

  /**
   * Helper to find an active permission effect in the registry.
   */
  public static findPermissionEffect(state: GameState, playerId: string, effectType: string, targetId: string): ContinuousEffect | undefined {

    const found = state.ruleRegistry.continuousEffects.find(e => {
      // 1. Basic Type/Owner check
      const eType = e.type as string;
      const effectiveControllerId = e.targetControllerId || e.controllerId;

      const matchesType = eType === effectType || (effectType === EffectType.AllowPlayExiled && e.canPlayExiled);

      if (!matchesType) return false;
      if (effectiveControllerId !== playerId) return false;

      // 2. Active Zone check (Static abilities only)
      const isStatic = (e.duration?.type || "").toString().toUpperCase() === 'STATIC';
      if (isStatic) {
        const source = RuleUtils.findObject(state, e.sourceId);
        if (!RuleUtils.isEntity(source) || (e.activeZones && source.zone && !e.activeZones.includes(source.zone))) return false;
      }

      // 3. Condition check
      const { condition: ConditionProcessor } = getProcessors(state);
      if (e.condition && !ConditionProcessor.matchesCondition(state, e.condition, {
        sourceId: e.sourceId,
        controllerId: e.controllerId,
        effects: [],
        targets: []
      })) return false;

      // 4. Target check (Is this card the target of the permission?)
      const { layer: LayerProcessor } = getProcessors(state);
      const isTarget = LayerProcessor.isTarget(state, e, targetId);

      if (!isTarget) return false;

      return true;
    });


    return found;
  }

  /**
   * CR 117: Passes priority continuously until the end of the turn or next interaction point.
   */
  public static togglePassTurn(state: GameState, playerId: string, engine: EngineContext) {
    const player = state.players[playerId];
    if (!player) return;

    player.passUntilEndOfTurn = !player.passUntilEndOfTurn;
    const { logger } = getProcessors(state);
    logger.info(state, LogCategory.PRIORITY, `[PASS-TURN] ${player.name} ${player.passUntilEndOfTurn ? 'enabled' : 'disabled'} Pass Turn.`);

    // Immediately check if we should auto-pass now that it's toggled
    if (player.passUntilEndOfTurn && state.priorityPlayerId === playerId) {
      this.checkAutoPass(state, playerId, engine);
    }
  }
}
