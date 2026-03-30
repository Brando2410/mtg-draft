import { GameState, Phase, Step, PlayerId, Zone, GameObject, PlayerState } from '@shared/engine_types';
import { Card } from '@shared/types';
import { StackResolver } from './StackResolver';
import { M21_LOGIC } from './data/m21_logic';
import { ManaProcessor } from './modules/magic/ManaProcessor';
import { GameSetupProcessor, PlayerActionProcessor, TurnProcessor, PriorityProcessor, ActionProcessor, StateBasedActionsProcessor, CombatProcessor, ValidationProcessor, TriggerProcessor, LayerProcessor } from './modules';

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
      consecutivePasses: 0,
      logs: ['Match Start Initialization...'],
      turnState: {
        permanentReturnedToHandThisTurn: false,
        noncombatDamageDealtToOpponents: 0,
        creaturesAttackedThisTurn: 0,
        lastDamageAmount: 0,
        lastLifeGainedAmount: 0,
        lastCardsDrawnAmount: 0
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
        tapForMana: (pId: string, cId: string) => this.tapForMana(pId, cId)
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
    
    // Track count for M21 logic (e.g. Basri Ket)
    this.state.turnState.creaturesAttackedThisTurn += (this.state.combat?.attackers || []).length;

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
       if (this.state.currentStep === Step.Cleanup) {
         this.advanceStep(); 
       } else {
         this.checkAutoPass(playerId);
       }
    }
    return res.success;
  }

  /**
   * CR 601: Casting Spells & CR 305: Playing Lands
   * @param declaredTargets Array of GameObject IDs for targeted spells
   */
  public playCard(playerId: PlayerId, cardInstanceId: string, declaredTargets: string[] = []): boolean {
    const activeId = String(this.state.activePlayerId).trim();
    const callerId = String(playerId).trim();
    const playerName = this.getPlayerName(playerId);

    // 1. Priority Error (Rule 117.1)
    if (this.state.priorityPlayerId !== playerId) {
      this.log(`${playerName} tried to act without priority.`);
      return false;
    }

    const player = this.state.players[playerId];
    if (player && player.pendingDiscardCount > 0) {
      this.log(`${playerName} must finish discarding before playing cards.`);
      return false;
    }

    const cardIndex = player.hand.findIndex((c: any) => c.id === cardInstanceId);
    if (cardIndex === -1) return false;
    
    const cardToPlay = player.hand[cardIndex];
    const typeLine = (cardToPlay.definition.type_line || '').toLowerCase();
    const isLand = typeLine.includes('land');
    const isInstantOrFlash = typeLine.includes('instant') || (cardToPlay.definition.oracleText || '').includes('Flash'); 
    
    // 2. Timing/Speed (Rule 305/307)
    if (!isInstantOrFlash) {
      if (activeId !== callerId || (this.state.currentPhase !== Phase.PreCombatMain && this.state.currentPhase !== Phase.PostCombatMain) || this.state.stack.length > 0) {
         this.log(`Illegal Play: Cannot cast sorcery speed spell/land right now.`);
         return false;
      }
    }

    // 3. Land Handling (Rule 305)
    if (isLand) {
      if (player.hasPlayedLandThisTurn) {
         this.log(`Illegal Play: Already played a land this turn.`);
         return false;
      }
      player.hand = player.hand.filter((c: any) => c.id !== cardInstanceId);
      cardToPlay.zone = Zone.Battlefield;
      this.state.battlefield = [...this.state.battlefield, cardToPlay];
      player.hasPlayedLandThisTurn = true;
      this.log(`${playerName} played Land: ${cardToPlay.definition.name}`);
      this.checkStateBasedActions();
      return true; // Return immediately: Playing a land is a special action (Rule 305.1)
    }

    // 4. UX IMPROVEMENT: Auto-tap lands if needed
    const cost = cardToPlay.definition.manaCost;
    if (!ManaProcessor.canPayManaCost(player, cost)) {
       // If player can pay total including untapped lands, auto-tap them
       if (ManaProcessor.canPayWithTotal(player, this.state.battlefield, cost)) {
          this.log(`Auto-tapping lands to pay ${cost}...`);
          // Note: In a complete engine, this would use a smart solver to pick colors optimally
          this.autoTapLandsForCost(playerId, cost);
       }
    }

    // 5. Mana Payment (Rule 601.2f)
    if (!ManaProcessor.canPayManaCost(player, cost)) {
      this.log(`Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Cost: ${cost})`);
      return false;
    }
    this.log(`${playerName} paying ${cost}...`);
    ManaProcessor.deductManaCost(player, cost);

    // 5. Stack Placement (Rule 601.2i)
    player.hand = player.hand.filter((c: any) => c.id !== cardInstanceId);
    cardToPlay.zone = Zone.Stack;
    const stackId = `spell_${Date.now()}`;
    const stackObj = {
      id: stackId,
      controllerId: playerId,
      sourceId: cardToPlay.id,
      type: 'Spell' as const,
      targets: declaredTargets || [],
      card: cardToPlay 
    };
    this.state.stack.push(stackObj);

    // Rule 601.2c: Choose targets if needed
    const logic = M21_LOGIC[cardToPlay.definition.name];
    const targetDefinition = (logic as any)?.targetDefinition || logic?.abilities?.find(a => a.type === 'Spell')?.targetDefinition;
    if (targetDefinition && (!declaredTargets || declaredTargets.length === 0)) {
       this.state.pendingAction = {
          type: 'TARGETING',
          playerId: playerId,
          sourceId: cardToPlay.id,
          data: {
              stackId: stackId,
              targetDefinition
          }
       };
       this.log(`[TARGETING] Player ${playerId} must choose targets for ${cardToPlay.definition.name}.`);
       return true;
    }

    this.log(`${playerName} cast: ${cardToPlay.definition.name}`);
    this.state.consecutivePasses = 0;
    this.passPriority(playerId);
    return true;
  }

  /**
   * CR 602: Activating Activated Abilities
   * @param abilityIndex The index of the ability in the card's M21_LOGIC entry
   */
  public activateAbility(playerId: PlayerId, cardId: string, abilityIndex: number, declaredTargets: string[] = []): boolean {
    const playerName = this.getPlayerName(playerId);
    if (this.state.priorityPlayerId !== playerId) {
      this.log(`${playerName} tried to activate ability without priority.`);
      return false;
    }

    const obj = this.state.battlefield.find(o => o.id === cardId);
    if (!obj) return false;

    // Load full logic from registry
    const { M21_LOGIC } = require('./data/m21_logic');
    const cardLogic = M21_LOGIC[obj.definition.name];
    if (!cardLogic || !cardLogic.abilities[abilityIndex]) return false;

    const ability = cardLogic.abilities[abilityIndex];
    if (ability.type !== 'Activated') return false;

    // 1. Timing & Frequency (Rule 606.3: Planeswalkers)
    const isPlaneswalker = obj.definition.types.includes('Planeswalker');
    if (isPlaneswalker) {
      const activeId = String(this.state.activePlayerId).trim();
      const isMainPhase = (this.state.currentPhase === Phase.PreCombatMain || this.state.currentPhase === Phase.PostCombatMain);
      const stackEmpty = this.state.stack.length === 0;

      const canActivateAnyTime = (cardLogic.abilities || []).some((a: any) => a.type === 'Static' && a.id.includes('any_turn'));
      const isSorcerySpeed = playerId === activeId && isMainPhase && stackEmpty;

      if (!canActivateAnyTime && !isSorcerySpeed) {
        this.log(`Illegal Activation: Planeswalker abilities can only be activated at sorcery speed.`);
        return false;
      }

      if (obj.abilitiesUsedThisTurn > 0) {
        this.log(`Illegal Activation: This permanent's activated abilities have already been used this turn.`);
        return false;
      }
    }

    // 2. Cost Payment
    const player = this.state.players[playerId];
    for (const cost of (ability.costs || [])) {
      if (cost.type === 'Loyalty') {
        const val = parseInt(cost.value); // e.g. "+1" or "-2"
        const currentLoyalty = obj.counters.loyalty || 0;
        if (val < 0 && currentLoyalty < Math.abs(val)) {
          this.log(`Illegal Activation: Not enough loyalty counters.`);
          return false;
        }
        obj.counters.loyalty = currentLoyalty + val;
        this.log(`${obj.definition.name} loyalty: ${currentLoyalty} -> ${obj.counters.loyalty}`);
      }
      else if (cost.type === 'Mana') {
        if (!ManaProcessor.canPayManaCost(player, cost.value)) {
          this.log(`Illegal Activation: Not enough mana.`);
          return false;
        }
        ManaProcessor.deductManaCost(player, cost.value);
      }
      else if (cost.type === 'Tap') {
        if (obj.isTapped) return false;
        obj.isTapped = true;
      }
    }

    // 3. Mark usage
    obj.abilitiesUsedThisTurn++;

    const stackId = `ability_${Date.now()}`;
    // 4. Put on stack
    this.state.stack.push({
      id: stackId,
      controllerId: playerId,
      sourceId: obj.id,
      type: 'ActivatedAbility',
      targets: declaredTargets || [],
      abilityIndex: abilityIndex,
      data: {
        effects: ability.effects || [],
        targetDefinition: ability.targetDefinition
      }
    });

    // Rule 601.2c: Choose targets if needed
    if (ability.targetDefinition && declaredTargets === undefined) {
       this.state.pendingAction = {
          type: 'TARGETING',
          playerId: playerId,
          sourceId: obj.id,
          data: {
              stackId: stackId, // NEW: Include stackId
              abilityIndex: abilityIndex,
              targetDefinition: ability.targetDefinition
          }
       };
       this.log(`[TARGETING] Player ${playerId} must choose targets for ${obj.definition.name}'s ability.`);
       return true;
    }

    this.log(`${playerName} activated ability of ${obj.definition.name}: ${ability.id}`);
    this.state.consecutivePasses = 0;
    this.passPriority(playerId);
    return true;
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

    if (this.state.priorityPlayerId !== playerId) return;
    
    // CR 117.1: A player must resolve pending mandatory actions before passing
    if (this.state.pendingAction && String(this.state.pendingAction.playerId) === String(playerId)) {
      this.log(`Invalid Action: Player must resolve pending ${this.state.pendingAction.type} first.`);
      return;
    }

    const player = this.state.players[playerId];
    if (player && player.pendingDiscardCount > 0) {
      if (!isAuto) this.log(`${this.getPlayerName(playerId)} must finish discarding first.`);
      return;
    }

    this.state.consecutivePasses++;
    
    // Rule 117.4: User experience for auto-pass
    const prefix = isAuto ? '[Auto] ' : '';
    this.log(`${prefix}${this.getPlayerName(playerId)} passed priority.`);

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
        let effects: any[] = [];
        
        if (objectToResolve.type === 'Spell' && objectToResolve.card) {
          effects = (objectToResolve.card.definition as any).effects || [];
        } 
        else if (objectToResolve.type === 'ActivatedAbility' || objectToResolve.type === 'TriggeredAbility') {
          // Rule 603/606: Abilities pull effects from their data object if available
          effects = (objectToResolve.data as any)?.effects || [];
          
          // Fallback for legacy activations if data.effects is missing
          if (effects.length === 0 && objectToResolve.type === 'ActivatedAbility') {
              const sourceObj = this.state.battlefield.find(o => o.id === objectToResolve.sourceId);
              if (sourceObj) {
                const cardLogic = M21_LOGIC[sourceObj.definition.name];
                if (cardLogic && cardLogic.abilities[objectToResolve.abilityIndex ?? -1]) {
                    effects = cardLogic.abilities[objectToResolve.abilityIndex!].effects;
                }
              }
          }
        }

        this.resolver.resolveTarget(objectToResolve, effects);
        this.resetPriorityToActivePlayer();
      }
    } else {
      this.advanceStep();
    }
  }

  private advanceStep() {
    const prevPhase = this.state.currentPhase;
    const prevStep = this.state.currentStep;

    let next = TurnProcessor.calculateNextStep(this.state.currentPhase, this.state.currentStep);
    this.log(`[FLOW] Calculating move from ${prevPhase}/${prevStep} to ${next.phase}/${next.step} (turnEnded: ${next.turnEnded})`);
    
    // 1. Skip Combat Phase if no potential attackers
    if (next.phase === Phase.Combat && next.step === Step.BeginningOfCombat && !TurnProcessor.hasPotentialAttackers(this.state, this.state.activePlayerId)) {
      this.log(`[BYPASS] skipping Combat - No attackers found for active player.`);
      next = { phase: Phase.PostCombatMain, step: Step.Main, turnEnded: false };
    }

    // 2. Skip Declare Blockers if no potential blockers
    if (next.step === Step.DeclareBlockers) {
      const defenderId = Object.keys(this.state.players).find(id => id !== this.state.activePlayerId);
      const attackerCount = (this.state.combat?.attackers || []).length;
      
      this.log(`[CHECK] Entering Blockers. Attackers: ${attackerCount}. Defender: ${defenderId}`);
      
      if (attackerCount === 0) {
        this.log(`[BYPASS] No attackers declared. Skipping Blockers and Damage.`);
        next = { phase: Phase.Combat, step: Step.EndOfCombat, turnEnded: false };
      }
      else if (defenderId && !TurnProcessor.hasPotentialBlockers(this.state, defenderId)) {
        this.log(`[BYPASS] Defender has no creatures to block with. Skipping to Damage.`);
        next = { phase: Phase.Combat, step: Step.CombatDamage, turnEnded: false };
      }
    }

    // 3. Skip First Strike Damage if no First Strike scorers
    if (next.step === Step.FirstStrikeDamage) {
        if (!CombatProcessor.hasFirstStrikeStep(this.state)) {
            this.log(`[BYPASS] No First Strike / Double Strike creatures. Skipping FS Damage.`);
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
    this.log(`[FLOW] Phase Transition: ${prevStep} -> ${this.state.currentStep}`);

    this.emptyAllManaPools();
    this.handleStepEntryRules();
    
    // Rule: If an action is required (Combat/Cleanup), STOP and wait.
    if (this.state.pendingAction) {
       this.log(`[FLOW] Pausing for Pending Action: ${this.state.pendingAction.type} for player ${this.state.pendingAction.playerId}`);
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
        lastCardsDrawnAmount: 0
    };
  }

  private givePriorityToNextPlayer() {
    if (!this.state.priorityPlayerId) return;
    const currentIndex = this.playerOrder.indexOf(this.state.priorityPlayerId);
    const nextIndex = (currentIndex + 1) % this.playerOrder.length;
    this.checkStateBasedActions();
    this.state.priorityPlayerId = this.playerOrder[nextIndex];
    
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
    const player = this.state.players[playerId];
    // Rule 117.1: If player has no actions and NO full control, auto-pass
    if (player && !player.fullControl && !this.canPlayerTakeAnyAction(playerId)) {
      this.passPriority(playerId, true);
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
      if (player && player.hand.length > 7) {
        player.pendingDiscardCount = player.hand.length - 7;
        this.state.pendingAction = { 
          type: 'DISCARD', 
          playerId: activeId, 
          count: player.pendingDiscardCount 
        };
        this.log(`${player.name} must discard ${player.pendingDiscardCount} card(s) to reach hand size.`);
      }
      
      // Rule 514.2: Remove all damage and cleanup continuous effects
      this.state.battlefield.forEach(obj => obj.damageMarked = 0);
      
      // MTG Arena "Whiteboard Cleanup"
      this.state.ruleRegistry.continuousEffects = this.state.ruleRegistry.continuousEffects.filter(
        e => e.duration.type !== 'UntilEndOfTurn'
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
    // Before returning, refresh all effective stats and playable flags for UI
    this.state.battlefield.forEach(obj => {
        const stats = LayerProcessor.getEffectiveStats(obj, this.state);
        obj.effectiveStats = {
            ...stats,
            isPlayable: this.state.priorityPlayerId === obj.controllerId && PriorityProcessor.canObjectBePlayed(this.state, obj.controllerId, obj.id)
        };
    });

    Object.values(this.state.players).forEach(player => {
        player.hand.forEach(card => {
            card.effectiveStats = {
                power: parseInt(card.definition.power || '0') || 0,
                toughness: parseInt(card.definition.toughness || '0') || 0,
                keywords: card.definition.keywords || [],
                isPlayable: this.state.priorityPlayerId === player.id && PriorityProcessor.canObjectBePlayed(this.state, player.id, card.id)
            };
        });
    });

    return this.state;
  }

  public resolveCombatOrdering(playerId: string, order: string[]): boolean {
    PlayerActionProcessor.resolveCombatOrdering(this.state, playerId, order, (m) => this.log(m));
    
    // Once ordering is complete (and no more pending actions exist), give priority back to AP.
    this.resetPriorityToActivePlayer();
    return true;
  }

  public resolveChoice(playerId: string, choiceIndex: number): boolean {
    if (this.state.pendingAction?.type !== 'CHOICE' || this.state.pendingAction.playerId !== playerId) return false;

    const sourceId = this.state.pendingAction.sourceId;
    const choice = this.state.pendingAction.data?.choices[choiceIndex];
    
    if (!choice || !sourceId) return false;

    // Resolve based on context
    const obj = this.state.battlefield.find(o => o.id === sourceId);
    if (obj && obj.definition.types.includes('Planeswalker')) {
      const abilityIndex = choice.value;
      const ability = M21_LOGIC[obj.definition.name].abilities[abilityIndex];

      if (ability.targetDefinition) {
         // Switch to targeting mode
         const targetDef = ability.targetDefinition;
         const legalTargetIds = this.state.battlefield
            .filter(o => ValidationProcessor.isLegalTarget(this.state, sourceId, o.id, targetDef))
            .map(o => o.id);
            
         if (legalTargetIds.length === 0) {
             if (targetDef.optional) {
                 this.log(`No legal targets found, auto-skipping target selection for ${obj.definition.name}.`);
                 this.state.pendingAction = undefined;
                 this.resetPriorityToActivePlayer(); 
                 return this.activateAbility(playerId, sourceId, abilityIndex, []);
             } else {
                 this.log(`No legal targets available. Activation invalid.`);
                 // Note: we'd normally refund costs here. Simplification: just block it.
                 return false;
             }
         }
         
         this.state.pendingAction = {
            type: 'TARGETING',
            playerId,
            sourceId,
            data: { abilityIndex, legalTargetIds, optional: targetDef.optional }
         };
         this.log(`Select target for ${obj.definition.name}'s ability.`);
         return true;
      }

      this.state.pendingAction = undefined;
      this.resetPriorityToActivePlayer(); 
      return this.activateAbility(playerId, sourceId, abilityIndex);
    }

    this.state.pendingAction = undefined;
    this.resetPriorityToActivePlayer();
    return true;
  }

  public resolveTargeting(playerId: PlayerId, targetId: string): boolean {
    if (this.state.pendingAction?.type !== 'TARGETING' || this.state.pendingAction.playerId !== playerId) return false;

    const actionData = this.state.pendingAction.data;
    const isOptional = actionData?.optional;
    const isSkipping = targetId === 'skip' || targetId === 'none';
    const targetDef = actionData?.targetDefinition;
    const targetCount = targetDef?.count || 1;
    
    // Initialize or get currently selected targets
    actionData.selectedTargets = actionData.selectedTargets || [];

    if (isSkipping) {
        if (!isOptional && actionData.selectedTargets.length === 0) {
            this.log(`Targeting is required, cannot skip.`);
            return false;
        }
        // Resolve with whatever we have
        return this.finaliseTargeting(playerId, actionData.selectedTargets);
    }

    const legalTargetIds = actionData.legalTargetIds || [];
    if (!legalTargetIds.includes(targetId)) {
        this.log(`Invalid target selected.`);
        return false;
    }

    if (actionData.selectedTargets.includes(targetId)) {
        this.log(`Target already selected.`);
        return false;
    }

    // Add target
    actionData.selectedTargets.push(targetId);
    this.log(`Target ${actionData.selectedTargets.length}/${targetCount} selected: ${targetId}`);

    // If we reached the target count, finalize
    if (actionData.selectedTargets.length >= targetCount) {
        return this.finaliseTargeting(playerId, actionData.selectedTargets);
    }

    // Otherwise, stay in targeting mode for the next target
    return true;
  }

  private finaliseTargeting(playerId: PlayerId, resolvedTargets: string[]): boolean {
    const actionData = this.state.pendingAction?.data;
    const sourceId = this.state.pendingAction?.sourceId;
    const abilityIndex = actionData?.abilityIndex;
    const stackId = actionData?.stackId;

    if (stackId) {
       const stackObj = this.state.stack.find(s => s.id === stackId);
       if (stackObj) {
          stackObj.targets = resolvedTargets;
          this.log(`Finalized targets for ${stackObj.type}: ${resolvedTargets.length} targets chosen.`);
       }
       this.state.pendingAction = undefined;
       this.resetPriorityToActivePlayer();
       return true;
    }

    if (abilityIndex !== undefined) {
       this.state.pendingAction = undefined;
       this.resetPriorityToActivePlayer();
       return this.activateAbility(playerId, sourceId!, abilityIndex, resolvedTargets);
    } else {
       this.state.pendingAction = undefined;
       this.resetPriorityToActivePlayer();
       return this.playCard(playerId, sourceId!, resolvedTargets);
    }
  }

  private cleanupEndOfTurn() {
    this.log(`[CLEANUP] Removing 'Until End of Turn' effects and resetting markers.`);
    
    // 1. Remove floating continuous effects (Rule 614)
    this.state.ruleRegistry.continuousEffects = this.state.ruleRegistry.continuousEffects.filter(eff => {
       return eff.duration?.type !== 'UntilEndOfTurn';
    });

    // 2. Clear damage markers and deathtouch flags (Rule 514.2)
    this.state.battlefield.forEach(obj => {
       obj.damageMarked = 0;
       obj.deathtouchMarked = false;
       obj.abilitiesUsedThisTurn = 0;
    });
  }

  private autoTapLandsForCost(playerId: PlayerId, costStr: string) {
    const player = this.state.players[playerId];
    const requirements = ManaProcessor.parseManaCost(costStr);
    
    // Sort requirements to handle COLORED mana first, GENERIC last
    // This prevents a Swamp being used for {1} when we still need {B}{B}
    const requirementsArray: (keyof typeof player.manaPool)[] = [];
    Object.entries(requirements.colored).forEach(([c, amt]) => {
       for(let i=0; i<amt; i++) requirementsArray.push(c as any);
    });
    // Add generic last
    for(let i=0; i<requirements.generic; i++) requirementsArray.push('C');

    // 1. First, satisfy colored requirements
    for (const req of requirementsArray) {
       if (req === 'C') continue; // Skip generic for phase 1

       // Do we already have this specific colored mana floating?
       const poolVal = player.manaPool[req] || 0;
       
       // Note: We need a temporary 'used' tracker if we were doing this perfectly,
       // but for simplicity, we check if we can skip tapping a land.
       if (poolVal > 0) {
          // Check if we need more than we have floating (simple greedy)
          // (Deducting from temporary pool would be better here)
       }

       // Find a land that EXACTLY produces this color
       const landToTap = this.state.battlefield.find(obj => {
          if (obj.controllerId !== playerId || obj.isTapped || !obj.definition.types.includes('Land')) return false;
          const name = obj.definition.name.toLowerCase();
          if (req === 'W' && name.includes('plains')) return true;
          if (req === 'U' && name.includes('island')) return true;
          if (req === 'B' && name.includes('swamp')) return true;
          if (req === 'R' && name.includes('mountain')) return true;
          if (req === 'G' && name.includes('forest')) return true;
          return false;
       });

       if (landToTap) {
          this.tapForMana(playerId, landToTap.id);
       }
    }

    // 2. Then, satisfy generic requirement using ANY remaining untapped lands
    // (Preferring basic lands that don't match the colors we might need later is complex,
    // so we just take any untapped land left.)
    for (let i = 0; i < requirements.generic; i++) {
        // Find pool mana first... (skipped for brevity)
        const landToTap = this.state.battlefield.find(obj => {
           return obj.controllerId === playerId && !obj.isTapped && obj.definition.types.includes('Land');
        });
        if (landToTap) {
           this.tapForMana(playerId, landToTap.id);
        }
    }
  }

  public setState(newState: GameState) {
    this.state = newState;
    // VERY IMPORTANT: Re-link resolver to the newest state reference
    this.resolver = new StackResolver(this.state);
  }
}
