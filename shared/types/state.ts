// state.ts
// Game state and player state structures

import type { AbilityDefinition, ActivatedAbility, TriggeredAbility, ReplacementEffect, PreventionEffect, AbilityCost } from './abilities';
import { AbilityType } from './abilities';
import type { CounterType, GameObjectId, PlayerId } from './core';
import { Phase, Step, Zone } from './core';
import type { ContinuousEffect, EffectDefinition, ConditionDefinition } from './effects';
import type { AbilityRestriction, TargetDefinition, TargetRestriction } from './targeting';

export type ManaPool = { W: number; U: number; B: number; R: number; G: number; C: number; };
export type RestrictedMana = { color: 'W' | 'U' | 'B' | 'R' | 'G' | 'C'; amount: number; restrictions: string[]; };

export interface CardLogic extends Partial<CardDefinition> {
    condition?: ConditionDefinition;
    effects?: EffectDefinition[];
    restrictions?: (TargetRestriction | string)[];
}

export interface CardDefinition {
    abilities?: (AbilityDefinition | string)[];
    auraRestrictions?: TargetDefinition[];
    cannotBeCopied?: boolean;
    colors: string[];
    entersPrepared?: boolean;
    entersTapped?: boolean;
    entersTappedCondition?: string;
    entersWithXCounters?: boolean;
    exileOnResolution?: boolean;
    faces?: CardDefinition[];
    flashbackCost?: string;
    image_url?: string;
    keywords?: string[];
    loyalty?: string | number;
    manaCost: string;
    manaValue?: number;
    name: string;
    oracleText: string;
    power?: string | number;
    preparedFace?: CardDefinition;
    rarity?: 'common' | 'uncommon' | 'rare' | 'mythic';
    scryfall_id?: string;
    set?: string;
    subtypes?: string[];
    supertypes?: string[];
    targetDefinitions?: TargetDefinition[];
    toughness?: string | number;
    typeMask?: number;
    type_line?: string;
    types: string[];
}

export interface BaseEntity {
    controllerId: PlayerId;
    convergeAmount?: number;
    counters: Partial<Record<CounterType, number>>;
    data?: Record<string, any>;
    dealtDamageThisTurn?: boolean;
    definition: CardDefinition | AbilityDefinition;
    exileOnResolution?: boolean;
    exiledBy?: string;
    id: string;
    image_url?: string;
    isCopy?: boolean;
    isFlashbackCast?: boolean;
    isPhasedOut?: boolean;
    isPrepared?: boolean;
    isPreparedCopy?: boolean;
    isToken?: boolean;
    name?: string;
    ownerId: PlayerId;
    paidManaValue?: number;
    targets?: (GameObjectId | PlayerId)[]; // Added to unify target access for GameObject | StackObject
    xValue?: number;
    zone?: Zone;
}

export interface EffectiveStats {
    abilities?: (AbilityDefinition | string)[];
    colors?: string[];
    flashbackCostOverride?: string;
    isActivation?: boolean;
    isFlashback?: boolean;
    isFreeCast?: boolean;
    isPermissionPlay?: boolean;
    isPlayable?: boolean;
    isVirtual?: boolean;
    keywords: string[];
    manaCost?: string;
    power: number;
    restrictions?: import('./core').RestrictionObject[];
    subtypes?: string[];
    supertypes?: string[];
    toughness: number;
    types?: string[];
}

export interface GameObject extends BaseEntity {
    definition: CardDefinition;
    abilitiesUsedThisTurn: number;
    attachedTo?: GameObjectId;
    cannotUntapThisTurn?: boolean;
    colorsSpent?: string[];
    controllerHistory?: PlayerId[];
    damageMarked: number;
    data?: Record<string, any>;
    deathtouchMarked: boolean;
    effectiveStats?: EffectiveStats;
    faceDown: boolean;
    isAttacking?: boolean;
    isBlocking?: boolean;
    isFreeCast?: boolean;
    isGoaded?: boolean;
    isPTSwitched?: boolean;
    isCopyTargeting?: boolean;
    bypassTargeting?: boolean;
    isRevealed?: boolean;
    isSpellCasting?: boolean;
    isTapped: boolean;
    isVirtual?: boolean;
    keywords: string[];
    lastNonStackZone?: Zone;
    modifierSnapshot?: any;
    originalDefinition?: CardDefinition;
    paidCost?: string;
    selectedFaceDefinition?: CardDefinition;
    sourceCreatureId?: string;
    summoningSickness: boolean;
    typeMask?: number;
    usedAlternativeCostId?: string;
    version?: number;
    zone: Zone;
}

