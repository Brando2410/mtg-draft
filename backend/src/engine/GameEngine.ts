import { ChoicePayload, EffectType, GameState, Phase, PlayerId, Step } from '@shared/engine_types';
import { Card } from '@shared/types';
import { ActivateAbilityOptions, EngineContext, PlayCardOptions } from './interfaces/EngineContext';
import { ActionProcessor, ChoiceGenerator, ChoiceProcessor, CombatProcessor, DamageProcessor, ConditionProcessor, EffectProcessor, GameSetupProcessor, LayerProcessor, ManaProcessor, PlayerActionProcessor, PriorityProcessor, ReplacementProcessor, SpellProcessor, StackProcessor, StackResolver, StateBasedActionsProcessor, TriggerProcessor, TurnProcessor, TargetingProcessor, RestrictionValidator } from './modules';
import { LkiProcessor } from './modules/state/LkiProcessor';
import { RegistryProcessor } from './modules/core/RegistryProcessor';
import { CostProcessor } from './modules/magic/CostProcessor';
import { Profiler } from './utils/Profiler';
import { EngineLogger } from './utils/EngineLogger';
import { LifeDamageHandler } from './modules/effects/handlers/life/LifeDamageHandler';
import { MoveEffectHandler } from './modules/effects/handlers/zone/MoveEffectHandler';
import { SpellValidator } from './modules/actions/spells/SpellValidator';
import { SpellCostCalculator } from './modules/actions/spells/SpellCostCalculator';
import { SpellInteractiveManager } from './modules/actions/spells/SpellInteractiveManager';
import { oracle } from './OracleLogicMap';

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
  public shouldLog: boolean = true;
  private state: GameState;
  private playerOrder: PlayerId[];
  private resolver: StackResolver;
  private decks: Record<string, Card[]>;
  private names: Record<string, string>;
  private avatars: Record<string, string>;
  public processors: EngineContext['processors'];

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
      lki: {},
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
        creaturesEnteredThisTurn: {},
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
      },
      executionTrace: [],
      mutationStack: [],
      choiceQueue: [],
      interaction: {},
      stateVersion: 1
    };

    GameSetupProcessor.initializePlayers(this.state, players, names, decks, avatars);
    this.resolver = new StackResolver(this.state);

    // Initialize Processor Registry for peer access
    this.processors = {
      action: ActionProcessor,
      playerAction: PlayerActionProcessor,
      combat: CombatProcessor,
      damage: DamageProcessor,
      choice: ChoiceProcessor,
      priority: PriorityProcessor,
      spell: SpellProcessor,
      stack: StackProcessor,
      trigger: TriggerProcessor,
      turn: TurnProcessor,
      targeting: TargetingProcessor,
      layer: LayerProcessor,
      sba: StateBasedActionsProcessor,
      restriction: RestrictionValidator,
      mana: ManaProcessor,
      cost: CostProcessor,
      registry: RegistryProcessor,
      effect: EffectProcessor,
      condition: ConditionProcessor,
      replacement: ReplacementProcessor,
      choiceGenerator: ChoiceGenerator,
      spellValidator: SpellValidator,
      spellCostCalculator: SpellCostCalculator,
      spellInteractiveManager: SpellInteractiveManager,
      lki: LkiProcessor,
      logger: EngineLogger,
      oracle: oracle
    };

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

  public incrementVersion() {
    this.state.stateVersion++;
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
    GameSetupProcessor.shuffleLibrary(this.state, playerId);
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
    MoveEffectHandler.handle(
      this.state,
      { type: EffectType.DrawCards, amount: 1 },
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
      this
    );
  }

  public autoTapLand(playerId: PlayerId, cardId: string, abilityIndex?: number, choiceIndex?: number): boolean {
    if (!this.state) {
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
  public declareAttacker(playerId: PlayerId, cardId: string, targetId?: string): boolean {
    return PlayerActionProcessor.declareAttacker(this.state, playerId, cardId, targetId);
  }

  /**
   * CR 508.2: Confirming the Attacker Declaration Action
   */
  public confirmAttackers(playerId: PlayerId): boolean {
    const res = CombatProcessor.confirmAttackers(this.state, playerId as PlayerId, this);
    if (res) this.incrementVersion();
    return res;
  }

  /**
   * CR 509: Declare Blockers Step
   */
  public handleBlockSelection(playerId: PlayerId, cardId: string): boolean {
    return PlayerActionProcessor.handleBlockSelection(this.state, playerId, cardId);
  }

  /**
   * CR 509.2: Confirming the Blocker Declaration Action
   */
  public confirmBlockers(playerId: PlayerId): boolean {
    const res = CombatProcessor.confirmBlockers(this.state, playerId as PlayerId, this);
    if (res) this.incrementVersion();
    return res;
  }

  public clearAttackers(playerId: PlayerId) {
    CombatProcessor.clearAttackers(this.state, playerId, this);
  }

  public clearBlockers(playerId: PlayerId) {
    CombatProcessor.clearBlockers(this.state, playerId, this);
  }

  /**
   * MANUAL DISCARD ACTION (e.g. for Cleanup phase or spells)
   */
  public discardCard(playerId: PlayerId, cardInstanceId: string): boolean {
    const res = PlayerActionProcessor.discardCard(this.state, playerId, cardInstanceId);
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
    const res = SpellProcessor.playCard(
      this.state,
      this,
      options
    );
    if (res) this.incrementVersion();
    return res;
  }

  public activateAbility(options: ActivateAbilityOptions): boolean {
    const res = SpellProcessor.activateAbility(
      this.state,
      this,
      options
    );
    if (res) this.incrementVersion();
    return res;
  }

  // --- Core Mechanics (Rule 117.4) ---

  /**
   * CR 117.4: Timing and Priority
   * Handles the passing of priority and automatic resolution of the stack.
   */
  public passPriority(playerId: PlayerId, isAuto = false) {
    Profiler.wrap('PriorityProcessor.passPriority', () => {
      PriorityProcessor.passPriority(this.state, playerId, this, isAuto);
    });
    this.incrementVersion();
  }

  public resolveTopOrAdvanceStep() {
    StackProcessor.resolveTopOrAdvanceStep(this.state, this, this.resolver);
    this.incrementVersion();
  }

  public advanceStep() {
    TurnProcessor.advanceStep(this.state, this);
    this.incrementVersion();
  }

  public givePriorityToNextPlayer() {
    PriorityProcessor.givePriorityToNextPlayer(this.state, this);
    this.incrementVersion();
  }

  public resetPriorityToActivePlayer() {
    PriorityProcessor.resetPriorityToActivePlayer(this.state, this);
    this.incrementVersion();
  }

  public checkAutoPass(playerId: PlayerId) {
    PriorityProcessor.checkAutoPass(this.state, playerId, this);
  }

  public togglePassTurn(playerId: PlayerId) {
    PriorityProcessor.togglePassTurn(this.state, playerId, this);
    this.incrementVersion();
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
    Profiler.wrap('checkStateBasedActions.total', () => {
      let sbaPerformed = false;
      let anyTriggersStacked = false;
      let loopCount = 0;
      const MAX_LOOPS = 50;

      do {
        if (loopCount++ > MAX_LOOPS) {
          console.error('[GameEngine] SBA/Trigger loop limit exceeded!');
          break;
        }

        // 1. Resolve SBAs until stable (Rule 704.3)
        sbaPerformed = Profiler.wrap('StateBasedActionsProcessor.resolveSBAs', () =>
          StateBasedActionsProcessor.resolveSBAs(this.state)
        );

        // 2. Resolve Triggers (Rule 603.3)
        anyTriggersStacked = Profiler.wrap('TriggerProcessor.processPendingTriggers', () =>
          TriggerProcessor.processPendingTriggers(this.state)
        );

        // 3. Check if only one player is left
        const activePlayers = Object.values(this.state.players).filter(p => !p.hasLost);
        if (activePlayers.length <= 1 && Object.keys(this.state.players).length > 1) {
          return;
        }

        // 4. Repeat if either step did work (Rule 117.5)
      } while (sbaPerformed || anyTriggersStacked);

      // CR 613: Refresh playability for the player who is about to receive priority
      LayerProcessor.updateDerivedStats(this.state, PriorityProcessor);
    });
  }

  /**
   * Core Action: Player Gain Life (Rule 119.3)
   */
  public gainLife(playerId: PlayerId, amount: number) {
    LifeDamageHandler.handleGainLife(
      this.state,
      { type: EffectType.GainLife, amount },
      { targets: [playerId], sourceId: 'system', controllerId: playerId, effects: [] }
    );
  }

  public getState(): GameState {
    // CR 613: Re-evaluate the "Derived State" (P/T, Keywords, isPlayable) before returning to the UI.
    Profiler.wrap('LayerProcessor.updateDerivedStats', () => {
      LayerProcessor.updateDerivedStats(this.state, PriorityProcessor);
    });
    return this.state;
  }

  public resolveChoice(playerId: PlayerId, choice: number | string | ChoicePayload): boolean {
    const res = ChoiceProcessor.resolveChoice(
      this.state,
      playerId,
      choice as any,
      this
    );
    if (res) this.incrementVersion();
    return res;
  }

  public resolveTargeting(playerId: PlayerId, targetId: string): boolean {
    const res = ChoiceProcessor.resolveTargeting(this.state, playerId, targetId, this);
    if (res) this.incrementVersion();
    return res;
  }

  public resolveCombatOrdering(playerId: PlayerId, order: string[]): boolean {
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

  public resumeResolution(sourceId: string, stackObj: any, parentContext: any): boolean {
    return ChoiceProcessor.resumeResolution(this.state, sourceId, stackObj, parentContext, this);
  }

  /**
   * CR 601.2c: Target selection
   */
  public finaliseTargeting(playerId: PlayerId, targets: string[]): boolean {
    if (!this.state) return false;
    const res = TargetingProcessor.finaliseTargeting(this.state, playerId, targets, this);
    if (res) this.incrementVersion();
    return res;
  }
}
