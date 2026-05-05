// effects.ts
// Effect types, definitions, and durations

import type { AbilityDefinition } from './abilities';
import type { GameObjectId, PlayerId } from './core';
import { Step, TargetMapping, Zone } from './core';
import type { StackObject, GameObject } from './state';
import type { AbilityRestriction, TargetDefinition } from './targeting';

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
    GainKeyword: 'GainKeyword',
    GainControl: 'GainControl',
    CantCastNamedCard: 'CantCastNamedCard',
    CantAttackOrBlockNamedCard: 'CantAttackOrBlockNamedCard',
    MustBlockThisTurn: 'MustBlockThisTurn',
    EntersTapped: 'EntersTapped',
    ExileUntilLeaves: 'ExileUntilLeaves',
    Attach: 'Attach',
    AllowCastFromExile: 'AllowCastFromExile',
    AddManaChoice: 'AddManaChoice',
    GetEmblem: 'GetEmblem',
    Dig: 'Dig',
    MustBeBlocked: 'MustBeBlocked',
    CantAttackUnless: 'CantAttackUnless',
    ApplyDelayedTrigger: 'ApplyDelayedTrigger',
    CounterTarget: 'CounterTarget',
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
    untilTurnOfPlayerId?: any;
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
    duration: EffectDuration;
    exileOnMoveToGraveyard?: boolean;
    flashbackCostOverride?: string;
    isAttribute?: boolean;
    isFreeCast?: boolean;
    isNotLegendary?: boolean;
    isSpellTax?: boolean;
    layer: number;
    limitPerTurn?: number;
    multiplier?: number | string;
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
    reductionAmount?: number;
    sourceId: GameObjectId;
    sublayer?: string;
    subType?: string;
    subtypesToAdd?: string[];
    subtypesSet?: string[];
    spendAnyMana?: boolean;
    targetControllerId?: PlayerId;
    targetIds?: GameObjectId[];
    targetMapping?: string;
    taxAmount?: number;
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
 * ResolutionContext (CR 608): Standardized contract for passing state through
 * the effect resolution chain. Replaces loosely typed 'any' parameters.
 */
export interface ResolutionContext {
    controllerId: PlayerId;
    controller?: any;
    effects: EffectDefinition[];
    eventAmount?: number;
    event?: import('./events').GameEvent;
    exiledIds?: string[];
    isCopy?: boolean;
    lastDiscardedIds?: string[];
    lastMilledIds?: string[];
    lookingCards?: any[];
    nextEffectIndex?: number;
    parentContext?: ResolutionContext;
    sourceId: GameObjectId;
    sourceObject?: GameObject;
    stackObject?: StackObject;
    startIndex?: number;
    targets: string[];
    xValue?: number;
}

/**
 * ConditionContext: Standardized contract for requirement checks in ConditionProcessor.
 */
export interface ConditionContext {
    controllerId: PlayerId;
    cardToPlay?: GameObject;
    effectSourceId?: GameObjectId;
    event?: import('./events').GameEvent;
    sourceId: GameObjectId;
    sourceObject?: import('./state').GameObject | import('./state').StackObject | import('./state').PlayerState;
    stackObject?: StackObject;
    targetId?: GameObjectId;
    targets?: string[];
}

/**
 * TargetingContext: Standardized contract for legality checks in TargetValidator.
 */
export interface TargetingContext {
    controllerId: string;
    isSpellCasting?: boolean;
    sourceId: string;
    stackObject?: StackObject;
    targetDefinitions?: TargetDefinition[];
    targetIndex?: number;
    targets?: string[];
    xValue?: number;
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
    resolver?: (state: any, context: ResolutionContext) => number;
    subtype?: string;
}
export type NumericProperty = number | string | AmountResolver | ((state: any, context: any, targets?: any) => number);

/**
 * Base properties shared by all effects (Rule 608)
 */
interface CoreProps {
    type: EffectType;
    activeZones?: Zone[];
    condition?: string | any;
    data?: any;
    duration?: EffectDuration | DurationType;
    effects?: EffectDefinition[];
    image_url?: string;
    label?: string;
    layer?: number;
    metadata?: Record<string, any>;
    next?: EffectDefinition;
    onFailureEffects?: EffectDefinition[];
    optional?: boolean;
    registeredType?: EffectType;
    restrictions?: (RestrictionDefinition | string)[];
    sublayer?: number | string;
}

