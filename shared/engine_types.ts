// engine_types.ts
// These interfaces represent the theoretical foundation of the MTG rules engine.

export const Zone = {
  Library: 'Library',
  Hand: 'Hand',
  Battlefield: 'Battlefield',
  Graveyard: 'Graveyard',
  Stack: 'Stack',
  Exile: 'Exile',
  Command: 'Command'
} as const;
export type Zone = (typeof Zone)[keyof typeof Zone];

export const Phase = {
  Beginning: 'Beginning',
  PreCombatMain: 'PreCombatMain',
  Combat: 'Combat',
  PostCombatMain: 'PostCombatMain',
  Ending: 'Ending',
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];

export const Step = {
  // Beginning Phase Steps
  Untap: 'Untap',
  Upkeep: 'Upkeep',
  Draw: 'Draw',
  
  // Main Phases don't have distinct steps inside them usually, just the 'Main' step
  Main: 'Main',

  // Combat Phase Steps
  BeginningOfCombat: 'BeginningOfCombat',
  DeclareAttackers: 'DeclareAttackers',
  DeclareBlockers: 'DeclareBlockers',
  FirstStrikeDamage: 'FirstStrikeDamage',
  CombatDamage: 'CombatDamage',
  EndOfCombat: 'EndOfCombat',

  // Ending Phase Steps
  End: 'End',
  Cleanup: 'Cleanup'
} as const;
export type Step = (typeof Step)[keyof typeof Step];

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
  keywords: string[];   // Static keywords: ["Flying", "Trample", "Haste"]
  loyalty?: string;
  oracleText: string;
  type_line?: string;
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
  abilitiesUsedThisTurn: number;
  faceDown: boolean;
  keywords: string[]; // Dynamic keywords gained (e.g. from an Aura or equipment)
  deathtouchMarked: boolean; // CR 702.2: Damage from a source with deathtouch
  isPhasedOut?: boolean; // CR 702.26: Treated as though it doesn't exist
  
  // Modifiers (Layer system targets)
  counters: Record<string, number>;

  // Rules Engine output (Calculated on server, displayed on client)
  effectiveStats?: {
    power: number;
    toughness: number;
    keywords: string[];
    isPlayable?: boolean; // For hand cards
  };
}

// An object residing on the stack waiting to resolve
export interface StackObject {
  id: string;
  controllerId: PlayerId;
  sourceId: GameObjectId; 
  type: 'Spell' | 'ActivatedAbility' | 'TriggeredAbility' | 'SpecialAction';
  targets: GameObjectId[] | PlayerId[];
  card?: GameObject;
  abilityIndex?: number;
  data?: any;
  name?: string;
  image_url?: string;
  xValue?: number; // Rule 107.3: The value of X
}

// Player's isolated state within a game
export interface PlayerState {
  id: PlayerId;
  name: string;
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
  fullControl: boolean;
  maxHandSize: number;
  pendingDiscardCount: number;
  manaCheat?: boolean; // DEBUG: Infinite mana
}

export interface CombatState {
  attackers: { 
    attackerId: GameObjectId; 
    targetId: PlayerId | GameObjectId;
    order?: GameObjectId[]; 
  }[];
  blockers: { 
    blockerId: GameObjectId; 
    attackerId: GameObjectId;
    order?: GameObjectId[]; 
  }[];
}

export interface TurnState {
  permanentReturnedToHandThisTurn: boolean;
  noncombatDamageDealtToOpponents: number;
  creaturesAttackedThisTurn: number;
  lastDamageAmount: number;
  lastLifeGainedAmount: number;
  lastCardsDrawnAmount: number;
  spellsCastThisTurn: Record<PlayerId, number>;
}

export interface PendingAction {
  type: 'DECLARE_ATTACKERS' | 'DECLARE_BLOCKERS' | 'ORDER_BLOCKERS' | 'ORDER_ATTACKERS' | 'DISCARD' | 'TARGETING' | 'CHOICE';
  playerId: PlayerId;
  count?: number; 
  sourceId?: string; // For targeting or specific effects
  data?: any;      // Contextual data (e.g. choice options)
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
  
  // Combat data
  combat?: CombatState;
  pendingAction?: PendingAction;

  // Rules Engine: The "Whiteboard"
  ruleRegistry: RuleRegistry;

  // Mechanic logic
  consecutivePasses: number; // To track when all players pass priority
  logs: string[];            // Real-time game events/engine logs
  
  turnState: TurnState;      // Grouped turn-wide logic tracking
}

export const DurationType = {
  Static: 'Static',                      // As long as source is in a specific zone (Layer 611.3a)
  UntilEndOfTurn: 'UntilEndOfTurn',      // Rule 514.2
  UntilEndOfCombat: 'UntilEndOfCombat',  // Rule 511.3
  UntilEvent: 'UntilEvent',              // e.g., "Until your next turn"
  Permanent: 'Permanent'                 // e.g., Counters or Emblems
} as const;
export type DurationType = (typeof DurationType)[keyof typeof DurationType];

export interface EffectDuration {
  type: DurationType;
  untilStep?: Step;          // For "Until next end step"
  untilTurnOfPlayerId?: PlayerId; 
  expiryEvent?: string;      // Hook for the Event Bus (e.g., 'ON_LEAVES_BATTLEFIELD')
}

