import { GameState, Phase, Step, PlayerId, Zone, GameObject, PlayerState, DurationType } from '@shared/engine_types';
import { Card } from '@shared/types';
import { StackResolver } from './modules';
import { M21_LOGIC } from './data/m21_logic';
import { ManaProcessor } from './modules/magic/ManaProcessor';
import { GameSetupProcessor, PlayerActionProcessor, TurnProcessor, PriorityProcessor, StackProcessor, ActionProcessor, SpellProcessor, ChoiceProcessor, StateBasedActionsProcessor, CombatProcessor, ValidationProcessor, TriggerProcessor, LayerProcessor } from './modules';

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

  /**
   * CR 103: Starting the Game
   */
  constructor(players: PlayerId[], decks: Record<string, Card[]> = {}, names: Record<string, string> = {}) {
    this.playerOrder = players;
    this.decks = decks;
    this.names = names;
    
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
        restrictions: []
      },
      emblems: [],
      consecutivePasses: 0,
      logs: ['Match Start Initialization...'],
      turnState: {
        permanentReturnedToHandThisTurn: false,
        noncombatDamageDealtToOpponents: 0,
        creaturesAttackedThisTurn: 0,
        lastDamageAmount: 0,
        lastLifeGainedAmount: 0,
        lastCardsDrawnAmount: 0,
        spellsCastThisTurn: {}
      }
    };
    
    GameSetupProcessor.initializePlayers(this.state, players, names, decks);
    this.resolver = new StackResolver(this.state);
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
    return GameSetupProcessor.drawCard(this.state, playerId, (m) => this.log(m));
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
    if (this.state.pendingAction?.type !== 'DECLARE_ATTACKERS' || this.state.pendingAction.playerId !== playerId) return;
    
    this.log(`${this.getPlayerName(playerId)} confirmed attackers.`);
    
    const attackers = this.state.combat?.attackers || [];
    this.state.turnState.creaturesAttackedThisTurn += attackers.length;

    // Rule 508.1: "Whenever an opponent attacks..." (Mangara support)
    if (attackers.length > 0) {
        TriggerProcessor.onEvent(this.state, {
            type: 'ON_ATTACKERS_DECLARED',
            playerId: playerId as PlayerId,
            data: { attackers }
        }, (m: string) => this.log(m));
    }

    this.state.pendingAction = undefined;
    this.resetPriorityToActivePlayer();
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
    if (this.state.pendingAction?.type !== 'DECLARE_BLOCKERS' || this.state.pendingAction.playerId !== playerId) return;
    
    // CR 509.1: Validate global block requirements (e.g. Menace)
    const validation = ValidationProcessor.validateAllBlockers(this.state);
    if (!validation.isValid) {
        this.log(`[BLOCK] ERR: ${validation.error}`);
        // Keep in block declaration mode until fixed
        return;
    }

    this.log(`${this.getPlayerName(playerId)} confirmed blockers.`);
    this.state.pendingAction = undefined;
    
    // CR 509.2 / 509.3: If multiple blockers/attackers are involved, we need damage assignment order first.
    if (CombatProcessor.needsOrdering(this.state)) {
        CombatProcessor.setupNextOrderingAction(this.state, (m) => this.log(m));
    } else {
        // CR 509.4: Give priority window in Declare Blockers step.
        this.resetPriorityToActivePlayer();
    }
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
            tapForMana: (p, c) => this.tapForMana(p, c),
            passPriority: (p) => this.passPriority(p),
            checkAutoPass: (p) => this.checkAutoPass(p),
            checkStateBasedActions: () => this.checkStateBasedActions()
        },
        bypassTargeting
    );
  }

  /**
   * CR 602: Activating Activated Abilities
   * @param abilityIndex The index of the ability in the card's M21_LOGIC entry
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
    // 1. Intercept for special actions
    if (this.state.pendingAction?.playerId === playerId) {
      if (this.state.pendingAction.type === 'DECLARE_ATTACKERS') {
        this.confirmAttackers(playerId);
        return;
      }
      if (this.state.pendingAction.type === 'DECLARE_BLOCKERS') {
        this.confirmBlockers(playerId);
        return;
      }
    }

    if (String(this.state.priorityPlayerId) !== String(playerId)) {
      console.log(`[ENGINE] passPriority IGNORED: current priority is ${this.state.priorityPlayerId}, but ${playerId} tried to pass.`);
      return;
    }
    
    // CR 117.1: A player must resolve pending mandatory actions before passing
    if (this.state.pendingAction && String(this.state.pendingAction.playerId) === String(playerId)) {
      console.log(`[ENGINE] passPriority BLOCKED: ${playerId} has pending ${this.state.pendingAction.type}.`);
      this.log(`Invalid Action: Player must resolve pending ${this.state.pendingAction.type} first.`);
      return;
    }

    const player = this.state.players[playerId];
    if (player && player.pendingDiscardCount > 0) {
      if (!isAuto) this.log(`${this.getPlayerName(playerId)} must finish discarding first.`);
      return;
    }

    this.state.consecutivePasses++;
    
    const prefix = isAuto ? '[Auto-Pass] ' : '[Manual-Pass] ';
    this.log(`${prefix}${this.getPlayerName(playerId)} passed. (${this.state.consecutivePasses}/${this.playerOrder.length} passes)`);

    if (this.state.consecutivePasses >= this.playerOrder.length) {
      this.resolveTopOrAdvanceStep();
    } else {
      this.givePriorityToNextPlayer();
    }
  }

  private resolveTopOrAdvanceStep() {
    if (this.state.stack.length > 0) {
      const objectToResolve = this.state.stack.pop();
      if (objectToResolve) {
        this.state.consecutivePasses = 0; // CR 117.4: Resolution or stack changes reset pass count
        
        this.log(`--------------------------------------------------`);
        this.log(`[RESOLVING] >>> ${objectToResolve.card?.definition.name || 'Effect'} is resolving <<<`);
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
    TriggerProcessor.onEvent(this.state, { 
        type: `ON_${stepName}_STEP`, 
        playerId: this.state.activePlayerId,
        data: { phase: this.state.currentPhase, step: this.state.currentStep } 
    }, (m) => this.log(m));

    // Fire generic event for the phase (e.g., ON_PRE_COMBAT_MAIN_PHASE_START)
    TriggerProcessor.onEvent(this.state, { 
        type: `ON_${phaseName}_PHASE_START`, 
        playerId: this.state.activePlayerId,
        data: { phase: this.state.currentPhase, step: this.state.currentStep } 
    }, (m) => this.log(m));

    this.emptyAllManaPools();
    this.handleStepEntryRules();
    
    if (this.state.pendingAction) {
       this.log(`[WAITING] Pending Action: ${this.state.pendingAction.type} for ${this.getPlayerName(this.state.pendingAction.playerId)}`);
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
    const nextIndex = (currentIndex + 1) % this.playerOrder.length;
    this.state.activePlayerId = this.playerOrder[nextIndex];
    if (this.state.players[this.state.activePlayerId]) {
      this.state.players[this.state.activePlayerId].hasPlayedLandThisTurn = false;
    }
    
    // Rule 606.3: Reset activated ability usage for all permanents
    this.state.battlefield.forEach(obj => obj.abilitiesUsedThisTurn = 0);

    // CR 500: Reset turn-wide logic tracking
    this.state.turnState = {
        permanentReturnedToHandThisTurn: false,
        noncombatDamageDealtToOpponents: 0,
        creaturesAttackedThisTurn: 0,
        lastDamageAmount: 0,
        lastLifeGainedAmount: 0,
        lastCardsDrawnAmount: 0,
        spellsCastThisTurn: {}
    };
  }

  private givePriorityToNextPlayer() {
    if (!this.state.priorityPlayerId) return;
    const currentIndex = this.playerOrder.indexOf(this.state.priorityPlayerId);
    const nextIndex = (currentIndex + 1) % this.playerOrder.length;
    this.checkStateBasedActions();
    this.state.priorityPlayerId = this.playerOrder[nextIndex];
    this.log(`[PRIORITY] Shifted to ${this.getPlayerName(this.state.priorityPlayerId)}.`);
    
    this.checkAutoPass(this.state.priorityPlayerId);
  }

  private resetPriorityToActivePlayer() {
    this.state.consecutivePasses = 0;
    this.checkStateBasedActions();
    
    // Only set priority to active player if an SBA or trigger didn't just set up a mandatory action.
    if (!this.state.pendingAction) {
      this.state.priorityPlayerId = this.state.activePlayerId;
    }
    
    if (this.state.priorityPlayerId) {
       this.checkAutoPass(this.state.priorityPlayerId);
    }
  }

  private checkAutoPass(playerId: PlayerId) {
    if (!this.state.priorityPlayerId || String(this.state.priorityPlayerId) !== String(playerId)) return;

    const player = this.state.players[playerId];
    const canAct = this.canPlayerTakeAnyAction(playerId);

    if (player && !player.fullControl && !canAct) {
      this.log(`[Auto-Pass] ${this.getPlayerName(playerId)} skipped: no legal actions found.`);
      console.log(`[ENGINE] Auto-Pass triggered for ${playerId} (Reason: PriorityProcessor returned false)`);
      this.passPriority(playerId, true);
    } else if (player && canAct) {
      console.log(`[ENGINE] Priority held by ${playerId} (Actions available)`);
    }
  }

  private canPlayerTakeAnyAction(playerId: PlayerId): boolean {
    return PriorityProcessor.canPlayerTakeAnyAction(this.state, playerId);
  }

  private emptyAllManaPools() {
    for (const player of Object.values(this.state.players) as PlayerState[]) {
      player.manaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    }
  }

  private checkStateBasedActions() {
    StateBasedActionsProcessor.resolveSBAs(this.state, (msg) => this.log(msg));
  }

  private handleStepEntryRules() {
    const activeId = this.state.activePlayerId;

    if (this.state.currentStep === Step.Untap) {
      ActionProcessor.untapAll(this.state, activeId, (m) => this.log(m));
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
      
      // MTG Arena "Whiteboard Cleanup"
      this.state.ruleRegistry.continuousEffects = this.state.ruleRegistry.continuousEffects.filter(
        e => e.duration.type !== DurationType.UntilEndOfTurn
      );
    }
  }

  /**
   * Core Action: Player Gain Life (Rule 119.3)
   */
  public gainLife(playerId: PlayerId, amount: number) {
    const player = this.state.players[playerId];
    if (!player) return;

    player.life += amount;
    this.state.turnState.lastLifeGainedAmount = amount;
    this.log(`${player.name} gains ${amount} life (${player.life - amount} -> ${player.life})`);

    // Emit event to the "Whiteboard"
    TriggerProcessor.onEvent(this.state, {
      type: 'ON_LIFE_GAIN',
      playerId,
      data: { amount }
    }, (m: string) => this.log(m));
  }

  private isPlayer(id: string): boolean {
    return !!this.state.players[id as PlayerId];
  }

  public getState(): GameState {
    // CR 613: Re-evaluate the "Derived State" (P/T, Keywords, isPlayable) before returning to the UI.
    LayerProcessor.updateDerivedStats(this.state, PriorityProcessor);
    return this.state;
  }

  public resolveCombatOrdering(playerId: string, order: string[]): boolean {
    PlayerActionProcessor.resolveCombatOrdering(this.state, playerId, order, (m) => this.log(m));
    
    // Once ordering is complete (and no more pending actions exist), give priority back to AP.
    this.resetPriorityToActivePlayer();
    return true;
  }

  public resolveChoice(playerId: string, choiceIndex: number): boolean {
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

    if (success && !this.state.pendingAction && this.state.stack.length > 0) {
        this.resolveTopOrAdvanceStep();
    }
    return success;
  }

  public resolveTargeting(playerId: PlayerId, targetId: string): boolean {
    const success = ChoiceProcessor.resolveTargeting(
        this.state,
        playerId,
        targetId,
        (m: string) => this.log(m),
        {
            resetPriorityToActivePlayer: () => this.resetPriorityToActivePlayer(),
            finaliseTargeting: (p: PlayerId, t: string[]) => this.finaliseTargeting(p, t)
        }
    );

    if (success && !this.state.pendingAction && this.state.stack.length > 0) {
       this.resolveTopOrAdvanceStep();
    }
    return success;
  }

  private finaliseTargeting(playerId: PlayerId, resolvedTargets: string[]): boolean {
    const actionData = this.state.pendingAction?.data;
    const sourceId = this.state.pendingAction?.sourceId;
    const abilityIndex = actionData?.abilityIndex;
    const stackObj = actionData?.stackObj; // Get the hidden stack object
    const stackId = actionData?.stackId;     // Get the trigger stack ID (for existing triggers)

    if (actionData?.isCostTargeting) {
        if (actionData.costType === 'Sacrifice') {
            (this.state as any).lastChosenSacrificeId = resolvedTargets[0];
        }
        this.state.pendingAction = undefined;
        this.state.priorityPlayerId = playerId;
        return this.playCard(playerId, sourceId!, actionData.declaredTargets || []);
    }

    if (actionData?.nextEffectIndex !== undefined) {
        this.state.pendingAction = undefined;
        this.state.priorityPlayerId = playerId;
        const savedTargets = [...(actionData.targets || []), ...resolvedTargets];
        const savedEffects = actionData.effects || [];
        const useSourceId = actionData.sourceId || sourceId!;
        const { EffectProcessor } = require('./modules/effects/EffectProcessor');
        EffectProcessor.resolveEffects(this.state, savedEffects, useSourceId, savedTargets, (m: string) => this.log(m), actionData.nextEffectIndex, stackObj, actionData.parentContext);
        
        // --- RESUME PARENT CONTEXTS (NESTED RESOLUTION) ---
        // If the current effect list (e.g. a Choice branch) is finished, go back to parent spell layers.
        let currentCtx = actionData.parentContext;
        while (!this.state.pendingAction && currentCtx && currentCtx.nextEffectIndex < currentCtx.effects.length) {
            this.log(`[RESOLVING] Returning to parent context for ${useSourceId}...`);
            const pEffs = currentCtx.effects;
            const pNext = currentCtx.nextEffectIndex;
            const pSource = currentCtx.sourceId || sourceId!;
            const pTargets = currentCtx.targets || [];
            const pStackObj = currentCtx.stackObj;
            const pGrantContext = currentCtx.parentContext; // Grandma context
            
            currentCtx = pGrantContext; // Shift up before call to avoid loops
            EffectProcessor.resolveEffects(this.state, pEffs, pSource, pTargets, (m: string) => this.log(m), pNext, pStackObj, pGrantContext);
        }

        if (!this.state.pendingAction) {
            if (this.state.stack.length > 0) {
                this.resolveTopOrAdvanceStep();
            } else {
                this.resetPriorityToActivePlayer();
            }
        }
        return true;
    }

    if (stackObj) {
        stackObj.targets = resolvedTargets;
        this.state.stack.push(stackObj); // Reveal to everyone now!
        this.state.consecutivePasses = 0;
        
        this.log(`--------------------------------------------------`);
        this.log(`[STACK] + ${this.getPlayerName(stackObj.controllerId)} cast/activated ${stackObj.card?.definition.name || stackObj.type}`);
        if (resolvedTargets.length > 0) {
            this.log(`[STACK] Target(s): ${resolvedTargets.join(', ')}`);
        }
        this.log(`--------------------------------------------------`);

        this.state.pendingAction = undefined;
        this.state.priorityPlayerId = playerId; 
        this.checkAutoPass(playerId);
        return true;
    }

    if (stackId) {
        const existingTrigger = this.state.stack.find(s => s.id === stackId);
        if (existingTrigger) {
            existingTrigger.targets = resolvedTargets;
            this.log(`[TARGETING] Targets confirmed for Trigger: ${resolvedTargets.join(', ')}`);
            this.state.pendingAction = undefined;
            this.state.priorityPlayerId = playerId;
            this.checkAutoPass(playerId);
            return true;
        }
    }

    if (abilityIndex !== undefined) {
       this.state.pendingAction = undefined;
       this.state.priorityPlayerId = playerId; 
       const success = this.activateAbility(playerId, sourceId!, abilityIndex, resolvedTargets, true);
       this.checkAutoPass(playerId);
       return success;
    } else {
       this.state.pendingAction = undefined;
       this.state.priorityPlayerId = playerId;
       const success = this.playCard(playerId, sourceId!, resolvedTargets, true);
       this.checkAutoPass(playerId);
       return success;
    }
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



  public setState(newState: GameState) {
    this.state = newState;
    // VERY IMPORTANT: Re-link resolver to the newest state reference
    this.resolver = new StackResolver(this.state);
  }
}
