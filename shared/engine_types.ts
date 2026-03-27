// engine_types.ts
// These interfaces represent the theoretical foundation of the MTG rules engine.

export enum Zone {
  Library = 'Library',
  Hand = 'Hand',
  Battlefield = 'Battlefield',
  Graveyard = 'Graveyard',
  Stack = 'Stack',
  Exile = 'Exile',
  Command = 'Command'
}

export enum Phase {
  Beginning = 'Beginning',
  PreCombatMain = 'PreCombatMain',
  Combat = 'Combat',
  PostCombatMain = 'PostCombatMain',
  Ending = 'Ending',
}

export enum Step {
  // Beginning Phase Steps
  Untap = 'Untap',
  Upkeep = 'Upkeep',
  Draw = 'Draw',
  
  // Main Phases don't have distinct steps inside them usually, just the 'Main' step
  Main = 'Main',

  // Combat Phase Steps
  BeginningOfCombat = 'BeginningOfCombat',
  DeclareAttackers = 'DeclareAttackers',
  DeclareBlockers = 'DeclareBlockers',
  CombatDamage = 'CombatDamage',
  EndOfCombat = 'EndOfCombat',

  // Ending Phase Steps
  End = 'End',
  Cleanup = 'Cleanup'
}

export type GameObjectId = string;
export type PlayerId = string;

// Static definition of a card. Decoupled from the instance state.
export interface CardDefinition {
  name: string;
  manaCost: string;
  colors: string[];
  supertypes: string[]; // e.g. "Legendary", "Basic", "Snow"
  types: string[];      // e.g. "Creature", "Instant", "Land"
  subtypes: string[];   // e.g. "Goblin", "Warrior", "Aura"
  power?: string;       // string to allow "*" or "1+*"
  toughness?: string;
  loyalty?: string;
  oracleText: string;
  image_url?: string;
  scryfall_id?: string;
}

// A physical/virtual object existing in a Zone.
// If it moves zones, a new GameObject is created (Rule 400.7).
export interface GameObject {
  id: GameObjectId;
  ownerId: PlayerId;
  controllerId: PlayerId;
  zone: Zone;
  
  // The base blueprint
  definition: CardDefinition;
  
  // Volatile state
  isTapped: boolean;
  damageMarked: number;
  summoningSickness: boolean;
  faceDown: boolean;
  
  // Modifiers (Layer system targets)
  counters: Record<string, number>;
}

// An object residing on the stack waiting to resolve
export interface StackObject {
  id: string;
  controllerId: PlayerId;
  sourceId: GameObjectId; 
  type: 'Spell' | 'ActivatedAbility' | 'TriggeredAbility' | 'SpecialAction';
  targets: GameObjectId[] | PlayerId[];
}

// Player's isolated state within a game
export interface PlayerState {
  id: PlayerId;
  life: number;
  poisonCounters: number;
  
  // Zones that belong to the player
  library: GameObject[];
  hand: GameObject[];
  graveyard: GameObject[];
  
  // Mana Pool resets every Step/Phase
  manaPool: {
    W: number;
    U: number;
    B: number;
    R: number;
    G: number;
    C: number; // Colorless
  };
  
  hasPlayedLandThisTurn: boolean;
  maxHandSize: number;
}

// The monolithic Game State representing the "Source of Truth"
export interface GameState {
  players: Record<PlayerId, PlayerState>;
  
  // Sequencing and Priority
  activePlayerId: PlayerId;      // Whose turn it is
  priorityPlayerId: PlayerId | null; // Who currently holds priority (null if resolving or in Untap/Cleanup)
  
  currentPhase: Phase;
  currentStep: Step;
  turnNumber: number;
  
  // Active Public Zones
  battlefield: GameObject[];
  exile: GameObject[];
  
  // The Stack
  stack: StackObject[];
  
  // Mechanic logic
  consecutivePasses: number; // To track when all players pass priority
}
