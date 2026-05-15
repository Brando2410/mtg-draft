// effects.ts
// Effect types, definitions, and durations

import type { AbilityDefinition, AbilityCost } from './abilities';
import type { GameObjectId, PlayerId } from './core';
import { Step, TargetMapping, Zone, CounterType } from './core';
import type { StackObject, GameObject, PlayerState, GameState } from './state';
import type { AbilityRestriction, TargetDefinition } from './targeting';
import type { GameEvent } from './events';

export const EffectType = {
    DealDamage: 'DealDamage',
    DrawCards: 'DrawCards',
    DiscardCards: 'DiscardCards',
    Destroy: 'Destroy',
    Exile: 'Exile',
    ExileTopCard: 'ExileTopCard',
    ExileAllCards: 'ExileAllCards',
    CREW: 'CREW',
    CreateToken: 'CreateToken',
    AddCounters: 'AddCounters',
    ApplyContinuousEffect: 'ApplyContinuousEffect',
    CopyObject: 'CopyObject',
    Choice: 'Choice',
    ConditionalEffect: 'ConditionalEffect',
    SearchLibrary: 'SearchLibrary',
    PutOnBattlefield: 'PutOnBattlefield',
    ReturnToHand: 'ReturnToHand',
    GainLife: 'GainLife',
    LoseLife: 'LoseLife',
    AddMana: 'AddMana',
    Necromentia: 'Necromentia',
    Tapped: 'Tapped',
    Untap: 'Untap',
    Fight: 'Fight',
    CostReduction: 'CostReduction',
    AllowOutOfTurnActivation: 'AllowOutOfTurnActivation',
    ExtraTurns: 'ExtraTurns',
    LookAtTopAndPick: 'LookAtTopAndPick',
    MoveToZone: 'MoveToZone',
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
    PhaseOut: 'PhaseOut',
    DoublePowerXTimes: 'DoublePowerXTimes',
    Freeze: 'Freeze',
    CantCastNamedCard: 'CantCastNamedCard',
    CantAttackOrBlockNamedCard: 'CantAttackOrBlockNamedCard',
    EntersTapped: 'EntersTapped',
    ExileUntilLeaves: 'ExileUntilLeaves',
    Attach: 'Attach',
    AllowCastFromExile: 'AllowCastFromExile',
    GetEmblem: 'GetEmblem',
    Dig: 'Dig',
    MustBeBlocked: 'MustBeBlocked',
    ApplyDelayedTrigger: 'ApplyDelayedTrigger',
    Cascade: 'Cascade',
    PutInGraveyard: 'PutInGraveyard',
    AdNauseam: 'AdNauseam',
    ChaosWarp: 'ChaosWarp',
    ApproachOfTheSecondSun: 'ApproachOfTheSecondSun',
    RemoveCounters: 'RemoveCounters',
    FlipCoin: 'FlipCoin',
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
    NextEndStep: 'NEXT_END_STEP',
    UntilSourceLeavesBattlefield: 'UNTIL_SOURCE_LEAVES_BATTLEFIELD'
} as const;
export type DurationType = (typeof DurationType)[keyof typeof DurationType];

export interface EffectDuration {
    type: DurationType;
    untilStep?: Step;
    untilTurnOfPlayerId?: PlayerId | ((state: GameState, source: any) => PlayerId);
    expiryEvent?: string;
}

export interface ContinuousEffect {
    id: string;
    abilitiesToAdd?: (string | AbilityDefinition)[];
    abilitiesToRemove?: string[];
    activeZones: Zone[];
    attribute?: string;
    canPlayExiled?: boolean;
    color?: string | string[];
    colorSet?: string[];
    colorsToAdd?: string[];
    condition?: string;
    controllerId: PlayerId;
    copyFromId?: GameObjectId;
    data?: any;
    duration: EffectDuration;
    exileOnMoveToGraveyard?: boolean;
    flashbackCostOverride?: string;
    isAttribute?: boolean;
    isFreeCast?: boolean;
    isNotLegendary?: boolean;
    isSpellTax?: boolean;
    miracleCostOverride?: string;
    layer: number;
    limitPerTurn?: number;
    multiplier?: NumericProperty;
    playerModifier?: {
        canPlayFromGraveyard?: boolean;
        canPlayFromTop?: boolean;
        lifeModifier?: number;
        maxHandSize?: number;
    };
    powerDynamic?: string;
    powerModifier?: number | string;
    powerSet?: number | string;
    removeAllAbilities?: boolean;
    restrictions?: AbilityRestriction[];
    reductionAmount?: NumericProperty;
    sourceId: GameObjectId;
    sublayer?: string;
    subType?: string;
    subtypesToAdd?: string[];
    subtypesSet?: string[];
    spendAnyMana?: boolean;
    targetControllerId?: PlayerId;
    targetIds?: GameObjectId[];
    targetMapping?: string;
    taxAmount?: NumericProperty;
    timestamp: number;
    toughnessDynamic?: string;
    toughnessModifier?: number | string;
    toughnessSet?: number | string;
    type?: EffectType;
    typesToAdd?: string[];
    typesSet?: string[];
    value?: any;
}



