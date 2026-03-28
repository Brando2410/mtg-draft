import { GameState, Phase, Step, PlayerId, Zone, GameObject, PlayerState } from '@shared/engine_types';
import { Card } from '@shared/types';
import { StackResolver } from './StackResolver';
import { ManaProcessor } from './modules/ManaProcessor';
import { TurnProcessor } from './modules/TurnProcessor';
import { PriorityProcessor } from './modules/PriorityProcessor';
import { ActionProcessor } from './modules/ActionProcessor';
import { StateBasedActionsProcessor } from './modules/StateBasedActionsProcessor';
import { CombatProcessor } from './modules/CombatProcessor';

/**
 * Centrailized Engine Coordinator (Chapters 1 & 11)
 * Rules references are kept for each functional block to ensure manual compliance.
 */
export class GameEngine {
  private state: GameState;
  private playerOrder: PlayerId[];
  private resolver: StackResolver;
  private decks: Record<string, Card[]>;
  private names: Record<string, string>;

  constructor(players: PlayerId[], decks: Record<string, Card[]> = {}, names: Record<string, string> = {}) {
    this.playerOrder = players;
    this.decks = decks;
    this.names = names;
    
    // Initialize the fundamental GameState (Rule 100)
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
      consecutivePasses: 0,
      logs: ['Match Start Initialization...'],
    };
    