interface TargetingProps {
    excludedTargetMapping?: string;
    playerIdMapping?: string;
    secondTarget?: string;
    sourceMapping?: string;
    target2Mapping?: string;
    targetControllerId?: PlayerId;
    targetControllerMapping?: TargetMapping | string;
    targetDefinitions?: any;
    targetIds?: string[];
    targetMapping?: any | string;
    targetOffset?: number;
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
    tax?: NumericProperty;
    toughnessOverride?: NumericProperty;
}


interface ZoneProps {
    fromTop?: NumericProperty;
    fromZone?: Zone | string;
    fromZones?: Zone[];
    libraryPosition?: number | 'top' | 'bottom' | 'random';
    position?: number | 'top' | 'bottom' | 'random';
    random?: boolean;
    remainderPosition?: number | 'top' | 'bottom' | 'random';
    remainderZone?: Zone | string;
    reveal?: boolean;
    revealed?: boolean;
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
    isParadigmCopy?: boolean;
    isSpellCasting?: boolean;
    tapped?: boolean;
}

/**
 * Properties that are highly specific to certain cards or legacy systems.
 * Grouped here to keep the main interfaces clean.
 */
interface SpecializedAndLegacyProps {
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
    damageSource?: string;
    damageSourceMapping?: string;
    damageType?: string;
}

export interface LifeEffect extends BaseEffect {
    type: typeof EffectType.GainLife | typeof EffectType.LoseLife;
}

export interface MoveEffect extends BaseEffect {
    type: typeof EffectType.MoveToZone | typeof EffectType.PutOnBattlefield | typeof EffectType.ReturnToHand | typeof EffectType.Exile | typeof EffectType.ExileTopCard | typeof EffectType.ExileAllCards | typeof EffectType.ShuffleLibrary | typeof EffectType.DiscardCards | typeof EffectType.ExileUntilManaValue | typeof EffectType.PutRemainderOnBottomRandom | typeof EffectType.LookAtTopAndPick | typeof EffectType.PutInGraveyard | typeof EffectType.ExileTopCardsExcessDamage;
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
    startingCounters?: { type?: string, counterType?: string, countersType?: string, amount: NumericProperty };
    storeMV?: string;
    targetPlayerId?: PlayerId;
}

export interface DrawEffect extends BaseEffect {
    type: typeof EffectType.DrawCards | typeof EffectType.DiscardCards | typeof EffectType.Mill | typeof EffectType.Scry | typeof EffectType.Surveil;
}

export interface SearchEffect extends BaseEffect {
    type: typeof EffectType.SearchLibrary;
    libraryPosition?: number | 'top' | 'bottom';
    onSelected?: (card: any) => EffectDefinition[];
    optional?: boolean;
    restrictions?: (RestrictionDefinition | string)[];
    selectionPool?: any;
    selectionType?: string;
    shuffle?: boolean;
}

export interface CounterEffect extends BaseEffect {
    type: typeof EffectType.AddCounters | typeof EffectType.RemoveCounters | typeof EffectType.Counter | typeof EffectType.DoubleCounters | typeof EffectType.MoveCounters;
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
    sourceCardId?: string;
    startingCounters?: { type?: string, counterType?: string, countersType?: string, amount: NumericProperty };
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
    duration?: EffectDuration | DurationType;
    exileOnMoveToGraveyard?: boolean;
    flashbackCostOverride?: any;
    isFreeCast?: boolean;
    keywordsToAdd?: string[];
    layer?: number;
    limitPerTurn?: number;
    playerModifier?: any;
    powerModifier?: number | string;
    powerSet?: number | string;
    removeAllAbilities?: boolean;
    restrictionsToAdd?: (RestrictionDefinition | string)[];
    spendAnyMana?: boolean;
    sublayer?: number | string;
    subtypesSet?: string[];
    subtypesToAdd?: string[];
    toughnessModifier?: number | string;
    toughnessSet?: number | string;
    typesSet?: string[];
    typesToAdd?: string[];
}



