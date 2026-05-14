import { ChoicePayload, EffectType, GameState, Phase, PlayerId, Step } from '@shared/engine_types';
import { Card } from '@shared/types';
import { ActivateAbilityOptions, EngineContext, PlayCardOptions } from './interfaces/EngineContext';
import { ActionProcessor, ChoiceGenerator, ChoiceProcessor, CombatProcessor, DamageProcessor, ConditionProcessor, EffectProcessor, GameSetupProcessor, LayerProcessor, ManaProcessor, PlayerActionProcessor, PriorityProcessor, ReplacementProcessor, SpellProcessor, StackProcessor, ResolutionManager, StateBasedActionsProcessor, TriggerProcessor, TurnProcessor, TargetingProcessor, RestrictionValidator, MulliganProcessor } from './modules';
import { TargetingDispatcher } from './modules/actions/targeting/TargetingDispatcher';
import { LkiProcessor } from './modules/state/LkiProcessor';
import { RegistryProcessor } from './modules/core/RegistryProcessor';
import { CostProcessor } from './modules/magic/CostProcessor';
import { Profiler } from './utils/Profiler';
import { EngineLogger } from './utils/EngineLogger';
import { LifeDamageHandler } from './modules/effects/handlers/life/LifeDamageHandler';
import { MovementHandler } from './modules/effects/handlers/zone/MoveEffectHandler';
import { SpellValidator } from './modules/actions/spells/SpellValidator';
import { SpellCostCalculator } from './modules/actions/spells/SpellCostCalculator';
import { SpellInteractiveManager } from './modules/actions/spells/SpellInteractiveManager';
import { oracle } from './OracleLogicMap';

/**
 * CENTRALIZED MTG RULE ENGINE (Orchestrator)
 */
export class GameEngine implements EngineContext {
  public shouldLog: boolean = true;
  private state: GameState;
  private playerOrder: PlayerId[];
  private decks: Record<string, Card[]>;
  private names: Record<string, string>;
  private avatars: Record<string, string>;
  private bots: Record<string, boolean>;
  public processors: EngineContext['processors'];

  constructor(players: PlayerId[], decks: Record<string, Card[]> = {}, names: Record<string, string> = {}, avatars: Record<string, string> = {}, bots: Record<string, boolean> = {}) {
    this.playerOrder = players;
    this.decks = decks;
    this.names = names;
    this.avatars = avatars;
    this.bots = bots;

    this.state = {
      players: {},
      activePlayerId: players[0],
      priorityPlayerId: players[0],
      currentPhase: Phase.Beginning,
      currentStep: Step.Untap,
      status: 'active',
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
      interaction: {
        lastSelections: {},
        flags: {}
      },
      stateVersion: 1
    };

    GameSetupProcessor.initializePlayers(this.state, players, names, decks, avatars, bots);

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
      targetingDispatcher: TargetingDispatcher,
      layer: LayerProcessor,
      sba: StateBasedActionsProcessor,
      resolution: ResolutionManager,
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
      oracle: oracle,
      mulligan: MulliganProcessor
    };

    Object.defineProperty(this.state, 'gameEngine', {
      value: this,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }

  public log(message: string) {
    const formattedMessage = `> ${message}`;
    const newLogs = [...(this.state.logs || []), formattedMessage];
    this.state.logs = newLogs.slice(-40);
    console.log(`[GameEngine] ${message}`);
  }

  public incrementVersion() {
    this.state.stateVersion++;
  }

  public getPlayerName(id: PlayerId): string {
    return this.state.players[id]?.name || this.names?.[id] || id;
  }

  public startGame() {
    MulliganProcessor.initialize(this.state, this);
  }

  public shuffleLibrary(playerId: PlayerId) {
    GameSetupProcessor.shuffleLibrary(this.state, playerId);
  }

  public drawCard(playerId: PlayerId): boolean {
    const player = this.state.players[playerId];
    if (!player) return false;
    if (player.library.length === 0) {
      player.hasLostDueToEmptyLibrary = true;
      this.checkStateBasedActions(); // Immediately process the loss
      return false;
    }
    MovementHandler.handle(
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

  public declareAttacker(playerId: PlayerId, cardId: string, targetId?: string): boolean {
    return PlayerActionProcessor.declareAttacker(this.state, playerId, cardId, targetId);
  }

  public confirmAttackers(playerId: PlayerId): boolean {
    const res = CombatProcessor.confirmAttackers(this.state, playerId as PlayerId, this);
    if (res) this.incrementVersion();
    return res;
  }

  public handleBlockSelection(playerId: PlayerId, cardId: string): boolean {
    return PlayerActionProcessor.handleBlockSelection(this.state, playerId, cardId);
  }

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

  public discardCard(playerId: PlayerId, cardInstanceId: string): boolean {
    const res = PlayerActionProcessor.discardCard(this.state, playerId, cardInstanceId);
    this.incrementVersion();
    return res.success;
  }

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

  public passPriority(playerId: PlayerId, isAuto = false) {
    Profiler.wrap('PriorityProcessor.passPriority', () => {
      PriorityProcessor.passPriority(this.state, playerId, this, isAuto);
    });
    this.incrementVersion();
  }

  public resolveTopOrAdvanceStep() {
    StackProcessor.resolveTopOrAdvanceStep(this.state, this);
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

        Profiler.wrap('LayerProcessor.updateDerivedStats', () => {
          LayerProcessor.updateDerivedStats(this.state, PriorityProcessor);
        });

        sbaPerformed = Profiler.wrap('StateBasedActionsProcessor.resolveSBAs', () =>
          StateBasedActionsProcessor.resolveSBAs(this.state)
        );

        anyTriggersStacked = Profiler.wrap('TriggerProcessor.processPendingTriggers', () =>
          TriggerProcessor.processPendingTriggers(this.state)
        );

        const activePlayers = Object.values(this.state.players).filter(p => !p.hasLost);
        if (activePlayers.length <= 1 && Object.keys(this.state.players).length > 1) {
          this.state.status = 'completed';
          this.state.winner = activePlayers[0]?.playerId;
          this.log(`Game Over. Winner: ${this.getPlayerName(this.state.winner || 'None')}`);
          return;
        }

      } while (sbaPerformed || anyTriggersStacked);
    });
  }

  public gainLife(playerId: PlayerId, amount: number) {
    LifeDamageHandler.handleGainLife(
      this.state,
      { type: EffectType.GainLife, amount },
      { targets: [playerId], sourceId: 'system', controllerId: playerId, effects: [] }
    );
  }

  public getState(): GameState {
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
    this.incrementVersion();
    return res;
  }

  public resolveTargeting(playerId: PlayerId, targetId: string): boolean {
    const res = ChoiceProcessor.resolveTargeting(this.state, playerId, targetId, this);
    this.incrementVersion();
    return res;
  }

  public resolveCombatOrdering(playerId: PlayerId, order: string[]): boolean {
    return CombatProcessor.resolveCombatOrdering(this.state, playerId, order, this);
  }

  public setState(newState: GameState) {
    this.state = newState;

    Object.defineProperty(this.state, 'gameEngine', {
      value: this,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }


  public finaliseTargeting(playerId: PlayerId, targets: string[]): boolean {
    if (!this.state) return false;
    const res = TargetingProcessor.finaliseTargeting(this.state, playerId, targets, this);
    this.incrementVersion();
    return res;
  }
}
