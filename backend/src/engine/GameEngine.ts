import { DurationType, GameObject, GameState, Phase, PlayerId, PlayerState, Step, TriggeredAbility, Zone } from '@shared/engine_types';
import { Card } from '@shared/types';
import { StackResolver } from './modules';
import { m21 } from './data/m21';
import { ManaProcessor } from './modules/magic/ManaProcessor';
import { GameSetupProcessor, PlayerActionProcessor, PlayerActionCallbacks, TurnProcessor, PriorityProcessor, PriorityCallbacks, StackProcessor, ActionProcessor, SpellProcessor, ChoiceProcessor, StateBasedActionsProcessor, CombatProcessor, CombatCallbacks, TriggerProcessor, LayerProcessor, EffectProcessor } from './modules';

/**
 * CENTRALIZED MTG RULE ENGINE (Orchestrator)
 * -----------------------------------------
 * This class coordinates the interaction between different rule modules 
 * (Combat, Mana, SBA, Priority) to maintain a consistent game state.
 * 
 * DESIGN PATTERN: Modular Processor Strategy.
 * Each module handles a specific Chapter of the Comprehensive Rules (CR).
 */
export class GameEngine {
  private state: GameState;
  private playerOrder: PlayerId[];
  private resolver: StackResolver;
  private decks: Record<string, Card[]>;
  private names: Record<string, string>;
  private avatars: Record<string, string>;