export interface RevealUntilConditionEffect extends BaseEffect {
    type: typeof EffectType.RevealUntilCondition;
    zone?: Zone;
    remainderZone?: Zone;
    remainderPosition?: 'top' | 'bottom' | 'random';
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
        costs?: any[];
        effects?: EffectDefinition[];
        label: string;
        targetDefinitions?: any;
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
    type: typeof EffectType.AddMana | typeof EffectType.AddManaChoice;
    amount?: NumericProperty;
    choices?: { label: string, value?: string, effects?: EffectDefinition[] }[];
    costs?: any[];
    mana?: string;
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
    value?: any;
    additionalCosts?: import('./abilities').AbilityCost[];
}

export interface SystemActionEffect extends BaseEffect {
    type: typeof EffectType.Sacrifice | typeof EffectType.Tap | typeof EffectType.Untap | typeof EffectType.Tapped | typeof EffectType.GainControl | typeof EffectType.LoseGame | typeof EffectType.ChangeTarget | typeof EffectType.EntersTapped | typeof EffectType.Attach | typeof EffectType.Freeze | typeof EffectType.CREW | typeof EffectType.AddActivatedAbility | typeof EffectType.AllowOutOfTurnActivation | typeof EffectType.DoublePowerXTimes | typeof EffectType.GainKeyword | typeof EffectType.AllowCastWithoutPaying | typeof EffectType.CantAttackUnless | typeof EffectType.PreventDamage | typeof EffectType.DisableDamagePrevention | typeof EffectType.AdditionalLandPlays | typeof EffectType.MustBeBlocked | typeof EffectType.AllowPlayExiled | typeof EffectType.AllowSpendManaAsAnyColor | typeof EffectType.ModifyCountersAmount | typeof EffectType.PlayWithTopCardRevealed | typeof EffectType.PhaseOut | typeof EffectType.MustBlockThisTurn | typeof EffectType.ExileUntilLeaves;
    abilitiesToAdd?: (string | AbilityDefinition)[];
    chosenName?: string;
    copyFromIdMapping?: string;
    keyword?: string | string[];
}





export interface LogEffect extends BaseEffect {
    type: typeof EffectType.Log;
    message?: string;
}

export interface TriggerAbilityEffect extends BaseEffect {
    type: typeof EffectType.AddTriggeredAbility | typeof EffectType.CreateDelayedTrigger | typeof EffectType.ApplyDelayedTrigger;
    captureTargetMV?: boolean;
    deferredTrigger?: any;
    eventMatch?: string | string[];
}


export interface PreventionEffectDefinition extends BaseEffect {
    type: typeof EffectType.AddPreventionEffect;
    damageType?: 'CombatDamage' | 'AllDamage' | string;
}

export interface EndTurnEffect extends BaseEffect {
    type: typeof EffectType.EndTurn;
}

export interface ShuffleEffect extends BaseEffect {
    type: typeof EffectType.Shuffle | typeof EffectType.ShuffleLibrary;
}

export interface SkipTurnsEffect extends BaseEffect {
    type: typeof EffectType.SkipTurns;
    amount?: NumericProperty;
    flipCoins?: number;
}

export interface PhasedOutEffect extends BaseEffect {
    type: typeof EffectType.PhasedOut | typeof EffectType.PhaseOut;
    isPhasedOut: boolean;
}

export interface ConditionalEffect extends BaseEffect {
    type: typeof EffectType.ConditionalEffect;
}



export interface FightEffect extends BaseEffect {
    type: typeof EffectType.Fight;
}

export interface CostModifierEffect extends BaseEffect {
    type: typeof EffectType.CostReduction | typeof EffectType.AdditionalCost | typeof EffectType.SpellTax;
    additionalCosts?: import('./abilities').AbilityCost[];
    alternateCost?: string;
    manaReduction?: any;
}

export interface EntersWithCountersEffect extends BaseEffect {
    type: typeof EffectType.EntersWithCounters;
    amount?: NumericProperty;
    counterType?: string;
}

export interface AddAdditionalTriggerEffect extends BaseEffect {
    type: typeof EffectType.AddAdditionalTrigger;
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
    | EndTurnEffect
    | ShuffleEffect
    | SkipTurnsEffect
    | PhasedOutEffect
    | ConditionalEffect
    | FightEffect
    | CostModifierEffect
    | EntersWithCountersEffect
    | AddAdditionalTriggerEffect
    | FlipCoinEffect
    | SystemActionEffect;

export interface FlipCoinEffect extends BaseEffect {
    type: typeof EffectType.FlipCoin;
    flipCoins?: NumericProperty;
}
