// abilities.ts
// Ability types and structures

import type { GameObjectId, PlayerId } from './core';
import { Zone } from './core';
import type { EffectDefinition, EffectDuration } from './effects';
import type { TriggerEvent } from './events';
import type { TargetDefinition } from './targeting';

export const AbilityType = {
    Spell: 'Spell',
    Activated: 'ActivatedAbility',
    Triggered: 'TriggeredAbility',
    Static: 'Static',
    Replacement: 'Replacement'
} as const;
export type AbilityType = (typeof AbilityType)[keyof typeof AbilityType];

export const CostType = {
    Tap: 'Tap',
    Mana: 'Mana',
    PayLife: 'PayLife',
    Discard: 'Discard',
    Sacrifice: 'Sacrifice',
    Loyalty: 'Loyalty',
    Exile: 'Exile',
    Crew: 'Crew',
    RemoveCounter: 'RemoveCounter',
    TapSelection: 'TapSelection',
    ExileSelf: 'ExileSelf',
    Choice: 'Choice',
    SacrificeSelf: 'SacrificeSelf',
    AddCounter: 'AddCounter'
} as const;
export type CostType = (typeof CostType)[keyof typeof CostType];

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
    HandCountGe: 'HAND_COUNT_GE',
    Infusion: 'INFUSION',
    TargetIsOpponent: 'TARGET_IS_OPPONENT',
    OwnCreatureEnters: 'OWN_CREATURE_ENTERS',
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
    CastInstantSorceryThisTurn: 'CAST_INSTANT_SORCERY_THIS_TURN',
    OwnCreatureDies: 'OWN_CREATURE_DIES',
    ReparteeTrigger: 'REPARTEE_TRIGGER',
    SelfAttacks: 'SELF_ATTACKS',
    SpellTargetsSource: 'SPELL_TARGETS_SOURCE',
    LifeGained2OrMoreThisTurn: 'LIFE_GAINED_2_OR_MORE_THIS_TURN',
    LifeGained3OrMoreThisTurn: 'LIFE_GAINED_3_OR_MORE_THIS_TURN',
    ControllerHasArtifact: 'CONTROLLER_HAS_ARTIFACT',
    EventPlayerIsYou: 'EVENT_PLAYER_IS_YOU',
    HasPermanent: 'HAS_PERMANENT',
    NotHasPermanent: 'NOT_HAS_PERMANENT',
    SpellTargetsCreature: 'SPELL_TARGETS_CREATURE',
    SpellIsCreature: 'SPELL_IS_CREATURE',
    SelfDied: 'SELF_DIED',
    EventSourceIsSelf: 'EVENT_SOURCE_IS_SELF',
    NotCastFromHand: 'NOT_CAST_FROM_HAND',
    EventObjectIsTriggerSource: 'EVENT_OBJECT_IS_TRIGGER_SOURCE',
    EventPlayerIsOpponent: 'EVENT_PLAYER_IS_OPPONENT',
    NextSpellThisTurn: 'NEXT_SPELL_THIS_TURN',
    CastDuringMainPhase: 'CAST_DURING_MAIN_PHASE',
    OpponentHasMoreCardsInHand: 'OPPONENT_HAS_MORE_CARDS_IN_HAND',
    IsInstantOrSorceryDiscarded: 'IS_INSTANT_OR_SORCERY_DISCARDED',
    TotalToughnessGe: 'TOTAL_TOUGHNESS_GE',
    GraveyardCreatureCountGe3: 'GRAVEYARD_CREATURE_COUNT_GE_3',
    NotCreature: 'NOT_CREATURE',
    OpponentControlsMoreCreatures: 'OPPONENT_CONTROLS_MORE_CREATURES',
    CreaturesDiedCountGe: 'CREATURES_DIED_COUNT_GE',
    CardsExiledThisTurn: 'CARDS_EXILED_THIS_TURN',
    CreatureDiedUnderYourControlThisTurn: 'CREATURE_DIED_UNDER_YOUR_CONTROL_THIS_TURN'
} as const;
export type ConditionType = (typeof ConditionType)[keyof typeof ConditionType] | string;

/**
 * Base properties shared by all costs (Rule 601.2f)
 */
export interface BaseAbilityCost {
    type: CostType;
    label?: string;
    optional?: boolean;
    [key: string]: any; // Transitional compatibility
}

export interface ManaCost extends BaseAbilityCost {
    type: typeof CostType.Mana;
    value: string; // Mana string like "{1}{B}"
    costModifiers?: { type: 'REDUCE_GENERIC_PER_COUNTER', counterType: string, amount?: number, multiplier?: number }[];
}

export interface TapCost extends BaseAbilityCost {
    type: typeof CostType.Tap;
}

export interface SacrificeCost extends BaseAbilityCost {
    type: typeof CostType.Sacrifice | typeof CostType.SacrificeSelf;
    amount?: number;
    targetDefinition?: TargetDefinition;
    restrictions?: (string | any)[];
}

export interface DiscardCost extends BaseAbilityCost {
    type: typeof CostType.Discard;
    amount?: number;
    targetDefinition?: TargetDefinition;
}

export interface LifeCost extends BaseAbilityCost {
    type: typeof CostType.PayLife;
    amount: number;
}

/**
 * Rules Engine Representation of an Ability activation cost (CR 602.1a).
 * Now a Union for type-safe parameter enforcement.
 */
export type AbilityCost = 
    | ManaCost 
    | TapCost 
    | SacrificeCost 
    | DiscardCost 
    | LifeCost 
    | BaseAbilityCost;

export interface ActivatedAbility {
    id: string;
    sourceId: GameObjectId;
    controllerId: PlayerId;
    costs: AbilityCost[];
    isManaAbility: boolean;
}

