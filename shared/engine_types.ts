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

export const SelectionType = {
  Target: 'Target',
  Choice: 'Choice',
  Random: 'Random',
  All: 'All',
  TopN: 'TopN',
  AnyNumber: 'AnyNumber',
  Look: 'Look',
  Search: 'Search'
} as const;
export type SelectionType = (typeof SelectionType)[keyof typeof SelectionType];

export const TargetMapping = {
  Self: 'SELF',
  Target1: 'TARGET_1',
  Target2: 'TARGET_2',
  Target3: 'TARGET_3',
  TargetAll: 'TARGET_ALL',
  Controller: 'CONTROLLER',
  EachOpponent: 'EACH_OPPONENT',
  EachPlayer: 'EACH_PLAYER',
  AllOpponents: 'ALL_OPPONENTS',
  TriggerEventSource: 'TRIGGER_EVENT_SOURCE',
  TriggerController: 'TRIGGER_CONTROLLER',
  AllCreaturesYouControl: 'ALL_CREATURES_YOU_CONTROL',
  OtherCreaturesYouControl: 'OTHER_CREATURES_YOU_CONTROL',
  AllOtherCreatures: 'ALL_OTHER_CREATURES',
  AllPermanents: 'ALL_PERMANENTS',
  AllMatchingPermanents: 'ALL_MATCHING_PERMANENTS',
  AllMatchingPermanentsYouControl: 'ALL_MATCHING_PERMANENTS_YOU_CONTROL',
  OtherPlaneswalkersYouControl: 'OTHER_PLANESWALKERS_YOU_CONTROL',
  AllLandsYouControl: 'ALL_LANDS_YOU_CONTROL',
  AllOtherCreaturesAndPlaneswalkers: 'ALL_OTHER_CREATURES_AND_PLANESWALKERS',
  MatchingCards: 'MATCHING_CARDS',
  Target1HandRevealPick: 'TARGET_1_HAND_REVEAL_PICK',
  Target1Controller: 'TARGET_1_CONTROLLER',
  Target1Owner: 'TARGET_1_OWNER',
  TargetOpponent: 'TARGET_OPPONENT',
  LookingCards: 'LOOKING_CARDS',
  SelectedCards: 'SELECTED_CARDS',
  SelectedCard: 'SELECTED_CARD',
  RemainingLookingCards: 'REMAINING_LOOKING_CARDS',
  NameACard: 'NAME_A_CARD',
  EventTarget: 'EVENT_TARGET',
  LastExiledObject: 'LAST_EXILED_OBJECT',
  TriggerSource: 'TRIGGER_SOURCE',
  LastDiscardedCards: 'LAST_DISCARDED_CARDS',
  TriggerTarget: 'TRIGGER_TARGET',
  LastCreatedToken: 'LAST_CREATED_TOKEN',
  EachOpponentCreature: 'EACH_OPPONENT_CREATURE',
  LastExiledIds: 'LAST_EXILED_IDS',
  LastMilledIds: 'LAST_MILLED_IDS',
  AllCreaturesAndPlaneswalkers: 'ALL_CREATURES_AND_PLANESWALKERS',
  EachCreature: 'EACH_CREATURE',
  SelectedTargets: 'SELECTED_TARGETS'
} as const;
export type TargetMapping = (typeof TargetMapping)[keyof typeof TargetMapping];

