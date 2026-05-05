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
    type?: EffectType;
    sourceId: GameObjectId;
    controllerId: PlayerId;
    layer: number;
    sublayer?: string;
    subType?: string;
    color?: string | string[];
    isAttribute?: boolean;
    attribute?: string;
    isSpellTax?: boolean;
    taxAmount?: number;
    reductionAmount?: number;
    exileOnMoveToGraveyard?: boolean;
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
    multiplier?: number | string;
    isNotLegendary?: boolean;
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
    lookingCards?: any[];        // Track cards revealed/looked at during this resolution (e.g. Scry/Search)
    nextEffectIndex?: number;    // Pointer for resuming multi-step effects
    xValue?: number;             // Bound X value for this resolution chain
    isCopy?: boolean;            // Flag if this resolution is for a copied spell/ability
    lastMilledIds?: string[];    // Snapshot of cards milled during this resolution
    lastDiscardedIds?: string[]; // Snapshot of cards discarded during this resolution
    sourceObject?: GameObject;   // Resolved LKI or Battlefield source
    eventAmount?: number;        // Explicit snapshot of event amount (damage, life, etc)
    controller?: any;            // Resolved controller player object
}

/**
 * ConditionContext: Standardized contract for requirement checks in ConditionProcessor.
 */
export interface ConditionContext {
    sourceId: GameObjectId;
    targetId?: GameObjectId;
    effectSourceId?: GameObjectId;
    controllerId: PlayerId;
    event?: import('./events').GameEvent;
    stackObject?: StackObject;
    targets?: string[];
    cardToPlay?: GameObject;
    sourceObject?: import('./state').GameObject | import('./state').StackObject | import('./state').PlayerState;
}

/**
 * TargetingContext: Standardized contract for legality checks in TargetValidator.
 */