export interface StackObject extends BaseEntity {
    abilityIndex?: number;
    cannotBeCopied?: boolean;
    castFromZone?: Zone;
    chosenName?: string;
    condition?: ConditionDefinition;
    /** @deprecated Use typed root properties or `resolution.transient` instead. Will be removed. */
    data?: Record<string, any>;
    discardAmount?: number | string;
    effects?: EffectDefinition[];
    event?: import('./events').GameEvent;
    eventAmount?: number;
    exiledIds?: string[];
    lastDiscardedIds?: string[];
    lastMilledIds?: string[];
    lookingCards?: GameObject[];
    maxChoices?: number;
    minChoices?: number;
    effectIndex?: number;
    isResumption?: boolean;
    nextPlayerIds?: PlayerId[];
    onFailureEffects?: EffectDefinition[];
    originalControllerId?: PlayerId;
    preSelectedChoice?: number | string;
    exileOnResolution?: boolean;
    sourceId: GameObjectId;
    sourceName?: string;
    sourceObject?: GameObject; // The canonical hydrated object (Card, Token, or Ability Source)
    targetDefinitions?: TargetDefinition[];
    targets: GameObjectId[] | PlayerId[];
    targetsControllers?: PlayerId[];
    summary?: string;
    isOptionalDiscard?: boolean;
    isFreeCast?: boolean;
    paidManaValue?: number;
    isCopy?: boolean;
    type: AbilityType;
    optional?: boolean;
    xValue?: number;
}

export interface PlayerState {
    autoOrderTriggers: boolean;
    avatar?: string;
    canActivateAbilities?: boolean;
    controllerId: PlayerId; // Harmonized for Targetable union
    extraTurns: number;
    fullControl: boolean;
    graveyard: GameObject[];
    hand: GameObject[];
    hasLost?: boolean;
    hasLostDueToEmptyLibrary?: boolean;
    hasPlayedLandThisTurn: boolean;
    hasWon?: boolean;
    id: PlayerId;
    isBot?: boolean;
    library: GameObject[];
    life: number;
    manaCheat?: boolean;
    manaPool: ManaPool;
    maxHandSize: number;
    name: string;
    ownerId: PlayerId;      // Harmonized for Targetable union
    playerId: PlayerId;    // Compatibility alias
    passUntilEndOfTurn: boolean;
    pendingDiscardCount: number;
    poisonCounters: number;
    restrictedMana?: RestrictedMana[];
    sideboard: GameObject[];
    stops: Record<string, boolean>;
    turnsToSkip: number;
    virtualHand: GameObject[];
}

export interface CombatState {
    attackers: {
        attackerId: GameObjectId;
        order?: GameObjectId[];
        targetId: PlayerId | GameObjectId;
    }[];
    blockers: {
        attackerId: GameObjectId;
        blockerId: GameObjectId;
        order?: GameObjectId[];
    }[];
}

export interface TurnState {
    cardLeftGraveyardThisTurn: Record<PlayerId, boolean>;
    cardsDrawnThisTurn: Record<PlayerId, number>;
    cardsExiledThisTurn: Record<PlayerId, boolean>;
    countersAddedThisTurnIds: GameObjectId[];
    creaturesAttackedThisTurn: number;
    creaturesDiedThisTurn: GameObject[];
    creaturesEnteredThisTurn: Record<PlayerId, number>;
    damagePreventionDisabled?: boolean;
    instantOrSorceryCastThisTurn: Record<PlayerId, boolean>;
    landsPlayedThisTurn: Record<PlayerId, number>;
    lastCardsDrawnAmount: number;
    lastCreatedTokenId?: string;
    lastDamageAmount: number;
    lastDestroyedCount?: number;
    lastDiscardedCount: number;
    lastDiscardedIds?: string[];
    lastExcessDamageAmount: number;
    lastExiledIds?: string[];
    lastLifeGainedAmount: number;
    lastMilledIds?: string[];
    lastSacrificedObject?: GameObject;
    lastSacrificedObjectPower?: number;
    lastScrySurveilResult?: {
        bottom: number;
        graveyard: number;
        playerId: PlayerId;
        timestamp: number;
        top: number;
        type: string;
    };
    lifeGainedThisTurn: Record<PlayerId, number>;
    namedCards?: Record<string, string>;
    noncombatDamageDealtToOpponents: Record<PlayerId, number>;
    permanentReturnedToHandThisTurn: boolean;
    playersWithPermanentReturnedThisTurn: Record<PlayerId, boolean>;
    spellsCastThisTurn: Record<PlayerId, number>;
    triggeredAbilitiesUsedThisTurn: Record<string, number>;
    turnStartTime: number;
}

export interface ChoiceOption {
    cardData?: GameObject | PlayerState | StackObject;
    costs?: AbilityCost[];
    effects?: EffectDefinition[];
    imageUrl?: string;
    isNone?: boolean;
    label: string;
    selectable?: boolean;
    targetDefinitions?: import('./targeting').TargetDefinition[];
    type_line?: string;
    value: string | number; // The key ID or index returned to the engine
}