export const DynamicAmount = {
  X: 'X',
  SourcePower: 'SOURCE_POWER',
  SourceToughness: 'SOURCE_TOUGHNESS',
  SourceCountersP1P1: 'SOURCE_COUNTERS_P1P1',
  DestroyedCount: 'DESTROYED_COUNT',
  SavedMV: 'SAVED_MV',
  TriggerEventValue: 'TRIGGER_EVENT_VALUE',
  TriggerEventSourcePower: 'TRIGGER_EVENT_SOURCE_POWER',
  DrawnThreeCheck: 'DYNAMIC_DrawnThreeCheck',
  TwoPlusDiscardedMV: 'DYNAMIC_2PlusDiscardedMV',
  DiscardedCount: 'DISCARDED_COUNT',
  CardsDrawnThisTurn: 'CARDS_DRAWN_THIS_TURN',
  ConvergeAmount: 'CONVERGE_AMOUNT',
  Target1Power: 'TARGET_1_POWER',
  Target1HandSize: 'TARGET_1_HAND_SIZE',
  DiscardedCountPlus1: 'DISCARDED_COUNT_PLUS_1',
  DifferentlyNamedLandsCount: 'DIFFERENTLY_NAMED_LANDS_COUNT',
  CreaturesYouControl: 'CREATURES_YOU_CONTROL',
  MagecraftSpent: 'MAGECRAFT_SPENT'
} as const;
export type DynamicAmount = (typeof DynamicAmount)[keyof typeof DynamicAmount];

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
  supertypes?: string[]; // e.g. "Legendary", "Basic", "Snow"
  types: string[];      // e.g. "Creature", "Instant", "Land"
  subtypes?: string[];   // e.g. "Goblin", "Warrior", "Aura"
  power?: string;       // string to allow "*" or "1+*"
  toughness?: string;
  keywords?: string[];   // Static keywords: ["Flying", "Trample", "Haste"]
  loyalty?: string;
  oracleText: string;
  type_line?: string;
  image_url?: string;
  scryfall_id?: string;
  set?: string;
  entersTapped?: boolean; // Replacement effect-style state for entry
  entersTappedCondition?: string; // e.g. "CONTROL_OTHER_LANDS_LE:1"
  entersWithXCounters?: boolean; // Rule 122.6: Entry with counters based on X
  entersPrepared?: boolean;      // SOS: Mechanic "Prepare"
  faces?: CardDefinition[]; // CR 711.1: Double-faced cards
  flashbackCost?: string;   // Alternative cost for casting from graveyard
  abilities?: (ParsedAbility | string)[];
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
  isPrepared: boolean;
  keywords: string[]; // Dynamic keywords gained (e.g. from an Aura or equipment)
  deathtouchMarked: boolean; // CR 702.2: Damage from a source with deathtouch
  isPhasedOut?: boolean; // CR 702.26: Treated as though it doesn't exist
  lastNonStackZone?: Zone; // Track where a spell was cast from
  xValue?: number;         // Rule 107.3: Snapshot of X during casting
  isFlashbackCast?: boolean; // Rule 702.34a: Exile if leaving stack

  // Modifiers (Layer system targets)
  counters: Record<string, number>;
  attachedTo?: GameObjectId;
  data?: any;

  // Rules Engine output (Calculated on server, displayed on client)
  effectiveStats?: {
    power: number;
    toughness: number;
    keywords: string[];
    restrictions?: string[];
    isPlayable?: boolean; // For hand cards
    manaCost?: string;    // Current cost to play/cast
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
  Choice: 'CHOICE',
  Scry: 'SCRY',
  Surveil: 'SURVEIL',
  ChooseX: 'CHOOSE_X',
  OrderTriggers: 'ORDER_TRIGGERS'
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
  isFlashbackCast?: boolean;
}

// Player's isolated state within a game
export interface PlayerState {
  id: PlayerId;
  name: string;
  avatar?: string;
  life: number;
  poisonCounters: number;

  // Zones that belong to the player
  library: GameObject[];
  hand: GameObject[];
  graveyard: GameObject[];
  sideboard: GameObject[];

  // Mana Pool resets every Step/Phase
  manaPool: {
    W: number;
    U: number;
    B: number;
    R: number;
    G: number;
    C: number; // Colorless
  };
  
  restrictedMana?: {
    color: 'W' | 'U' | 'B' | 'R' | 'G' | 'C';
    amount: number;
    restrictions: string[]; // e.g. ['Instant', 'Sorcery']
  }[];

