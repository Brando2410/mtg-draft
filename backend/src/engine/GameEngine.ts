import { GameState, Phase, PlayerId, Step } from '@shared/engine_types';
import { Card } from '@shared/types';
import { ActivateAbilityOptions, EngineContext, PlayCardOptions } from './interfaces/EngineContext';
import { ChoiceProcessor, CombatProcessor, GameSetupProcessor, LayerProcessor, PlayerActionProcessor, PriorityProcessor, SpellProcessor, StackProcessor, StackResolver, StateBasedActionsProcessor, TriggerProcessor, TurnProcessor } from './modules';

/**
 * CENTRALIZED MTG RULE ENGINE (Orchestrator)
 * -----------------------------------------
 * This class coordinates the interaction between different rule modules 
 * (Combat, Mana, SBA, Priority) to maintain a consistent game state.
 * 
 * DESIGN PATTERN: Modular Processor Strategy.
 * Each module handles a specific Chapter of the Comprehensive Rules (CR).
 */
export class GameEngine implements EngineContext {
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
      limbo: [],
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
  public log(message: string) {
    const formattedMessage = `> ${message}`;
    const newLogs = [...(this.state.logs || []), formattedMessage];
    this.state.logs = newLogs.slice(-40);
    console.log(`[GameEngine] ${message}`);
  }

  /**
   * Helper to resolve player IDs to human-readable names.
   */
  public getPlayerName(id: PlayerId): string {
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
    if (!player) return false;
    if (player.library.length === 0) {
      player.hasLostDueToEmptyLibrary = true;
      return false;
    }
    const { MoveEffectHandler } = require('./modules/effects/handlers/zone/MoveEffectHandler');
    MoveEffectHandler.handle(
      this.state,
      { type: 'DrawCards', amount: 1 } as any,
      (m: string) => this.log(m),
      {
        sourceId: 'system',
        controllerId: playerId,
        targets: [playerId],
        effects: []
      }
    );
    return true;
  }

  // --- Player Actions (Rule 117) ---

  /**
   * CR 106: Tapping for Mana & Special Actions (Attacking/Blocking)
   * This is a "Click Interaction" wrapper that delegates to the correct sub-routine
   * based on the current game context (Rule 117).
   */
  public interactWithPermanent(playerId: PlayerId, cardId: string): boolean {
    if (!this.state) {
        console.error('[GameEngine] interactWithPermanent called but state is undefined');
        return false;
    }
    return PlayerActionProcessor.interactWithPermanent(
      this.state,
      playerId,
      cardId,
      (m: string) => this.log(m),
      this
    );
  }

  public autoTapLand(playerId: PlayerId, cardId: string, abilityIndex?: number, choiceIndex?: number): boolean {
    if (!this.state) {
        console.error('[GameEngine] autoTapLand called but state is undefined');
        return false;
    }
    return PlayerActionProcessor.autoTapLand(this.state, playerId, cardId, this, abilityIndex, choiceIndex);
  }

  public tapForMana(playerId: PlayerId, cardId: string, abilityIndex?: number, choiceIndex?: number): boolean {
    return this.autoTapLand(playerId, cardId, abilityIndex, choiceIndex);
  }

  /**
   * CR 508: Declare Attackers Step
   */
  public declareAttacker(playerId: string, cardId: string, targetId?: string): boolean {
    return PlayerActionProcessor.declareAttacker(this.state, playerId, cardId, targetId, (m: string) => this.log(m));
  }

  /**
   * CR 508.2: Confirming the Attacker Declaration Action
   */
  public confirmAttackers(playerId: string) {
    CombatProcessor.confirmAttackers(this.state, playerId as PlayerId, this);
  }

  /**
   * CR 509: Declare Blockers Step
   */
  public handleBlockSelection(playerId: string, cardId: string): boolean {
    return PlayerActionProcessor.handleBlockSelection(this.state, playerId, cardId, (m: string) => this.log(m));
  }

  /**
   * CR 509.2: Confirming the Blocker Declaration Action
   */
  public confirmBlockers(playerId: string) {
    CombatProcessor.confirmBlockers(this.state, playerId as PlayerId, this);
  }

