// state.ts
// Game state and player state structures

import type { AbilityDefinition } from './abilities';
import { AbilityType } from './abilities';
import type { GameObjectId, PlayerId, RestrictionObject } from './core';
import { Phase, Step, Zone } from './core';
import type { ContinuousEffect } from './effects';
import type { AbilityRestriction, TargetDefinition } from './targeting';

export type CounterType = 'loyalty' | 'p1p1' | 'm1m1' | 'charge' | 'energy' | 'poison' | 'experience' | 'lore' | 'time' | 'suspend' | 'oil' | 'shield' | 'stun' | 'doom' | 'corrupt' | 'slime' | '+1/+1' | '-1/-1';

export interface CardLogic {
    name?: string;
    abilities?: AbilityDefinition[];
    effects?: any[];
    targetDefinitions?: TargetDefinition[];
    condition?: any;
    restrictions?: any[];
    exileOnResolution?: boolean;
}

export interface CardDefinition {
    name: string;
    manaCost: string;
    manaValue?: number;
    colors: string[];
    supertypes?: string[];
    types: string[];
    subtypes?: string[];
    typeMask?: number;
    power?: string | number;
    toughness?: string | number;
    keywords?: string[];
    loyalty?: string | number;
    oracleText: string;
    type_line?: string;
    image_url?: string;
    scryfall_id?: string;
    set?: string;
    entersTapped?: boolean;
    entersTappedCondition?: string;
    entersWithXCounters?: boolean;
    entersPrepared?: boolean;
    preparedFace?: CardDefinition;
    faces?: CardDefinition[];
    flashbackCost?: string;
    abilities?: (AbilityDefinition | string)[];
    exileOnResolution?: boolean;
    rarity?: 'common' | 'uncommon' | 'rare' | 'mythic' | 'basic';
    cannotBeCopied?: boolean;
    targetDefinitions?: TargetDefinition[];
    auraRestrictions?: TargetDefinition[];
}

export interface BaseEntity {
    id: string;
    controllerId: PlayerId;
    ownerId: PlayerId;
    definition: CardDefinition;
    name?: string;
    image_url?: string;
    zone?: Zone;
    xValue?: number;
    counters: Partial<Record<CounterType, number>>;
    isPhasedOut?: boolean;
    isPrepared?: boolean;
    convergeAmount?: number;
    exileOnResolution?: boolean;
    isToken?: boolean;
    isCopy?: boolean;
    isPreparedCopy?: boolean;
    isFlashbackCast?: boolean;
    paidManaValue?: number;
}

export interface GameObject extends BaseEntity {
    zone: Zone;
    version?: number;
    typeMask?: number;
    isTapped: boolean;
    damageMarked: number;
    summoningSickness: boolean;
    abilitiesUsedThisTurn: number;
    faceDown: boolean;
    keywords: string[];
    deathtouchMarked: boolean;
    lastNonStackZone?: Zone;
    isRevealed?: boolean;
    isFreeCast?: boolean;
    usedAlternativeCostId?: string;
    paidCost?: string;
    sourceCreatureId?: string;
    colorsSpent?: string[];
    originalDefinition?: CardDefinition;
    selectedFaceDefinition?: CardDefinition;
    attachedTo?: GameObjectId;
    data?: any;
    effectiveStats?: {
        power: number;
        toughness: number;
        keywords: string[];
        restrictions?: RestrictionObject[];
        isPlayable?: boolean;
        manaCost?: string;
        isFlashback?: boolean;
        isActivation?: boolean;
        isVirtual?: boolean;
        colors?: string[];
        types?: string[];
        subtypes?: string[];
        supertypes?: string[];
        flashbackCostOverride?: string;
    };
    isAttacking?: boolean;
    isBlocking?: boolean;
    isGoaded?: boolean;
    cannotUntapThisTurn?: boolean;
    modifierSnapshot?: any;
    isVirtual?: boolean;
    isPTSwitched?: boolean;
    controllerHistory?: PlayerId[];
}

export interface StackObject extends BaseEntity {
    sourceId: GameObjectId;
    type: AbilityType;
    targets: GameObjectId[] | PlayerId[];
    sourceObject?: GameObject; // The canonical hydrated object (Card, Token, or Ability Source)
    abilityIndex?: number;
    data?: any;
    cannotBeCopied?: boolean;
    originalControllerId?: PlayerId;
    condition?: any;
}