  hasPlayedLandThisTurn: boolean;
  fullControl: boolean;
  maxHandSize: number;
  pendingDiscardCount: number;
  manaCheat?: boolean; // DEBUG: Infinite mana
  virtualHand: GameObject[]; // Cards playable from non-hand zones (Exile, Graveyard, Library)
  stops: Record<string, boolean>; // Phase/Step stops (Arena-style)
  autoOrderTriggers: boolean;
  passUntilEndOfTurn: boolean;
  extraTurns: number;
  turnsToSkip: number;
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
  lastExcessDamageAmount: number;
  lastSacrificedObjectPower?: number;
  turnStartTime: number; // For effect expiration logic
  lastLifeGainedAmount: number;
  lastCardsDrawnAmount: number;
  cardsDrawnThisTurn: Record<PlayerId, number>;
  lifeGainedThisTurn: Record<PlayerId, number>;
  spellsCastThisTurn: Record<PlayerId, number>;
  instantOrSorceryCastThisTurn: Record<PlayerId, boolean>;
  cardLeftGraveyardThisTurn: Record<PlayerId, boolean>;
  landsPlayedThisTurn: Record<PlayerId, number>;
  triggeredAbilitiesUsedThisTurn: Record<string, number>;
  lastDiscardedCount: number;
  lastDiscardedIds?: string[];
  cardsExiledThisTurn: Record<PlayerId, boolean>;
  namedCards?: Record<string, string>; // Store named card choices (e.g. for Pithing Needle or Academic Probation)
  countersAddedThisTurnIds: GameObjectId[];
  damagePreventionDisabled?: boolean;
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
export interface OrderTriggersPendingActionData {
  triggers: StackObject[];
}

export type PendingActionData = ChoicePendingActionData | TargetingPendingActionData | DiscardPendingActionData | XSelectionPendingActionData | OrderTriggersPendingActionData | any;

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

  // Simultaneous triggers waiting to be ordered
  pendingTriggers?: StackObject[];

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
  Permanent: 'PERMANENT',                 // e.g., Counters or Emblems
  UntilYourNextTurn: 'UNTIL_YOUR_NEXT_TURN', // Expire at start of next turn
  UntilEndOfYourNextTurn: 'UNTIL_END_OF_YOUR_NEXT_TURN', // Expire at end of next turn
  NextEndStep: 'NEXT_END_STEP'
} as const;
export type DurationType = (typeof DurationType)[keyof typeof DurationType];


export interface EffectDuration {
  type: DurationType;
  untilStep?: Step;          // For "Until next end step"
  untilTurnOfPlayerId?: any; // PlayerId or (state: GameState, source: GameObject) => PlayerId
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
  typesSet?: string[];
  subtypesToAdd?: string[];
  subtypesSet?: string[];
  colorsToAdd?: string[];
  colorSet?: string[];
  abilitiesToAdd?: (string | ParsedAbility)[];
  abilitiesToRemove?: string[];
  removeAllAbilities?: boolean; // Layer 6
  exileOnMoveToGraveyard?: boolean;
  condition?: string;

  // For Layer 1 (Copying)
  copyFromId?: GameObjectId;

  // Rule 611 permissions & alternative costs
  canPlayExiled?: boolean;
  spendAnyMana?: boolean;
  isFreeCast?: boolean;
  restrictions?: AbilityRestriction[];
  flashbackCostOverride?: string;
  playerModifier?: {
      maxHandSize?: number;
      canPlayFromGraveyard?: boolean;
      canPlayFromTop?: boolean;
      lifeModifier?: number;
  };
}

export interface AbilityCost {
  type: 'Tap' | 'Mana' | 'PayLife' | 'Discard' | 'Sacrifice' | 'Loyalty' | 'Exile' | 'Crew' | 'Life' | 'RemoveCounter' | 'TapSelection' | 'ExileSelf' | 'Choice';
  value?: any; // e.g. "{G}" or 3 life
  amount?: number; // For Crew power
  restrictions?: (string | any)[]; // e.g. ["Creature"] or [{ type: "Creature" }]
  targetMapping?: string;  // e.g. "SELF"
  counterType?: string;    // For RemoveCounter cost
  costModifiers?: { type: 'REDUCE_GENERIC_PER_COUNTER', counterType: string }[];
  sourceZone?: Zone;
  sourceZones?: Zone[]; 
  label?: string;
  choices?: { label: string, costs: AbilityCost[] }[];
  zone?: Zone;
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
  CannotCastNamedCard: 'CannotCastNamedCard',
  CannotCastPermanentSpells: 'CannotCastPermanentSpells',
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
  targets?: string[];
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
  eventMatch: GameEvent['type'] | GameEvent['type'][];
  activeZone?: ZoneRequirement;
  condition?: (state: GameState, event: GameEvent, ability: TriggeredAbility) => boolean;
  limitPerTurn?: number;
  duration?: EffectDuration;
  oracleText?: string;
  effects?: EffectDefinition[]; // For internal/delayed triggers
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
  Command: 'Command',
  Any: 'Any'
} as const;
export type ZoneRequirement = (typeof ZoneRequirement)[keyof typeof ZoneRequirement];