  public clearAttackers(playerId: string) {
    CombatProcessor.clearAttackers(this.state, playerId as PlayerId, this);
  }

  public clearBlockers(playerId: string) {
    CombatProcessor.clearBlockers(this.state, playerId as PlayerId, this);
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
  public playCard(options: PlayCardOptions): boolean {
    return SpellProcessor.playCard(
      this.state,
      (m) => this.log(m),
      this,
      options
    );
  }

  public activateAbility(options: ActivateAbilityOptions): boolean {
    return SpellProcessor.activateAbility(
      this.state,
      (m) => this.log(m),
      this,
      options
    );
  }

  // --- Core Mechanics (Rule 117.4) ---

  /**
   * CR 117.4: Timing and Priority
   * Handles the passing of priority and automatic resolution of the stack.
   */
  public passPriority(playerId: PlayerId, isAuto = false) {
    PriorityProcessor.passPriority(this.state, playerId, this, isAuto);
  }

  public resolveTopOrAdvanceStep() {
    StackProcessor.resolveTopOrAdvanceStep(this.state, this, this.resolver, (m) => this.log(m));
  }

  public advanceStep() {
    TurnProcessor.advanceStep(this.state, this, (m) => this.log(m));
  }

  public givePriorityToNextPlayer() {
    PriorityProcessor.givePriorityToNextPlayer(this.state, this);
  }

  public resetPriorityToActivePlayer() {
    PriorityProcessor.resetPriorityToActivePlayer(this.state, this);
  }

  public checkAutoPass(playerId: PlayerId) {
    PriorityProcessor.checkAutoPass(this.state, playerId, this);
  }

  public togglePassTurn(playerId: string) {
    PriorityProcessor.togglePassTurn(this.state, playerId, this);
  }

  private canPlayerTakeAnyAction(playerId: PlayerId): boolean {
    return PriorityProcessor.canPlayerTakeAnyAction(this.state, playerId);
  }

  /**
   * Checks for State-Based Actions (CR 704) and pending triggers (CR 603).
   * Rule 117.5: "Each time a player would receive priority, the game first performs all 
   * applicable state-based actions as a single event, then repeats this process until 
   * no more state-based actions are performed. Then triggered abilities are put on 
   * the stack. These steps repeat until no new state-based actions are performed 
   * and no new abilities trigger."
   */
  public checkStateBasedActions() {
    let sbaPerformed = false;
    let anyTriggersStacked = false;

    do {
      // 1. Resolve SBAs until stable (Rule 704.3)
      sbaPerformed = StateBasedActionsProcessor.resolveSBAs(this.state, (m: string) => this.log(m));

      // 2. Resolve Triggers (Rule 603.3)
      anyTriggersStacked = TriggerProcessor.processPendingTriggers(this.state, (m: string) => this.log(m));

      // 3. Repeat if either step did work (Rule 117.5)
    } while (sbaPerformed || anyTriggersStacked);
  }

  /**
   * Core Action: Player Gain Life (Rule 119.3)
   */
  public gainLife(playerId: PlayerId, amount: number) {
    const { LifeDamageHandler } = require('./modules/effects/handlers/life/LifeDamageHandler');
    LifeDamageHandler.handleGainLife(this.state, [playerId], amount, (m: string) => this.log(m));
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
      this
    );

    if (success && !this.state.pendingAction) {
      // Priority is already handled by ChoiceProcessor (either reset to active or kept by the player)
    }
    return success;
  }

  public resolveTargeting(playerId: PlayerId, targetId: string): boolean {
    return PlayerActionProcessor.resolveTargeting(this.state, playerId, targetId, this);
  }

  public resolveCombatOrdering(playerId: string, order: string[]): boolean {
    return CombatProcessor.resolveCombatOrdering(this.state, playerId, order, this);
  }

  public setState(newState: GameState) {
    this.state = newState;

    // VERY IMPORTANT: Re-link the engine to the state for processors that depend on it
    Object.defineProperty(this.state, 'gameEngine', {
      value: this,
      enumerable: false,
      writable: true,
      configurable: true
    });

    // VERY IMPORTANT: Re-link resolver to the newest state reference
    this.resolver = new StackResolver(this.state);
  }
}