/**
 * EngineFrame (CR 608): Unified context for ALL engine operations.
 * Used by effect handlers, condition checks, and targeting validation.
 * Replaces the separate ResolutionContext, ConditionContext contracts.
 */
export interface EngineFrame {
    // === Identity ===
    controllerId: PlayerId;
    sourceId: GameObjectId;

    // === Resolution State ===
    effectIndex?: number;
    isResumption?: boolean;
    effects: EffectDefinition[];
    targets: string[];
    originalTargets?: string[];

    // === Transient Data ===
    castFromZone?: Zone;
    chosenName?: string;
    discardAmount?: number | string;
    event?: GameEvent;
    eventAmount?: number;
    exiledIds?: string[];
    isCopy?: boolean;
    isFreeCast?: boolean;
    isMiracleCast?: boolean;
    allowPotentialMatches?: boolean;
    lastDiscardedIds?: string[];
    lastMilledIds?: string[];
    lookingCards?: GameObject[];
    maxChoices?: number;
    minChoices?: number;
    nextPlayerIds?: PlayerId[];
    onFailureEffects?: EffectDefinition[];
    paidManaValue?: number;
    sourceName?: string;
    xValue?: number;
    exileOnResolution?: boolean;
    involvedIds?: string[];

    // === References ===
    sourceObject?: GameObject | StackObject | PlayerState;
    stackObject?: StackObject;

    // === Hierarchy ===
    parentContext?: EngineFrame;
    depth?: number;

    // === Condition/Targeting Specific ===
    cardToPlay?: GameObject;
    effectSourceId?: GameObjectId;
    isSpellCasting?: boolean;
    targetDefinitions?: TargetDefinition[];
    targetIndex?: number;
}

/**
 * AmountResolver - Standardized representation for numeric values that change
 * based on game state (CR 107).
 */
export interface AmountResolver {
    type: 'CONSTANT' | 'POWER' | 'TOUGHNESS' | 'COUNT_PLAYER_PERMANENTS' | 'X_VALUE' | 'SCRIPT' | 'PLAYER_LIFE' | 'PLAYER_HAND_SIZE';
    baseValue?: number;
    multiplier?: number;
    offset?: number;
    resolver?: (state: GameState, context: EngineFrame) => number;
    subtype?: string;
    rounding?: 'floor' | 'ceil';
}
export type NumericProperty = 
    | number 
    | string 
    | AmountResolver 
    | Record<string, number>
    | { min: number; max: number }
    | undefined;

/**
 * ConditionDefinition: Union of supported formats for game logic checks (CR 101/608).
 * Supports string lookups, predicate functions, and matcher objects.
 */
export type ConditionDefinition = 
    | string 
    | string[];

/**
 * Base properties shared by all effects (Rule 608)
 */
interface CoreProps {
    type: EffectType;
    activeZones?: Zone[];
    condition?: ConditionDefinition;
    data?: Record<string, unknown>;
    duration?: EffectDuration;
    effects?: EffectDefinition[];
    image_url?: string;
    label?: string;
    layer?: number;
    next?: EffectDefinition;
    onFailureEffects?: EffectDefinition[];
    optional?: boolean;
    registeredType?: EffectType;
    restrictions?: (RestrictionDefinition | string)[];
    sublayer?: number | string;
}

interface TargetingProps {
    excludedTargetMapping?: TargetMapping;
    playerIdMapping?: TargetMapping;
    sourceMapping?: TargetMapping;
    target2Mapping?: TargetMapping;
    targetControllerId?: PlayerId;
    targetControllerMapping?: TargetMapping;
    targetDefinitions?: TargetDefinition[];
    targetIds?: string[];
    targetMapping?: TargetMapping | string;
    targetOffset?: number;
    sourceZones?: import('./core').Zone[];
}

