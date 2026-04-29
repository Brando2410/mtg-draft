// targeting.ts
// Targeting and restriction interfaces

import type { GameObjectId, PlayerId, RestrictionType } from './core';
import { Zone } from './core';
import type { EffectDuration } from './effects';
import type { GameObject, PlayerState, StackObject } from './state';

/**
 * Targetable - Union of all entities that can be targeted or affected by restrictions.
 */
export type Targetable = GameObject | PlayerState | StackObject;

export const TargetType = {
    Creature: 'CREATURE',
    Player: 'PLAYER',
    AnyTarget: 'ANY_TARGET',
    Permanent: 'PERMANENT',
    Land: 'LAND',
    Artifact: 'ARTIFACT',
    Enchantment: 'ENCHANTMENT',
    Planeswalker: 'PLANESWALKER',
    Spell: 'SPELL',
    CreatureOrPlaneswalker: 'CREATURE_OR_PLANESWALKER',
    NonlandPermanent: 'NON_LAND_PERMANENT',
    CardInGraveyard: 'CARD_IN_GRAVEYARD',
    CardInExile: 'CARD_IN_EXILE',
    CardInHand: 'CARD_IN_HAND',
    Opponent: 'OPPONENT',
    Self: 'SELF',
    PlayerOrPlaneswalker: 'PLAYER_OR_PLANESWALKER',
    Card: 'CARD',
    ArtifactOrEnchantment: 'ARTIFACT_OR_ENCHANTMENT',
    InstantOrSorcery: 'INSTANT_OR_SORCERY',
    ArtifactEnchantmentOrPlaneswalker: 'ARTIFACT_ENCHANTMENT_OR_PLANESWALKER',
    SpellOrPermanent: 'SPELL_OR_PERMANENT',
    Any: 'ANY'
} as const;
export type TargetType = (typeof TargetType)[keyof typeof TargetType];

/**
 * TargetDefinition - Standardized contract for specifying legal targets.
 * Standardizes Rule 601.2c (Casting) and 608.2b (Resolution).
 */
export interface TargetDefinition {
    /** The fundamental type requirement (CREATURE, PLAYER, etc.) */
    type?: TargetType | string;

    /** 
     * Target count logic. 
     * If number: Exact count required.
     * If { min, max }: Range of allowed targets.
     * If 'any' or 'AnyNumber': Select any number of targets.
     */
    count?: number | { min: number; max: number } | 'any' | 'AnyNumber';

    /** Equivalent to count: { min: N } */
    minCount?: number;

    /** Equivalent to count: { max: N } */
    maxCount?: number;

    /** If true, the controller can choose 0 targets even if min/count is specified */
    optional?: boolean;

    /** General filters (e.g. ['youcontrol', 'nonland']) */
    restrictions?: (TargetRestriction | string)[];

    /** Specific filters applied to each individual target slot in multi-targeting */
    perTargetRestrictions?: (TargetRestriction | string)[][];

    /** Zones where the targets must be located (Default: Battlefield) */
    sourceZones?: Zone[];

    /** Legacy alias for sourceZones[0] */
    zone?: Zone;

    /** Specific controller requirement ('CONTROLLER', 'OPPONENT') */
    controller?: 'CONTROLLER' | 'OPPONENT' | string;

    /** UI Prompt to show the user */
    label?: string;
    
    /** Extra metadata for complex filters (e.g. manaValue threshold) */
    data?: any;
}

// RestrictionType is now unified in shared/types/core.ts


export interface AbilityRestriction {
    id: string;
    sourceId: GameObjectId;
    type: RestrictionType;
    targetId?: GameObjectId;
    targetControllerId?: PlayerId;
    duration: EffectDuration;
}