export const TriggerEvent = {
  EnterBattlefield: 'ON_ETB',
  EnterBattlefieldOther: 'ON_ETB_OTHER',
  Death: 'ON_DEATH',
  DeathOther: 'ON_DEATH_OTHER',
  LeaveBattlefield: 'ON_LEAVE_BATTLEFIELD',
  Attack: 'ON_ATTACK',
  Block: 'ON_BLOCK',
  BecameBlocked: 'ON_BECAME_BLOCKED',
  AttackersDeclared: 'ON_ATTACKERS_DECLARED',
  AttackOrBlock: 'ON_ATTACK_OR_BLOCK',
  DamageDealtToCreature: 'ON_DAMAGE_DEALT_TO_CREATURE',
  DamageDealtToPlayer: 'ON_DAMAGE_PLAYER',
  DamageTaken: 'ON_DAMAGE_TAKED',
  NoncombatDamageOpponent: 'ON_NONCOMBAT_DAMAGE_OPPONENT',
  CountersAdded: 'ON_COUNTERS_ADDED',
  CountersAddedOther: 'ON_COUNTERS_ADDED_OTHER',
  CounterAdded: 'ON_COUNTER_ADDED', // Singular check
  CastInstantOrSorcery: 'ON_CAST_INSTANT_SORCERY',
  CastFirstInstantOrSorcery: 'ON_CAST_FIRST_INSTANT_SORCERY',
  CastNonCreature: 'ON_CAST_NON_CREATURE',
  CastSpell: 'ON_CAST_SPELL',
  OpponentCastNonHand: 'ON_OPPONENT_CAST_NON_HAND',
  SecondSpellCast: 'ON_SECOND_SPELL_CAST',
  ThirdSpellCast: 'ON_THIRD_SPELL_CAST',
  CopySpell: 'ON_COPY_SPELL',
  Magecraft: 'ON_MAGECRAFT',
  MagecraftOpponent: 'ON_MAGECRAFT_OPPONENT',
  Draw: 'ON_DRAW',
  SecondDraw: 'ON_SECOND_DRAW',
  BecomeTarget: 'ON_BECOME_TARGET',
  LifeGain: 'ON_LIFE_GAIN',
  Sacrifice: 'ON_SACRIFICE',
  Untap: 'ON_UNTAP',
  EndOfTurn: 'ON_END_OF_TURN',
  EndStep: 'ON_END_STEP',
  StartOfCombat: 'ON_START_OF_COMBAT',
  BeginningOfCombatStep: 'ON_BEGINNING_OF_COMBAT_STEP',
  PreCombatMainPhaseStart: 'ON_PRE_COMBAT_MAIN_PHASE_START',
  Upkeep: 'ON_UPKEEP_STEP',
  Cleanup: 'ON_CLEANUP_STEP',
  LeaveGraveyard: 'ON_LEAVE_GRAVEYARD',
  ValentinReplacementSuccess: 'ON_VALENTIN_REPLACEMENT_SUCCESS'
} as const;

export type TriggerEvent = (typeof TriggerEvent)[keyof typeof TriggerEvent];

