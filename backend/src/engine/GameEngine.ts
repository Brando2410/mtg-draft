import { GameState, Phase, Step, PlayerId, Zone, GameObject, PlayerState } from '@shared/engine_types';
import { StackResolver } from './StackResolver';

export class GameEngine {
  private state: GameState;
  
  // Players ordered by turn order
  private playerOrder: PlayerId[];
  private resolver: StackResolver;

  constructor(players: PlayerId[]) {
    this.playerOrder = players;
    
    // Initialize the fundamental GameState according to the theoretical rules
    this.state = {
      players: {}, // We'll initialize these later
      
      activePlayerId: players[0],     // The first player starts
      priorityPlayerId: players[0],   // Active player gets priority first
      
      currentPhase: Phase.Beginning,
      currentStep: Step.Untap,
      turnNumber: 1,
      
      battlefield: [],
      exile: [],
      
      stack: [],
      
      consecutivePasses: 0,
    };
    
    this.initializePlayers(players);
    this.resolver = new StackResolver(this.state);
  }

  // Set up the isolated player zones and resources
  private initializePlayers(playerIds: PlayerId[]) {
    for (const id of playerIds) {
      this.state.players[id] = {
        id,
        life: 20, // Base life
        poisonCounters: 0,
        
        library: [], // Left empty for now.
        hand: [],
        graveyard: [],
        
        manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
        
        hasPlayedLandThisTurn: false,
        maxHandSize: 7 // Based on Hidden Zones (402)
      };
    }
  }

  public getState(): GameState {
    return this.state;
  }

  // --- Player Actions ---

