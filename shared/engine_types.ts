// engine_types.ts
// These interfaces represent the theoretical foundation of the MTG rules engine.

export const Zone = {
  Library: 'Library',
  Hand: 'Hand',
  Battlefield: 'Battlefield',
  Graveyard: 'Graveyard',
  Stack: 'Stack',
  Exile: 'Exile',
  Command: 'Command' // CR 408: The Command Zone (Emblems live here forever)
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
  set?: string;
  entersTapped?: boolean; // Replacement effect-style state for entry
  entersWithXCounters?: boolean; // Rule 122.6: Entry with counters based on X
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
  lastNonStackZone?: Zone; // Track where a spell was cast from
  xValue?: number;         // Rule 107.3: Snapshot of X during casting

  // Modifiers (Layer system targets)
  counters: Record<string, number>;
  attachedTo?: GameObjectId;

  // Rules Engine output (Calculated on server, displayed on client)
  effectiveStats?: {
    power: number;
    toughness: number;
    keywords: string[];
    isPlayable?: boolean; // For hand cards
  };
}

// A player's interactive request to the game engine
export const ActionType = {
  DeclareAttackers: 'DECLARE_ATTACKERS',
  DeclareBlockers: 'DECLARE_BLOCKERS',
  OrderBlockers: 'ORDER_BLOCKERS',
  OrderAttackers: 'ORDER_ATTACKERS',
  Discard: 'DISCARD',
  Targeting: 'TARGETING',
  ModalSelection: 'MODAL_SELECTION',
  ResolutionChoice: 'RESOLUTION_CHOICE',
  OptionalAction: 'OPTIONAL_ACTION',
  Choice: 'CHOICE', // Deprecated, keeping for backward compatibility
  Scry: 'SCRY',
  Surveil: 'SURVEIL',
  ChooseX: 'CHOOSE_X'
} as const;
export type ActionType = (typeof ActionType)[keyof typeof ActionType];

// An object residing on the stack waiting to resolve
export interface StackObject {
  id: string;
  controllerId: PlayerId;
  sourceId: GameObjectId;
  type: AbilityType;
  targets: GameObjectId[] | PlayerId[];
  card?: GameObject;
  abilityIndex?: number;
  data?: any;
  name?: string;
  image_url?: string;
  xValue?: number; // Rule 107.3: The value of X
  exileOnResolution?: boolean;
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
  virtualHand: GameObject[]; // Cards playable from non-hand zones (Exile, Graveyard, Library)
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
  playersWithPermanentReturnedThisTurn: Record<PlayerId, boolean>;
  noncombatDamageDealtToOpponents: number;
  creaturesAttackedThisTurn: number;
  creaturesDiedThisTurn: any[];
  lastDamageAmount: number;
  lastLifeGainedAmount: number;
  lastCardsDrawnAmount: number;
  cardsDrawnThisTurn: Record<PlayerId, number>;
  lifeGainedThisTurn: Record<PlayerId, number>;
  spellsCastThisTurn: Record<PlayerId, number>;
  instantOrSorceryCastThisTurn: Record<PlayerId, boolean>;
  landsPlayedThisTurn: Record<PlayerId, number>;
}

export interface ChoicePendingActionData {
  label: string;
  choices: { label: string; effects: EffectDefinition[] }[];
  targets?: string[];
  nextEffectIndex?: number;
  sourceId?: string;
  abilityIndex?: number;
  stackObj?: StackObject;
  stackId?: string;
}

export interface TargetingPendingActionData {
  targetDefinition: TargetDefinition;
  nextEffectIndex?: number;
  sourceId: string;
  abilityIndex?: number;
  stackObj?: StackObject;
  stackId?: string;
  targets: string[];
}

export interface DiscardPendingActionData {
  amount: number;
}

export interface XSelectionPendingActionData {
  label: string;
  sourceId: string;
  declaredTargets: string[];
}

export type PendingActionData = ChoicePendingActionData | TargetingPendingActionData | DiscardPendingActionData | XSelectionPendingActionData | any;

export interface PendingAction {
  type: ActionType;
  playerId: PlayerId;
  count?: number;
  sourceId?: string; // For targeting or specific effects
  data?: PendingActionData;      // Contextual data (e.g. choice options)
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

  // CR 408: Command Zone — holds emblems permanently
  emblems: EmblemDefinition[];

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
  playerOrder: PlayerId[];   // CR 103: The order of players in the game
}