export interface PlayerState {
    id: PlayerId;
    name: string;
    avatar?: string;
    life: number;
    poisonCounters: number;
    library: GameObject[];
    hand: GameObject[];
    graveyard: GameObject[];
    sideboard: GameObject[];
    manaPool: {
        W: number;
        U: number;
        B: number;
        R: number;
        G: number;
        C: number;
    };
    restrictedMana?: {
        color: 'W' | 'U' | 'B' | 'R' | 'G' | 'C';
        amount: number;
        restrictions: string[];
    }[];
    hasPlayedLandThisTurn: boolean;
    fullControl: boolean;
    maxHandSize: number;
    pendingDiscardCount: number;
    manaCheat?: boolean;
    virtualHand: GameObject[];
    hasLost?: boolean;
    hasWon?: boolean;
    hasLostDueToEmptyLibrary?: boolean;
    stops: Record<string, boolean>;
    autoOrderTriggers: boolean;
    passUntilEndOfTurn: boolean;
    extraTurns: number;
    turnsToSkip: number;
    canActivateAbilities?: boolean;
}

export interface CombatState {
    attackers: {
        attackerId: GameObjectId;
        targetId: PlayerId | GameObjectId;
        order?: GameObjectId[];
    }[];
    blockers: {
        blockerId: GameObjectId;
        attackerId: GameObjectId;
        order?: GameObjectId[];
    }[];
}

export interface TurnState {
    permanentReturnedToHandThisTurn: boolean;
    playersWithPermanentReturnedThisTurn: Record<PlayerId, boolean>;
    noncombatDamageDealtToOpponents: Record<PlayerId, number>;
    creaturesAttackedThisTurn: number;
    creaturesDiedThisTurn: any[];
    lastDamageAmount: number;
    lastExcessDamageAmount: number;
    lastSacrificedObjectPower?: number;
    turnStartTime: number;
    lastLifeGainedAmount: number;
    lastCardsDrawnAmount: number;
    cardsDrawnThisTurn: Record<PlayerId, number>;
    lifeGainedThisTurn: Record<PlayerId, number>;
    spellsCastThisTurn: Record<PlayerId, number>;
    creaturesEnteredThisTurn: Record<PlayerId, number>;
    instantOrSorceryCastThisTurn: Record<PlayerId, boolean>;
    cardLeftGraveyardThisTurn: Record<PlayerId, boolean>;
    landsPlayedThisTurn: Record<PlayerId, number>;
    triggeredAbilitiesUsedThisTurn: Record<string, number>;
    lastDiscardedCount: number;
    lastDiscardedIds?: string[];
    lastDestroyedCount?: number;
    lastSacrificedObject?: GameObject;
    cardsExiledThisTurn: Record<PlayerId, boolean>;
    namedCards?: Record<string, string>;
    countersAddedThisTurnIds: GameObjectId[];
    damagePreventionDisabled?: boolean;
    lastScrySurveilResult?: {
        playerId: PlayerId;
        top: number;
        bottom: number;
        graveyard: number;
        type: string;
        timestamp: number;
    };
    lastExiledIds?: string[];
    lastMilledIds?: string[];
    lastCreatedTokenId?: string;
}

export interface ChoiceOption {
    label: string;
    value: any; // The key ID or index returned to the engine
    selectable?: boolean;
    effects?: any[];
    costs?: any[];
    imageUrl?: string;
    cardData?: GameObject;
    type_line?: string;
}

export interface ChoicePayload {
    selections: (string | number)[];
    summary?: string;
    // Multi-select specific reordering (Scry/Surveil)
    top?: string[];
    bottom?: string[];
    graveyard?: string[];
    // Specialized parameters for specific mechanics (faceIndex, costChoiceId, xValue, modeIndices)
    params?: Record<string, any>;
}

export interface InteractionState {
    lastSelections: Record<string, string[]>; // Map of type -> IDs (e.g. { 'Sacrifice': ['id1'], 'Exile': ['id2', 'id3'] })
    lastChoiceIndex?: number; // Numeric selection (e.g. cost index, mode index)
    lastChoiceValue?: string; // String selection (e.g. chosen color, type, or card name)
    lastChosenModeIndex?: number[]; // Mode indices for multi-mode spells
    lastChoiceX?: number; // Chosen X value
    flags: Record<string, any>; // Multi-purpose flags (e.g. confirmedAutoTap, paidCasualtyFor)
}

