// targeting.ts
// Targeting and restriction interfaces

import type { GameObjectId, PlayerId } from './core';
import { Zone } from './core';
import type { EffectDuration } from './effects';

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

export const RestrictionType = {
    CannotTap: 'CannotTap',
    CannotUntap: 'CannotUntap',
    CannotAttack: 'CannotAttack',
    CannotBlock: 'CannotBlock',
    CannotBlockThisTurn: 'CannotBlockThisTurn',
    CannotCastType: 'CannotCastType',
    CannotActivateNonManaAbilities: 'CannotActivateNonManaAbilities',
    CannotActivateAbilities: 'CannotActivateAbilities',
    CannotActivateNamedCardAbilities: 'CannotActivateNamedCardAbilities',
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
    NonLand: 'nonland',
    NonCreature: 'noncreature',
    NonArtifact: 'nonartifact',
    NonEnchantment: 'nonenchantment',
    NonPlaneswalker: 'nonplaneswalker',
    Other: 'other',
    Another: 'another',
    Self: 'self',
    Graveyard: 'graveyard',
    FromHand: 'fromhand',
    YouControl: 'youcontrol',
    NotControlled: 'notcontrolled',
    OpponentControl: 'opponentcontrol',
    Opponents: 'opponents',
    Yours: 'yours',
    Legendary: 'legendary',
    Basic: 'basic',
    Tapped: 'tapped',
    Untapped: 'untapped',
    AttackingOrBlocking: 'attackingorblocking',
    Monocolored: 'monocolored',
    Multicolored: 'multicolored',
    Colorless: 'colorless',
    HasXInManaCost: 'hasxinmanacost',
    InstantOrSorceryCastThisTurn: 'instantorsorcerycastthisturn',
    AnyTarget: 'anytarget',
    Player: 'player',
    Opponent: 'opponent',
    You: 'you',
    NonLegendary: 'nonlegendary',
    NonLandPermanent: 'nonlandpermanent',
    ArtifactCreature: 'artifactcreature',
    Token: 'token',
    NonToken: 'nontoken',
    OpponentControls: 'opponentcontrols',
    YouOwn: 'youown',
    OpponentOwns: 'opponentowns'
} as const;

export type TargetRestriction = (typeof Restriction)[keyof typeof Restriction] | {
    type?: string;
    value?: any;
    restrictions?: (TargetRestriction | string)[];
    not?: any;
    [key: string]: any;
};
