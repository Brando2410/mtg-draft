// state.ts
// Game state and player state structures

import type { ContinuousEffect } from './effects';
import { Phase, Step, Zone } from './core';
import type { GameObjectId, PlayerId } from './core';
import type { AbilityRestriction } from './targeting';
import { AbilityType } from './abilities';
import type { ParsedAbility } from './abilities';

export interface CardDefinition {
    name: string;
    manaCost: string;
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
    abilities?: (ParsedAbility | string)[];
    exileOnResolution?: boolean;
}

export interface GameObject {
    id: GameObjectId;
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
    isFlashbackCast?: boolean;
    isRevealed?: boolean;
    counters: Record<string, number>;
    attachedTo?: GameObjectId;
    data?: any;
    effectiveStats?: {
        power: number;
        toughness: number;
        keywords: string[];
        restrictions?: string[];
        isPlayable?: boolean;
        manaCost?: string;
    };
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
    isFlashbackCast?: boolean;
    definition?: CardDefinition;
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
    stops: Record<string, boolean>;
    autoOrderTriggers: boolean;
    passUntilEndOfTurn: boolean;
    extraTurns: number;
    turnsToSkip: number;
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

export interface PendingAction {
    type: string;
    playerId: PlayerId;
    count?: number;
    sourceId?: string;
    data?: any;
}

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
    turnState: TurnState;
    playerOrder: PlayerId[];
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
