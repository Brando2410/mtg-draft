// core.ts
// Primitive types and fundamental constants

export const Zone = {
  Library: "Library",
  Hand: "Hand",
  Battlefield: "Battlefield",
  Graveyard: "Graveyard",
  Stack: "Stack",
  Exile: "Exile",
  Command: "Command",
  Any: "Any",
  None: "None",
} as const;
export type Zone = (typeof Zone)[keyof typeof Zone];

export const CardType = {
  Creature: 0x01,
  Land: 0x02,
  Artifact: 0x04,
  Enchantment: 0x08,
  Planeswalker: 0x10,
  Instant: 0x20,
  Sorcery: 0x40,
  Player: 0x80,
  Battle: 0x100,
  Tribal: 0x200,
} as const;
export type CardType = number;

export const Keyword = {
  Haste: 'Haste',
  Flashback: 'Flashback',
  Flying: 'Flying',
  Deathtouch: 'Deathtouch',
  Lifelink: 'Lifelink',
  Vigilance: 'Vigilance',
  Trample: 'Trample',
  Indestructible: 'Indestructible',
  Ward: 'Ward',
  Hexproof: 'Hexproof',
  Shroud: 'Shroud',
  Menace: 'Menace',
  Reach: 'Reach',
  FirstStrike: 'FirstStrike',
  DoubleStrike: 'DoubleStrike',
  Defender: 'Defender'
} as const;
export type Keyword = (typeof Keyword)[keyof typeof Keyword];

export const CounterType = {
  P1P1: "+1/+1",
  M1M1: "-1/-1",
  Loyalty: "loyalty",
  Charge: "charge",
  Lore: "lore",
  Poison: "poison",
  Energy: "energy",
  Experience: "experience",
  Time: "time",
  Suspect: "suspect",
  Blood: "blood"
} as const;
export type CounterType = (typeof CounterType)[keyof typeof CounterType];

export const EnginePrefix = {
  VirtualPrepared: "virtual_prepared_",
  Copy: "copy_",
  Token: "token_"
} as const;

export const SelectionType = {
  Target: "Target",
  Choice: "Choice",
  Random: "Random",
  All: "All",
  TopN: "TopN",
  AnyNumber: "AnyNumber",
  Look: "Look",
  Search: "Search",
} as const;
export type SelectionType = (typeof SelectionType)[keyof typeof SelectionType];

export const Color = {
  White: "W" as const,
  Blue: "U" as const,
  Black: "B" as const,
  Red: "R" as const,
  Green: "G" as const,
  Colorless: "C" as const,
} as const;
export type Color = (typeof Color)[keyof typeof Color];

