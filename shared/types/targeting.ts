// targeting.ts
// Targeting and restriction interfaces

import { EffectDuration } from './effects';
import { GameObjectId, PlayerId, Zone } from './core';

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
    Card: 'CARD'
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

export const RestrictionType = {
    CannotTap: 'CannotTap',
    CannotUntap: 'CannotUntap',
    CannotAttack: 'CannotAttack',
    CannotBlock: 'CannotBlock',
    CannotBlockThisTurn: 'CannotBlockThisTurn',
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