  /**
   * Main entry point for a player attempting to play a card from their hand.
   */
  public playCard(playerId: PlayerId, cardInstanceId: string, declaredTargets: string[] = []): boolean {
    // 1. You must have priority to play a card/spell (Rule 117.1)
    if (this.state.priorityPlayerId !== playerId) {
      console.warn(`[GameEngine] Player ${playerId} tried to play a card without Priority.`);
      return false;
    }

    const player = this.state.players[playerId];
    const cardIndex = player.hand.findIndex((c: any) => c.id === cardInstanceId);
    if (cardIndex === -1) {
      console.warn(`[GameEngine] Card ${cardInstanceId} not found in player ${playerId}'s hand.`);
      return false;
    }
    
    const cardToPlay = player.hand[cardIndex];

    // 2. Determine Time/Type Restrictions
    const isInstantOrFlash = cardToPlay.definition.types.includes('Instant') || cardToPlay.definition.oracleText.includes('Flash'); // Simplified check
    const isLand = cardToPlay.definition.types.includes('Land');
    const isSorcerySpeed = !isInstantOrFlash && !isLand;

    // Sorcery-speed requirements: Must be Active Player, during Main Phase, and Stack must be empty
    if (isSorcerySpeed || isLand) {
      if (this.state.activePlayerId !== playerId) {
         console.warn(`[GameEngine] Sorcery/Land must be played on your own turn.`);
         return false;
      }
      if (this.state.currentPhase !== Phase.PreCombatMain && this.state.currentPhase !== Phase.PostCombatMain) {
         console.warn(`[GameEngine] Sorcery/Land must be played during a Main phase.`);
         return false;
      }
      if (this.state.stack.length > 0) {
         console.warn(`[GameEngine] Sorcery/Land cannot be played if the stack is not empty.`);
         return false;
      }
    }

    // 3. Special Land Handling (Lands don't use the stack! Rule 305.1)
    if (isLand) {
      if (player.hasPlayedLandThisTurn) {
         console.warn(`[GameEngine] Player ${playerId} has already played a land this turn.`);
         return false;
      }
      
      // Play the land
      player.hand.splice(cardIndex, 1);
      cardToPlay.zone = Zone.Battlefield;
      this.state.battlefield.push(cardToPlay);
      player.hasPlayedLandThisTurn = true;
      
      console.log(`[GameEngine] Player ${playerId} played land: ${cardToPlay.definition.name}`);
      
      // Playing a land doesn't consume priority or yield it implicitly, 
      // but SBA happens before any player would receive priority.
      this.checkStateBasedActions();
      return true;
    }

    // 4. Casting a Spell (Chapter 6)
    
    // (A) Check target legality/requirements before moving to stack
    // (stubbed target checking for now)

    // (B) Pay Costs (stubbed for now: assume player has mana or we automatically deduct)
    // this.deductMana(player, cardToPlay.definition.manaCost);
    
    // (C) Move from Hand to Stack
    player.hand.splice(cardIndex, 1);
    cardToPlay.zone = Zone.Stack;
    
    // Create the Stack Object representation
    this.state.stack.push({
      id: `spell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      controllerId: playerId,
      sourceId: cardToPlay.id,
      type: 'Spell',
      targets: declaredTargets
    });

    console.log(`[GameEngine] Player ${playerId} cast: ${cardToPlay.definition.name}. Placed on Stack.`);
    
    // Any time a spell is cast, priority passes are reset because the game state advanced
    this.state.consecutivePasses = 0;
    
    // Rule: The player who cast the spell implicitly retains priority, 
    // but in digital implementations they typically Auto-Pass unless they enter "Hold Priority" mode.
    // For this engine snippet, we'll auto-pass for flow:
    this.passPriority(playerId);

    return true;
  }

  // --- Core Loop Mechanics ---

  public passPriority(playerId: PlayerId) {
    // 1. Verify it's actually this player's turn to act
    if (this.state.priorityPlayerId !== playerId) {
      throw new Error(`Player ${playerId} does not have priority.`);
    }

    this.state.consecutivePasses++;

    // Check if everyone passed priority in succession without action
    if (this.state.consecutivePasses >= this.playerOrder.length) {
      this.resolveTopOrAdvanceStep();
    } else {
      // Pass to the next player in order
      this.givePriorityToNextPlayer();
    }
  }

  private resolveTopOrAdvanceStep() {
    // When all players pass in succession, either:
    // A) The top object on the Stack resolves.
    // B) If the Stack is empty, the Step or Phase ends and the game advances.
    
    if (this.state.stack.length > 0) {
      // Resolve the top spell/ability
      this.resolveTopStackObject();
    } else {
      // Advance to the next turn structural step
      this.advanceStep();
    }
  }

  private resolveTopStackObject() {
    // Basic LIFO Pop (Rule 608)
    const objectToResolve = this.state.stack.pop();
    if (!objectToResolve) return;

    console.log(`Resolving: ${objectToResolve.id}`);
    
    // In a fully integrated version, we fetch the card parser definition here.
    // We pass the parsed "effects" array to the resolver.
    // Temporarily using an empty array until the Card Loader is built.
    const effectsToApply: any[] = []; 
    
    this.resolver.resolveTarget(objectToResolve, effectsToApply);
    
    // After resolution, priority goes back to the Active Player
    this.resetPriorityToActivePlayer();
  }

  private advanceStep() {
    // Move to the next chronological step in the Turn Structure (500)
    const nextStep = this.calculateNextStep(this.state.currentPhase, this.state.currentStep);
    
    this.state.currentPhase = nextStep.phase;
    this.state.currentStep = nextStep.step;
    
    // Empty mana pool of ALL players when a step ends
    this.emptyAllManaPools();
    
    // Specific Step Rules (e.g. untap everyone during Untap step)
    this.handleStepEntryRules();
    
    // Finally, handle priority for the new step. 
    // Untap and Cleanup typically don't give priority naturally.
    if (this.state.currentStep === Step.Untap || this.state.currentStep === Step.Cleanup) {
      this.state.priorityPlayerId = null;
      // In a real engine, SBA and triggers could change this, but normally we immediately advance:
      // this.advanceStep(); // (skipping to Upkeep/End for this PoC skeleton)
    } else {
      this.resetPriorityToActivePlayer();
    }
  }

  private givePriorityToNextPlayer() {
    if (!this.state.priorityPlayerId) return;
    
    const currentIndex = this.playerOrder.indexOf(this.state.priorityPlayerId);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= this.playerOrder.length) {
      nextIndex = 0;
    }
    
    // Ensure State-Based Actions are checked RIGHT BEFORE a player gets priority (704.3)
    this.checkStateBasedActions();
    
    this.state.priorityPlayerId = this.playerOrder[nextIndex];
  }

  private resetPriorityToActivePlayer() {
    this.state.consecutivePasses = 0;
    
    // SBA Check before handling active player priority
    this.checkStateBasedActions();
    
    this.state.priorityPlayerId = this.state.activePlayerId;
  }

  private emptyAllManaPools() {
    for (const player of Object.values(this.state.players) as PlayerState[]) {
      player.manaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    }
  }

  // --- State-Based Actions Engine ---
  
  private checkStateBasedActions() {
    // 704: Sweeping mechanism that governs death, state anomalies, etc.
    let sbaPerformed = false;
    
    // Check Lethal Damage & 0 Toughness (704.5f / 704.5g)
    for (let i = this.state.battlefield.length - 1; i >= 0; i--) {
      const obj = this.state.battlefield[i];
      // Assume getToughness() wraps the base toughness + +1/-1 modifiers Layer
      // if (getToughness(obj) <= 0 || obj.damageMarked >= getToughness(obj)) {
      //   this.moveToGraveyard(obj);
      //   sbaPerformed = true;
      // }
    }
    
    // Check Game Over (0 Life or 10 poison) (704.5a / 704.5c)
    // for (const player of Object.values(this.state.players)) {
    //   if (player.life <= 0 || player.poisonCounters >= 10) {
    //     this.eliminatePlayer(player.id);
    //     sbaPerformed = true;
    //   }
    // }
    
    // Loop if an action was actually taken
    if (sbaPerformed) {
      this.checkStateBasedActions();
    }
  }

  private handleStepEntryRules() {
    // 502 Untap: Phasing, Untap everything that belongs to Active Player
    if (this.state.currentStep === Step.Untap) {
      // Untap all controlled permanents
    }
    // 504 Draw: Active Player is forced to draw 1 card
    else if (this.state.currentStep === Step.Draw) {
      // this.drawCard(this.state.activePlayerId);
    }
    // 514 Cleanup: Active Player discards down to max hand size, damage wears off
    else if (this.state.currentStep === Step.Cleanup) {
      // Remove all marked damage
      this.state.battlefield.forEach((obj: GameObject) => obj.damageMarked = 0);
    }
  }

  // Naive Next Step Calculator
  private calculateNextStep(phase: Phase, step: Step): { phase: Phase, step: Step } {
    const sequence = [
      { phase: Phase.Beginning, step: Step.Untap },
      { phase: Phase.Beginning, step: Step.Upkeep },
      { phase: Phase.Beginning, step: Step.Draw },
      { phase: Phase.PreCombatMain, step: Step.Main },
      { phase: Phase.Combat, step: Step.BeginningOfCombat },
      { phase: Phase.Combat, step: Step.DeclareAttackers },
      { phase: Phase.Combat, step: Step.DeclareBlockers },
      { phase: Phase.Combat, step: Step.CombatDamage },
      { phase: Phase.Combat, step: Step.EndOfCombat },
      { phase: Phase.PostCombatMain, step: Step.Main },
      { phase: Phase.Ending, step: Step.End },
      { phase: Phase.Ending, step: Step.Cleanup }
    ];
    
    const currentIndex = sequence.findIndex(s => s.phase === phase && s.step === step);
    if (currentIndex === sequence.length - 1) {
      // Turn over. AdvanceTurn logic here.
      return { phase: Phase.Beginning, step: Step.Untap }; // Assuming next turn
    }
    return sequence[currentIndex + 1];
  }
}