export const DurationType = {
  Static: 'STATIC',                      // As long as source is in a specific zone (Layer 611.3a)
  UntilEndOfTurn: 'UNTIL_END_OF_TURN',      // Rule 514.2
  UntilEndOfCombat: 'UNTIL_END_OF_COMBAT',  // Rule 511.3
  UntilEvent: 'UNTIL_EVENT',              // e.g., "Until your next turn"
  UntilNextUntapStep: 'UNTIL_NEXT_UNTAP_STEP', // For "frozen" effects
  Permanent: 'PERMANENT'                 // e.g., Counters or Emblems
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
  type?: EffectType;
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
  powerModifier?: number | string;
  toughnessModifier?: number | string;
  powerSet?: number | string;      // Layer 7b
  toughnessSet?: number | string;  // Layer 7b
  powerDynamic?: string;
  toughnessDynamic?: string;
  typesToAdd?: string[];
  subtypesToAdd?: string[];
  colorsToAdd?: string[];
  colorSet?: string[];
  abilitiesToAdd?: string[];
  abilitiesToRemove?: string[];
  removeAllAbilities?: boolean; // Layer 6
  exileOnMoveToGraveyard?: boolean;
  condition?: string;

  // For Layer 1 (Copying)
  copyFromId?: GameObjectId;

  // Rule 611 permissions & alternative costs
  canPlayExiled?: boolean;
  isFreeCast?: boolean;
  restrictions?: AbilityRestriction[];
}

export interface AbilityCost {
  type: 'Tap' | 'Mana' | 'PayLife' | 'Discard' | 'Sacrifice' | 'Loyalty';
  value?: any; // e.g. "{G}" or 3 life
  restrictions?: string[]; // e.g. ["Creature"]
  targetMapping?: string;  // e.g. "SELF"
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
  CannotCastType: 'CannotCastType',
  CannotActivateNonManaAbilities: 'CannotActivateNonManaAbilities',
  MustAttack: 'MustAttack',
  MustBeBlocked: 'MustBeBlocked'
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
  counterType?: string;
  sourceZone?: Zone;
  card?: GameObject;
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
  duration?: EffectDuration;
}

export interface RuleRegistry {
  continuousEffects: ContinuousEffect[];
  activatedAbilities: ActivatedAbility[];
  triggeredAbilities: TriggeredAbility[];
  restrictions: AbilityRestriction[];
  replacementEffects?: any[];
  preventionEffects?: DamagePreventionEffect[];
}

export interface DamagePreventionEffect {
  id: string;
  sourceId: string;
  controllerId: PlayerId;
  damageType: 'CombatDamage' | 'AllDamage' | 'Any';
  targetMapping: string; // e.g. 'DOGS_YOU_CONTROL'
  duration: string;
}

export const AbilityType = {
  Spell: 'Spell',
  Activated: 'ActivatedAbility',
  Triggered: 'TriggeredAbility',
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
  power?: string;
  toughness?: string;
  colors: string[];
  types: string[];
  subtypes: string[];
  keywords?: string[];
  oracleText?: string;
  image_url?: string;
}
// CR 114: Emblems
// An emblem is a marker that lives in the Command Zone permanently.
// It cannot be targeted, destroyed, or affected by spells/abilities.
// Its triggered abilities function just like those from a permanent.
export interface EmblemDefinition {
  id: string;              // Unique instance ID
  name: string;            // e.g. "Basri Ket Emblem"
  controllerId: PlayerId;  // The player who "gets" the emblem
  oracleText: string;      // For display purposes
  image_url?: string;      // Source planeswalker image for UI
  abilities: any[];        // Triggered/Static abilities the emblem provides
}

export interface EmblemBlueprint {
  name: string;
  oracleText: string;
  abilities: any[];
  image_url?: string;
}