export interface TriggeredAbility {
    id: string;
    sourceId: GameObjectId;
    controllerId: PlayerId;
    name?: string;
    eventMatch: string | string[];
    activeZone?: Zone;
    condition?: string | ConditionType | ((state: any, event: any, ability: TriggeredAbility) => boolean);
    limitPerTurn?: number;
    duration?: EffectDuration;
    oracleText?: string;
    effects?: EffectDefinition[];
    isGlobal?: boolean;
    type?: AbilityType;
    payload?: any;
}

/**
 * AbilityDefinition - Standardized contract for all card abilities.
 * Standardizes Rule 113 (Abilities), separating Spell, Activated, Triggered, and Static types.
 */
export type AbilityDefinition = 
    | SpellAbilityDefinition 
    | ActivatedAbilityDefinition 
    | TriggeredAbilityDefinition 
    | StaticAbilityDefinition;

export interface BaseAbilityDefinition {
    id?: string;
    /** The name of the ability (e.g. "Equip", "Flashback", or custom names) */
    name?: string;
    /** Mandatory for all abilities - identifies the rules category */
    type: AbilityType;
    /** Full rules text of the ability */
    oracleText?: string;
    /** The zone where this ability is active (Default: Battlefield for permanents, Stack for spells) */
    activeZone?: Zone;
    /** 
     * ACTIVATION-TIME TARGETS (CR 601.2c / 602.2b)
     * These must be chosen when the spell/ability is put on the stack.
     */
    targetDefinition?: TargetDefinition | TargetDefinition[];
    /** Manual override for card image/art */
    image_url?: string;
    /** Metadata for UI display */
    triggerMetadata?: {
        isCombat?: boolean;
        triggerDescription?: string;
    };
    /** Optionality of the entire ability */
    optional?: boolean;
    /** Costs that must be paid in addition to the primary cost (Rule 601.2f) */
    additionalCosts?: AbilityCost[];
    /** Shortcut mana cost for display or complex resolution hooks */
    manaCost?: string;
    /** Specific cost override for Flashback implementation */
    flashbackCost?: string;
    /** Inherent cost reduction logic (used by some specialized cards) */
    costReduction?: any;
}

/**
 * SpellAbilityDefinition - Represents a spell being cast from the hand or other zones (Rule 113.3a).
 */
export interface SpellAbilityDefinition extends BaseAbilityDefinition {
    type: typeof AbilityType.Spell;
    /** Ordered list of effects to execute upon resolution (Rule 608). Optional for Auras/Modals that use ETB or modes. */
    effects?: EffectDefinition[];
    /** Whether the card is exiled after resolving instead of going to graveyard */
    exileOnResolution?: boolean;
    /** Modal spell configuration (e.g. "Choose one --") */
    isModal?: boolean;
    multiMode?: { type: string };
    multiTargetMapping?: boolean;
    minChoices?: number;
    maxChoices?: number;
    modes?: any[];
    /** Alternative costs (e.g. Flashback, Overload) */
    costs?: AbilityCost[];
}

/**
 * ActivatedAbilityDefinition - Represents an ability activated by a player (Rule 113.3b).
 */
export interface ActivatedAbilityDefinition extends BaseAbilityDefinition {
    type: typeof AbilityType.Activated;
    /** Costs required to activate this ability (Rule 602.2b) */
    costs: AbilityCost[];
    /** Ordered list of effects to execute upon resolution */
    effects: EffectDefinition[];
    /** Limit to sorcery-speed only */
    activatedOnlyAsSorcery?: boolean;
    /** Whether this is a mana ability (doesn't use stack, Rule 605) */
    isManaAbility?: boolean;
    /** Usage limits per turn */
    limitPerTurn?: number;
    /** Activation condition (e.g. "only if you have 27+ life") */
    condition?: string | ConditionType | ((state: any, event: any, t: any) => boolean);
    /** Pre-declared targets for the ability */
    targets?: any[];
    /** Restrictions on what can be targeted or affected */
    restrictions?: any[];
}

/**
 * TriggeredAbilityDefinition - Represents an ability triggered by a game event (Rule 113.3c).
 */
export interface TriggeredAbilityDefinition extends BaseAbilityDefinition {
    type: typeof AbilityType.Triggered;
    /** The game event(s) that trigger this ability (Rule 603) */
    eventMatch: TriggerEvent | TriggerEvent[];
    /** Ordered list of effects to execute upon resolution */
    effects: EffectDefinition[];
    /** Logic expression or custom function to check before putting on stack (The "intervening if" clause) */
    condition?: string | ConditionType | ((state: any, event: any, t: any) => boolean);
    /** Usage limits per turn */
    maxTriggersPerTurn?: number;
    limitPerTurn?: number;
    /** Pre-declared targets for the triggered ability */
    targets?: any[];
}

/**
 * StaticAbilityDefinition - Represents a continuous rule change (Rule 113.3d).
 */
export interface StaticAbilityDefinition extends BaseAbilityDefinition {
    type: typeof AbilityType.Static | typeof AbilityType.Replacement;
    /** Continuous effects generated by this ability (Rule 611) */
    effects?: EffectDefinition[];
    /** Custom logic conditions for the static effect to be active */
    condition?: string | ConditionType | ((state: any, event: any, t: any) => boolean);
    /** Specific rule restrictions (e.g. "Cannot attack") */
    restrictions?: { type: string, value?: string, effectZone?: string, targetId?: string, targetMapping?: string }[];
    /** Event to replace (for Replacement effects) */
    replacesEvent?: string;
    /** Specific cost reductions granted by this ability */
    costReduction?: any;
    /** Cost overrides for special actions */
    flashbackCost?: string;
    manaCost?: string;
}


