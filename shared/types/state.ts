// state.ts
// Game state and player state structures

import type { AbilityDefinition } from './abilities';
import { AbilityType } from './abilities';
import type { GameObjectId, PlayerId, RestrictionObject } from './core';
import { Phase, Step, Zone } from './core';
import type { ContinuousEffect } from './effects';
import type { AbilityRestriction } from './targeting';

export interface CardDefinition {
    name: string;
    manaCost: string;
    manaValue?: number;
    colors: string[];
    supertypes?: string[];
    types: string[];
    subtypes?: string[];
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
    targetDefinition?: import('./targeting').TargetDefinition;
    auraRestriction?: import('./targeting').TargetDefinition;
}

export interface GameObject {
    id: GameObjectId;
    image_url?: string;
    ownerId: PlayerId;
    controllerId: PlayerId;
    zone: Zone;
    definition: CardDefinition;
    isTapped: boolean;
    damageMarked: number;
    summoningSickness: boolean;
    abilitiesUsedThisTurn: number;
    faceDown: boolean;
    isPrepared: boolean;
    keywords: string[];
    deathtouchMarked: boolean;
    isPhasedOut?: boolean;
    lastNonStackZone?: Zone;
    xValue?: number;
    exileOnResolution?: boolean;
    isFlashbackCast?: boolean;
    isRevealed?: boolean;
    isFreeCast?: boolean;
    usedAlternativeCostId?: string;
    paidCost?: string;
    isPreparedCopy?: boolean;
    isCopy?: boolean;
    sourceCreatureId?: string;
    colorsSpent?: string[];
    originalDefinition?: CardDefinition;
    selectedFaceDefinition?: CardDefinition;
    counters: Record<string, number>;
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
    isToken?: boolean;
    isAttacking?: boolean;
    isBlocking?: boolean;
    isGoaded?: boolean;
    cannotUntapThisTurn?: boolean;
    modifierSnapshot?: any;
    convergeAmount?: number;
    isVirtual?: boolean;
    isPTSwitched?: boolean;
    paidManaValue?: number;
    controllerHistory?: PlayerId[];
}

export interface StackObject {
    id: string;
    controllerId: PlayerId;
    sourceId: GameObjectId;
    type: AbilityType;
    targets: GameObjectId[] | PlayerId[];
    card?: GameObject;
    abilityIndex?: number;
    data?: any;
    name?: string;
    image_url?: string;
    xValue?: number;
    exileOnResolution?: boolean;
    isCopy?: boolean;
    isPreparedCopy?: boolean;
    isFlashbackCast?: boolean;
    definition?: CardDefinition;
    cannotBeCopied?: boolean;
    convergeAmount?: number;
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
    index?: number;
    indices?: number[];
    value?: string;
    values?: string[];
}

export interface InteractionState {
    lastChosenSacrificeId?: string;
    lastChosenDiscardId?: string;
    lastChosenTapSelectionIds?: string[];
    lastChosenExileIds?: string[];
    lastChosenCostChoiceIndex?: number;
    lastChosenModeIndex?: number[];
    lastChoiceIndex?: number | string;
    confirmedAutoTap?: boolean;
    paidCasualtyFor?: string;
    consumedModeIndex?: number[];
    lastChoiceX?: number;
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