export const TargetMapping = {
  Self: "SELF",
  Target1: "TARGET_1",
  Target2: "TARGET_2",
  Target3: "TARGET_3",
  Target4: "TARGET_4",
  Target5: "TARGET_5",
  Target6: "TARGET_6",
  Target7: "TARGET_7",
  Target8: "TARGET_8",
  TargetAll: "TARGET_ALL",
  Controller: "CONTROLLER",
  EachOpponent: "EACH_OPPONENT",
  EachPlayer: "EACH_PLAYER",
  AllOpponents: "ALL_OPPONENTS",
  TriggerEventSource: "TRIGGER_EVENT_SOURCE",
  TriggerController: "TRIGGER_CONTROLLER",
  AllCreaturesYouControl: "ALL_CREATURES_YOU_CONTROL",
  OtherCreaturesYouControl: "OTHER_CREATURES_YOU_CONTROL",
  AllOtherCreatures: "ALL_OTHER_CREATURES",
  AllPermanents: "ALL_PERMANENTS",
  AllMatchingPermanents: "ALL_MATCHING_PERMANENTS",
  AllMatchingPermanentsYouControl: "ALL_MATCHING_PERMANENTS_YOU_CONTROL",
  OtherPlaneswalkersYouControl: "OTHER_PLANESWALKERS_YOU_CONTROL",
  AllLandsYouControl: "ALL_LANDS_YOU_CONTROL",
  AllOtherCreaturesAndPlaneswalkers: "ALL_OTHER_CREATURES_AND_PLANESWALKERS",
  AllPlaneswalkersYouControl: "ALL_PLANESWALKERS_YOU_CONTROL",
  EventObjectController: "EVENT_OBJECT_CONTROLLER",
  MatchingCards: "MATCHING_CARDS",
  Target1HandRevealPick: "TARGET_1_HAND_REVEAL_PICK",
  Target1Controller: "TARGET_1_CONTROLLER",
  Target1Owner: "TARGET_1_OWNER",
  TargetOpponent: "TARGET_OPPONENT",
  LookingCards: "LOOKING_CARDS",
  SelectedCards: "SELECTED_CARDS",
  SelectedCard: "SELECTED_CARD",
  RemainingLookingCards: "REMAINING_LOOKING_CARDS",
  NameACard: "NAME_A_CARD",
  EventTarget: "EVENT_TARGET",
  LastExiledObject: "LAST_EXILED_OBJECT",
  TriggerSource: "TRIGGER_SOURCE",
  LastDiscardedCards: "LAST_DISCARDED_CARDS",
  TriggerTarget: "TRIGGER_TARGET",
  LastCreatedToken: "LAST_CREATED_TOKEN",
  EachOpponentCreature: "EACH_OPPONENT_CREATURE",
  LastExiledIds: "LAST_EXILED_IDS",
  LastMilledIds: "LAST_MILLED_IDS",
  AllCreaturesAndPlaneswalkers: "ALL_CREATURES_AND_PLANESWALKERS",
  EachCreature: "EACH_CREATURE",
  SelectedTargets: "SELECTED_TARGETS",
  TargetPlayer: "TARGET_PLAYER",
  TargetCreature: "TARGET_CREATURE",
  TargetPermanent: "TARGET_PERMANENT",
  EnchantedCreature: "ENCHANTED_CREATURE",
  EnchantedPermanent: "ENCHANTED_PERMANENT",
  AllCreatures: "ALL_CREATURES",
  AllPlaneswalkers: "ALL_PLANESWALKERS",
  AllMatchingCards: "ALL_MATCHING_CARDS",
  ChoiceFromExiled: "CHOICE_FROM_EXILED",
  ControllerGraveyard: "CONTROLLER_GRAVEYARD",
  ControllerSideboard: "CONTROLLER_SIDEBOARD",
  Target1Hand: "TARGET_1_HAND",
  Target1Graveyard: "TARGET_1_GRAVEYARD",
  Target1Battlefield: "TARGET_1_BATTLEFIELD",
  AllBattlefield: "ALL_BATTLEFIELD",
  ControllerHand: "CONTROLLER_HAND",
  ControllerBattlefield: "CONTROLLER_BATTLEFIELD",
  OpponentHandRevealPick: "OPPONENT_HAND_REVEAL_PICK",
  ParentContextExiledIds: "PARENT_CONTEXT_EXILED_IDS",
  ParentContextExiledIdsOwners: "PARENT_CONTEXT_EXILED_IDS_OWNERS",
  AnyGraveyard: "ANY_GRAVEYARD",
  AnyExile: "ANY_EXILE",
  SourceObject: "SOURCE_OBJECT",
  ControllerLibrary: "CONTROLLER_LIBRARY",
  OpponentHand: "OPPONENT_HAND",
  OpponentGraveyard: "OPPONENT_GRAVEYARD",
  LinkedObject: "LINKED_OBJECT",
  Target1HighestMVCreaturePlaneswalker: "TARGET_1_HIGHEST_MV_CREATURE_PLANESWALKER",
  ExiledCard: "EXILED_CARD",
  EventSource: "EVENT_SOURCE",
  EventPlayer: "EVENT_PLAYER",
  TriggerTargetController: "TRIGGER_TARGET_CONTROLLER",
  OtherSpiritsYouControl: "OTHER_SPIRITS_YOU_CONTROL",
  AllPermanentsYouControl: "ALL_PERMANENTS_YOU_CONTROL",
  AllFractalsYouControl: "ALL_FRACTALS_YOU_CONTROL",
  OtherCreatures: "OTHER_CREATURES",
  EachCreatureYouControl: "EACH_CREATURE_YOU_CONTROL",
  Opponent1: "OPPONENT_1",
  AllCreaturesControlledByTarget1: "ALL_CREATURES_CONTROLLED_BY_TARGET_1",
  ControllerGraveyardAndLibrary: "CONTROLLER_GRAVEYARD_AND_LIBRARY",
  AllPlayers: "ALL_PLAYERS",
  AnyTarget: "ANY_TARGET",
  SelfAndTarget1: "SELF_AND_TARGET_1",
  MatchingPermanentsYouControl: "MATCHING_PERMANENTS_YOU_CONTROL",
  MatchingPermanents: "MATCHING_PERMANENTS",
  Opponents: "OPPONENTS",
  RemainderOfPool: "REMAINDER_OF_POOL",
  RemainderOfLookingCards: "REMAINDER_OF_LOOKING_CARDS",
  OtherCreaturesAndPlaneswalkers: "OTHER_CREATURES_AND_PLANESWALKERS",
  Opponent: "OPPONENT",
} as const;
export type TargetMapping = (typeof TargetMapping)[keyof typeof TargetMapping];