export const Restriction = {
    Creature: 'creature',
    Artifact: 'artifact',
    Land: 'land',
    Enchantment: 'enchantment',
    Planeswalker: 'planeswalker',
    Instant: 'instant',
    Sorcery: 'sorcery',
    Permanent: 'permanent',
    Card: 'card',
    NonLand: 'non_land',
    NonCreature: 'non_creature',
    NonArtifact: 'non_artifact',
    NonEnchantment: 'non_enchantment',
    NonPlaneswalker: 'non_planeswalker',
    Other: 'other',
    Self: 'self',
    Graveyard: 'graveyard',
    FromHand: 'from_hand',
    YouControl: 'you_control',
    NotControlled: 'not_controlled',
    OpponentControl: 'opponent_control',
    Legendary: 'legendary',
    Basic: 'basic',
    Tapped: 'tapped',
    Untapped: 'untapped',
    AttackingOrBlocking: 'attacking_or_blocking',
    Attacking: 'attacking',
    Blocking: 'blocking',
    WasDealtDamageThisTurn: 'was_dealt_damage_this_turn',
    HasP1P1Counter: 'hascounter_p1p1',
    GreatestPower: 'greatest_power',
    Monocolored: 'monocolored',
    Multicolored: 'multicolored',
    Colorless: 'colorless',
    HasXInManaCost: 'hasxinmanacost',
    InstantOrSorceryCastThisTurn: 'instant_or_sorcery_cast_this_turn',
    AnyTarget: 'any_target',
    Player: 'player',
    Opponent: 'opponent',
    You: 'you',
    NonLegendary: 'non_legendary',
    NonLandPermanent: 'non_land_permanent',
    ArtifactCreature: 'artifact_creature',
    Token: 'token',
    NonToken: 'non_token',
    YouOwn: 'you_own',
    OpponentOwns: 'opponent_owns',
    InstantOrSorcery: 'instant_or_sorcery',
    ArtifactOrCreature: 'artifact_or_creature',
    WithoutFlying: 'without_flying',
    White: 'white',
    Blue: 'blue',
    Black: 'black',
    Red: 'red',
    Green: 'green',
    NonWhite: 'nonwhite',
    NonBlue: 'nonblue',
    NonBlack: 'nonblack',
    NonRed: 'nonred',
    NonGreen: 'nongreen',
    Spirit: 'spirit',
    Shrine: 'shrine',
    Dog: 'dog',
    Cat: 'cat',
    Zombie: 'zombie',
    Goblin: 'goblin',
    NonBasic: 'non_basic',
    Flying: 'flying',
    Defender: 'defender',
    Haste: 'haste',
    Vigilance: 'vigilance',
    Lifelink: 'lifelink',
    Deathtouch: 'deathtouch',
    Trample: 'trample',
    Menace: 'menace',
    Reach: 'reach',
    FirstStrike: 'firststrike',
    DoubleStrike: 'doublestrike',
    Indestructible: 'indestructible',
    CreatureOrLand: 'creature_or_land',
    CreatureOrPlaneswalker: 'creature_or_planeswalker',
    ArtifactOrEnchantment: 'artifact_or_enchantment',
    Forest: 'forest',
    Island: 'island',
    Mountain: 'mountain',
    Plains: 'plains',
    Swamp: 'swamp',
    Lesson: 'lesson',
    Pest: 'pest',
    Bat: 'bat',
    Insect: 'insect',
    Snake: 'snake',
    Spider: 'spider',
    Bird: 'bird',
    Goat: 'goat',
    Ox: 'ox',

    // Ugin / Specialized / Build Fixes
    OneOrMoreColors: 'oneormorecolors',
    ManaValueLessOrEqualToX: 'mv_le_x',
    Ability: 'ability',
    Any: 'any',
    All: 'all',
    LandOrShrine: 'landorshrine',
    CannotBlock: 'cannotblock',
    MustAttack: 'mustattack',

    // New additions for audit alignment
    Name: 'name',
    Liliana: 'liliana',
    Garruk: 'garruk',
    Basri: 'basri',
    Teferi: 'teferi',
    Chandra: 'chandra',
    Power4OrGreater: 'power4orgreater',
    ManaValue6OrGreater: 'mv6orgreater',
    ManaValue5OrGreater: 'mv5orgreater',
    ManaValue1OrLess: 'mv_le_1',
    ManaValue2OrLess: 'mv_le_2',
    ManaValue3OrLess: 'mv_le_3',
    ManaValue4OrLess: 'mv_le_4',
    ManaValue1OrGreater: 'mv_ge_1',
    ManaValue4OrGreater: 'mv_ge_4',
    ManaValueLeLifeGained: 'mv_le_life_gained',
    ExiledWithSource: 'exiledwithsource',
    SharesColorWithSource: 'shares_color_with_source',
    ControlledByTarget1: 'controlled_by_target_1',
    ManaValueLessThanSource: 'mv_lt_source',
    Power2OrLess: 'power_le_2',
    Power3OrGreater: 'power3orgreater',
    Power3OrLess: 'power_le_3',
    SameNameAsSource: 'samenameassource',
    Aura: 'aura',
    NonAura: 'non_aura',
    NotAura: 'non_aura',
    Spell: 'spell',
} as const;

export type TargetRestriction = (typeof Restriction)[keyof typeof Restriction] | {
    type?: string;
    value?: any;
    restrictions?: (TargetRestriction | string)[];
    not?: any;
    [key: string]: any;
};