export const EffectType = {
  DealDamage: 'DealDamage',
  DrawCards: 'DrawCards',
  DiscardCards: 'DiscardCards',
  Destroy: 'Destroy',
  Exile: 'Exile',
  ExileTopCard: 'ExileTopCard',
  ExileAllCards: 'ExileAllCards',
  Counter: 'Counter',
  CreateToken: 'CreateToken',
  AddCounters: 'AddCounters',
  ApplyContinuousEffect: 'ApplyContinuousEffect',
  CopyObject: 'CopyObject',
  Choice: 'Choice',
  SearchLibrary: 'SearchLibrary',
  PutOnBattlefield: 'PutOnBattlefield',
  PutInHand: 'PutInHand',
  ShuffleLibrary: 'ShuffleLibrary',
  ReturnToHand: 'ReturnToHand',
  GainLife: 'GainLife',
  LoseLife: 'LoseLife',
  AddMana: 'AddMana',
  Necromentia: 'Necromentia',
  Tapped: 'Tapped',
  Untap: 'Untap',
  Fight: 'Fight',
  CostReduction: 'CostReduction',
  PhasedOut: 'PhasedOut',
  AllowOutOfTurnActivation: 'AllowOutOfTurnActivation',
  ExtraTurns: 'ExtraTurns',
  LookAtTopAndPick: 'LookAtTopAndPick',
  MoveToZone: 'MoveToZone',
  PutRemainderOnBottomRandom: 'PutRemainderOnBottomRandom',
  CreateEmblem: 'CreateEmblem',   // CR 114: Creates an emblem in the Command Zone
  Sacrifice: 'Sacrifice',         // CR 701.17: Move permanent(s) to graveyard bypassing indestructible
  Scry: 'Scry',                   // CR 701.18: Look at top cards and choose top/bottom
  AddTriggeredAbility: 'AddTriggeredAbility',
  AddPreventionEffect: 'AddPreventionEffect',
  Shuffle: 'Shuffle',
  Log: 'Log',
  CopySpellOnStack: 'CopySpellOnStack',
  SpellTax: 'SpellTax',
  AdditionalCost: 'AdditionalCost',
  AdditionalLandPlays: 'AdditionalLandPlays',
  Mill: 'Mill',
  ModifyDrawAmount: 'ModifyDrawAmount',
  ModifyCountersAmount: 'ModifyCountersAmount',
  GainAbilitiesOfTopCard: 'GainAbilitiesOfTopCard',
  AllowCastFromGraveyard: 'AllowCastFromGraveyard',
  CombatConstraint: 'CombatConstraint',
  PreventDamage: 'PreventDamage',
  LoseGame: 'LoseGame',
  AddAdditionalTrigger: 'AddAdditionalTrigger',
  Tap: 'Tap',
  CounterSpell: 'CounterSpell',
  CounterAbility: 'CounterAbility',
  CreateTokenCopy: 'CreateTokenCopy',
  ChangeTarget: 'ChangeTarget',
  EndTurn: 'EndTurn',
  PlayWithTopCardRevealed: 'PlayWithTopCardRevealed',
  AllowPlayFromTop: 'AllowPlayFromTop',
  AllowSpendManaAsAnyColor: 'AllowSpendManaAsAnyColor',
  AllowLookAtTop: 'AllowLookAtTop',
  AllowPlayExiled: 'AllowPlayExiled',
  Surveil: 'Surveil',
  AllowCastWithoutPaying: 'AllowCastWithoutPaying',
  PENDING_ACTION: 'PENDING_ACTION',
} as const;

export type EffectType = (typeof EffectType)[keyof typeof EffectType];

export interface EffectDefinition {
  type: EffectType;
  amount?: number | string | ((state: any, source: any) => number);
  value?: any;
  tapped?: boolean;
  costs?: AbilityCost[];

  eventMatch?: string; // For AddTriggeredAbility

  manaType?: string;
  maxCount?: number;
  manaReduction?: string;
  emblemBlueprint?: EmblemBlueprint;

  // Modular Token Support
  tokenBlueprint?: TokenBlueprint;

  // Choice Properties
  choices?: {
    label: string;
    costs?: AbilityCost[];
    effects: EffectDefinition[];
  }[];

  // Continuous Effect Properties
  duration?: string | EffectDuration;
  powerModifier?: number | string;
  toughnessModifier?: number | string;
  powerSet?: number | string;
  toughnessSet?: number | string;
  powerDynamic?: string; // For CDAs (Layer 7a) like Tarmogoyf or Kinetic Augur
  toughnessDynamic?: string; // For CDAs (Layer 7a)
  abilitiesToAdd?: string[];
  abilitiesToRemove?: string[];
  removeAllAbilities?: boolean;
  subtypesToAdd?: string[];
  layer?: number;
  sublayer?: string;
  targetControllerId?: string;
  isFreeCast?: boolean;
  canPlayExiled?: boolean;
  exileOnMoveToGraveyard?: boolean;

