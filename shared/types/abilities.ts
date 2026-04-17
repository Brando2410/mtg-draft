// abilities.ts
// Ability types and structures

import { EffectDefinition, EffectDuration } from './effects';
import { GameObjectId, PlayerId, Zone } from './core';
import { TargetDefinition } from './targeting';
import { TriggerEvent } from './events';

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
    SacrificeSelf: 'SacrificeSelf'
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
    OwnCreatureDies: 'OWN_CREATURE_DIES'
} as const;
export type ConditionType = (typeof ConditionType)[keyof typeof ConditionType] | string;

export interface AbilityCost {
    type: CostType;
    value?: any;
    amount?: number;
    restrictions?: (string | any)[];
    targetMapping?: string;
    counterType?: string;
    costModifiers?: { type: 'REDUCE_GENERIC_PER_COUNTER', counterType: string, amount?: number, multiplier?: number }[];
    sourceZone?: Zone;
    sourceZones?: Zone[];
    label?: string;
    choices?: { label: string, costs: AbilityCost[] }[];
    zone?: Zone;
    optional?: boolean;
    restriction?: any;
    selectionType?: string;
    targetDefinition?: TargetDefinition;
}

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
    condition?: (state: any, event: any, ability: TriggeredAbility) => boolean;
    limitPerTurn?: number;
    duration?: EffectDuration;
    oracleText?: string;
    effects?: EffectDefinition[];
}

export interface ParsedAbility {
    id?: string;
    name?: string;
    type: AbilityType;
    multiMode?: { type: string };
    multiTargetMapping?: boolean;
    modes?: any[];
    activeZone?: Zone;
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
        triggerDescription?: string;
    };
    isModal?: boolean;
    minChoices?: number;
    maxChoices?: number;
    optional?: boolean;
    limitPerTurn?: number;
    maxTriggersPerTurn?: number;
    oracleText?: string;
    replacesEvent?: string;
    exileOnResolution?: boolean;
    costReduction?: any;
    flashbackCost?: string;
    manaCost?: string;
    restrictions?: { type: string, value?: string, effectZone?: string }[];
    effects?: EffectDefinition[];
}