interface NumericProps {
    amount?: NumericProperty;
    limitPerTurn?: number;
    maxChoices?: NumericProperty;
    maxCount?: NumericProperty;
    maxTriggers?: number;
    minChoices?: NumericProperty;
    pickCount?: NumericProperty;
    powerOverride?: NumericProperty;
    reductionAmount?: NumericProperty;
    taxAmount?: NumericProperty;
    multiplier?: NumericProperty;
    toughnessOverride?: NumericProperty;
}


interface ZoneProps {
    fromTop?: NumericProperty;
    position?: number | 'top' | 'bottom' | 'random';
    random?: boolean;
    remainderPosition?: number | 'top' | 'bottom' | 'random';
    remainderZone?: Zone | string;
    reveal?: boolean;
    shuffleRemainder?: boolean;
    sourceZones?: Zone[];
    zone?: Zone;
}

interface StateProps {
    attacking?: boolean;
    canPlayExiled?: boolean;
    cannotBlock?: boolean;
    entersTapped?: boolean;
    exileOnResolution?: boolean;
    isDiscard?: boolean;
    isDraw?: boolean;
    isFreeCast?: boolean;
    isMiracleCast?: boolean;
    isParadigmCopy?: boolean;
    isSpellCasting?: boolean;
    tapped?: boolean;
    capturedMV?: number;
    spent?: number;
    xValue?: number;
    lookingCards?: GameObject[];
}

/**
 * Properties that are highly specific to certain cards or legacy systems.
 * Grouped here to keep the main interfaces clean.
 */
interface SpecializedAndLegacyProps {
    selectionType?: string;
    showCancel?: boolean;
    linkKey?: string;
}

/**
 * Base properties shared by all effects (Rule 608)
 */
export interface BaseEffect extends
    CoreProps,
    TargetingProps,
    NumericProps,
    ZoneProps,
    StateProps,
    SpecializedAndLegacyProps { }


export interface DamageEffect extends BaseEffect {
    type: typeof EffectType.DealDamage;
    captureTargetMV?: boolean;
    damageType?: string;
}

export interface LifeEffect extends BaseEffect {
    type: typeof EffectType.GainLife | typeof EffectType.LoseLife;
}

export interface MoveEffect extends BaseEffect {
    type: typeof EffectType.MoveToZone | typeof EffectType.PutOnBattlefield | typeof EffectType.ReturnToHand | typeof EffectType.Exile | typeof EffectType.ExileTopCard | typeof EffectType.ExileAllCards | typeof EffectType.Shuffle | typeof EffectType.DiscardCards | typeof EffectType.ExileUntilManaValue | typeof EffectType.LookAtTopAndPick | typeof EffectType.PutInGraveyard | typeof EffectType.ExileTopCardsExcessDamage;
    additionalEffectPerCard?: EffectDefinition;
    fromTop?: NumericProperty;
    linkKey?: string;
    onSelected?: (card: any) => EffectDefinition[];
    ownerControl?: boolean;
    ownerId?: PlayerId;
    remainderPosition?: number | 'top' | 'bottom' | 'random';
    remainderZone?: Zone;
    selectionPool?: any;
    selectionType?: string;
    shuffle?: boolean;
    shuffleRemainder?: boolean;
    startingCounters?: { counterType?: string, amount: NumericProperty };
    storeMV?: string;
    targetPlayerId?: PlayerId;
}

export interface DrawEffect extends BaseEffect {
    type: typeof EffectType.DrawCards | typeof EffectType.DiscardCards | typeof EffectType.Mill | typeof EffectType.Scry | typeof EffectType.Surveil;
}

export interface SearchEffect extends BaseEffect {
    type: typeof EffectType.SearchLibrary;
    position?: number | 'top' | 'bottom';
    onSelected?: (card: any) => EffectDefinition[];
    optional?: boolean;
    restrictions?: (RestrictionDefinition | string)[];
    selectionPool?: any;
    selectionType?: string;
    shuffle?: boolean;
}

export interface CounterEffect extends BaseEffect {
    type: typeof EffectType.AddCounters | typeof EffectType.RemoveCounters | typeof EffectType.DoubleCounters | typeof EffectType.MoveCounters;
    amount?: NumericProperty;
    counterType?: string;
}

export interface TokenEffect extends BaseEffect {
    type: typeof EffectType.CreateToken | typeof EffectType.CreateTokenCopy;
    abilitiesToAdd?: (AbilityDefinition | string)[];
    attackTargetId?: string;
    isAttacking?: boolean;
    keywordsToAdd?: string[];
    linkKey?: string;
    startingCounters?: { counterType?: string, amount: NumericProperty };
    storeLinkedId?: string;
    storeMV?: string;
    subtypesToAdd?: string[];
    tokenBlueprint?: any;
    typesToAdd?: string[];
}