  // Dynamic Token stats
  powerOverride?: number | string;
  toughnessOverride?: number | string;

  multiplier?: number;
  repeatIfTypeMatch?: string[];

  target2Mapping?: string;
  target3Mapping?: string;
  isAttacking?: boolean;
  damageType?: string;
  additionalCosts?: any[];

  // Conditional logic
  condition?: string;
  message?: string;
  destination?: Zone;

  /**
   * targetMapping conventions:
   * - 'SELF': The card itself
   * - 'TARGET_1', 'TARGET_2': Specific targets from targetDefinition
   * - 'TARGET_ALL': All targets selected via targetDefinition
   * - 'CONTROLLER': The controller of the ability
   * - 'ALL_CREATURES_YOU_CONTROL', 'OTHER_CREATURES_YOU_CONTROL': Group selectors
   */
  targetMapping?: string;
  damageSourceMapping?: string; // Optional mapping for who deals the damage (e.g., 'TARGET_1')
  targetIdMapping?: string;
  targetIds?: string[]; // For specific snapshots (Exile/Choice results)
  targetDefinition?: TargetDefinition;
  restrictions?: any[];
  effects?: EffectDefinition[]; // Sub-effects to execute after a selection
  label?: string; // Top-level label for Choice effects
  targetId?: string; // For MoveToZone
  zone?: Zone; // For MoveToZone
  sourceZone?: Zone; // For consolidated movement/exile
  selectionType?: 'Target' | 'All' | 'TopN' | 'Search'; // For consolidated targeting
  cardsToMoveIds?: string[]; // For PutRemainderOnBottomRandom
  optional?: boolean; // For Choice/LookAtTopAndPick
  hideUndo?: boolean; // For Choice (UI Hint)
  all?: boolean; // For Mass effects
  on?: string; // For AddTriggeredAbility (legacy)
  triggerCondition?: (state: any, event: any, source: any) => boolean; // For AddTriggeredAbility
  onSelected?: (card: any) => EffectDefinition[]; // For Choice logic
  revealed?: boolean; // For Library/Hand visible info
  playDuration?: 'UNTIL_END_OF_TURN' | 'UNTIL_NEXT_TURN_END'; // For impulsive draw
  sourceZones?: Zone[]; // For multizone search/movement
  splitDestinations?: { count: number, zone: Zone, tapped?: boolean }[]; // For complex splits (e.g. Cultivate)
  remainderZone?: Zone; // For leftovers (Top/Bottom/Graveyard)
  remainderPosition?: 'top' | 'bottom'; // Explicit destination position for remainders
  fromTop?: number; // Number of cards to look at from top (Scry/LookAtTop)
  shuffle?: boolean; // For library search
  reveal?: boolean; // For hidden zone search
  libraryPosition?: 'top' | 'bottom'; // Destination within library
  shuffleRemainder?: boolean; // For LookAtTopAndPick leftovers
  chooseNewTargets?: boolean; // For CopySpellOnStack
}

export const TargetType = {
  Player: 'Player',
  Permanent: 'Permanent',
  Spell: 'Spell',
  CardInGraveyard: 'CardInGraveyard',
  Card: 'Card',
  AnyTarget: 'AnyTarget'
} as const;
export type TargetType = (typeof TargetType)[keyof typeof TargetType];

export interface TargetDefinition {
  type: TargetType;
  count: number;
  minCount?: number;
  optional?: boolean;
  restrictions?: (string | any)[];
  perTargetRestrictions?: (string | any)[][];
}

export interface ParsedAbility {
  id: string;
  type: AbilityType;
  multiMode?: { type: string };
  multiTargetMapping?: boolean; // Support for complex multi-target structures (e.g. Sublime Epiphany)
  modes?: any[];
  activeZone: ZoneRequirement;
  costs?: AbilityCost[];
  isManaAbility?: boolean;
  triggerEvent?: string | string[];
  triggerCondition?: any;
  targetDefinition?: TargetDefinition;
  activatedOnlyAsSorcery?: boolean;
  triggerMetadata?: {
    isCombat?: boolean;
    triggerDescription?: string; // Optional manual override for the "Whenever..." part
  };
  oracleText?: string;
  replacesEvent?: string;
  costReduction?: any;
  restrictions?: { type: string, value?: string, effectZone?: string }[];
  condition?: string;
  effects?: EffectDefinition[];
}

export interface ImplementableCard extends CardDefinition {
  abilities: ParsedAbility[];
}