export interface ChoiceQueueItem {
    type: string;
    playerId: PlayerId;
    sourceId: string;
    data: any;
}

/**
 * InteractionMetadata - Structured cross-cutting data that must persist across interaction boundaries.
 * Used to ensure flags like 'exileOnResolution' or 'isFreeCast' are not lost between choice creation and action resolution.
 */
export interface InteractionMetadata {
    isSpellCasting?: boolean;
    isFreeCast?: boolean;
    exileOnResolution?: boolean;
    sourceMV?: number;
    parentContext?: any; // ResolutionContext from EffectProcessor
    stackObj?: StackObject;
    targets?: string[];
}

export interface BaseActionData {
    label: string;
    stackObj?: StackObject;
    parentContext?: any;
    mutationCheckpoint?: number;
    hideUndo?: boolean;
    isContextual?: boolean;
    abilityIndex?: number;
    isSpellCasting?: boolean;
    isFreeCast?: boolean;
    summary?: string;
    xValue?: number;
    metadata?: InteractionMetadata; // NEW: Standardized metadata container
    [key: string]: any;
}

export interface ModalActionData extends BaseActionData {
    choices: ChoiceOption[];
    isCostChoice?: boolean;
    costType?: 'Sacrifice' | 'Discard' | 'TapSelection' | 'Exile';
    minChoices?: number;
    maxChoices?: number;
}

export interface XChoiceActionData extends BaseActionData {
    isResolutionX: boolean;
    originalActionData: PendingAction;
}

export interface TargetingActionData extends BaseActionData {
    isTargetingModal?: boolean;
    declaredTargets?: string[];
    targets?: string[];
}

export interface BatchActionData extends BaseActionData {
    lookingCards?: GameObject[];
    nextPlayerIds?: PlayerId[];
    discardAmount?: number | string;
    onFailureEffects?: any[];
}

export type ActionData = ModalActionData | XChoiceActionData | TargetingActionData | BatchActionData | BaseActionData;

export interface PendingAction {
    type: string;
    playerId: PlayerId;
    count?: number;
    sourceId?: string;
    data?: ActionData;
}

import type { Mutation } from './mutations';

export interface GameState {
    players: Record<PlayerId, PlayerState>;
    activePlayerId: PlayerId;
    priorityPlayerId: PlayerId | null;
    currentPhase: Phase;
    currentStep: Step;
    turnNumber: number;
    battlefield: GameObject[];
    exile: GameObject[];
    emblems: EmblemDefinition[];
    stack: StackObject[];
    combat?: CombatState;
    pendingTriggers?: StackObject[];
    pendingAction?: PendingAction;
    ruleRegistry: RuleRegistry;
    limbo: GameObject[];
    consecutivePasses: number;
    logs: string[];
    executionTrace?: {
        type: string;
        sourceId: string;
        controllerId: string;
        targets: string[];
        timestamp: number;
        xValue?: number;
        nextEffectIndex?: number;
    }[];
    mutationStack?: Mutation[];
    choiceQueue?: ChoiceQueueItem[];
    turnState: TurnState;
    playerOrder: PlayerId[];
    interaction: InteractionState;
    stateVersion: number;
    gameStats?: {
        castCounts: Record<PlayerId, Record<string, number>>;
    };

    // Performance & Engine Extensions
    _entityMap?: Record<string, BaseEntity>;
    _objectCache?: Map<string, any> & {
        version: number;
    };
    dynamicCopies?: Record<string, GameObject>;
    paradigmCopies?: Record<string, GameObject>;
    _statsCache?: Map<string, any> & { version?: number };
    _lastLayerHash?: string;
    _triggerCache?: any;
    isResolvingDrawReplacement?: boolean;
    lki: Record<string, Partial<Record<Zone, GameObject | StackObject>>>;
    gameEngine?: import('../../backend/src/engine/interfaces/EngineContext').EngineContext;
}

export interface RuleRegistry {
    continuousEffects: ContinuousEffect[];
    activatedAbilities: any[];
    triggeredAbilities: any[];
    restrictions: AbilityRestriction[];
    replacementEffects?: any[];
    preventionEffects?: any[];
}

export interface EmblemDefinition {
    id: string;
    name: string;
    controllerId: PlayerId;
    oracleText: string;
    image_url?: string;
    abilities: any[];
}