export interface EmblemEffect extends BaseEffect {
    type: typeof EffectType.CreateEmblem | typeof EffectType.GetEmblem;
    emblemBlueprint: {
        abilities?: any[];
        image_url?: string;
        name?: string;
        oracleText?: string;
    };
}

export interface ContinuousEffectDefinition extends BaseEffect {
    type: typeof EffectType.ApplyContinuousEffect;
    abilitiesToAdd?: (AbilityDefinition | string)[];
    abilitiesToRemove?: string[];
    activeZones?: Zone[];
    allowCastFromZone?: Zone;
    allowFreeCastFromHand?: boolean;
    canPlayExiled?: boolean;
    chosenName?: string;
    colorSet?: string[];
    colorsToAdd?: string[];
    condition?: any;
    copyFromIdMapping?: string;
    duration?: EffectDuration;
    exileOnMoveToGraveyard?: boolean;
    flashbackCostOverride?: any;
    isFreeCast?: boolean;
    keywordsToAdd?: string[];
    layer?: number;
    limitPerTurn?: number;
    miracleCostOverride?: string;
    multiplier?: NumericProperty;
    playerModifier?: any;
    powerModifier?: number | string;
    powerSet?: number | string;
    reductionAmount?: NumericProperty;
    removeAllAbilities?: boolean;
    restrictionsToAdd?: (RestrictionDefinition | string)[];
    spendAnyMana?: boolean;
    sublayer?: number | string;
    subtypesSet?: string[];
    subtypesToAdd?: string[];
    taxAmount?: NumericProperty;
    toughnessModifier?: number | string;
    toughnessSet?: number | string;
    typesSet?: string[];
    typesToAdd?: string[];
}



export interface RevealUntilConditionEffect extends BaseEffect {
    type: typeof EffectType.RevealUntilCondition;
    zone?: Zone;
    remainderZone?: Zone;
    remainderPosition?: number | 'top' | 'bottom' | 'random';
    shuffleRemainder?: boolean;
    restrictions?: (RestrictionDefinition | string)[];
}

export interface RestrictionDefinition {
    type: import('./core').RestrictionType | string;
    value?: any;
    condition?: any;
    restrictions?: (RestrictionDefinition | string)[];
}

export interface ModalEffect extends BaseEffect {
    type: typeof EffectType.Choice;
    allowDuplicates?: boolean;
    choices?: {
        condition?: string | any;
        costs?: AbilityCost[];
        effects?: EffectDefinition[];
        label: string;
        targetDefinitions?: TargetDefinition[];
        value?: string | number;
    }[];
    isSpellCasting?: boolean;
    maxChoices?: number | string | AmountResolver;
    minChoices?: number | string | AmountResolver;
    onSelected?: (card: any) => EffectDefinition[];
    optional?: boolean;
    selectionPool?: any;
}

export interface CastSpellEffect extends BaseEffect {
    type: typeof EffectType.CastSpell;
    alternateCost?: string;
    exileOnResolution?: boolean;
    isFreeCast?: boolean;
    value?: string;
}

export interface AddManaEffect extends BaseEffect {
    type: typeof EffectType.AddMana;
    amount?: NumericProperty;
    choices?: { label: string, value?: string, effects?: EffectDefinition[] }[];
    costs?: any[];
    manaRestrictions?: any[];
    manaType?: string;
}

export interface NeutralizeEffect extends BaseEffect {
    type: typeof EffectType.Destroy | typeof EffectType.CounterSpell | typeof EffectType.CounterAbility | typeof EffectType.CounterSpellOrAbility;
    sourceZones?: Zone[];
}

export interface ExtraTurnsEffect extends BaseEffect {
    type: typeof EffectType.ExtraTurns;
    amount: number | string | AmountResolver;
}

export interface CopyEffect extends BaseEffect {
    type: typeof EffectType.CopyObject | typeof EffectType.CopySpellOnStack | typeof EffectType.CopyAbility;
    abilitiesToAdd?: (string | AbilityDefinition)[];
    chooseNewTargets?: boolean;
    isLegendary?: boolean;
    isToken?: boolean;
    keywordsToAdd?: string[];
    targetMapping?: string;
}

