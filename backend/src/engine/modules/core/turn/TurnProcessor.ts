import { GameState, Phase, PlayerId, Step } from '@shared/engine_types';
import { getProcessors } from '../../ProcessorRegistry';

/**
 * Handle Turn Architecture (Chapter 5)
 */
export class TurnProcessor {

  public static getNextStep(state: GameState): { phase: Phase, step: Step, turnEnded: boolean } {
    let next = this.calculateNextStep(state.currentPhase, state.currentStep);

    // Skip Combat logic moved to PriorityProcessor auto-pass for better UX
    // (We now always enter combat steps so triggers can fire)

    // 2. Skip Declare Blockers if no potential blockers (Rule 509)
    if (next.step === Step.DeclareBlockers) {
      const defenderId = Object.keys(state.players).find(id => id !== state.activePlayerId);
      const attackerCount = (state.combat?.attackers || []).length;

      if (attackerCount === 0) {
        // Arena-style skip: jumping directly to Main 2 if no combat intent
        next = { phase: Phase.PostCombatMain, step: Step.Main, turnEnded: false };
      }
      else if (defenderId && !this.hasPotentialBlockers(state, defenderId)) {
        next = { phase: Phase.Combat, step: Step.CombatDamage, turnEnded: false };
      }
    }

    return next;
  }

  public static calculateNextStep(phase: Phase, step: Step): { phase: Phase, step: Step, turnEnded: boolean } {
    // Rule 500: Full sequence order
    const sequence = [
      { phase: Phase.Beginning, step: Step.Untap },
      { phase: Phase.Beginning, step: Step.Upkeep },
      { phase: Phase.Beginning, step: Step.Draw },
      { phase: Phase.PreCombatMain, step: Step.Main },
      { phase: Phase.Combat, step: Step.BeginningOfCombat },
      { phase: Phase.Combat, step: Step.DeclareAttackers },
      { phase: Phase.Combat, step: Step.DeclareBlockers },
      { phase: Phase.Combat, step: Step.FirstStrikeDamage },
      { phase: Phase.Combat, step: Step.CombatDamage },
      { phase: Phase.Combat, step: Step.EndOfCombat },
      { phase: Phase.PostCombatMain, step: Step.Main },
      { phase: Phase.Ending, step: Step.End },
      { phase: Phase.Ending, step: Step.Cleanup }
    ];

    const currentIndex = sequence.findIndex(s => s.phase === phase && s.step === step);

    // Rule 500.2: If the turn ends, wrap around
    if (currentIndex === sequence.length - 1) {
      return { ...sequence[0], turnEnded: true };
    }
    return { ...sequence[currentIndex + 1], turnEnded: false };
  }

  public static hasPotentialAttackers(state: GameState, playerId: PlayerId): boolean {
    return state.battlefield.some(obj => {
      if (obj.controllerId !== playerId || obj.isTapped) return false;

      const types = (obj.definition.types || []).map(t => t.toLowerCase());
      const typeLine = (obj.definition.type_line || '').toLowerCase();
      const isCreature = types.includes('creature') || typeLine.includes('creature') || (obj.definition.types || []).includes('Creature');
      if (!isCreature) return false;

      // Rule 302.6: Haste bypasses summoning sickness for attacking
      const keywords = [...(obj.definition.keywords || []), ...(obj.effectiveStats?.keywords || [])];
      const hasHaste = keywords.some(k => k.toLowerCase() === 'haste');
      if (obj.summoningSickness && !hasHaste) return false;

      // Rule 702.3: Defender (with 702.3b override check) and other restrictions
      const { restriction: RP } = getProcessors(state);
      if (!RP.canAttack(state, obj)) return false;

      return true;
    });
  }

  public static hasPotentialBlockers(state: GameState, playerId: PlayerId): boolean {
    return state.battlefield.some(obj => {
      if (obj.controllerId !== playerId || obj.isTapped) return false;

      const types = (obj.definition.types || []).map(t => t.toLowerCase());
      const typeLine = (obj.definition.type_line || '').toLowerCase();
      const isCreature = types.includes('creature') || typeLine.includes('creature') || (obj.definition.types || []).includes('Creature');
      if (!isCreature) return false;

      // Registry Restrictions
      const cannotBlock = state.ruleRegistry.restrictions.some(r => r.targetId === obj.id && (r.type === 'CannotBlock' || r.type === 'CannotBlockThisTurn'));
      if (cannotBlock) return false;

      return true;
    });
  }