  /**
   * CR 103: Starting the Game
   */
  constructor(players: PlayerId[], decks: Record<string, Card[]> = {}, names: Record<string, string> = {}, avatars: Record<string, string> = {}) {
    this.playerOrder = players;
    this.decks = decks;
    this.names = names;
    this.avatars = avatars;

    // CR 100: Create the initial monolithic GameState
    this.state = {
      players: {},
      activePlayerId: players[0],
      priorityPlayerId: players[0],
      currentPhase: Phase.Beginning,
      currentStep: Step.Untap,
      turnNumber: 1,
      battlefield: [],
      exile: [],
      stack: [],
      ruleRegistry: {
        continuousEffects: [],
        activatedAbilities: [],
        triggeredAbilities: [],
        restrictions: [],
        replacementEffects: [],
        preventionEffects: []
      },
      emblems: [],
      consecutivePasses: 0,
      logs: ['Match Start Initialization...'],
      playerOrder: players,
      turnState: {
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
      }
    };

    GameSetupProcessor.initializePlayers(this.state, players, names, decks, avatars);
    this.resolver = new StackResolver(this.state);
    
    // Add non-enumerable reference to avoid circular serialization issues
    Object.defineProperty(this.state, 'gameEngine', {
      value: this,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }

  /**
   * Internal Event Logger for the game history.
   */
  private log(message: string) {
    const formattedMessage = `> ${message}`;
    const newLogs = [...(this.state.logs || []), formattedMessage];
    this.state.logs = newLogs.slice(-40);
    console.log(`[GameEngine] ${message}`);
  }

  /**
   * Helper to resolve player IDs to human-readable names.
   */
  private getPlayerName(id: PlayerId): string {
    return this.state.players[id]?.name || this.names?.[id] || id;
  }

  /**
   * CR 103.2: Shuffle and Draw Starting Hands
   */
  public startGame() {
    for (const playerId of this.playerOrder) {
      this.shuffleLibrary(playerId);
      for (let i = 0; i < 7; i++) {
        this.drawCard(playerId);
      }
    }
    // CR 103: Starting draw doesn't count for "this turn" effects
    this.state.turnState.cardsDrawnThisTurn = {};
    this.resetPriorityToActivePlayer();
  }

  /**
   * CR 701.19: Shuffling
   * Randomizes the order of a player's library using Fisher-Yates.
   */
  public shuffleLibrary(playerId: PlayerId) {
    GameSetupProcessor.shuffleLibrary(this.state, playerId, (m) => this.log(m));
  }

  /**
   * CR 121: Drawing a Card
   * @returns false if the player loses due to deck-out (CR 704.5b)
   */
  public drawCard(playerId: PlayerId): boolean {
    const player = this.state.players[playerId];
    if (!player || player.library.length === 0) return false;
    const { MoveEffectHandler } = require('./modules/effects/handlers/MoveEffectHandler');
    MoveEffectHandler.handle(this.state, { type: 'DrawCards', amount: 1 } as any, [playerId], (m: string) => this.log(m), playerId);
    return true;
  }

  // --- Player Actions (Rule 117) ---

  /**
   * CR 106: Tapping for Mana & Special Actions (Attacking/Blocking)
   * This is a "Click Interaction" wrapper that delegates to the correct sub-routine
   * based on the current game context (Rule 117).
   */
  public interactWithPermanent(playerId: PlayerId, cardId: string): boolean {
    return PlayerActionProcessor.interactWithPermanent(
      this.state,
      playerId,
      cardId,
      (m: string) => this.log(m),
      {
        declareAttacker: (pId: string, cId: string) => this.declareAttacker(pId, cId),
        handleBlockSelection: (pId: string, cId: string) => this.handleBlockSelection(pId, cId),
        tapForMana: (pId: string, cId: string) => this.tapForMana(pId, cId),
        activateAbility: (pId: PlayerId, cId: string, idx: number) => this.activateAbility(pId, cId, idx)
      }
    );
  }

  public autoTapLand(playerId: PlayerId, cardId: string): boolean {
    const obj = this.state.battlefield.find(o => o.id === cardId);
    if (!obj || obj.controllerId !== playerId || obj.isTapped) return false;
    
    // We use a simplified check for the first mana ability to ensure synchronous tapping
    const { oracle } = require('./OracleLogicMap');
    const logic = oracle.getCard(obj.definition.name);
    if (!logic || !logic.abilities) return false;

    const manaAbilityIdx = logic.abilities.findIndex((a: any) => a.isManaAbility);
    if (manaAbilityIdx === -1) return false;

    // Use activateAbility with bypassTargeting=true for silent autotap
    return this.activateAbility(playerId, cardId, manaAbilityIdx, [], true);
  }

  public tapForMana(playerId: PlayerId, cardId: string): boolean {
    return PlayerActionProcessor.tapForMana(
      this.state,
      playerId,
      cardId,
      (m: string) => this.log(m),
      {
        declareAttacker: (pId: string, cId: string) => this.declareAttacker(pId, cId),
        handleBlockSelection: (pId: string, cId: string) => this.handleBlockSelection(pId, cId)
      }
    );
  }

  /**
   * CR 508: Declare Attackers Step
   */
  private declareAttacker(playerId: string, cardId: string, targetId?: string): boolean {
    return PlayerActionProcessor.declareAttacker(this.state, playerId, cardId, targetId, (m: string) => this.log(m));
  }

  /**
   * CR 508.2: Confirming the Attacker Declaration Action
   */
  public confirmAttackers(playerId: string) {
    CombatProcessor.confirmAttackers(this.state, playerId as PlayerId, this.getCombatCallbacks());
  }

  /**
   * CR 509: Declare Blockers Step
   */
  private handleBlockSelection(playerId: string, cardId: string): boolean {
    return PlayerActionProcessor.handleBlockSelection(this.state, playerId, cardId, (m: string) => this.log(m));
  }

  /**
   * CR 509.2: Confirming the Blocker Declaration Action
   */
  public confirmBlockers(playerId: string) {
    CombatProcessor.confirmBlockers(this.state, playerId as PlayerId, this.getCombatCallbacks());
  }

  public clearAttackers(playerId: string) {
    CombatProcessor.clearAttackers(this.state, playerId as PlayerId, this.getCombatCallbacks());
  }

  public clearBlockers(playerId: string) {
    CombatProcessor.clearBlockers(this.state, playerId as PlayerId, this.getCombatCallbacks());
  }

  /**
   * MANUAL DISCARD ACTION (e.g. for Cleanup phase or spells)
   */
  public discardCard(playerId: PlayerId, cardInstanceId: string): boolean {
    const res = PlayerActionProcessor.discardCard(this.state, playerId, cardInstanceId, (m: string) => this.log(m));
    if (res.finished) {
      // CR 608.2: If discarding was part of a spell resolution, we must resume resolution immediately.
      // resolveTopOrAdvanceStep handles both resuming the stack and advancing steps (like Cleanup).
      this.resolveTopOrAdvanceStep();
    }
    return res.success;
  }

  /**
   * CR 601: Casting Spells & CR 305: Playing Lands
   * @param declaredTargets Array of GameObject IDs for targeted spells
   */
  public playCard(playerId: PlayerId, cardInstanceId: string, declaredTargets: string[] = [], bypassTargeting: boolean = false): boolean {
    return SpellProcessor.playCard(
      this.state,
      playerId,
      cardInstanceId,
      declaredTargets,
      (m) => this.log(m),
      {
        tapForMana: (p, c) => this.autoTapLand(p, c),
        passPriority: (p) => this.passPriority(p),
        checkAutoPass: (p) => this.checkAutoPass(p),
        checkStateBasedActions: () => this.checkStateBasedActions()
      },
      bypassTargeting
    );
  }

  /**
   * CR 602: Activating Activated Abilities
   * @param abilityIndex The index of the ability in the card's m21 entry
   */
  public activateAbility(playerId: PlayerId, cardId: string, abilityIndex: number, declaredTargets: string[] = [], bypassTargeting: boolean = false): boolean {
    return SpellProcessor.activateAbility(
      this.state,
      playerId,
      cardId,
      abilityIndex,
      declaredTargets,
      (m) => this.log(m),
      {
        tapForMana: (p, c) => this.autoTapLand(p, c),
        passPriority: (p) => this.passPriority(p),
        checkAutoPass: (p) => this.checkAutoPass(p)
      },
      bypassTargeting
    );
  }

  // --- Core Mechanics (Rule 117.4) ---

  /**
   * CR 117.4: Timing and Priority
   * Handles the passing of priority and automatic resolution of the stack.
   */
  public passPriority(playerId: PlayerId, isAuto = false) {
    PriorityProcessor.passPriority(this.state, playerId, this.getPriorityCallbacks(), isAuto);
  }

  private resolveTopOrAdvanceStep() {
    if (this.state.stack.length > 0) {
      const objectToResolve = this.state.stack.pop();
      if (objectToResolve) {
        this.state.consecutivePasses = 0; // CR 117.4: Resolution or stack changes reset pass count
        if (this.state.stack.length > 0) {
          console.log(`[DEBUG] STACK CONTENTS:`, this.state.stack.map(s => ({ id: s.id, name: (s as any).name || s.card?.definition.name, idx: (s as any).data?.nextEffectIndex })));
        }

        this.log(`--------------------------------------------------`);
        const objectName = (objectToResolve as any).name || objectToResolve.card?.definition.name || 'Effect';
        this.log(`[RESOLVING] >>> ${objectName} is resolving <<<`);

        // --- DIAGNOSTIC TRACING ---
        if (this.state.stack.length > 5) {
          const { EffectProcessor } = require('./modules/effects/EffectProcessor');
          EffectProcessor.troubleshoot(this.state, objectToResolve.sourceId);
        }
        const effects = StackProcessor.getEffectsForResolution(this.state, objectToResolve);
        const startIndex = (objectToResolve as any).data?.nextEffectIndex || 0;
        const completed = this.resolver.resolveObject(objectToResolve, effects, startIndex);

        if (!completed) {
          // Suspended resolution. Push the object back to the stack.
          if (!objectToResolve.data) objectToResolve.data = {};
          objectToResolve.data.nextEffectIndex = this.state.pendingAction?.data?.nextEffectIndex || 0;
          this.state.stack.push(objectToResolve);

          // During suspended resolution, priority is given to the player who must act
          this.state.priorityPlayerId = this.state.pendingAction?.playerId || null;
          return;
        }

        const stackRemaining = this.state.stack.map(s => s.card?.definition.name || 'Effect').join(', ');
        if (stackRemaining) {
          this.log(`[STACK-LEFT] Still on stack: [${stackRemaining}]`);
        } else {
          this.log(`[STACK-EMPTY] The stack is now empty.`);
        }
        this.log(`--------------------------------------------------`);
        this.resetPriorityToActivePlayer();
      }
    } else {
      this.advanceStep();
    }
  }

  private advanceStep() {
    const prevPhase = this.state.currentPhase;
    const prevStep = this.state.currentStep;

    let next = TurnProcessor.getNextStep(this.state);

    // 3. Skip First Strike Damage if no First Strike scorers (Rule 510.4)
    if (next.step === Step.FirstStrikeDamage) {
      if (!CombatProcessor.hasFirstStrikeStep(this.state)) {
        next = { phase: Phase.Combat, step: Step.CombatDamage, turnEnded: false };
      }
    }

    if (next.turnEnded) {
      this.log(`[FLOW] Turn is ending on request: ${next.phase}/${next.step}`);
      this.cleanupEndOfTurn();
      this.rotateActivePlayer();
      this.state.turnNumber++;
      this.log(`Turn ${this.state.turnNumber} - Active: ${this.getPlayerName(this.state.activePlayerId)}`);
    }

    this.state.currentPhase = next.phase;
    this.state.currentStep = next.step;
    this.state.consecutivePasses = 0;
    this.log(`[PHASE] >>> Entering ${this.state.currentPhase}: ${this.state.currentStep} <<<`);

    // CR 603.6: Phase/Step Transition Triggers
    const phaseName = this.state.currentPhase.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    const stepName = this.state.currentStep.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    // Fire generic event for the step (e.g., ON_END_STEP, ON_UPKEEP_STEP)
    const stepEvent = {
      type: `ON_${stepName}_STEP`,
      playerId: this.state.activePlayerId,
      data: { phase: this.state.currentPhase, step: this.state.currentStep }
    };
    TriggerProcessor.onEvent(this.state, stepEvent, (m) => this.log(m));
    this.cleanupExpiredEffectsByEvent(stepEvent.type, this.state.activePlayerId);


    // Fire generic event for the phase (e.g., ON_PRE_COMBAT_MAIN_PHASE_START)
    const phaseEvent = {
      type: `ON_${phaseName}_PHASE_START`,
      playerId: this.state.activePlayerId,
      data: { phase: this.state.currentPhase, step: this.state.currentStep }
    };
    TriggerProcessor.onEvent(this.state, phaseEvent, (m) => this.log(m));
    this.cleanupExpiredEffectsByEvent(phaseEvent.type, this.state.activePlayerId);


    ManaProcessor.emptyAllManaPools(this.state);
    this.handleStepEntryRules();

    if (this.state.pendingAction) {
      this.log(`[WAITING] Pending Action: ${this.state.pendingAction.type} for ${this.getPlayerName(this.state.pendingAction.playerId)}`);
      this.checkAutoPass(this.state.pendingAction.playerId);
      return;
    }

    if (this.state.currentStep === Step.Untap || this.state.currentStep === Step.Cleanup) {
      this.log(`[FLOW] Auto-advancing from administrative step ${this.state.currentStep}`);
      this.state.priorityPlayerId = null;
      this.advanceStep();
    } else {
      this.resetPriorityToActivePlayer();
    }
  }

  private rotateActivePlayer() {
    const currentIndex = this.playerOrder.indexOf(this.state.activePlayerId);
    
    // extra turns logic
    const currentPlayer = this.state.players[this.state.activePlayerId];
    if (currentPlayer && currentPlayer.extraTurns > 0) {
        currentPlayer.extraTurns--;
        this.log(`[TURN] ${currentPlayer.name} takes an EXTRA turn! (${currentPlayer.extraTurns} remaining)`);
        // activePlayerId stays the same
    } else {
        let nextIndex = (currentIndex + 1) % this.playerOrder.length;
        let nextPlayerId = this.playerOrder[nextIndex];
        let nextPlayer = this.state.players[nextPlayerId];
        
        while (nextPlayer && nextPlayer.turnsToSkip > 0) {
            this.log(`[TURN] ${nextPlayer.name} SKIPS a turn! (${nextPlayer.turnsToSkip} remaining)`);
            nextPlayer.turnsToSkip--;
            nextIndex = (nextIndex + 1) % this.playerOrder.length;
            nextPlayerId = this.playerOrder[nextIndex];
            nextPlayer = this.state.players[nextPlayerId];
        }
        
        this.state.activePlayerId = nextPlayerId;
    }

    if (this.state.players[this.state.activePlayerId]) {
      this.state.players[this.state.activePlayerId].hasPlayedLandThisTurn = false;
    }

    // CR 500: Reset turn-wide logic tracking
    for (const pId in this.state.players) {
        this.state.players[pId].passUntilEndOfTurn = false;
    }

    // Rule 606.3: Reset activated ability usage for all permanents
    this.state.battlefield.forEach(obj => obj.abilitiesUsedThisTurn = 0);

    // CR 500: Reset turn-wide logic tracking
    this.state.turnState = {
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

  private givePriorityToNextPlayer() {
    PriorityProcessor.givePriorityToNextPlayer(this.state, this.getPriorityCallbacks());
  }

  private resetPriorityToActivePlayer() {
    PriorityProcessor.resetPriorityToActivePlayer(this.state, this.getPriorityCallbacks());
  }

  private checkAutoPass(playerId: PlayerId) {
    PriorityProcessor.checkAutoPass(this.state, playerId, this.getPriorityCallbacks());
  }

  public togglePassTurn(playerId: string) {
    const player = this.state.players[playerId];
    if (!player) return;
    
    player.passUntilEndOfTurn = !player.passUntilEndOfTurn;
    this.log(`[PASS-TURN] ${player.name} ${player.passUntilEndOfTurn ? 'enabled' : 'disabled'} Pass Turn.`);
    
    // Immediately check if we should auto-pass now that it's toggled
    if (player.passUntilEndOfTurn && this.state.priorityPlayerId === playerId) {
        this.checkAutoPass(playerId);
    }
  }

  private getPriorityCallbacks(): PriorityCallbacks {
    return {
      log: (m: string) => this.log(m),
      getPlayerName: (id: PlayerId) => this.getPlayerName(id),
      resolveTopOrAdvanceStep: () => this.resolveTopOrAdvanceStep(),
      confirmAttackers: (pId: string) => this.confirmAttackers(pId),
      confirmBlockers: (pId: string) => this.confirmBlockers(pId),
      checkStateBasedActions: () => this.checkStateBasedActions()
    };
  }

  private getCombatCallbacks(): CombatCallbacks {
    return {
      log: (m: string) => this.log(m),
      getPlayerName: (id: PlayerId) => this.getPlayerName(id),
      resetPriorityToActivePlayer: () => this.resetPriorityToActivePlayer(),
      advanceStep: () => this.advanceStep()
    };
  }

  private canPlayerTakeAnyAction(playerId: PlayerId): boolean {
    return PriorityProcessor.canPlayerTakeAnyAction(this.state, playerId);
  }


  private checkStateBasedActions() {
    StateBasedActionsProcessor.resolveSBAs(this.state, (msg) => this.log(msg));
  }

  private handleStepEntryRules() {
    const activeId = this.state.activePlayerId;

    if (this.state.currentStep === Step.Untap) {
      const { RegistryProcessor } = require('./modules/core/RegistryProcessor');
      this.state.battlefield.filter(c => c.controllerId === activeId).forEach(c => RegistryProcessor.registerAbilities(this.state, c));
      ActionProcessor.untapAll(this.state, activeId, (m) => this.log(m));

      // CR 611.2: Expire "Until Next Untap Step" effects that applied to the active player's permanents
      // SOS: Expire "Until Your Next Turn" effects
      this.state.ruleRegistry.continuousEffects = this.state.ruleRegistry.continuousEffects.filter(eff => {
          if (eff.duration?.type === DurationType.UntilYourNextTurn && eff.duration.untilTurnOfPlayerId === activeId) {
              return false;
          }
          if (eff.duration?.type === DurationType.UntilNextUntapStep) {
              const targets = (eff as any).targetIds || [];
              const hasActiveTarget = targets.some((tid: string) => this.state.battlefield.find(o => o.id === tid)?.controllerId === activeId);
              if (hasActiveTarget) return false;
          }
          return true;
      });
    }
    else if (this.state.currentPhase === Phase.Combat) {
      CombatProcessor.handleStepEntry(this.state, (m) => this.log(m));
    }
    else if (this.state.currentStep === Step.Draw) {
      const skipDraw = this.state.turnNumber === 1 && this.playerOrder[0] === activeId;
      if (!skipDraw && !this.drawCard(activeId)) {
        this.log(`${this.getPlayerName(activeId)} deck-out loss.`);
      }
    }
    else if (this.state.currentStep === Step.Cleanup) {
      const player = this.state.players[activeId];
      if (player && player.hand.length > player.maxHandSize) {
        player.pendingDiscardCount = player.hand.length - player.maxHandSize;
        this.state.pendingAction = {
          type: 'DISCARD',
          playerId: activeId,
          count: player.pendingDiscardCount
        };
        this.log(`${player.name} must discard ${player.pendingDiscardCount} card(s) to reach hand size (${player.maxHandSize}).`);
      }

      // Rule 514.2: Remove all damage and cleanup continuous effects
      this.state.battlefield.forEach(obj => obj.damageMarked = 0);

      // SOS: Expire "Until End of Your Next Turn" effects
      this.state.ruleRegistry.continuousEffects = this.state.ruleRegistry.continuousEffects.filter(eff => {
          if (eff.duration?.type === DurationType.UntilEndOfYourNextTurn && eff.duration.untilTurnOfPlayerId === activeId) {
              // Only expire if it was NOT created this turn (to survive the turn it was cast)
              if (eff.timestamp < this.state.turnState.turnStartTime) return false;
          }
          return eff.duration.type !== DurationType.UntilEndOfTurn;
      });
      this.state.ruleRegistry.triggeredAbilities = this.state.ruleRegistry.triggeredAbilities.filter(
        t => !t.duration || t.duration.type !== DurationType.UntilEndOfTurn
      );
    }
  }
  /**
   * Core Action: Player Gain Life (Rule 119.3)
   */
  public gainLife(playerId: PlayerId, amount: number) {
    const { LifeDamageHandler } = require('./modules/effects/handlers/LifeDamageHandler');
    LifeDamageHandler.handleGainLife(this.state, [playerId], amount, (m: string) => this.log(m));
  }


  private cleanupExpiredEffectsByEvent(eventType: string, activePlayerId?: PlayerId) {
    const previousCount = this.state.ruleRegistry.continuousEffects.length;
    this.state.ruleRegistry.continuousEffects = this.state.ruleRegistry.continuousEffects.filter(eff => {
      if (eff.duration?.type === DurationType.UntilEvent && eff.duration.expiryEvent === eventType) {
        // If untilTurnOfPlayerId is specified, only expire if it's that player's turn
        if (eff.duration.untilTurnOfPlayerId && eff.duration.untilTurnOfPlayerId !== activePlayerId) {
            return true;
        }
        return false;
      }
      return true;
    });

    if (this.state.ruleRegistry.continuousEffects.length < previousCount) {
      this.log(`[FLOW] Expired ${previousCount - this.state.ruleRegistry.continuousEffects.length} continuous effect(s) on event ${eventType}.`);
    }
  }

  public getState(): GameState {
    // CR 613: Re-evaluate the "Derived State" (P/T, Keywords, isPlayable) before returning to the UI.
    LayerProcessor.updateDerivedStats(this.state, PriorityProcessor);
    return this.state;
  }


  public resolveChoice(playerId: string, choiceIndex: any): boolean {
    const success = ChoiceProcessor.resolveChoice(
      this.state,
      playerId,
      choiceIndex,
      (m: string) => this.log(m),
      {
        resetPriorityToActivePlayer: () => this.resetPriorityToActivePlayer(),
        activateAbility: (p: PlayerId, c: string, i: number, t: string[], b: boolean = false) => this.activateAbility(p, c, i, t, b),
        tapForMana: (p: string, c: string) => this.tapForMana(p, c),
        checkAutoPass: (p: string) => this.checkAutoPass(p)
      }
    );

    if (success && !this.state.pendingAction) {
      this.resetPriorityToActivePlayer();
    }
    return success;
  }

  public resolveTargeting(playerId: PlayerId, targetId: string): boolean {
    return PlayerActionProcessor.resolveTargeting(this.state, playerId, targetId, this.getPlayerActionCallbacks());
  }

  private getPlayerActionCallbacks(): PlayerActionCallbacks {
    return {
        log: (m: string) => this.log(m),
        getPlayerName: (id: PlayerId) => this.getPlayerName(id),
        playCard: (pId, cId, targets, bypass) => this.playCard(pId, cId, targets, bypass),
        activateAbility: (pId, cId, idx, targets, bypass) => this.activateAbility(pId, cId, idx, targets, bypass),
        resetPriorityToActivePlayer: () => this.resetPriorityToActivePlayer(),
        checkAutoPass: (pId: PlayerId) => this.checkAutoPass(pId)
    };
  }

  private cleanupEndOfTurn() {
    this.log(`[CLEANUP] Removing 'Until End of Turn' effects and resetting markers.`);

    // 1. Remove floating continuous effects (Rule 614)
    this.state.ruleRegistry.continuousEffects = this.state.ruleRegistry.continuousEffects.filter(eff => {
      return eff.duration?.type !== DurationType.UntilEndOfTurn;
    });

    // 2. Clear damage markers and deathtouch flags (Rule 514.2)
    this.state.battlefield.forEach(obj => {
      obj.damageMarked = 0;
      obj.deathtouchMarked = false;
      obj.abilitiesUsedThisTurn = 0;
    });
  }

  public resolveCombatOrdering(playerId: string, order: string[]): boolean {
    return CombatProcessor.resolveCombatOrdering(this.state, playerId, order, this.getCombatCallbacks());
  }

  public setState(newState: GameState) {
    this.state = newState;
    // VERY IMPORTANT: Re-link resolver to the newest state reference
    this.resolver = new StackResolver(this.state);
  }
}