export interface ContinuousEffect {
  id: string;
  sourceId: GameObjectId;
  controllerId: PlayerId;
  layer: number;
  sublayer?: string;
  timestamp: number;
  activeZones: Zone[]; 
  duration: EffectDuration;
  targetIds?: GameObjectId[];
  targetMapping?: string;
  targetControllerId?: PlayerId;
  powerModifier?: number;
  toughnessModifier?: number;
  powerSet?: number;      // Layer 7b
  toughnessSet?: number;  // Layer 7b
  abilitiesToAdd?: string[];
  abilitiesToRemove?: string[];
  removeAllAbilities?: boolean; // Layer 6
  
  // For Layer 1 (Copying)
  copyFromId?: GameObjectId;
}

export interface AbilityCost {
  type: 'Tap' | 'Mana' | 'PayLife' | 'Discard' | 'Sacrifice' | 'Loyalty';
  value: any; // e.g. "{G}" or 3 life
  restrictions?: string[]; // e.g. ["Creature"]
}

export interface ActivatedAbility {
  id: string;
  sourceId: GameObjectId;
  controllerId: PlayerId;
  costs: AbilityCost[];
  isManaAbility: boolean;
  // effects or spell definitions to push to stack
}

export const RestrictionType = {
  CannotTap: 'CannotTap',
  CannotUntap: 'CannotUntap',
  CannotAttack: 'CannotAttack',
  CannotBlock: 'CannotBlock',
  CannotCastType: 'CannotCastType'
} as const;
export type RestrictionType = (typeof RestrictionType)[keyof typeof RestrictionType];

export interface AbilityRestriction {
  id: string;
  sourceId: GameObjectId;
  type: RestrictionType;
  targetId?: GameObjectId;
  targetControllerId?: PlayerId;
  duration: EffectDuration;
}

export interface GameEvent {
  type: string;
  playerId?: PlayerId;
  sourceId?: GameObjectId;
  targetId?: GameObjectId;
  amount?: number;
  sourceZone?: Zone;
  data?: any; // e.g. { amount: 2 } or { targetId: '...' }
}

export interface TriggeredAbility {
  id: string;
  sourceId: GameObjectId;
  controllerId: PlayerId;
  eventMatch: GameEvent['type'];
  // Optional: "Intervening If" clause (Rule 603.4)
  condition?: (event: GameEvent, state: GameState) => boolean;
  // Specific effect to execute or push to stack
}

export interface RuleRegistry {
  continuousEffects: ContinuousEffect[];
  activatedAbilities: ActivatedAbility[];
  triggeredAbilities: TriggeredAbility[];
  restrictions: AbilityRestriction[];
  replacementEffects?: any[];
}
export const AbilityType = {
  Spell: 'Spell',
  Activated: 'Activated',
  Triggered: 'Triggered',
  Static: 'Static',
  Replacement: 'Replacement'
} as const;
export type AbilityType = (typeof AbilityType)[keyof typeof AbilityType];

export const ZoneRequirement = {
  Battlefield: 'Battlefield',
  Graveyard: 'Graveyard',
  Hand: 'Hand',
  Stack: 'Stack',
  Any: 'Any'
} as const;
export type ZoneRequirement = (typeof ZoneRequirement)[keyof typeof ZoneRequirement];

export interface TokenBlueprint {
  name: string;
  power: string;
  toughness: string;
  colors: string[];
  types: string[];
  subtypes: string[];
  keywords: string[];
  oracleText?: string;
}

export interface EffectDefinition {
  type: 'DealDamage' | 'DrawCards' | 'Destroy' | 'Exile' | 'Counter' | 'CreateToken' | 'AddCounters' | 'ApplyContinuousEffect' | 'CopyObject' | 'Choice' | 'SearchLibrary' | 'PutOnBattlefield' | 'PutInHand' | 'ShuffleLibrary' | 'ReturnToHand' | 'GainLife' | 'AddMana' | 'Tapped' | 'Fight' | 'CostReduction' | 'DiscardCards' | 'PhasedOut';
  amount?: number | string;
  value?: any; 
  
  // Modular Token Support
  tokenBlueprint?: TokenBlueprint;
  
  // Choice Properties
  choices?: {
    label: string;
    effects: EffectDefinition[];
  }[];

  // Continuous Effect Properties
  duration?: string;
  powerModifier?: number;
  toughnessModifier?: number;
  powerSet?: number;
  toughnessSet?: number;
  abilitiesToAdd?: string[];
  abilitiesToRemove?: string[];
  removeAllAbilities?: boolean;
  layer?: number;
  targetControllerId?: string;
  
  /**
   * targetMapping conventions:
   * - 'SELF': The card itself
   * - 'TARGET_1', 'TARGET_2': Specific targets from targetDefinition
   * - 'TARGET_ALL': All targets selected via targetDefinition
   * - 'CONTROLLER': The controller of the ability
   * - 'ALL_CREATURES_YOU_CONTROL', 'OTHER_CREATURES_YOU_CONTROL': Group selectors
   */
  targetMapping: string; 
}

export interface TargetDefinition {
  type: 'Player' | 'Permanent' | 'Spell' | 'CardInGraveyard';
  count: number;
  optional?: boolean;
  restrictions?: string[];
}

export interface ParsedAbility {
  id: string;
  type: AbilityType;
  activeZone: ZoneRequirement;
  costs?: AbilityCost[];
  isManaAbility?: boolean;
  triggerEvent?: string; 
  triggerCondition?: any; 
  targetDefinition?: TargetDefinition;
  effects: EffectDefinition[];
}

export interface ImplementableCard extends CardDefinition {
  abilities: ParsedAbility[];
}
