import { AbilityCost, AbilityDefinition, AbilityType, ActionType, CardDefinition, ContinuousEffect, EffectType, GameObject, GameState, Phase, PlayerId, Step, TargetMapping, TriggerEvent, Zone, GameEvent, PlayerState, BaseEntity, TargetDefinition } from '@shared/engine_types';
import { oracle } from '../../../OracleLogicMap';
import { SpellProcessor } from '../../actions/spells/SpellProcessor';
import { TargetingProcessor } from '../../actions/targeting/TargetingProcessor';
import { RestrictionValidator } from '../../core/RestrictionValidator';
import { CostProcessor } from '../../magic/CostProcessor';
import { ManaProcessor } from '../../magic/ManaProcessor';
import { RuleUtils } from '../../../utils/RuleUtils';
import { LayerProcessor } from '../../state/LayerProcessor';
import { ConditionProcessor } from '../logic/ConditionProcessor';
import { EngineValidator } from '../logic/EngineValidator';
import { TurnProcessor } from './TurnProcessor';
import { getProcessors } from '../../ProcessorRegistry';
import { LogCategory } from '../../../utils/EngineLogger';
import { ResolutionManager } from '../stack/ResolutionManager';



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
      const { choice: ChoiceProcessor } = getProcessors(state);
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

    // Support for consolidated "Beginning" stop (covers Upkeep and Draw)
    const beginKey = isYourTurn ? `my_beginning` : `opp_beginning`;
    const isBeginning = currentStepId === 'upkeep' || currentStepId === 'draw';

    const hasManualStop = player?.stops?.[stopKey] || (isBeginning && player?.stops?.[beginKey]);
    const isSkipActive = player?.passUntilEndOfTurn;

    // Skip if no possible actions OR if Pass Turn is active (and no manual stop is reached)
    const shouldSkip = !canAct || (isSkipActive && !hasManualStop);

    if (player && !player.fullControl && !hasManualStop && shouldSkip) {
      // We still need to prompt for attackers/blockers if it's the right step
      const isCombatSelection = state.pendingAction?.type === 'DECLARE_ATTACKERS' || state.pendingAction?.type === 'DECLARE_BLOCKERS';
      if (isSkipActive && isCombatSelection) {
        return; // Don't auto-pass combat declarations even if Skip is active
      }

      //engine.log(`[Auto-Pass] ${engine.getPlayerName(playerId)} skipped${!canAct ? ': no legal actions found' : ' (Pass Turn active)'}.`);
      this.passPriority(state, playerId, engine, true);
    } else if (player && (canAct || hasManualStop)) {
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
  public static canPlayerTakeAnyAction(state: GameState, playerId: string): boolean {
    const player = state.players[playerId];
    if (!player) return false;
    const { logger } = getProcessors(state);

    // 1. Mandatory Actions (CR 117.1)
    if (EngineValidator.isPlayerRequiredToAct(state, playerId)) return true;
    if (player.pendingDiscardCount > 0) return true;

    // 2. Manual Stops
    const isYourTurn = state.activePlayerId === playerId;
    const currentStepId = state.currentStep.toLowerCase();
    const stopKey = isYourTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;
    if (player?.stops?.[stopKey] && state.stack.length === 0) {
      return true;
    }

    // 3. Spells (Scan all zones where a player might have permission to cast)
    const potentialSpells = [
      ...player.hand,
      ...player.virtualHand,
      ...player.graveyard,
      ...state.exile.filter(o => o.controllerId === playerId),
      ...(player.library.length > 0 ? [player.library[player.library.length - 1]] : [])
    ];

    const hasPlayableSpell = potentialSpells.some(obj => this.canObjectBePlayed(state, playerId, obj.id, false));
    if (hasPlayableSpell) return true;

    // 4. Activated Abilities (Scan all zones for abilities that could be activated)
    const potentialAbilitySources = [
      ...state.battlefield.filter(o => o.controllerId === playerId),
      ...player.hand,
      ...player.graveyard,
      ...state.exile.filter(o => o.controllerId === playerId)
    ];

    const hasActivatableAbility = potentialAbilitySources.some(obj => {
      const abilities = this.getAbilitiesForObject(state, obj);
      return abilities.some((_, idx) => this.canAbilityBeActivated(state, playerId, obj.id, idx, false));
    });

    if (hasActivatableAbility) return true;

    return false;
  }

  /**
   * Refactored Playability Check (CR 300-307)
   * Determines if a card or virtual object can be played/cast.
   */
  public static canObjectBePlayed(state: GameState, playerId: string, objId: string, checkPriority = true, preComputedStats?: any, preComputedCost?: string): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    // 1. Locate the object and identify its context (Permission check)
    let cardToPlay: GameObject | undefined;
    let isFlashback = false;

    // Search visible zones
    cardToPlay = player.hand.find(o => o.id === objId) || player.virtualHand.find(o => o.id === objId);

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

    if (!cardToPlay) {
      // Special Case: Battlefield (Prepared face casting)
      const fieldObj = state.battlefield.find(o => o.id === objId);
      if (fieldObj && fieldObj.controllerId === playerId && fieldObj.isPrepared) {
        return this.canCastPreparedFace(state, player, fieldObj, checkPriority);
      }
      return false;
    }

    // 2. Structural & Timing Checks
    if (state.pendingAction && state.pendingAction.playerId === playerId) return false;

    if (!this.validateTiming(state, playerId, cardToPlay, false, checkPriority)) return false;

    // 3. Casting Restrictions (Rule 613.11)
    if (!RestrictionValidator.canCastSpells(state, playerId, cardToPlay)) return false;

    // 4. Affordability (Mana and Additional Costs)
    const { layer: LayerProc } = getProcessors(state);
    const stats = preComputedStats || cardToPlay.effectiveStats || LayerProc.getEffectiveStats(cardToPlay, state);
    const effectiveCost = preComputedCost || stats.manaCost || SpellProcessor.getEffectiveCosts(state, cardToPlay, [], undefined, isFlashback, stats).totalMana;
    
    const isLand = RuleUtils.isLand(cardToPlay);
    if (isLand) {
      if (player.hasPlayedLandThisTurn || state.stack.length > 0) return false;
    } else if (!player.manaCheat) {
      if (!ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveCost, cardToPlay)) return false;
      
      // Check for mandatory additional costs (e.g. Sacrifice a creature)
      const additionalCosts = (cardToPlay.definition as any).additionalCosts || [];
      if (additionalCosts.length > 0) {
        const { targeting: TargetingProcessor } = getProcessors(state);
        const canPayExtras = (additionalCosts as any[]).every(cost => {
          if (cost.type === 'Sacrifice') {
            return state.battlefield.some(o => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, cost.restrictions || [], { sourceId: cardToPlay!.id, controllerId: playerId }));
          }
          return true; 
        });
        if (!canPayExtras) return false;
      }
    }

    // 5. Targeting (Rule 601.2c)
    const { targeting: TargetingProc } = getProcessors(state);
    const logic = oracle.getCard(cardToPlay.definition.name);
    const spellAbility = (logic?.abilities?.find((a: any) => a.type === AbilityType.Spell) || 
                          cardToPlay.definition.abilities?.find((a: any) => a.type === AbilityType.Spell)) as AbilityDefinition;

    if (spellAbility) {
      if (spellAbility.modes) {
        const hasValidMode = spellAbility.modes.some(mode => {
          if (!mode.targetDefinitions || mode.targetDefinitions.length === 0 || mode.targetDefinitions.every((td: TargetDefinition) => td.optional)) return true;
          return TargetingProc.hasLegalTargets(state, cardToPlay!.id, mode.targetDefinitions, playerId);
        });
        if (!hasValidMode) return false;
      } else if (spellAbility.targetDefinitions && spellAbility.targetDefinitions.length > 0) {
        if (!spellAbility.targetDefinitions.every((td: TargetDefinition) => td.optional) && !TargetingProc.hasLegalTargets(state, cardToPlay!.id, spellAbility.targetDefinitions, playerId)) {
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

    // Prepared faces are treated as spells (usually instant or sorcery)
    if (!this.validateTiming(state, player.id, face, false, checkPriority)) return false;

    const { totalMana } = SpellProcessor.getEffectiveCosts(state, obj, [], face);
    if (player.manaCheat || ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana, obj)) {
      return true;
    }
    return false;
  }

  /**
   * Centralized helper to collect all abilities for an object (logic, definition, and granted).
   */
  private static getAbilitiesForObject(state: GameState, obj: BaseEntity): (AbilityDefinition | string)[] {
    const logic = oracle.getCard(obj.definition.name);
    const abilities: (AbilityDefinition | string)[] = [...(logic?.abilities || [])];

    // Definition abilities (Inline/Token/Virtual)
    if (obj.definition.abilities) {
      obj.definition.abilities.forEach((a: string | AbilityDefinition) => {
        const isDuplicate = abilities.some(existing => {
          if (typeof a === 'string' || typeof existing === 'string') return a === existing;
          return (a.id !== undefined && existing.id !== undefined) ? a.id === existing.id : (a.type === existing.type && JSON.stringify(a.effects) === JSON.stringify(existing.effects));
        });
        if (!isDuplicate) abilities.push(a);
      });
    }

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
    const player = state.players[playerId];
    const obj = RuleUtils.findObject(state, objId);
    if (!player || !obj || !RuleUtils.isEntity(obj)) return false;

    // Optimization: Skip checking if a pending action is waiting for this player
    if (state.pendingAction && state.pendingAction.playerId === playerId) return false;

    // 1. Find and validate the ability
    const abilities = this.getAbilitiesForObject(state, obj);
    const ability = abilities[abilityIndex];
    if (!ability || typeof ability === 'string' || ability.type !== AbilityType.Activated) return false;

    // 2. Timing & Priority (includes Loyalty CR 606.3 via validateTiming)
    if (!this.validateTiming(state, playerId, ability, true, checkPriority)) return false;

    // 3. Zone Check (CR 113.6)
    const activeZone = ability.activeZone || Zone.Battlefield;
    if (activeZone !== (Zone.Any as Zone) && obj.zone !== activeZone) return false;

    // 4. Restrictions (Silence, Limits, Conditions)
    const dummyEvent: GameEvent = { type: 'NONE', playerId };
    if (ability.triggerCondition && !ability.triggerCondition(state, dummyEvent, { sourceId: obj.id, controllerId: playerId })) return false;
    
    if (ability.condition && !ConditionProcessor.matchesCondition(state, ability.condition, { sourceId: obj.id, controllerId: playerId, targets: [] })) return false;

    if (ability.limitPerTurn) {
      const usedCount = state.turnState.triggeredAbilitiesUsedThisTurn[`ability_${obj.id}_${abilityIndex}`] || 0;
      if (usedCount >= ability.limitPerTurn) return false;
    }

    if (RuleUtils.isPlaneswalker(obj) && ('abilitiesUsedThisTurn' in obj) && (obj as any).abilitiesUsedThisTurn > 0) return false;

    if (RuleUtils.isGameObject(obj) && !RestrictionValidator.canActivateAbility(state, playerId, ability, obj)) return false;

    // Skip mana abilities for auto-pass scan (Optimization)
    if (!checkPriority && ability.isManaAbility) return false;

    // 5. Cost Check
    if (!player.manaCheat && !CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) return false;

    // 6. Target Check
    const { targeting: TargetingProcessor } = getProcessors(state);
    if (ability.modes) {
      const hasValidMode = ability.modes.some(mode => {
        if (!mode.targetDefinitions || mode.targetDefinitions.length === 0 || mode.targetDefinitions.every((td: TargetDefinition) => td.optional)) return true;
        return TargetingProcessor.hasLegalTargets(state, obj.id, mode.targetDefinitions, playerId);
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
    if (checkPriority && state.priorityPlayerId !== playerId) return false;

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
    const onlyAsSorcery = objOrAbility.activatedOnlyAsSorcery || objOrAbility.sorcerySpeed;
    const isSorcerySpeed = isLand || isLoyalty || onlyAsSorcery || (!isInstantOrFlash && !isActivatedAbility);

    // 3. Evaluate Speed Requirements
    if (isSorcerySpeed) {
      const isYourTurn = state.activePlayerId === playerId;
      const isMain = state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain;
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
      if (e.condition && !ConditionProcessor.matchesCondition(state, e.condition, {
        sourceId: e.sourceId,
        controllerId: e.controllerId,
        targets: []
      })) return false;

      // 4. Target check (Is this card the target of the permission?)
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