  /**
   * CR 500: Advancing the turn phase/step
   */
  public static advanceStep(state: GameState, engine: import('../../../interfaces/EngineContext').EngineContext, log: (m: string) => void) {
    const prevPhase = state.currentPhase;
    const prevStep = state.currentStep;

    let next = this.getNextStep(state);

    // 3. Skip First Strike Damage if no First Strike scorers (Rule 510.4)
    if (next.step === Step.FirstStrikeDamage) {
      if (!engine.processors.combat.hasFirstStrikeStep(state)) {
        next = { phase: Phase.Combat, step: Step.CombatDamage, turnEnded: false };
      }
    }

    if (next.turnEnded) {
      // log(`[FLOW] Turn is ending on request: ${next.phase}/${next.step}`);
      this.cleanupEndOfTurn(state, log);
      this.rotateActivePlayer(state, log);
      state.turnNumber++;
      log(`Turn ${state.turnNumber} - Active: ${engine.getPlayerName(state.activePlayerId)}`);
    }

    state.currentPhase = next.phase;
    state.currentStep = next.step;
    state.consecutivePasses = 0;

    // CR 500: Administrative steps don't give priority by default
    if (state.currentStep === Step.Untap || state.currentStep === Step.Cleanup) {
      state.priorityPlayerId = null;
    }

    //  log(`[PHASE] >>> Entering ${state.currentPhase}: ${state.currentStep} <<<`);

    // CR 603.6: Phase/Step Transition Triggers
    const phaseName = state.currentPhase.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    const stepName = state.currentStep.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    // Fire generic event for the step (e.g., ON_END_STEP, ON_UPKEEP_STEP)
    const stepEvent = {
      type: `ON_${stepName}_STEP`,
      playerId: state.activePlayerId,
      data: { phase: state.currentPhase, step: state.currentStep }
    };
    engine.processors.trigger.onEvent(state, stepEvent, log);
    this.cleanupExpiredEffectsByEvent(state, stepEvent.type, log, state.activePlayerId);


    // Fire generic event for the phase (e.g., ON_PRE_COMBAT_MAIN_PHASE_START)
    const phaseEvent = {
      type: `ON_${phaseName}_PHASE_START`,
      playerId: state.activePlayerId,
      data: { phase: state.currentPhase, step: state.currentStep }
    };
    engine.processors.trigger.onEvent(state, phaseEvent, log);
    this.cleanupExpiredEffectsByEvent(state, phaseEvent.type, log, state.activePlayerId);

    engine.processors.mana.emptyAllManaPools(state);

    this.handleStepEntryRules(state, engine, log);

    if (state.pendingAction) {
      log(`[WAITING] Pending Action: ${state.pendingAction.type} for ${engine.getPlayerName(state.pendingAction.playerId)}`);
      engine.checkAutoPass(state.pendingAction.playerId);
      return;
    }

    if (state.currentStep === Step.Untap || state.currentStep === Step.Cleanup) {
      // log(`[FLOW] Auto-advancing from administrative step ${state.currentStep}`);
      this.advanceStep(state, engine, log);
    } else {
      engine.resetPriorityToActivePlayer();
    }
  }

  /**
   * CR 500: Turn Rotation and Maintenance
   */
  public static rotateActivePlayer(state: GameState, log: (m: string) => void) {
    const currentIndex = state.playerOrder.indexOf(state.activePlayerId);

    // Extra turns logic
    const currentPlayer = state.players[state.activePlayerId];
    if (currentPlayer && currentPlayer.extraTurns > 0) {
      currentPlayer.extraTurns--;
      log(`[TURN] ${currentPlayer.name} takes an EXTRA turn! (${currentPlayer.extraTurns} remaining)`);
    } else {
      let nextIndex = (currentIndex + 1) % state.playerOrder.length;
      let nextPlayerId = state.playerOrder[nextIndex];
      let nextPlayer = state.players[nextPlayerId];

      while (nextPlayer && nextPlayer.turnsToSkip > 0) {
        log(`[TURN] ${nextPlayer.name} SKIPS a turn! (${nextPlayer.turnsToSkip} remaining)`);
        nextPlayer.turnsToSkip--;
        nextIndex = (nextIndex + 1) % state.playerOrder.length;
        nextPlayerId = state.playerOrder[nextIndex];
        nextPlayer = state.players[nextPlayerId];
      }

      state.activePlayerId = nextPlayerId;
    }

    if (state.players[state.activePlayerId]) {
      state.players[state.activePlayerId].hasPlayedLandThisTurn = false;
    }

    // CR 500: Reset turn-wide logic tracking
    for (const pId in state.players) {
      state.players[pId].passUntilEndOfTurn = false;
    }

    // Rule 606.3: Reset activated ability usage
    state.battlefield.forEach(obj => obj.abilitiesUsedThisTurn = 0);

    state.turnState = {
      permanentReturnedToHandThisTurn: false,
      playersWithPermanentReturnedThisTurn: {},
      noncombatDamageDealtToOpponents: {},
      creaturesAttackedThisTurn: 0,
      creaturesDiedThisTurn: [],
      lastDamageAmount: 0,
      lastExcessDamageAmount: 0,
      lastLifeGainedAmount: 0,
      lastCardsDrawnAmount: 0,
      cardsDrawnThisTurn: {},
      spellsCastThisTurn: {},
      lifeGainedThisTurn: {},
      instantOrSorceryCastThisTurn: {},
      cardLeftGraveyardThisTurn: {},
      landsPlayedThisTurn: {},
      triggeredAbilitiesUsedThisTurn: {},
      lastDiscardedCount: 0,
      cardsExiledThisTurn: {},
      countersAddedThisTurnIds: [],
      turnStartTime: Date.now()
    };
  }