export interface TokenBlueprint {
  name: string;
  power?: string | number;
  toughness?: string | number;
  colors: string[];
  types: string[];
  subtypes: string[];
  keywords?: string[];
  abilities?: any[];
  oracleText?: string;
  image_url?: string;
  manaCost?: string;
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
  CREW: 'CREW',
  Counter: 'Counter',
  CreateToken: 'CreateToken',
  AddCounters: 'AddCounters',
  ApplyContinuousEffect: 'ApplyContinuousEffect',
  CopyObject: 'CopyObject',
  Choice: 'Choice',
  ConditionalEffect: 'ConditionalEffect',
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
  AddActivatedAbility: 'AddActivatedAbility',
  CreateDelayedTrigger: 'CreateDelayedTrigger',
  ExchangeHandAndGraveyard: 'ExchangeHandAndGraveyard',
  Learn: 'Learn',
  AddPreventionEffect: 'AddPreventionEffect',
  Shuffle: 'Shuffle',
  Log: 'Log',
  CopySpellOnStack: 'CopySpellOnStack',
  Prepare: 'Prepare',
  Unprepare: 'Unprepare',
  ExileTopCardsExcessDamage: 'ExileTopCardsExcessDamage',
  SpellTax: 'SpellTax',
  AdditionalCost: 'AdditionalCost',
  AdditionalLandPlays: 'AdditionalLandPlays',
  Mill: 'Mill',
  DisableDamagePrevention: 'DisableDamagePrevention',
  ExileUntilManaValue: 'ExileUntilManaValue',
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
  Paradigm: 'Paradigm',
  AllowSpendManaAsAnyColor: 'AllowSpendManaAsAnyColor',
  AllowLookAtTop: 'AllowLookAtTop',
  AllowPlayExiled: 'AllowPlayExiled',
  Surveil: 'Surveil',
  DoubleCounters: 'DoubleCounters',
  AllowCastWithoutPaying: 'AllowCastWithoutPaying',
  CastSpell: 'CastSpell',
  MoveCounters: 'MoveCounters',
  EntersWithCounters: 'EntersWithCounters',
  AllowPlayMilledCard: 'AllowPlayMilledCard',
  RevealUntilCondition: 'RevealUntilCondition',
  PENDING_ACTION: 'PENDING_ACTION',
  SkipTurns: 'SkipTurns',
  PayMana: 'PayMana',
  LoseMana: 'LoseMana',
} as const;


export type EffectType = (typeof EffectType)[keyof typeof EffectType];

