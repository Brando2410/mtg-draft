// effects.ts
// Effect types, definitions, and durations

import type { AbilityDefinition } from './abilities';
import type { GameObjectId, PlayerId } from './core';
import { Step, TargetMapping, Zone } from './core';
import type { StackObject } from './state';
import type { AbilityRestriction } from './targeting';

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
    CopyAbility: 'CopyAbility',
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
    abilitiesToAdd?: (string | AbilityDefinition)[];
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
 * ResolutionContext (CR 608): Standardized contract for passing state through
 * the effect resolution chain. Replaces loosely typed 'any' parameters.
 */
export interface ResolutionContext {
    sourceId: GameObjectId;
    controllerId: PlayerId;
    targets: string[];
    effects: EffectDefinition[]; // The list of effects in this resolution chain
    stackObject?: StackObject;
    parentContext?: ResolutionContext;
    startIndex?: number;
    event?: import('./events').GameEvent; // Standardized event triggering this resolution
    exiledIds?: string[];        // Track objects moved to exile during this resolution
    lookingCards?: string[];     // Track cards revealed/looked at during this resolution (e.g. Scry/Search)
    nextEffectIndex?: number;    // Pointer for resuming multi-step effects
    eventData?: any;             // Alias for backward compatibility
}

/**
 * ConditionContext: Standardized contract for requirement checks in ConditionProcessor.
 */
export interface ConditionContext {
    sourceId: GameObjectId;
    controllerId: PlayerId;
    event?: import('./events').GameEvent;
    stackObject?: StackObject;
    targets?: string[];
    eventData?: any;
}

/**
 * TargetingContext: Standardized contract for legality checks in TargetValidator.
 */
export interface TargetingContext {
    sourceId: string;
    controllerId: string;
    stackObject?: StackObject;
    targetDef?: any;
    targetIndex?: number;
}

/**
 * AmountResolver - Standardized representation for numeric values that change
 * based on game state (CR 107).
 */
export interface AmountResolver {
    type: 'CONSTANT' | 'POWER' | 'TOUGHNESS' | 'COUNT_PLAYER_PERMANENTS' | 'X_VALUE' | 'SCRIPT';
    baseValue?: number;
    multiplier?: number;
    offset?: number;
    subtype?: string; // For COUNT_PLAYER_PERMANENTS
    resolver?: (state: any, context: ResolutionContext) => number;
}

/**
 * Base properties shared by all effects (Rule 608)
 */
export interface BaseEffect {
    type: EffectType;
    label?: string;
    duration?: EffectDuration | string;
    layer?: number;
    condition?: string | any;
    targetMapping?: any | string;
    targetControllerMapping?: TargetMapping | string;
    restrictions?: any[];
    effects?: EffectDefinition[]; // Nested effects for chaining/conditionals
    onFailureEffects?: EffectDefinition[];
    [key: string]: any; // Transitional compatibility
}

export interface DamageEffect extends BaseEffect {
    type: typeof EffectType.DealDamage;
    amount: number | string | AmountResolver;
    damageSourceMapping?: string;
}

export interface LifeEffect extends BaseEffect {
    type: typeof EffectType.GainLife | typeof EffectType.LoseLife;
    amount: number | string | AmountResolver;
}

export interface MoveEffect extends BaseEffect {
    type: typeof EffectType.MoveToZone | typeof EffectType.PutOnBattlefield | typeof EffectType.PutInHand | typeof EffectType.ReturnToHand | typeof EffectType.Exile | typeof EffectType.ExileTopCard | typeof EffectType.ExileAllCards | typeof EffectType.ShuffleLibrary;
    zone?: Zone | string;
    sourceZones?: Zone[] | string[];
    libraryPosition?: number | 'top' | 'bottom';
    shuffle?: boolean;
    fromTop?: number | string | AmountResolver;
    reveal?: boolean;
    tapped?: boolean;
    ownerControl?: boolean;
}

export interface DrawEffect extends BaseEffect {
    type: typeof EffectType.DrawCards | typeof EffectType.DiscardCards | typeof EffectType.Mill | typeof EffectType.Scry | typeof EffectType.Surveil;
    amount: number | string | AmountResolver;
    fromTop?: number | string | AmountResolver; // For Scry/Surveil/LookAtTop
}

export interface SearchEffect extends BaseEffect {
    type: typeof EffectType.SearchLibrary;
    sourceZones?: Zone[];
    shuffle?: boolean;
    reveal?: boolean;
    targetDefinition?: any;
}

export interface CounterEffect extends BaseEffect {
    type: typeof EffectType.AddCounters | typeof EffectType.Counter | typeof EffectType.DoubleCounters | typeof EffectType.MoveCounters;
    counterType?: string;
    amount?: number | string | AmountResolver;
}

export interface TokenEffect extends BaseEffect {
    type: typeof EffectType.CreateToken | typeof EffectType.CreateTokenCopy;
    amount?: number | string | AmountResolver;
    definition?: any; // CardDefinition for token
    abilitiesToAdd?: (string | AbilityDefinition)[];
}

export interface ContinuousEffectDefinition extends BaseEffect {
    type: typeof EffectType.ApplyContinuousEffect;
    abilitiesToAdd?: (string | AbilityDefinition)[];
    abilitiesToRemove?: string[];
    restrictionsToAdd?: (RestrictionDefinition | string)[];
    powerModifier?: number | string;
    toughnessModifier?: number | string;
    powerSet?: number | string;
    toughnessSet?: number | string;
    removeAllAbilities?: boolean;
}

export interface RestrictionDefinition {
    type: import('./core').RestrictionType | string;
    value?: any;
    condition?: any;
}

export interface ModalEffect extends BaseEffect {
    type: typeof EffectType.Choice;
    choices: {
        label: string;
        effects?: EffectDefinition[];
        costs?: any[];
        targetDefinition?: any;
        value?: string | number;
        condition?: string;
    }[];
}

/**
 * Rules Engine Representation of an Effect execution (CR 608/609).
 * Now a Union for type-safe parameter enforcement.
 */
export type EffectDefinition =
    | DamageEffect
    | LifeEffect
    | DrawEffect
    | MoveEffect
    | SearchEffect
    | CounterEffect
    | TokenEffect
    | ContinuousEffectDefinition
    | ModalEffect
    | BaseEffect;