    this.initializePlayers(players);
    this.resolver = new StackResolver(this.state);
  }

  private log(message: string) {
    const formattedMessage = `> ${message}`;
    const newLogs = [...(this.state.logs || []), formattedMessage];
    this.state.logs = newLogs.slice(-40); 
    console.log(`[GameEngine] ${message}`);
  }

  private getPlayerName(id: PlayerId): string {
    return this.state.players[id]?.name || this.names?.[id] || id;
  }

  // --- Initialization (Rule 103) ---

  private initializePlayers(playerIds: PlayerId[]) {
    for (const id of playerIds) {
      this.state.players[id] = {
        id,
        name: this.names[id] || `Player ${id.slice(0, 4)}`,
        life: 20, 
        poisonCounters: 0,
        library: (this.decks[id] || []).map((cardRef, index) => this.createGameObject(id, cardRef, index)),
        hand: [],
        graveyard: [],
        manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
        hasPlayedLandThisTurn: false,
        fullControl: false,
        maxHandSize: 7,
        pendingDiscardCount: 0
      };
    }
  }

  private createGameObject(ownerId: PlayerId, cardRef: Card, index: number): GameObject {
    const typeLine = cardRef.type_line || '';
    return {
      id: `${ownerId}-lib-${index}`,
      ownerId,
      controllerId: ownerId,
      zone: Zone.Library,
      definition: {
        name: cardRef.name || 'Unknown Card',
        manaCost: cardRef.mana_cost || '',
        colors: cardRef.card_colors || [],
        supertypes: [], 
        types: typeLine.split(/[-—]/)[0].trim().split(/\s+/).filter(Boolean),
        subtypes: typeLine.includes('—') ? typeLine.split(/[-—]/)[1].trim().split(/\s+/).filter(Boolean) : [],
        oracleText: cardRef.oracle_text || '',
        type_line: typeLine,
        image_url: cardRef.image_url || cardRef.image_uris?.normal || cardRef.image_uris?.large,
        scryfall_id: (cardRef as any).scryfall_id,
        power: (cardRef as any).power,
        toughness: (cardRef as any).toughness
      },
      isTapped: false,
      damageMarked: 0,
      summoningSickness: false,
      faceDown: false,
      counters: {}
    };
  }

  public startGame() {
    for (const playerId of this.playerOrder) {
      this.shuffleLibrary(playerId); 
      for (let i = 0; i < 7; i++) {
        this.drawCard(playerId);
      }
    }
    this.resetPriorityToActivePlayer();
  }

  public shuffleLibrary(playerId: PlayerId) {
    const player = this.state.players[playerId];
    if (!player) return;
    this.log(`Shuffling library for: ${player.name}`);
    for (let i = player.library.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [player.library[i], player.library[j]] = [player.library[j], player.library[i]];
    }
  }

  public drawCard(playerId: PlayerId): boolean {
    const player = this.state.players[playerId];
    if (!player || player.library.length === 0) return false;
    const card = player.library.pop();
    if (card) {
      card.zone = Zone.Hand;
      player.hand.push(card);
      // Log for transparency
      this.log(`${player.name} draws a card.`);
      return true;
    }
    return false;
  }

  // --- Player Actions (Rule 117) ---

  public tapForMana(playerId: PlayerId, cardId: string): boolean {
    // 1. Context Switch: Attacking or Blocking
    if (this.state.pendingAction?.playerId === playerId) {
      if (this.state.pendingAction.type === 'DECLARE_ATTACKERS') {
        return this.declareAttacker(playerId, cardId);
      }
      if (this.state.pendingAction.type === 'DECLARE_BLOCKERS') {
        return this.handleBlockSelection(playerId, cardId);
      }
    }

    // 2. Default: Priority Check for Mana
    if (!this.canPlayerTakeAnyAction(playerId)) {
      this.log(`Action error: ${this.getPlayerName(playerId)} tried to tap for mana without priority.`);
      return false;
    }

    const card = this.state.battlefield.find(c => c.id === cardId);
    if (!card || card.controllerId !== playerId) return false;

    const typeLine = (card.definition.type_line || '').toLowerCase();
    if (!typeLine.includes('land')) return false;

    const player = this.state.players[playerId];
    const name = card.definition.name.toLowerCase();
    
    // Determine produced color
    let color: keyof typeof player.manaPool = 'C';
    if (name.includes('plains')) color = 'W';
    else if (name.includes('island')) color = 'U';
    else if (name.includes('swamp')) color = 'B';
    else if (name.includes('mountain')) color = 'R';
    else if (name.includes('forest')) color = 'G';

    if (card.isTapped) {
      // UNDO Action: Only if mana is still in pool
      if (player.manaPool[color] > 0) {
        card.isTapped = false;
        player.manaPool[color]--;
        this.log(`${player.name} untapping ${card.definition.name} (Undo Mana {${color}})`);
        return true;
      } else {
        this.log(`Cannot undo: Mana {${color}} already spent.`);
        return false;
      }
    } else {
      // TAP Action
      card.isTapped = true;
      player.manaPool[color]++;
      this.log(`${player.name} tapped ${card.definition.name} for {${color}}`);
      return true;
    }
  }

  private declareAttacker(playerId: string, cardId: string): boolean {
    const card = this.state.battlefield.find(c => c.id === cardId);
    if (!card || card.controllerId !== playerId || card.zone !== Zone.Battlefield) return false;
    
    // 508.1a: Check if it's a creature
    const typeLine = (card.definition.type_line || '').toLowerCase();
    if (!typeLine.includes('creature')) return false;

    // 508.1a: Summoning Sickness
    if (card.summoningSickness && !(card.definition.oracleText || '').toLowerCase().includes('haste')) {
       this.log(`${card.definition.name} has summoning sickness.`);
       return false;
    }

    if (!this.state.combat) this.state.combat = { attackers: [], blockers: [] };

    const existingIndex = this.state.combat.attackers.findIndex(a => a.attackerId === cardId);
    if (existingIndex >= 0) {
       this.state.combat.attackers.splice(existingIndex, 1);
       card.isTapped = false;
       this.log(`${card.definition.name} removed from attackers.`);
    } else {
       if (card.isTapped) return false;
       const opponentId = Object.keys(this.state.players).find(id => id !== playerId);
       this.state.combat.attackers.push({ attackerId: cardId, targetId: opponentId! });
       card.isTapped = true;
       this.log(`${card.definition.name} assigned as attacker.`);
    }
    return true;
  }

  public confirmAttackers(playerId: string) {
    if (this.state.pendingAction?.type !== 'DECLARE_ATTACKERS' || this.state.pendingAction.playerId !== playerId) return;
    
    this.log(`${this.getPlayerName(playerId)} confirmed attackers.`);
    this.state.pendingAction = undefined;
    this.advanceStep(); // Moves to 508.2 priority window
  }

  private handleBlockSelection(playerId: string, cardId: string): boolean {
    const card = this.state.battlefield.find(c => c.id === cardId);
    if (!card) {
      this.log(`[BLOCK] ERR: Card ${cardId} not found on battlefield.`);
      return false;
    }

    this.log(`[BLOCK] Interaction: ${card.definition.name} (${cardId}). Blocker in hand? ${this.state.pendingAction?.sourceId}`);

    // A. SELECTION: My creature (the blocker)
    if (card.controllerId === playerId) {
      if (card.isTapped) {
        this.log(`[BLOCK] ERR: ${card.definition.name} is tapped and cannot block.`);
        return false;
      }
      this.state.pendingAction!.sourceId = cardId;
      this.log(`Selected ${card.definition.name} to block. Now select an attacking creature.`);
      return true;
    }

    // B. TARGETING: Opponent attacker
    const blockerId = this.state.pendingAction!.sourceId;
    if (!blockerId) {
      this.log("[BLOCK] Choose one of your potential blockers first.");
      return false;
    }

    const attackers = this.state.combat?.attackers || [];
    const isAttacking = attackers.some(a => a.attackerId === cardId);
    
    this.log(`[BLOCK] Checking if ${card.definition.name} is attacking. List: ${attackers.map(a => a.attackerId).join(',')} | Result: ${isAttacking}`);

    if (!isAttacking) {
      this.log(`[BLOCK] ERR: ${card.definition.name} is not an attacking creature.`);
      return false;
    }

    if (!this.state.combat) this.state.combat = { attackers: [], blockers: [] };

    // Update blocker link (Rule: only 1 attacker blocked per creature normally)
    const oldIdx = this.state.combat.blockers.findIndex(b => b.blockerId === blockerId);
    if (oldIdx >= 0) this.state.combat.blockers.splice(oldIdx, 1);

    this.state.combat.blockers.push({ blockerId, attackerId: cardId });
    this.log(`${this.state.battlefield.find(c => c.id === blockerId)?.definition.name} blocking ${card.definition.name}`);
    
    // Clear selection for next block
    this.state.pendingAction!.sourceId = undefined;
    return true;
  }

  public confirmBlockers(playerId: string) {
    if (this.state.pendingAction?.type !== 'DECLARE_BLOCKERS' || this.state.pendingAction.playerId !== playerId) return;
    
    this.log(`${this.getPlayerName(playerId)} confirmed blockers.`);
    this.state.pendingAction = undefined;
    this.advanceStep();
  }

  /**
   * MANUAL DISCARD ACTION (e.g. for Cleanup phase or spells)
   */
  public discardCard(playerId: PlayerId, cardInstanceId: string): boolean {
    const player = this.state.players[playerId];
    if (!player) return false;

    const cardIndex = player.hand.findIndex(c => c.id === cardInstanceId);
    if (cardIndex === -1) return false;

    const card = player.hand.splice(cardIndex, 1)[0];
    card.zone = Zone.Graveyard;
    player.graveyard.push(card);
    
    if (player.pendingDiscardCount > 0) {
      player.pendingDiscardCount--;
      this.log(`${player.name} discarded ${card.definition.name} (${player.pendingDiscardCount} more to go).`);
      
      // If we finished discarding, resume logic
      if (player.pendingDiscardCount === 0) {
        this.log(`${player.name} finished discarding.`);
        this.state.pendingAction = undefined; 

        if (this.state.currentStep === Step.Cleanup) {
          this.advanceStep(); 
        } else {
          this.checkAutoPass(playerId);
        }
      }
    } else {
      this.log(`${player.name} discarded ${card.definition.name}.`);
    }

    return true;
  }

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

    // 4. Mana Payment (Rule 601.2f)
    const cost = cardToPlay.definition.manaCost;
    if (!ManaProcessor.canPayManaCost(player, cost)) {
      this.log(`Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Cost: ${cost})`);
      return false;
    }
    this.log(`${playerName} paying ${cost}...`);
    ManaProcessor.deductManaCost(player, cost);

    // 5. Stack Placement (Rule 601.2i)
    player.hand = player.hand.filter((c: any) => c.id !== cardInstanceId);
    cardToPlay.zone = Zone.Stack;
    this.state.stack = [...this.state.stack, {
      id: `spell_${Date.now()}`,
      controllerId: playerId,
      sourceId: cardToPlay.id,
      type: 'Spell',
      targets: declaredTargets,
      card: cardToPlay 
    }];

    this.log(`${playerName} cast: ${cardToPlay.definition.name}`);
    this.state.consecutivePasses = 0;
    this.passPriority(playerId);
    return true;
  }

  // --- Core Mechanics (Rule 117.4) ---

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
        this.resolver.resolveTarget(objectToResolve, []);
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

    if (next.turnEnded) {
      this.log(`[FLOW] Turn is ending on request: ${next.phase}/${next.step}`);
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
    this.state.priorityPlayerId = this.state.activePlayerId;
    
    this.checkAutoPass(this.state.priorityPlayerId);
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
    StateBasedActionsProcessor.checkAndApply(this.state, (msg) => this.log(msg));
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
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public setState(newState: GameState) {
    this.state = newState;
    // VERY IMPORTANT: Re-link resolver to the newest state reference
    this.resolver = new StackResolver(this.state);
  }
}