export const ConditionType = {
    IsYourTurn: 'IS_YOUR_TURN',
    OurTurn: 'OUR_TURN',
    IsOpponentTurn: 'IS_OPPONENT_TURN',
    HasCounters: 'HAS_COUNTERS',
    TriggerTargetIsSelf: 'TRIGGER_TARGET_IS_SELF',
    TriggerSourcePowOrToughLe1: 'TRIGGER_SOURCE_POW_OR_TOUGH_LE_1',
    TargetsTappedCreature: 'TARGETS_TAPPED_CREATURE',
    HasCreaturePower4Plus: 'HAS_CREATURE_POWER_4_PLUS',
    PlayerIsController: 'PLAYER_IS_CONTROLLER',
    ObjectIsSelf: 'OBJECT_IS_SELF',
    CreatureDiedThisTurn: 'CREATURE_DIED_THIS_TURN',
    GainedLifeThisTurn: 'GAINED_LIFE_THIS_TURN',
    Infusion: 'INFUSION',
    TargetIsOpponent: 'TARGET_IS_OPPONENT',
    OwnCreatureEnters: 'OWN_CREATURE_ENTERS',
    OwnCreatureDies: 'OWN_CREATURE_DIES',
    TargetIsInstantOrSorcery: 'TARGET_IS_INSTANT_OR_SORCERY',
    CastInstantSorceryThisTurn: 'CAST_INSTANT_SORCERY_THIS_TURN',
    Target1IsController: 'TARGET_1_IS_CONTROLLER',
    SpentManaGe: 'SPENT_MANA_GE',
    SpentManaGtPowerOrToughness: 'SPENT_MANA_GT_POWER_OR_TOUGHNESS',
    HasPermanent: 'HAS_PERMANENT',
    NotHasPermanent: 'NOT_HAS_PERMANENT',
    CastFromHand: 'CAST_FROM_HAND',
    NotCastFromHand: 'NOT_CAST_FROM_HAND',
    ArtifactCountGe: 'ARTIFACT_COUNT_GE',
    LandCountGe: 'LAND_COUNT_GE',
    TopCardIsGoblin: 'TOP_CARD_IS_GOBLIN',
    XGe: 'X_GE',
    XEquals: 'X_EQUALS',
    SpellTargetsSource: 'SPELL_TARGETS_SOURCE',
    SpellTargetsCreature: 'SPELL_TARGETS_CREATURE',
    SpellIsCreature: 'SPELL_IS_CREATURE',
    PlayerHasLifeGe: 'PLAYER_HAS_LIFE_GE',
    OpponentHasLifeLe: 'OPPONENT_HAS_LIFE_LE',
    EventObjectMatches: 'EVENT_OBJECT_MATCHES',
    Target1Matches: 'TARGET_1_MATCHES',
    Target2Matches: 'TARGET_2_MATCHES',
    EventManaValueGe: 'EVENT_MANA_VALUE_GE',
    DrawnCardsGe: 'DRAWN_CARDS_GE',
    CounterGe: 'COUNTER_GE',
    OtherLandsLe: 'OTHER_LANDS_LE',
    HasInstantAndSorceryInGy: 'HAS_INSTANT_AND_SORCERY_IN_GY',
    EventCounterTypeMatches: 'EVENT_COUNTER_TYPE_MATCHES',
    CardsLeftYourGraveyardThisTurn: 'CARDS_LEFT_YOUR_GRAVEYARD_THIS_TURN',
    OpponentHasMoreCards: 'OPPONENT_HAS_MORE_CARDS',
} as const;
export type ConditionType = (typeof ConditionType)[keyof typeof ConditionType] | string;

export interface EffectDefinition {
  type: EffectType;
  amount?: number | string | DynamicAmount | ((state: any, source: any, targets?: string[]) => number);
  targetMapping?: TargetMapping | string;
  value?: any;
  tapped?: boolean;
  costs?: AbilityCost[];
  isDiscard?: boolean;
  returnToBattlefield?: boolean;
  returnDuration?: DurationType;
  limitPerTurn?: number;

  eventMatch?: string; // For AddTriggeredAbility

  manaType?: string;
  maxCount?: number;
  manaReduction?: string;
  emblemBlueprint?: EmblemBlueprint;

  // Modular Token Support
  tokenBlueprint?: TokenBlueprint;
  startingCounters?: any;

  // Choice Properties
  choices?: {
    label: string;
    condition?: string | ConditionType;
    costs?: AbilityCost[];
    effects?: EffectDefinition[];
    targetDefinition?: TargetDefinition | TargetDefinition[];
  }[];

  // Continuous Effect Properties
  duration?: string | EffectDuration;
  powerModifier?: number | string | ((state: any, source: any) => number);
  toughnessModifier?: number | string | ((state: any, source: any) => number);
  powerSet?: number | string | ((state: any, source: any) => number);
  toughnessSet?: number | string | ((state: any, source: any) => number);
  powerDynamic?: string; // For CDAs (Layer 7a) like Tarmogoyf or Kinetic Augur
  toughnessDynamic?: string; // For CDAs (Layer 7a)
  abilitiesToAdd?: (string | ParsedAbility)[];
  abilitiesToRemove?: string[];
  removeAllAbilities?: boolean;
  subtypesToAdd?: string[];
  subtypesSet?: string[];
  colorsToAdd?: string[];
  colorSet?: string[];
  colorsSet?: string[];
  typesToAdd?: string[];
  typesSet?: string[];
  layer?: number;
  sublayer?: string;
  targetControllerId?: string;
  isFreeCast?: boolean;
  canPlayExiled?: boolean;
  spendAnyMana?: boolean;
  flashbackCostOverride?: string;
  exileOnMoveToGraveyard?: boolean;
  isLegendary?: boolean;
  next?: EffectDefinition;
  replacementEffect?: any;
  playerModifier?: any;
  powerMultiplier?: number | string;
  toughnessMultiplier?: number | string;
  restriction?: string;
  restriction2?: string;
  playerIdMapping?: string;

