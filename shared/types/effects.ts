// effects.ts
// Effect types, definitions, and durations

import type { ParsedAbility } from './abilities';
import type { AbilityRestriction } from './targeting';
import type { GameObjectId, PlayerId } from './core';
import { Step, Zone, TargetMapping } from './core';

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
    CreateEmblem: 'CreateEmblem',
    Sacrifice: 'Sacrifice',
    Scry: 'Scry',
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
    CounterSpellOrAbility: 'CounterSpellOrAbility',
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
    PhaseOut: 'PhaseOut',
    DoublePowerXTimes: 'DoublePowerXTimes',
    Freeze: 'Freeze',
    GainKeyword: 'GainKeyword',
    GainControl: 'GainControl',
    CantCastNamedCard: 'CantCastNamedCard',
    CantAttackOrBlockNamedCard: 'CantAttackOrBlockNamedCard',
    MustBlockThisTurn: 'MustBlockThisTurn',
    EntersTapped: 'EntersTapped',
    ExileUntilLeaves: 'ExileUntilLeaves',
    Attach: 'Attach'
} as const;
export type EffectType = (typeof EffectType)[keyof typeof EffectType];

export const DurationType = {
    Static: 'STATIC',
    UntilEndOfTurn: 'UNTIL_END_OF_TURN',
    UntilEndOfCombat: 'UNTIL_END_OF_COMBAT',
    UntilEvent: 'UNTIL_EVENT',
    UntilNextUntapStep: 'UNTIL_NEXT_UNTAP_STEP',
    Permanent: 'PERMANENT',
    UntilYourNextTurn: 'UNTIL_YOUR_NEXT_TURN',
    UntilEndOfYourNextTurn: 'UNTIL_END_OF_YOUR_NEXT_TURN',
    NextEndStep: 'NEXT_END_STEP'
} as const;
export type DurationType = (typeof DurationType)[keyof typeof DurationType];

export interface EffectDuration {
    type: DurationType;
    untilStep?: Step;
    untilTurnOfPlayerId?: any;
    expiryEvent?: string;
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
    powerSet?: number | string;
    toughnessSet?: number | string;
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
    removeAllAbilities?: boolean;
    exileOnMoveToGraveyard?: boolean;
    condition?: string;
    copyFromId?: GameObjectId;
    canPlayExiled?: boolean;
    spendAnyMana?: boolean;
    isFreeCast?: boolean;
    limitPerTurn?: number;
    value?: any;
    restrictions?: AbilityRestriction[];
    flashbackCostOverride?: string;
    playerModifier?: {
        maxHandSize?: number;
        canPlayFromGraveyard?: boolean;
        canPlayFromTop?: boolean;
        lifeModifier?: number;
    };
}

/**
 * Rules Engine Representation of an Effect execution (CR 608/609).
 */
export interface EffectDefinition {
    // --- CORE ---
    type: EffectType;
    amount?: number | string | any | ((state: any, source: any, targets: string[], context?: any) => number);
    value?: any;
    label?: string;
    duration?: EffectDuration | string;
    layer?: number;
    condition?: string | any;
    oneShot?: boolean;
    isCombat?: boolean;
    triggerDescription?: string;

    // --- TARGETING ---
    targetMapping?: any | string;
    targetDefinition?: any;
    targetControllerMapping?: TargetMapping | string;
    copyFromIdMapping?: TargetMapping | string;
    restrictions?: any[];

    // --- STATS & COMBAT ---
    powerModifier?: number | string;
    toughnessModifier?: number | string;
    powerSet?: number | string;
    toughnessSet?: number | string;
    pMod?: number | string;
    tMod?: number | string;
    powerDynamic?: any;
    toughnessDynamic?: any;
    statBase?: any;
    staticStats?: { power?: number | string, toughness?: number | string };
    tapped?: boolean;

    // --- ABILITIES & MODIFIERS ---
    abilitiesToAdd?: (string | any)[];
    abilitiesToRemove?: any[];
    removeAllAbilities?: boolean;
    flashbackCostOverride?: string;
    subtypesToAdd?: string[];
    subtypesSet?: string[];
    canPlayExiled?: boolean;

    // --- MOVEMENT & ZONES ---
    zone?: Zone | string;
    sourceZones?: Zone[] | string[];
    libraryPosition?: number | 'top' | 'bottom';
    fromTop?: number | string | any;
    shuffle?: boolean;
    fromGraveyard?: boolean;
    fromExile?: boolean;
    isDiscard?: boolean;
    isDraw?: boolean;
    isFreeCast?: boolean;
    remainderZone?: Zone | string;
    remainderPosition?: string;
    shuffleRemainder?: boolean;
    returnToBattlefield?: boolean;
    returnDuration?: DurationType;

    // --- SELECTION & INTERACTIVE ---
    choices?: { 
        label: string; 
        effects?: EffectDefinition[]; 
        costs?: any[]; 
        targetDefinition?: any; 
        value?: string | number;
        condition?: string;
    }[];
    selectionType?: string;
    optional?: boolean;
    reveal?: boolean;
    revealed?: boolean;
    revealingPlayerId?: PlayerId | string;
    ownerControl?: boolean;

    // --- EFFECT CHAINING ---
    effects?: EffectDefinition[];
    onFailureEffects?: EffectDefinition[];
    delayedTriggers?: any[];
    next?: any;
    
    // --- META ---
    limitPerTurn?: number;
    eventMatch?: string;
    manaType?: string;
    maxCount?: number;
    costs?: any[];
    [key: string]: any;
}