export interface TargetingContext {
    sourceId: string;
    controllerId: string;
    stackObject?: StackObject;
    targetDefinitions?: TargetDefinition[];
    targetIndex?: number;
    targets?: string[];
    xValue?: number;
    isSpellCasting?: boolean;
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
export type NumericProperty = number | string | AmountResolver | ((state: any, context: any, targets?: any) => number);

/**
 * Base properties shared by all effects (Rule 608)
 */
export interface BaseEffect {
    type: EffectType;
    label?: string;
    duration?: EffectDuration | DurationType;
    layer?: number;
    condition?: string | any;
    targetId?: string;
    targetIds?: string[];
    targetMapping?: any | string;
    target2Mapping?: string;
    targetControllerMapping?: TargetMapping | string;
    restrictions?: any[];
    selectionType?: string;
    effects?: EffectDefinition[]; // Nested effects for chaining/conditionals
    onFailureEffects?: EffectDefinition[];
    isFreeCast?: boolean;
    isSpellCasting?: boolean;
    isParadigmCopy?: boolean;
    isDiscard?: boolean;
    fromZone?: Zone | string;
    storeMV?: string;
    storeLinkedId?: string;
    linkKey?: string;
    alternateCost?: string;
    metadata?: Record<string, any>;
    data?: any;
    targetOffset?: number;
    optional?: boolean;
    revealed?: boolean;
    remainderZone?: Zone | string;
    remainderPosition?: number | 'top' | 'bottom' | 'random';
    shuffleRemainder?: boolean;
    isDraw?: boolean;
    targetDefinitions?: any;
    fromTop?: NumericProperty;
    libraryPosition?: number | 'top' | 'bottom' | 'random';
    sourceZones?: Zone[];
    tapped?: boolean;
    registeredType?: EffectType;
    sublayer?: number | string;
    value?: any;
    limitPerTurn?: number;
    targetControllerId?: PlayerId;
    copyFromIdMapping?: string;
    chosenName?: string;
    exileOnResolution?: boolean;
    amount?: NumericProperty;
    choices?: any[];
    minChoices?: NumericProperty;
    maxChoices?: NumericProperty;
    counterType?: string;
    selectionPool?: any;
    zone?: Zone;
    reveal?: boolean;
    random?: boolean;
    excludedTargetMapping?: string;
    eventMatch?: string | string[];
    additionalCost?: any;
    additionalCosts?: any;
    entersTapped?: boolean;
    abilitiesToAdd?: (AbilityDefinition | string)[];
    onSelected?: (card: any) => EffectDefinition[];
    mana?: string;
    manaType?: string;
    manaRestrictions?: any;
    keyword?: string | string[];
    keywordsToAdd?: string[];
    damageType?: string;
    manaReduction?: any;
    deferredTrigger?: any;
    manaRestriction?: any;
    cannotBlock?: boolean;
    allowFreeCastFromHand?: boolean;
    allowCastFromZone?: Zone;
    maxTriggers?: number;
    maxCount?: NumericProperty;
    playerIdMapping?: string;
    secondTarget?: string;
    attacking?: boolean;
    powerOverride?: NumericProperty;
    toughnessOverride?: NumericProperty;
    position?: number | 'top' | 'bottom' | 'random';
    restriction?: any;
    tax?: NumericProperty;
    power?: NumericProperty;
    toughness?: NumericProperty;
    tokenDefinition?: any;
    pickAmount?: NumericProperty;
    pickCount?: NumericProperty;
    damageSource?: string;
    sourceMapping?: string;
    costs?: any[];
    fromZones?: Zone[];
    canPlayExiled?: boolean;
    isUnblockable?: boolean;
    typesSet?: string[];
    typesToAdd?: string[];
    subtypesToAdd?: string[];
    startingCounters?: { type?: string, counterType?: string, countersType?: string, amount: NumericProperty };
    image_url?: string;
    activeZones?: Zone[];
    flipCoins?: NumericProperty;
    next?: EffectDefinition; // Chain to next effect (e.g. Cascade)
    captureTargetMV?: boolean;
}

export interface DamageEffect extends BaseEffect {
    type: typeof EffectType.DealDamage;
    damageSourceMapping?: string;
}

export interface LifeEffect extends BaseEffect {
    type: typeof EffectType.GainLife | typeof EffectType.LoseLife;
}

export interface MoveEffect extends BaseEffect {
    type: typeof EffectType.MoveToZone | typeof EffectType.PutOnBattlefield | typeof EffectType.ReturnToHand | typeof EffectType.Exile | typeof EffectType.ExileTopCard | typeof EffectType.ExileAllCards | typeof EffectType.ShuffleLibrary | typeof EffectType.DiscardCards | typeof EffectType.ExileUntilManaValue | typeof EffectType.PutRemainderOnBottomRandom | typeof EffectType.LookAtTopAndPick | typeof EffectType.PutInGraveyard | typeof EffectType.ExileTopCardsExcessDamage;
    ownerControl?: boolean;
    shuffle?: boolean;
    ownerId?: PlayerId;
    targetPlayerId?: PlayerId;
    additionalEffectPerCard?: EffectDefinition;
    fromTop?: NumericProperty;
    remainderZone?: Zone;
    remainderPosition?: number | 'top' | 'bottom' | 'random';
    shuffleRemainder?: boolean;
}

export interface DrawEffect extends BaseEffect {
    type: typeof EffectType.DrawCards | typeof EffectType.DiscardCards | typeof EffectType.Mill | typeof EffectType.Scry | typeof EffectType.Surveil;
}

export interface SearchEffect extends BaseEffect {
    type: typeof EffectType.SearchLibrary;
    shuffle?: boolean;
    optional?: boolean;
    selectionType?: string;
    libraryPosition?: number | 'top' | 'bottom';
}

export interface CounterEffect extends BaseEffect {
    type: typeof EffectType.AddCounters | typeof EffectType.RemoveCounters | typeof EffectType.Counter | typeof EffectType.DoubleCounters | typeof EffectType.MoveCounters;
}

export interface TokenEffect extends BaseEffect {
    type: typeof EffectType.CreateToken | typeof EffectType.CreateTokenCopy;
    definition?: any; // CardDefinition for token
    tokenBlueprint?: any;
    isAttacking?: boolean;
    attackTargetId?: string;
    sourceCardId?: string;
    originalCardId?: string;
    sourceMapping?: string;
    storeLinkedId?: string;
}

export interface EmblemEffect extends BaseEffect {
    type: typeof EffectType.CreateEmblem | typeof EffectType.GetEmblem;
    emblemBlueprint: {
        name?: string;
        image_url?: string;
        oracleText?: string;
        abilities?: any[];
    };
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
    canPlayExiled?: boolean;
    spendAnyMana?: boolean;
    typesToAdd?: string[];
    subtypesToAdd?: string[];
    subtypesSet?: string[];
    colorsToAdd?: string[];
    colorSet?: string[];
    colorsSet?: string[]; // Alias
    typesSet?: string[]; // Alias
    flashbackCostOverride?: any;
    exileOnMoveToGraveyard?: boolean;
    playerModifier?: any;
}

export interface RevealUntilConditionEffect extends BaseEffect {
    type: typeof EffectType.RevealUntilCondition;
    zone?: Zone;
    remainderZone?: Zone;
    remainderPosition?: 'top' | 'bottom' | 'random';
    shuffleRemainder?: boolean;
}

export interface RestrictionDefinition {
    type: import('./core').RestrictionType | string;
    value?: any;
    condition?: any;
}

export interface ModalEffect extends BaseEffect {
    type: typeof EffectType.Choice;
    minChoices?: number | string | AmountResolver;
    maxChoices?: number | string | AmountResolver;
    allowDuplicates?: boolean;
    optional?: boolean;
    isSpellCasting?: boolean;
    choices?: {
        label: string;
        effects?: EffectDefinition[];
        costs?: any[];
        targetDefinitions?: any;
        value?: string | number;
        condition?: string | any;
    }[];
}

export interface CastSpellEffect extends BaseEffect {
    type: typeof EffectType.CastSpell;
    value?: string;
    isFreeCast?: boolean;
    targetId?: string;
    exileOnResolution?: boolean;
}

export interface AddManaEffect extends BaseEffect {
    type: typeof EffectType.AddMana | typeof EffectType.AddManaChoice;
    amount?: NumericProperty;
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
    targetMapping?: string;
    isToken?: boolean;
    isLegendary?: boolean;
    abilitiesToAdd?: (string | AbilityDefinition)[];
    keywordsToAdd?: string[];
    chooseNewTargets?: boolean;
}

export interface SpecializedEffect extends BaseEffect {
    type: typeof EffectType.AdNauseam | typeof EffectType.ChaosWarp | typeof EffectType.ApproachOfTheSecondSun | typeof EffectType.Learn | typeof EffectType.ExchangeHandAndGraveyard | typeof EffectType.Necromentia | typeof EffectType.Cascade | typeof EffectType.Dig | typeof EffectType.Prepare | typeof EffectType.Unprepare | typeof EffectType.GainAbilitiesOfTopCard | typeof EffectType.AllowCastFromGraveyard | typeof EffectType.AllowCastFromExile | typeof EffectType.AllowLookAtTop | typeof EffectType.AllowPlayFromTop | typeof EffectType.AllowPlayMilledCard;
    value?: any;
}

export interface SystemActionEffect extends BaseEffect {
    type: typeof EffectType.Sacrifice | typeof EffectType.Tap | typeof EffectType.Untap | typeof EffectType.Tapped | typeof EffectType.GainControl | typeof EffectType.LoseGame | typeof EffectType.ChangeTarget | typeof EffectType.EntersTapped | typeof EffectType.Attach | typeof EffectType.Freeze | typeof EffectType.CREW | typeof EffectType.AddActivatedAbility | typeof EffectType.AllowOutOfTurnActivation | typeof EffectType.DoublePowerXTimes | typeof EffectType.GainKeyword | typeof EffectType.AllowCastWithoutPaying | typeof EffectType.CantAttackUnless | typeof EffectType.PreventDamage | typeof EffectType.PayMana | typeof EffectType.DisableDamagePrevention | typeof EffectType.AdditionalLandPlays | typeof EffectType.ApplyDelayedTrigger | typeof EffectType.MustBeBlocked | typeof EffectType.AllowPlayExiled | typeof EffectType.AllowSpendManaAsAnyColor | typeof EffectType.ModifyCountersAmount | typeof EffectType.PlayWithTopCardRevealed | typeof EffectType.LoseMana | typeof EffectType.PhaseOut | typeof EffectType.MustBlockThisTurn | typeof EffectType.ExileUntilLeaves;
}





export interface LogEffect extends BaseEffect {
    type: typeof EffectType.Log;
    message?: string;
}

export interface TriggerAbilityEffect extends BaseEffect {
    type: typeof EffectType.AddTriggeredAbility | typeof EffectType.CreateDelayedTrigger;
    eventMatch?: string | string[];
    on?: string; // Legacy alias for eventMatch
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
    value?: any;
}

export interface ConditionalEffect extends BaseEffect {
    type: typeof EffectType.ConditionalEffect;
    condition?: any;
    trueEffects?: EffectDefinition[];
    falseEffects?: EffectDefinition[];
    effects?: EffectDefinition[]; // Legacy alias for trueEffects
}


export interface FightEffect extends BaseEffect {
    type: typeof EffectType.Fight;
}

export interface CostModifierEffect extends BaseEffect {
    type: typeof EffectType.CostReduction | typeof EffectType.AdditionalCost | typeof EffectType.SpellTax;
    manaReduction?: any;
    additionalCosts?: any[];
}

export interface EntersWithCountersEffect extends BaseEffect {
    type: typeof EffectType.EntersWithCounters;
    counterType?: string;
    amount?: NumericProperty;
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
    | RevealUntilConditionEffect
    | SystemActionEffect;