  // Dynamic Token stats
  powerOverride?: number | string | ((state: any, source: any) => number);
  toughnessOverride?: number | string | ((state: any, source: any) => number);

  multiplier?: number;
  repeatIfTypeMatch?: string[];

  target2Mapping?: string;
  target3Mapping?: string;
  isAttacking?: boolean;
  damageType?: string;
  additionalCosts?: any[];

  // Conditional logic
  condition?: ConditionType;
  onFailureEffects?: EffectDefinition[];
  message?: string;
  destination?: Zone;

  damageSourceMapping?: string; // Optional mapping for who deals the damage (e.g., 'TARGET_1')
  targetIdMapping?: string;
  targetIds?: string[]; // For specific snapshots (Exile/Choice results)
  targetDefinition?: TargetDefinition | TargetDefinition[];
  restrictions?: any[];
  effects?: EffectDefinition[]; // Sub-effects to execute after a selection
  label?: string; // Top-level label for Choice effects
  targetId?: string; // For MoveToZone
  zone?: Zone; // For MoveToZone
  sourceZone?: Zone; // For consolidated targeting
  selectionType?: SelectionType; // For consolidated targeting
  cardsToMoveIds?: string[]; // For PutRemainderOnBottomRandom
  optional?: boolean; // For Choice/LookAtTopAndPick
  hideUndo?: boolean; // For Choice (UI Hint)
  all?: boolean; // For Mass effects
  onSelected?: (card: any) => EffectDefinition[]; // For Choice logic
  revealed?: boolean; // For Library/Hand visible info
  playDuration?: 'UNTIL_END_OF_TURN' | 'UNTIL_NEXT_TURN_END'; // For impulsive draw
  ownerControl?: boolean; // CR 110.2: Flicker effects use ownerId
  sourceZones?: Zone[]; // For multizone search/movement
  splitDestinations?: { count: number, zone: Zone, tapped?: boolean }[]; // For complex splits (e.g. Cultivate)
  remainderZone?: Zone; // For leftovers (Top/Bottom/Graveyard)
  remainderPosition?: 'top' | 'bottom'; // Explicit destination position for remainders
  fromTop?: number | string; // Number of cards to look at from top (Scry/LookAtTop)
  shuffle?: boolean; // For library search
  reveal?: boolean; // For hidden zone search
  libraryPosition?: 'top' | 'bottom'; // Destination within library
  shuffleRemainder?: boolean; // For LookAtTopAndPick leftovers
  chooseNewTargets?: boolean; // For CopySpellOnStack
  minChoices?: number; // For Choice effects
  maxChoices?: number; // For Choice effects

  // SOS specific fields
  manaRestrictions?: string[];
  blueprint?: any;
  sourceMapping?: string;
  deferredTrigger?: any;
  cannotBlock?: boolean;
  addedTriggers?: any[];
  sublayer_sos?: string;
  counterType?: string;
  xValue?: number;
  isParadigmCopy?: boolean;
  stats?: any;
  count?: number;
  originalCardId?: string;
  isDraw?: boolean;
  redirectConditions?: { zone?: Zone, onLeaveZone?: Zone };
  targetControllerMapping?: string;
  copyFromIdMapping?: string;
  fromZone?: Zone;
  storeMV?: string;
  costToPay?: AbilityCost;
  excludedTargetMapping?: string;
}

export const TargetType = {
  Player: 'Player',
  Permanent: 'Permanent',
  Spell: 'Spell',
  CardInGraveyard: 'CardInGraveyard',
  Card: 'Card',
  AnyTarget: 'AnyTarget',
  Creature: 'Creature',
  Artifact: 'Artifact',
  Land: 'Land',
  Enchantment: 'Enchantment',
  Planeswalker: 'Planeswalker',
  Instant: 'Instant',
  Sorcery: 'Sorcery',
  InstantOrSorcery: 'Instant_or_Sorcery',
  ArtifactOrCreature: 'Artifact_or_Creature',
  ArtifactOrEnchantment: 'Artifact_or_Enchantment',
  CreatureOrPlaneswalker: 'Creature_or_Planeswalker',
  NonlandPermanent: 'Nonland_Permanent'
} as const;
export type TargetType = (typeof TargetType)[keyof typeof TargetType];

