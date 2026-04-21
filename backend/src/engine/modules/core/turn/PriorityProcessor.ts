import { AbilityType, EffectType, GameState, Phase, PlayerId, Step, TargetMapping, Zone } from '@shared/engine_types';
import { oracle } from '../../../OracleLogicMap';
import { SpellProcessor } from '../../actions/spells/SpellProcessor';
import { ConditionProcessor } from '../logic/ConditionProcessor';
import { CostProcessor } from '../../magic/CostProcessor';
import { ManaProcessor } from '../../magic/ManaProcessor';
import { LayerProcessor } from '../../state/LayerProcessor';
import { RestrictionValidator } from '../../core/RestrictionValidator';
import { TurnProcessor } from './TurnProcessor';


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
    if (state.pendingAction && String(state.pendingAction.playerId) === String(playerId)) {
      console.log(`[PRIORITY-PROC] passPriority BLOCKED: ${playerId} has pending ${state.pendingAction.type}.`);
      engine.log(`Invalid Action: Player must resolve pending ${state.pendingAction.type} first.`);
      return;
    }

    const player = state.players[playerId];
    if (player && player.pendingDiscardCount > 0) {
      if (!isAuto) engine.log(`${engine.getPlayerName(playerId)} must finish discarding first.`);
      return;
    }

    // --- STOPPER LOGIC: Untoggle stop after it "did its work" ---
    if (!isAuto && player?.stops) {
      const isOurTurn = state.activePlayerId === playerId;
      const currentStepId = state.currentStep.toLowerCase();
      const stopKey = isOurTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;
      const beginKey = isOurTurn ? `my_beginning` : `opp_beginning`;
      const isBeginning = currentStepId === 'upkeep' || currentStepId === 'draw';

      if (player.stops[stopKey] || (isBeginning && player.stops[beginKey])) {
        if (player.stops[stopKey]) player.stops[stopKey] = false;
        if (isBeginning && player.stops[beginKey]) player.stops[beginKey] = false;

        console.log(`[STOPPER] Untoggled stop for ${stopKey}/beginning after manual pass.`);
        engine.log(`Stop cleared for ${state.currentStep}.`);
      }
    }

    state.consecutivePasses++;

    const prefix = isAuto ? '[Auto-Pass] ' : '[Manual-Pass] ';
    engine.log(`${prefix}${engine.getPlayerName(playerId)} passed. (${state.consecutivePasses}/${state.playerOrder.length} passes)`);

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

    state.priorityPlayerId = state.playerOrder[nextIndex];
    engine.log(`[PRIORITY] Shifted to ${engine.getPlayerName(state.priorityPlayerId)}.`);

    this.checkAutoPass(state, state.priorityPlayerId, engine);
  }

  public static resetPriorityToActivePlayer(
    state: GameState,
    engine: EngineContext
  ) {
    state.consecutivePasses = 0;
    engine.checkStateBasedActions();

    // Only set priority to active player if an SBA or trigger didn't just set up a mandatory action.
    if (!state.pendingAction) {
      state.priorityPlayerId = state.activePlayerId;
    }

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
      const isOurTurn = state.activePlayerId === playerId;
      const currentStepId = state.currentStep.toLowerCase();
      const stopKey = isOurTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;
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

    const isOurTurn = state.activePlayerId === playerId;
    const currentStepId = state.currentStep.toLowerCase();
    const stopKey = isOurTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;

    // Support for consolidated "Beginning" stop (covers Upkeep and Draw)
    const beginKey = isOurTurn ? `my_beginning` : `opp_beginning`;
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

      engine.log(`[Auto-Pass] ${engine.getPlayerName(playerId)} skipped${!canAct ? ': no legal actions found' : ' (Pass Turn active)'}.`);
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
  public static canPlayerTakeAnyAction(state: GameState, playerId: string): boolean {
    const player = state.players[playerId];
    if (!player) return false;

    // Rule 117.1: If player has a pending mandatory action, they MUST act.
    if (state.pendingAction && String(state.pendingAction.playerId) === String(playerId)) {
      return true;
    }
    if (player.pendingDiscardCount > 0) return true;

    const isOurTurn = state.activePlayerId === playerId;
    const currentStepId = state.currentStep.toLowerCase();
    const stopKey = isOurTurn ? `my_${currentStepId}` : `opp_${currentStepId}`;
    const hasManualStop = player?.stops?.[stopKey];

    const stackEmpty = state.stack.length === 0;

    // Auto-pass Upkeep, Draw, AND End steps if the stack is empty 
    // UNLESS a manual stop is set for this phase.
    const isBeginning = state.currentPhase === Phase.Beginning && (state.currentStep === Step.Upkeep || state.currentStep === Step.Draw);
    const isCombatBeginningOrEnd = state.currentPhase === Phase.Combat && (state.currentStep === Step.BeginningOfCombat || state.currentStep === Step.EndOfCombat);
    const isDamageStep = state.currentStep === Step.CombatDamage || state.currentStep === Step.FirstStrikeDamage;
    const isEndStep = state.currentStep === Step.End;

    if ((isBeginning || isCombatBeginningOrEnd || isDamageStep || isEndStep) && stackEmpty) {
      if (hasManualStop) return true;
      return false;
    }

    // 1. Check hand for castable spells
    const hasCastableHand = player.hand.some(card => {
      const playable = this.canObjectBePlayed(state, playerId, card.id, false);
      return playable;
    });
    if (hasCastableHand) return true;

    // 2. Check Graveyard for castable spells (Flashback) or activated abilities
    const hasGraveAction = player.graveyard.some(card => {
      const playable = this.canObjectBePlayed(state, playerId, card.id, false);
      return playable;
    });
    if (hasGraveAction) return true;

    // 3. Check Exile for castable spells
    const hasExileAction = state.exile.some(card => {
      if (card.controllerId !== playerId) return false;
      const playable = this.canObjectBePlayed(state, playerId, card.id, false);
      return playable;
    });
    if (hasExileAction) return true;

    // 4. Check Top of Library (permission)
    if (player.library.length > 0) {
      const topCard = player.library[player.library.length - 1];
      if (this.canObjectBePlayed(state, playerId, topCard.id, false)) {
        return true;
      }
    }

    // 5. Chapter 3 Check: Battlefield Activated Abilities
    const hasBattlefieldAction = state.battlefield.some(obj => {
      if (obj.controllerId !== playerId) return false;

      // SOS: Prepare check
      if (obj.isPrepared && (obj.definition.preparedFace || obj.definition.faces?.[1])) {
        const face = obj.definition.preparedFace || obj.definition.faces![1];
        const isInstant = face.types.some((t: string) => t.toLowerCase() === 'instant');
        const isSorcery = face.types.some((t: string) => t.toLowerCase() === 'sorcery');

        let timingOk = isInstant;
        if (isSorcery && isOurTurn && stackEmpty && (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain)) {
          timingOk = true;
        }

        if (timingOk) {
          const { totalMana } = SpellProcessor.getEffectiveCosts(state, obj, [], face);
          if (ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana, obj)) {
            return true;
          }
        }
      }

      const logic = oracle.getCard(obj.definition.name);
      if (!logic || !logic.abilities) return false;

      return logic.abilities.some((ability: any, index: number) => {
        const canAct = this.canAbilityBeActivated(state, playerId, obj.id, index, false);
        return canAct;
      });
    });

    if (!hasBattlefieldAction) {
      // console.log(`[DEBUG] canPlayerTakeAnyAction: FALSE for ${playerId}. Hand size: ${player.hand.length}, Grave size: ${player.graveyard.length}`);
    }
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

    const { TargetingProcessor } = require('../../actions/targeting/TargetingProcessor');

    // Check hand
    let cardToPlay = player.hand.find(o => o.id === objId);

    // Check top of library (Radha, Snoop, etc.)
    if (!cardToPlay && player.library.length > 0 && player.library[player.library.length - 1].id === objId) {
      const topCard = player.library[player.library.length - 1];
      const hasAllowEffect = this.findPermissionEffect(state, playerId, EffectType.AllowPlayFromTop, topCard.id);
      if (hasAllowEffect) {
        cardToPlay = topCard;
      }
    }

    // Check graveyard (Demonic Embrace, Flashback, etc.)
    if (!cardToPlay) {
      const graveCard = player.graveyard.find(c => c.id === objId);
      if (graveCard) {
        const hasAllowEffect = this.findPermissionEffect(state, playerId, EffectType.AllowCastFromGraveyard, graveCard.id);
        const hasFlashback = LayerProcessor.getEffectiveKeywords(graveCard, state).some(k => k.toLowerCase() === 'flashback');
        const hasGraveAbility = graveCard.definition.abilities?.some((a: any, idx: number) => this.canAbilityBeActivated(state, playerId, graveCard.id, idx, false));
        if (hasAllowEffect || hasFlashback || hasGraveAbility) cardToPlay = graveCard;
      }
    }

    // Check exile (Idol of Endurance, Ugin's +2, etc.)
    if (!cardToPlay) {
      const exileCard = state.exile.find(c => c.id === objId);
      if (exileCard && exileCard.controllerId === playerId) {
        const hasAllowEffect = this.findPermissionEffect(state, playerId, EffectType.AllowPlayExiled, exileCard.id);
        if (hasAllowEffect) cardToPlay = exileCard;
      }
    }

    if (cardToPlay) {
      if (state.pendingAction) return false;

      const hasPriority = state.priorityPlayerId === playerId;
      if (checkPriority && !hasPriority) return false;

      if (!RestrictionValidator.canCastSpells(state, playerId, cardToPlay)) {
        return false;
      }

      const { totalMana: effectiveCost, additionalCosts } = SpellProcessor.getEffectiveCosts(state, cardToPlay);

      // Modular Timing Check
      const timingOk = this.validateTiming(state, playerId, cardToPlay);
      if (!timingOk) return false;

      let canPlay = true;
      const typeLine = (cardToPlay.definition.type_line || '').toLowerCase();
      const types = (cardToPlay.definition.types || []).map(t => t.toLowerCase());
      const isLand = typeLine.includes('land') || types.includes('land');

      if (isLand) {
        canPlay = !player.hasPlayedLandThisTurn;
      } else {
        canPlay = ManaProcessor.canPayWithTotal(player, state.battlefield, effectiveCost, cardToPlay);
      }

      // --- CHECK ADDITIONAL COSTS ---
      if (canPlay && additionalCosts.length > 0) {
        const { TargetingProcessor } = require('../../actions/targeting/TargetingProcessor');
        const canPayAllExtras = additionalCosts.every(cost => {
          if (cost.type === 'Sacrifice') {
            const candidates = state.battlefield.filter(o =>
              o.controllerId === playerId &&
              TargetingProcessor.matchesRestrictions(state, o, cost.restrictions || [], { sourceId: cardToPlay!.id, controllerId: playerId })
            );
            return candidates.length > 0;
          }
          return true;
        });
        if (!canPayAllExtras) canPlay = false;
      }

      // --- CHECK TARGETS ---
      if (canPlay) {
        const logic = oracle.getCard(cardToPlay.definition.name);
        // Fallback to definition abilities for spells without dedicated logic (like virtual spells)
        const spellAbility = logic?.abilities?.find((a: any) => a.type === 'Spell' || a.type === AbilityType.Spell) ||
          cardToPlay.definition.abilities?.find((a: any) => a.type === 'Spell' || a.type === AbilityType.Spell);

        // Modal check
        if (spellAbility?.modes) {
          const hasValidMode = spellAbility.modes.some((mode: any) => {
            if (!mode.targetDefinition || mode.targetDefinition.optional) return true;
            const { TargetingProcessor } = require('../../actions/targeting/TargetingProcessor');
            return TargetingProcessor.hasLegalTargets(state, cardToPlay!.id, mode.targetDefinition, playerId);
          });
          if (!hasValidMode) canPlay = false;
        } else {
          const targetDefinition = (logic as any)?.targetDefinition || spellAbility?.targetDefinition;

          if (targetDefinition && !targetDefinition.optional) {
            const { TargetingProcessor } = require('../../actions/targeting/TargetingProcessor');
            if (!TargetingProcessor.hasLegalTargets(state, cardToPlay!.id, targetDefinition, playerId)) {
              canPlay = false;
            }
          }
        }
      }

      return canPlay;
    }

    // Check battlefield (for activating abilities OR Casting Prepared face)
    const objOnField = state.battlefield.find(o => o.id === objId);
    if (objOnField && objOnField.controllerId === playerId) {
      if (state.pendingAction) return false;
      const hasPriority = state.priorityPlayerId === playerId;
      if (checkPriority && !hasPriority) return false;

      // --- SOS: Prepared Casting Check ---
      if (objOnField.isPrepared && (objOnField.definition.preparedFace || objOnField.definition.faces?.[1])) {
        const face = objOnField.definition.preparedFace || objOnField.definition.faces![1];
        const isInstant = face.types.some((t: string) => t.toLowerCase() === 'instant');
        const isSorcery = face.types.some((t: string) => t.toLowerCase() === 'sorcery');
        const stackEmpty = state.stack.length === 0;
        const isYourTurn = state.activePlayerId === playerId;
        const isMain = state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain;

        let timingOk = isInstant;
        if (isSorcery && isYourTurn && stackEmpty && isMain) timingOk = true;

        if (timingOk) {
          const { totalMana } = SpellProcessor.getEffectiveCosts(state, objOnField, [], face);
          if (ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana, objOnField)) return true;
        }
      }

      const logic = oracle.getCard(objOnField.definition.name);
      if (!logic || (!logic.abilities && !state.ruleRegistry.continuousEffects.some(e => e.type === EffectType.AddTriggeredAbility))) return false;

      return logic.abilities.some((ability: any, index: number) => this.canAbilityBeActivated(state, playerId, objId, index, checkPriority));
    }

    return false;
  }

  /**
   * Centralized logic for ability activation checks.
   */
  public static canAbilityBeActivated(state: GameState, playerId: string, objId: string, abilityIndex: number, checkPriority = true): boolean {
    const player = state.players[playerId];
    const { TargetingProcessor } = require('../../actions/targeting/TargetingProcessor');
    const obj = TargetingProcessor.findObjectInAnyZone(state, objId);
    if (!player || !obj) return false;

    if (state.pendingAction) return false;

    if (checkPriority && state.priorityPlayerId !== playerId) return false;

    const cardLogic = oracle.getCard(obj.definition.name);
    let abilities = [...(cardLogic?.abilities || [])];

    // --- SUPPORT FOR IN-LINE ABILITIES (Tokens, Virtual Spells) ---
    if (obj.definition.abilities) {
      obj.definition.abilities.forEach((a: any) => {
        if (!abilities.some(existing => existing.id === a.id && a.id !== undefined)) {
          abilities.push(a);
        }
      });
    }

    // --- SUPPORT FOR GRANTED ABILITIES (Conspicuous Snoop, Galazeth, etc.) ---
    const grantedAbilityEffects = state.ruleRegistry.continuousEffects.filter(e =>
      (e.type === EffectType.GainAbilitiesOfTopCard || e.type === EffectType.AddTriggeredAbility) &&
      (e.targetIds?.includes(objId) || (e.targetMapping === 'SELF' && e.sourceId === objId) || LayerProcessor.isTarget(state, e, objId)) &&
      ConditionProcessor.matchesCondition(state, e.condition, {
        sourceId: e.sourceId,
        controllerId: e.controllerId
      })
    );

    for (const e of grantedAbilityEffects) {
      if (e.type === EffectType.GainAbilitiesOfTopCard) {
        const topCard = player.library[player.library.length - 1];
        if (topCard) {
          const topLogic = oracle.getCard(topCard.definition.name);
          if (topLogic?.abilities) {
            const granted = topLogic.abilities.filter((a: any) => a.type === AbilityType.Activated);
            abilities = [...abilities, ...granted];
          }
        }
      } else if (e.type === EffectType.AddTriggeredAbility && (e as any).value) {
        // value contains the granted ability (which could be Activated despite the effect name)
        abilities = [...abilities, (e as any).value];
      }

    }

    if (!abilities[abilityIndex]) return false;
    const ability = abilities[abilityIndex];

    if (ability.type !== AbilityType.Activated) return false;

    // Zone check (CR 113.6)
    const activeZone = ability.activeZone || Zone.Battlefield;
    if (activeZone !== (Zone.Any as any) && activeZone !== (obj.zone as any)) {
      return false;
    }

    // Requirement Check (Rule 602.5b/Activation conditions)
    if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) {
      console.log(`Illegal Activation: Activation requirements for ${obj.definition.name} are not met.`);
      return false;
    }

    // Explicit Condition check
    if (ability.condition) {
      const { ConditionProcessor } = require('../logic/ConditionProcessor');
      if (!ConditionProcessor.matchesCondition(state, ability.condition, { sourceId: obj.id, controllerId: playerId })) {
        return false;
      }
    }

    // Limit Check
    if (ability.limitPerTurn) {
      const usedCount = state.turnState.triggeredAbilitiesUsedThisTurn[`ability_${obj.id}_${abilityIndex}`] || 0;
      if (usedCount >= ability.limitPerTurn) return false;
    }

    // Skip purely mana-producing abilities for auto-pass
    if (!checkPriority && ability.isManaAbility) return false;

    // Restriction Check
    if (!RestrictionValidator.canActivateAbility(state, playerId, ability, obj)) {
      return false;
    }
    // Timing Check (Rule 602.1 / 606.3)
    const isPlaneswalker = obj.definition.types.some((t: string) => String(t).toLowerCase() === 'planeswalker');
    let timingOk = this.validateTiming(state, playerId, ability, true);

    if (isPlaneswalker) {
      // Rule 606.3: loyalty abilities are sorcery speed by default
      if (timingOk) {
        const isOurTurn = state.activePlayerId === playerId;
        const isMain = state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain;
        const stackEmpty = state.stack.length === 0;
        if (!isOurTurn || !isMain || !stackEmpty) timingOk = false;
      }

      const canActivateAnyTime = (cardLogic.abilities || []).some((a: any) => a.type === 'Static' && String(a.id || "").includes('any_turn')) ||
        state.ruleRegistry.continuousEffects.some(e =>
          e.type === EffectType.AllowOutOfTurnActivation &&
          (e.targetIds?.includes(obj.id) || (e.targetMapping === TargetMapping.Self && e.sourceId === obj.id))
        );

      if (!canActivateAnyTime && !timingOk) return false;
      if (obj.abilitiesUsedThisTurn > 0) return false;
    } else if (!timingOk) {
      return false;
    }

    // Requirement Check (Rule 602.5b)
    if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) {
      return false;
    }

    // Cost Check
    if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) return false;

    // Requirement Check (Rule 602.5b) - Double check after costs? (Historical logic)
    if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) return false;

    // Target Check
    if (ability.modes) {
      const hasValidMode = ability.modes.some((mode: any) => {
        if (!mode.targetDefinition || mode.targetDefinition.optional) return true;
        return TargetingProcessor.hasLegalTargets(state, obj.id, mode.targetDefinition, playerId);
      });
      if (!hasValidMode) return false;
    } else if (ability.targetDefinition && !ability.targetDefinition.optional) {
      if (!TargetingProcessor.hasLegalTargets(state, obj.id, ability.targetDefinition, playerId)) {
        return false;
      }
    }

    return true;
  }

  public static validateTiming(state: GameState, playerId: string, objOrAbility: any, isActivatedAbility = false): boolean {
    const def = objOrAbility?.definition || objOrAbility;
    // For dual-faced or prepared cards, we only consider the first face's types for timing unless it's a virtual spell
    const rawTypeLine = (def.type_line || '').toLowerCase();
    const typeLine = objOrAbility.isVirtual ? rawTypeLine : rawTypeLine.split('//')[0];
    const types = (def.types || []).map((t: string) => t.toLowerCase());

    const isInstantOrFlash = typeLine.includes('instant') ||
      types.includes('instant') ||
      (def.keywords || []).some((k: string) => k.toLowerCase() === 'flash') ||
      /\bFlash\b/.test(def.oracleText || '');

    const isLand = typeLine.includes('land') || types.includes('land');

    // Rule 602.1: Sorcery-speed abilities
    const onlyAsSorcery = objOrAbility.activatedOnlyAsSorcery || (!isInstantOrFlash && !isActivatedAbility) || (isActivatedAbility && objOrAbility.activatedOnlyAsSorcery);

    if (onlyAsSorcery || isLand) {
      const isOurTurn = state.activePlayerId === playerId;
      const isMain = state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain;
      const stackEmpty = state.stack.length === 0;

      if (!isOurTurn || !isMain || !stackEmpty) {
        return false;
      }
    }

    return true;
  }

  /**
   * Helper to find an active permission effect in the registry.
   */
  public static findPermissionEffect(state: GameState, playerId: string, effectType: string, targetId: string): any {
    const { TargetingProcessor } = require('../../actions/targeting/TargetingProcessor');

    const found = state.ruleRegistry.continuousEffects.find(e => {
      // 1. Basic Type/Owner check
      const eType = e.type as string;
      const effectiveControllerId = (e as any).targetControllerId || e.controllerId;

      const matchesType = eType === effectType || (effectType === EffectType.AllowPlayExiled && (e as any).canPlayExiled);

      if (!matchesType) return false;
      if (effectiveControllerId !== playerId) return false;

      // 2. Active Zone check (Static abilities only)
      const isStatic = (e.duration?.type || "").toString().toUpperCase() === 'STATIC';
      if (isStatic) {
        const { TargetingProcessor } = require('../../actions/targeting/TargetingProcessor');
        const source = TargetingProcessor.findObjectInAnyZone(state, e.sourceId);
        if (!source || (e.activeZones && !e.activeZones.includes(source.zone))) return false;
      }

      // 3. Condition check
      if (e.condition && !ConditionProcessor.matchesCondition(state, e.condition, {
        sourceId: e.sourceId,
        controllerId: e.controllerId
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
    engine.log(`[PASS-TURN] ${player.name} ${player.passUntilEndOfTurn ? 'enabled' : 'disabled'} Pass Turn.`);

    // Immediately check if we should auto-pass now that it's toggled
    if (player.passUntilEndOfTurn && state.priorityPlayerId === playerId) {
      this.checkAutoPass(state, playerId, engine);
    }
  }
}