export interface ChoicePayload {
    bottom?: string[];
    graveyard?: string[];
    params?: Record<string, any>;
    selections: (string | number)[];
    summary?: string;
    top?: string[];
}

export interface InteractionState {
    flags: Record<string, any>; // Multi-purpose flags (e.g. confirmedAutoTap, paidCasualtyFor)
    lastChoiceIndex?: number; // Numeric selection (e.g. cost index, mode index)
    lastChoiceValue?: string; // String selection (e.g. chosen color, type, or card name)
    lastChoiceX?: number; // Chosen X value
    lastChosenModeIndex?: number[]; // Mode indices for multi-mode spells
    lastSelections: Record<string, string[]>; // Map of type -> IDs (e.g. { 'Sacrifice': ['id1'], 'Exile': ['id2', 'id3'] })
    manaChoices?: Record<string, string>; // Map of hybrid symbol index -> chosen payment (e.g. { "0": "R" })
}

export interface ChoiceQueueItem {
    data: any;
    playerId: PlayerId;
    sourceId: string;
    type: string;
}

/**
 * InteractionMetadata - Structured cross-cutting data that must persist across interaction boundaries.
 * Used to ensure flags like 'exileOnResolution' or 'isFreeCast' are not lost between choice creation and action resolution.
 */
export interface InteractionMetadata {
    effects?: import('./effects').EffectDefinition[];
    exileOnResolution?: boolean;
    isFreeCast?: boolean;
    isSpellCasting?: boolean;
    lastDiscardedIds?: string[];
    lastMilledIds?: string[];
    lookingCards?: GameObject[];
    effectIndex?: number;
    isResumption?: boolean;
    controllerId?: PlayerId;
    paidManaValue?: number;
    parentContext?: import('./effects').EngineFrame | any;
    sourceMV?: number;
    stackObj?: StackObject;
    targets?: string[];
    xValue?: number;
    exiledIds?: string[];
    chosenName?: string;
    parentSourceId?: string;
    parentStackId?: string;

    // --- Phase 5 Migration Fields ---
    manaSnapshot?: ManaPool;
    restrictedSnapshot?: RestrictedMana[];
    producedMana?: Partial<ManaPool>;
    tappedLandIds?: string[];
    isCopyTargeting?: boolean;
    isChangeTargeting?: boolean;
    isCostTargeting?: boolean;
    isResolutionX?: boolean;
    xValueConfirmed?: boolean;
    discardAmount?: string | number;
    confirmedAutoTap?: boolean;
    abilityIndex?: number;
    preSelectedChoice?: number;
    spellCopyRef?: StackObject;
    isManaChoiceToggle?: boolean;
    hybridGroups?: any[];
    triggers?: any[];
    nextPlayerIds?: string[];
    onFailureEffects?: import('./effects').EffectDefinition[];
    isOptionalDiscard?: boolean;
    maxChoices?: number;
    minChoices?: number;
    allowDuplicates?: boolean;
    involvedIds?: string[];
    declaredTargets?: string[];
    choiceEffects?: import('./effects').EffectDefinition[];
    nextTriggersToStack?: any[];
    isMulliganPutBack?: boolean;
}

export interface CommonResolutionFields {
    effects?: import('./effects').EffectDefinition[];
    effectIndex?: number;
    parentContext?: import('./effects').EngineFrame;
    stackObj?: StackObject;
    targets?: string[];
    declaredTargets?: string[];
}

export interface CommonChoiceFields {
    choices?: ChoiceOption[];
    choiceEffects?: import('./effects').EffectDefinition[];
    costType?: string;
    isCostChoice?: boolean;
    isTargetingModal?: boolean;
    maxChoices?: number;
    minChoices?: number;
    originalActionData?: any;
    selectedChoice?: any;
}

export interface BaseActionData extends CommonResolutionFields, CommonChoiceFields {
    // --- Core Identity ---
    label: string;
    summary?: string;
    allowDuplicates?: boolean;
    reveal?: boolean;
    isOptionalDiscard?: boolean;
    isResolutionX?: boolean;
    isMulliganPutBack?: boolean;
    mCount?: number;
    discardAmount?: number | string;
    metadata?: InteractionMetadata;

    sourceId?: string;
    sourceObject?: GameObject;
    hideUndo?: boolean;
    isContextual?: boolean;
    mutationCheckpoint?: number;

    // --- Component: Targeting ---
    count?: number;
    minCount?: number;
    maxCount?: number;
    targetDefinition?: import('./targeting').TargetDefinition;
    targetDefinitions?: import('./targeting').TargetDefinition[];
    selectedTargets?: (string | null)[];