export interface TargetDefinition {
  type: TargetType;
  count?: number;
  minCount?: number;
  optional?: boolean;
  restrictions?: (string | any)[];
  perTargetRestrictions?: (string | any)[][];
  sourceZones?: Zone[];
  zone?: Zone;
  controller?: string;
  maxSelections?: number;
  label?: string;
}

export interface ParsedAbility {
  id?: string;
  type: AbilityType;
  multiMode?: { type: string };
  multiTargetMapping?: boolean; // Support for complex multi-target structures (e.g. Sublime Epiphany)
  modes?: any[];
  activeZone?: ZoneRequirement;
  costs?: AbilityCost[];
  additionalCosts?: AbilityCost[];
  isManaAbility?: boolean;
  eventMatch?: TriggerEvent | TriggerEvent[];
  condition?: string | ConditionType | ((state: any, event: any, t: any) => boolean);
  targetDefinition?: TargetDefinition | TargetDefinition[];
  targets?: any[];
  zone?: Zone;
  activatedOnlyAsSorcery?: boolean;
  triggerMetadata?: {
    isCombat?: boolean;
    triggerDescription?: string; // Optional manual override for the "Whenever..." part
  };
  isModal?: boolean;
  minChoices?: number;
  maxChoices?: number;
  optional?: boolean;
  limitPerTurn?: number;
  oracleText?: string;
  replacesEvent?: string;
  exileOnResolution?: boolean;
  costReduction?: any;
  flashbackCost?: string;
  manaCost?: string;
  restrictions?: { type: string, value?: string, effectZone?: string }[];
  effects?: EffectDefinition[];
}

export interface ImplementableCard extends CardDefinition {
  abilities?: any[]; 
}

export const Restriction = {
  // Types
  Creature: 'creature',
  Artifact: 'artifact',
  Land: 'land',
  Enchantment: 'enchantment',
  Planeswalker: 'planeswalker',
  Instant: 'instant',
  Sorcery: 'sorcery',
  Permanent: 'permanent',
  Card: 'card',

  // Negative Filters
  NonLand: 'nonland',
  NonCreature: 'noncreature',
  NonArtifact: 'nonartifact',
  NonEnchantment: 'nonenchantment',
  NonPlaneswalker: 'nonplaneswalker',

  // Contextual & Zone
  Other: 'other',
  Another: 'another',
  Self: 'self',
  Graveyard: 'graveyard',
  FromHand: 'fromhand',

  // Ownership & Control
  YouControl: 'youcontrol',
  NotControlled: 'notcontrolled',
  OpponentControl: 'opponentcontrol',
  Opponents: 'opponents',
  Yours: 'yours',

  // Status & Combat
  Legendary: 'legendary',
  Basic: 'basic',
  Tapped: 'tapped',
  Untapped: 'untapped',
  AttackingOrBlocking: 'attackingorblocking',

  // Color
  Monocolored: 'monocolored',
  Multicolored: 'multicolored',
  Colorless: 'colorless',

  // Special conditions
  HasXInManaCost: 'hasxinmanacost',
  InstantOrSorceryCastThisTurn: 'instantorsorcerycastthisturn',
  AnyTarget: 'anytarget',
  Player: 'player',
  Opponent: 'opponent',
  You: 'you',
  NonLegendary: 'nonlegendary'
} as const;

export const TargetKeyword = {
  Flying: 'flying',
  Haste: 'haste',
  Vigilance: 'vigilance',
  Trample: 'trample',
  Lifelink: 'lifelink',
  Deathtouch: 'deathtouch',
  Reach: 'reach',
  Menace: 'menace',
  Defender: 'defender',
  FirstStrike: 'first strike',
  DoubleStrike: 'double strike',
  Indestructible: 'indestructible'
} as const;
