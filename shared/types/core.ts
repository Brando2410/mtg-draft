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

const _Keyword = {
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

/**
 * Keyword - MTG Keywords.
 * Dynamic: Supports arbitrary keywords like Keyword.Casualty1 or Keyword.Ward2.
 */
export const Keyword: Record<string, string> & typeof _Keyword = new Proxy(_Keyword as any, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    // Return the property name as is (e.g. Ward2 -> Ward2) 
    // or you could add normalization logic here.
    return prop;
  }
});

export type Keyword = string;

const _CounterType = {
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

export type CounterType = 'loyalty' | 'p1p1' | 'm1m1' | 'charge' | 'energy' | 'poison' | 'experience' | 'lore' | 'time' | 'suspend' | 'oil' | 'shield' | 'stun' | 'doom' | 'corrupt' | 'slime' | '+1/+1' | '-1/-1' | 'suspect' | 'blood';

/**
 * CounterType - MTG Counter types.
 * Dynamic: Supports arbitrary counters like CounterType.Oil or CounterType.Filibuster.
 */
export const CounterType: Record<string, string> & typeof _CounterType = new Proxy(_CounterType as any, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    return prop.toLowerCase();
  }
});



export const EnginePrefix = {
  VirtualPrepared: "virtual_prepared_",
  Copy: "copy_",
  Token: "token_",
  Flashback: "flashback_",
  Permission: "permission_",
  FreeCast: "free_",
  VirtualHand: "v_",
} as const;

export const SelectionType = {
  Target: "Target",
  Choice: "Choice",
  Random: "Random",
  ALL: "ALL",
  TopN: "TopN",
  ANY: "ANY",
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

const _TargetMapping = {
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
  RemainderOfLookingCards: "REMAINING_LOOKING_CARDS",
  OtherCreaturesAndPlaneswalkers: "OTHER_CREATURES_AND_PLANESWALKERS",
  Opponent: "OPPONENT",
  AllCreaturesOpponentsControl: "ALL_CREATURES_OPPONENTS_CONTROL",
  AllPermanentsOpponentsControl: "ALL_PERMANENTS_OPPONENTS_CONTROL",
} as const;

/**
 * TargetMapping - MTG Target Resolution contracts.
 * Dynamic: Automatically handles Target1, Target2, Target1Controller, Target1Owner, etc.
 */
export const TargetMapping: Record<string, string> & typeof _TargetMapping = new Proxy(_TargetMapping as any, {
  get(target, prop: string) {
    if (prop in target) return target[prop];

    // Dynamic conversion: CamelCase -> SNAKE_CASE
    // e.g. Target1Controller -> TARGET_1_CONTROLLER
    // e.g. Target99Owner -> TARGET_99_OWNER
    if (prop.startsWith('Target')) {
      return prop.replace(/([A-Z0-9])/g, (match) => `_${match}`).toUpperCase().substring(1);
    }

    return prop.toUpperCase();
  }
});

export type TargetMapping = string;

const _DynamicAmount = {
  X: "X",
  XPlus1: "X_PLUS_1",
  XPowerOf2: "X_POWER_OF_2",
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
  CreaturesYouControl: "CREATURES_YOU_CONTROL",
  CreatureCountYouControl: "CREATURE_COUNT_YOU_CONTROL",
  LandsYouControl: "LANDS_YOU_CONTROL",
  GraveyardSize: "GRAVEYARD_SIZE",
  HandSize: "HAND_SIZE",
  CardsInHandCount: "CARDS_IN_HAND_COUNT",
  LifeGainedThisTurn: "LIFE_GAINED_THIS_TURN",
  SpellsCastThisTurn: "SPELLS_CAST_THIS_TURN",
  CreaturesDiedThisTurnCount: "CREATURES_DIED_THIS_TURN_COUNT",
  InstantSorceryInGraveyardCount: "INSTANT_SORCERY_IN_GRAVEYARD_COUNT",
  EventAmount: "EVENT_AMOUNT",
  Target1ManaValue: "TARGET_1_MANA_VALUE",
  Target1HandSize: "TARGET_1_HAND_SIZE",
  DiscardedCountPlus1: "DISCARDED_COUNT_PLUS_1",
  DifferentlyNamedLandsCount: "DIFFERENTLY_NAMED_LANDS_COUNT",
  MagecraftSpent: "MAGECRAFT_SPENT",
  GraveyardSizeNegative: "GRAVEYARD_SIZE_NEGATIVE",
  OtherAttackingCreaturesCount: "OTHER_ATTACKING_CREATURES_COUNT",
  TriggerObjectPower: "TRIGGER_EVENT_SOURCE_POWER",
  EventObjectPower: "EVENT_OBJECT_POWER",
  GreatestPowerInYourGraveyard: "GREATEST_POWER_IN_GRAVEYARD",
  PaidManaSpent: "PAID_MANA_SPENT",
} as const;

/**
 * DynamicAmount - MTG Numeric calculation contracts.
 * Supports static keys and dynamic patterns like DynamicAmount.CountGoblins or DynamicAmount.AffinityArtifacts.
 */
export const DynamicAmount: Record<string, string> & typeof _DynamicAmount = new Proxy(_DynamicAmount as any, {
  get(target, prop: string) {
    if (prop in target) return target[prop];

    // Handle Count[Type] -> COUNT_[TYPE]
    if (prop.startsWith('Count')) {
      const type = prop.substring(5);
      return `COUNT_${type.toUpperCase()}`;
    }

    // Handle Affinity[Type] -> AFFINITY_[TYPE]
    if (prop.startsWith('Affinity')) {
      const type = prop.substring(8);
      return `AFFINITY_${type.toUpperCase()}`;
    }

    return prop.toUpperCase();
  }
});

export type DynamicAmount = string;

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
  Mulligan: "MULLIGAN",
  StartingPlayerSelection: "STARTING_PLAYER_SELECTION",
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