    originalTargets?: string[];
    legalTargetIds?: string[];
    legalPlayerIds?: string[];

    // --- Component: Casting & Mana ---

    totalMana?: string;

    isManaChoice?: boolean;
    isManaChoiceToggle?: boolean;
    hybridGroups?: any;
    paidManaValue?: number;

    // --- Component: Batch & Sequencing ---
    lookingCards?: GameObject[];
    involvedIds?: string[];
    lastDiscardedIds?: string[];
    lastMilledIds?: string[];
    nextPlayerIds?: string[];
    effectIndex?: number;
    triggers?: any[];
    isChoiceSequence?: boolean;
    isSacrificeSequence?: boolean;

    canSkip?: boolean;
    optional?: boolean;
    isOptional?: boolean;

    // --- Component: Modes & Choices ---
    isModeSelection?: boolean;

    remainingCosts?: import('./abilities').AbilityCost[];
    sequencedEffect?: import('./effects').EffectDefinition;
    onFailureEffects?: import('./effects').EffectDefinition[];

    // --- Legacy / Transition ---

    ids?: string[];
}

export interface TargetingActionData extends BaseActionData {
    _backupTargets?: string[];
    nextTriggersToStack?: any[];
    prompt?: string;
    stackId?: string;
}

export interface ModalActionData extends BaseActionData {
    allowDuplicates?: boolean;
    reveal?: boolean;
}

export interface XChoiceActionData extends BaseActionData {
    choiceCosts?: any[];
    isResolutionX: boolean; // Overridden to be required
}

export interface BatchActionData extends BaseActionData {
    isOptionalDiscard?: boolean;
}

export interface CostActionData extends BaseActionData {
    // Typed definitions for cost resolution
}

export type ActionData = ModalActionData | XChoiceActionData | TargetingActionData | BatchActionData | CostActionData | BaseActionData;

export interface PendingAction {
    count?: number;
    data?: ActionData;
    playerId: PlayerId;
    sourceId?: string;
    type: string;
}

export interface MulliganState {
    mulliganCounts: Record<PlayerId, number>;
    decisions: Record<PlayerId, 'keep' | 'mulligan' | 'none'>;
    discardsComplete: Record<PlayerId, boolean>;
    startingPlayerId?: PlayerId;
    isStartingPlayerSelected?: boolean;
    isComplete?: boolean;
}

import type { Mutation } from './mutations';

export interface GameState {
    isSticky?: boolean;
    _entityMap?: Record<string, BaseEntity>;
    _lastLayerHash?: string;
    _objectCache?: Map<string, GameObject | StackObject> & {
        version: number;
    };
    _statsCache?: Map<string, EffectiveStats> & { version?: number };
    _triggerCache?: any;
    activePlayerId: PlayerId;
    battlefield: GameObject[];
    choiceQueue?: ChoiceQueueItem[];
    combat?: CombatState;
    consecutivePasses: number;
    currentPhase: Phase;
    currentStep: Step;
    dynamicCopies?: Record<string, GameObject>;
    emblems: EmblemDefinition[];
    executionTrace?: {
        controllerId: string;
        effectIndex?: number;
        sourceId: string;
        targets: string[];
        timestamp: number;
        type: string;
        xValue?: number;
    }[];
    exile: GameObject[];
    gameEngine?: any;
    gameStats?: {
        castCounts: Record<PlayerId, Record<string, number>>;
    };
    interaction: InteractionState;
    isResolvingDrawReplacement?: boolean;
    limbo: GameObject[];
    lki: Record<string, Partial<Record<Zone, GameObject | StackObject>>>;
    logs: string[];
    mulliganState?: MulliganState;
    mutationStack?: Mutation[];
    paradigmCopies?: Record<string, GameObject>;
    pendingAction?: PendingAction;
    pendingTriggers?: StackObject[];
    playerOrder: PlayerId[];
    players: Record<PlayerId, PlayerState>;
    priorityPlayerId: PlayerId | null;
    ruleRegistry: RuleRegistry;
    stack: StackObject[];
    stateVersion: number;
    status?: 'active' | 'completed';
    turnNumber: number;
    turnState: TurnState;
    winner?: PlayerId;
}

export interface RuleRegistry {
    activatedAbilities: ActivatedAbility[];
    continuousEffects: ContinuousEffect[];
    preventionEffects: PreventionEffect[];
    replacementEffects: ReplacementEffect[];
    restrictions: AbilityRestriction[];
    triggeredAbilities: TriggeredAbility[];
}

export interface EmblemDefinition {
    abilities: (AbilityDefinition | string)[];
    controllerId: PlayerId;
    id: string;
    image_url?: string;
    name: string;
    oracleText?: string;
}