  /**
   * CR 502/503/514: Step-specific Entry Rules
   */
  public static handleStepEntryRules(state: GameState, engine: import('../../../interfaces/EngineContext').EngineContext, log: (m: string) => void) {
    const activeId = state.activePlayerId;
    const { DurationType } = require('@shared/engine_types');

    if (state.currentStep === Step.Untap) {
      state.battlefield.filter(c => c.controllerId === activeId).forEach(c => engine.processors.registry.registerAbilities(state, c));
      engine.processors.action.untapAll(state, activeId, log);

      // CR 611.2: Expire "Until Next Untap Step" effects
      state.ruleRegistry.continuousEffects = state.ruleRegistry.continuousEffects.filter(eff => {
        if (eff.duration?.type === DurationType.UntilYourNextTurn && eff.duration.untilTurnOfPlayerId === activeId) {
          return false;
        }
        if (eff.duration?.type === DurationType.UntilNextUntapStep) {
          const targets = (eff as any).targetIds || [];
          const hasActiveTarget = targets.some((tid: string) => state.battlefield.find(o => o.id === tid)?.controllerId === activeId);
          if (hasActiveTarget) return false;
        }
        return true;
      });
    }
    else if (state.currentPhase === Phase.Combat) {
      engine.processors.combat.handleStepEntry(state, log);
    }
    else if (state.currentStep === Step.Draw) {
      const skipDraw = state.turnNumber === 1 && state.playerOrder[0] === activeId;
      if (!skipDraw && !engine.drawCard(activeId)) {
        log(`${engine.getPlayerName(activeId)} deck-out loss.`);
      }
    }
    else if (state.currentStep === Step.Cleanup) {
      const player = state.players[activeId];
      if (player && player.hand.length > player.maxHandSize) {
        player.pendingDiscardCount = player.hand.length - player.maxHandSize;
        state.pendingAction = {
          type: 'DISCARD',
          playerId: activeId,
          count: player.pendingDiscardCount
        };
        log(`${player.name} must discard ${player.pendingDiscardCount} card(s) to reach hand size (${player.maxHandSize}).`);
      }

      state.battlefield.forEach(obj => obj.damageMarked = 0);

      state.ruleRegistry.continuousEffects = state.ruleRegistry.continuousEffects.filter(eff => {
        if (eff.duration?.type === DurationType.UntilEndOfYourNextTurn && eff.duration.untilTurnOfPlayerId === activeId) {
          if (eff.timestamp < state.turnState.turnStartTime) return false;
        }
        return eff.duration.type !== DurationType.UntilEndOfTurn;
      });
      state.ruleRegistry.triggeredAbilities = state.ruleRegistry.triggeredAbilities.filter(
        t => !t.duration || t.duration.type !== DurationType.UntilEndOfTurn
      );
    }
  }

  /**
   * CR 514: Cleanup Step Maintenance
   */
  public static cleanupEndOfTurn(state: GameState, log: (m: string) => void) {
    log(`[CLEANUP] Removing 'Until End of Turn' effects and resetting markers.`);
    const { DurationType } = require('@shared/engine_types');

    state.ruleRegistry.continuousEffects = state.ruleRegistry.continuousEffects.filter(eff => {
      return eff.duration?.type !== DurationType.UntilEndOfTurn;
    });

    state.battlefield.forEach(obj => {
      obj.damageMarked = 0;
      obj.deathtouchMarked = false;
      obj.abilitiesUsedThisTurn = 0;
    });
  }

  /**
   * Clear rule-duration effects conditionally
   */
  public static cleanupExpiredEffectsByEvent(state: GameState, eventType: string, log: (m: string) => void, activePlayerId?: PlayerId) {
    const { DurationType } = require('@shared/engine_types');
    const previousCount = state.ruleRegistry.continuousEffects.length;

    state.ruleRegistry.continuousEffects = state.ruleRegistry.continuousEffects.filter(eff => {
      if (eff.duration?.type === DurationType.UntilEvent && eff.duration.expiryEvent === eventType) {
        if (eff.duration.untilTurnOfPlayerId && eff.duration.untilTurnOfPlayerId !== activePlayerId) {
          return true;
        }
        return false;
      }
      return true;
    });

    if (state.ruleRegistry.continuousEffects.length < previousCount) {
      log(`[FLOW] Expired ${previousCount - state.ruleRegistry.continuousEffects.length} continuous effect(s) on event ${eventType}.`);
    }
  }
}