export const DynamicAmount = {
  X: "X",
  SourcePower: "SOURCE_POWER",
  SourceToughness: "SOURCE_TOUGHNESS",
  SourceCountersP1P1: "SOURCE_COUNTERS_P1P1",
  Power: "POWER",
  DestroyedCount: "DESTROYED_COUNT",
  SavedMV: "SAVED_MV",
  TriggerEventValue: "TRIGGER_EVENT_VALUE",
  TriggerEventSourcePower: "TRIGGER_EVENT_SOURCE_POWER",
  DrawnThreeCheck: "DYNAMIC_DrawnThreeCheck",
  TwoPlusDiscardedMV: "DYNAMIC_2PlusDiscardedMV",
  DiscardedCount: "DISCARDED_COUNT",
  CardsDrawnThisTurn: "CARDS_DRAWN_THIS_TURN",
  ConvergeAmount: "CONVERGE_AMOUNT",
  Target1Power: "TARGET_1_POWER",
  Target1ManaValue: "TARGET_1_MANA_VALUE",
  Target1HandSize: "TARGET_1_HAND_SIZE",
  DiscardedCountPlus1: "DISCARDED_COUNT_PLUS_1",
  DifferentlyNamedLandsCount: "DIFFERENTLY_NAMED_LANDS_COUNT",
  CreaturesYouControl: "CREATURES_YOU_CONTROL",
  MagecraftSpent: "MAGECRAFT_SPENT",
  Target1GraveyardCreatureCountX2: "TARGET_1_GRAVEYARD_CREATURE_COUNT_X2",
  GraveyardSize: "GRAVEYARD_SIZE",
  GraveyardSizeNegative: "GRAVEYARD_SIZE_NEGATIVE",
  HandSize: "HAND_SIZE",
  OtherAttackingCreaturesCount: "OTHER_ATTACKING_CREATURES_COUNT",
  HandCount: "HAND_SIZE",
  ShrinesYouControlCount: "COUNT_Shrine",
  TriggerObjectPower: "TRIGGER_EVENT_SOURCE_POWER",
  EventObjectPower: "EVENT_OBJECT_POWER",
  GreatestPowerInYourGraveyard: "GREATEST_POWER_IN_GRAVEYARD",
  CreaturesDiedThisTurnCount: "CREATURES_DIED_THIS_TURN_COUNT",
  LandsYouControlCount: "COUNT_Land",
  DogsYouControlCount: "COUNT_Dog",
  CatsYouControlCount: "COUNT_Cat",
  InstantsAndSorceriesInGraveyard: "INSTANTS_SORCERIES_IN_GRAVEYARD",
  Count_Power4PlusCreaturesYouControl: "COUNT_POWER4PLUS_CREATURES_YOU_CONTROL"
} as const;
export type DynamicAmount = (typeof DynamicAmount)[keyof typeof DynamicAmount];

export const Phase = {
  Beginning: "Beginning",
  PreCombatMain: "PreCombatMain",
  Combat: "Combat",
  PostCombatMain: "PostCombatMain",
  Ending: "Ending",
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];

export const Step = {
  Untap: "Untap",
  Upkeep: "Upkeep",
  Draw: "Draw",
  Main: "Main",
  BeginningOfCombat: "BeginningOfCombat",
  DeclareAttackers: "DeclareAttackers",
  DeclareBlockers: "DeclareBlockers",
  FirstStrikeDamage: "FirstStrikeDamage",
  CombatDamage: "CombatDamage",
  EndOfCombat: "EndOfCombat",
  End: "End",
  Cleanup: "Cleanup",
} as const;
export type Step = (typeof Step)[keyof typeof Step];