export interface SpecializedEffect extends BaseEffect {
    type: typeof EffectType.AdNauseam | typeof EffectType.ChaosWarp | typeof EffectType.ApproachOfTheSecondSun | typeof EffectType.Learn | typeof EffectType.ExchangeHandAndGraveyard | typeof EffectType.Necromentia | typeof EffectType.Cascade | typeof EffectType.Dig | typeof EffectType.Prepare | typeof EffectType.Unprepare | typeof EffectType.GainAbilitiesOfTopCard | typeof EffectType.AllowCastFromGraveyard | typeof EffectType.AllowCastFromExile | typeof EffectType.AllowLookAtTop | typeof EffectType.AllowPlayFromTop | typeof EffectType.AllowPlayMilledCard;
    value?: unknown;
    additionalCosts?: AbilityCost[];
}

export interface PendingActionEffect extends BaseEffect {
    type: typeof EffectType.PENDING_ACTION;
    action: import('./state').PendingAction;
}

export interface SystemActionEffect extends BaseEffect {
    type: typeof EffectType.Sacrifice | typeof EffectType.Tap | typeof EffectType.Untap | typeof EffectType.Tapped | typeof EffectType.LoseGame | typeof EffectType.ChangeTarget | typeof EffectType.EntersTapped | typeof EffectType.Attach | typeof EffectType.Freeze | typeof EffectType.CREW | typeof EffectType.AddActivatedAbility | typeof EffectType.AllowOutOfTurnActivation | typeof EffectType.DoublePowerXTimes | typeof EffectType.AllowCastWithoutPaying | typeof EffectType.PreventDamage | typeof EffectType.DisableDamagePrevention | typeof EffectType.AdditionalLandPlays | typeof EffectType.MustBeBlocked | typeof EffectType.AllowPlayExiled | typeof EffectType.AllowSpendManaAsAnyColor | typeof EffectType.ModifyCountersAmount | typeof EffectType.PlayWithTopCardRevealed | typeof EffectType.PhaseOut | typeof EffectType.ExileUntilLeaves;
    abilitiesToAdd?: (string | AbilityDefinition)[];
    chosenName?: string;
    copyFromIdMapping?: TargetMapping;
    keyword?: string | string[];
}





export interface LogEffect extends BaseEffect {
    type: typeof EffectType.Log;
    message?: string;
}

export interface TriggerAbilityEffect extends BaseEffect {
    type: typeof EffectType.AddTriggeredAbility | typeof EffectType.CreateDelayedTrigger | typeof EffectType.ApplyDelayedTrigger;
    captureTargetMV?: boolean;
    deferredTrigger?: AbilityDefinition;
    eventMatch?: string | string[];
    oneShot?: boolean;
    triggerCondition?: ConditionDefinition;
}


export interface PreventionEffectDefinition extends BaseEffect {
    type: typeof EffectType.AddPreventionEffect;
    damageType?: 'CombatDamage' | 'AllDamage' | string;
}

export interface SimpleEffect extends BaseEffect {
    type: 
        | typeof EffectType.EndTurn 
        | typeof EffectType.Shuffle 
        | typeof EffectType.ConditionalEffect 
        | typeof EffectType.Fight
        | typeof EffectType.AddAdditionalTrigger;
}


export interface SkipTurnsEffect extends BaseEffect {
    type: typeof EffectType.SkipTurns;
    amount?: NumericProperty;
    flipCoins?: number;
}

export interface PhaseOutEffect extends BaseEffect {
    type: typeof EffectType.PhaseOut;
    isPhasedOut: boolean;
}


export interface CostModifierEffect extends BaseEffect {
    type: typeof EffectType.CostReduction | typeof EffectType.AdditionalCost | typeof EffectType.SpellTax;
    additionalCosts?: AbilityCost[];
    alternateCost?: string;
    reductionAmount?: number | string | Record<string, number>;
}

export interface EntersWithCountersEffect extends BaseEffect {
    type: typeof EffectType.EntersWithCounters;
    amount?: NumericProperty;
    counterType?: CounterType;
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
    | CastSpellEffect
    | AddManaEffect
    | NeutralizeEffect
    | ExtraTurnsEffect
    | CopyEffect
    | SpecializedEffect
    | EmblemEffect
    | RevealUntilConditionEffect
    | LogEffect
    | TriggerAbilityEffect
    | PreventionEffectDefinition
    | SimpleEffect
    | SkipTurnsEffect
    | PhaseOutEffect
    | CostModifierEffect
    | EntersWithCountersEffect
    | FlipCoinEffect
    | PendingActionEffect
    | SystemActionEffect;

export interface FlipCoinEffect extends BaseEffect {
    type: typeof EffectType.FlipCoin;
    flipCoins?: NumericProperty;
}