export type GameObjectId = string;
export type PlayerId = string;

// A player's interactive request to the game engine
export const ActionType = {
  DeclareAttackers: "DECLARE_ATTACKERS",
  DeclareBlockers: "DECLARE_BLOCKERS",
  OrderBlockers: "ORDER_BLOCKERS",
  OrderAttackers: "ORDER_ATTACKERS",
  Discard: "DISCARD",
  Targeting: "TARGETING",
  ModalSelection: "MODAL_SELECTION",
  ResolutionChoice: "RESOLUTION_CHOICE",
  OptionalAction: "OPTIONAL_ACTION",
  Choice: "CHOICE",
  Scry: "SCRY",
  Surveil: "SURVEIL",
  ChooseX: "CHOOSE_X",
  OrderTriggers: "ORDER_TRIGGERS",
  LegendRule: "LEGEND_RULE",
} as const;
export type ActionType = (typeof ActionType)[keyof typeof ActionType];

/**
 * RestrictionType - Unified registry of action prevention and rule modifications (Rule 613/701).
 * Used to define keywords like 'CannotAttack' or 'MustAttack' as structured objects.
 */
export const RestrictionType = {
  CannotAttack: "CannotAttack",
  CannotBlock: "CannotBlock",
  CannotBlockThisTurn: "CannotBlockThisTurn",
  CannotBeBlocked: "CannotBeBlocked",
  CannotActivateNonManaAbilities: "CannotActivateNonManaAbilities",
  CannotActivateAbilities: "CannotActivateAbilities",
  CannotTap: "CannotTap",
  CannotUntap: "CannotUntap",
  CannotBeSacrificed: "CannotBeSacrificed",
  CannotBeCountered: "CannotBeCountered",
  CannotBeTargeted: "CannotBeTargeted",
  MustAttack: "MustAttack",
  MustBlock: "MustBlock",
  MustBeBlocked: "MustBeBlocked",
  CanAttackWithDefender: "CanAttackWithDefender",
  // Player restrictions
  CannotCastSpells: "CannotCastSpells",
  CannotDrawCards: "CannotDrawCards",
  CannotGainLife: "CannotGainLife",
  CannotCastPermanentSpells: "CannotCastPermanentSpells",
  CannotCastNamedCard: "CannotCastNamedCard",
  CannotActivateNamedCardAbilities: "CannotActivateNamedCardAbilities",
  CannotCastType: "CannotCastType",
} as const;
export type RestrictionType = (typeof RestrictionType)[keyof typeof RestrictionType];

/**
 * RestrictionObject - A structured rule modification.
 * Supports conditional restrictions (e.g. "Cannot attack UNLESS...")
 */
export interface RestrictionObject {
    type: RestrictionType | string;
    condition?: any; // ConditionDefinition reference
    duration?: any;  // EffectDuration reference
    value?: any;     // Extra metadata (e.g. specific IDs or colors)
    sourceId?: string;
}

/**
 * ActionResult - Standardized outcome of a game engine action.
 * Used by ActionProcessor to return structured feedback to the EffectProcessor.
 */
export interface ActionResult {
  /**
   * Whether the action completed successfully according to game rules.
   * False if the action was prevented (e.g. Indestructible, Protection, Prevention).
   */
  success: boolean;

  /**
   * Identifiers of GameObjects that were physically affected (moved, destroyed, transformed).
   */
  affectedIds: GameObjectId[];

  /**
   * The actual numeric value resulting from the action.
   * For Damage: Amount actually dealt after prevention/mitigation.
   * For Life: Amount actually gained/lost.
   * For Move: Number of cards successfully moved.
   */
  actualAmount: number;

  /**
   * If success is false, this explains why the rule engine stopped the action.
   * Common values: 'Indestructible', 'Ward', 'Hexproof', 'PreventionEffect', 'InvalidZone'.
   */
  stoppedBy?: string;

  /**
   * Extra metadata specific to the action (e.g. types of cards discarded).
   */
  metadata?: any;
}
