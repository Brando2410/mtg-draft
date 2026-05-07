import {
  AbilityCost,
  AbilityDefinition,
  EffectDefinition, GameObject, GameState, PlayerId, ResolutionContext, StackObject, TargetDefinition
} from '@shared/engine_types';
import { ProcessorRegistry } from '../modules/ProcessorRegistry';

export interface PlayCardOptions {
    playerId: PlayerId;
    cardId: string;
    targets?: string[];
    xValue?: number;
    bypassPriority?: boolean;
    bypassTargeting?: boolean;
    isFreeCast?: boolean;
    exileOnResolution?: boolean;
    parentContext?: ResolutionContext;
    isAbilitySelectionBypassed?: boolean;
}

export interface ActivateAbilityOptions {
    playerId: PlayerId;
    cardId: string;
    abilityIndex: number;
    targets?: string[];
    xValue?: number;
    choiceIndex?: number;
    bypassPriority?: boolean;
    bypassTargeting?: boolean;
    isFreeCast?: boolean;
    exileOnResolution?: boolean;
    parentContext?: ResolutionContext;
}

export interface FinalizeCastOptions {
    playerId: PlayerId;
    cardToPlay: GameObject;
    totalMana: string;
    additionalCosts: AbilityCost[];
    declaredTargets: string[];
    spellEffects: EffectDefinition[];
    targetDefinitions?: TargetDefinition[];
    isFirstInstantOrSorcery?: boolean;
    isInstantOrSorcery?: boolean;
    isFreeCast?: boolean;
    parentContext?: ResolutionContext;
}

export interface FinalizeAbilityOptions {
    playerId: PlayerId;
    obj: GameObject;
    ability: AbilityDefinition;
    abilityIndex: number;
    declaredTargets: string[];
    xValue?: number;
    preSelectedChoice?: number;
    parentContext?: ResolutionContext;
    exileOnResolution?: boolean;
}

export interface InteractiveAbilityOptions {
    playerId: PlayerId;
    obj: GameObject;
    ability: AbilityDefinition;
    abilityIndex: number;
    declaredTargets: string[];
    preSelectedChoice?: number;
    parentContext?: ResolutionContext;
    exileOnResolution?: boolean;
}

export interface EffectExecutionOptions {
    state: GameState;
    effect: EffectDefinition;
    sourceId: string;
    validTargetIds: string[];
    stackObject?: StackObject;
    parentContext?: ResolutionContext;
    controllerIdOverride?: PlayerId;
    lookingCards?: GameObject[];
    lastMilledIds?: string[];
    lastDiscardedIds?: string[];
    currentIndex?: number;
    nextEffectIndex?: number;
}

export interface ResolveEffectsOptions {
    state: GameState;
    effects: EffectDefinition[];
    sourceId: string;
    targets: string[];
    startIndex?: number;
    stackObject?: StackObject;
    parentContext?: ResolutionContext;
    controllerIdOverride?: PlayerId;
    lookingCards?: GameObject[];
}

export interface EngineContext {
    getPlayerName(id: PlayerId): string;

    // Core actions
    drawCard(pId: PlayerId): boolean;
    playCard(options: PlayCardOptions): boolean;
    activateAbility(options: ActivateAbilityOptions): boolean;
    tapForMana(pId: PlayerId, cId: string, aIdx?: number, cIdx?: number): boolean | void;

    // Passing & Priority
    resetPriorityToActivePlayer(): void;
    checkAutoPass(pId: PlayerId): void;
    passPriority(pId: PlayerId, isAuto?: boolean): void;

    // Phase / Step / Stack Control
    resolveTopOrAdvanceStep(): void;
    advanceStep(): void;

    // State Based Actions
    checkStateBasedActions(): void;

    // Combat Methods
    declareAttacker(pId: PlayerId, cId: string): boolean;
    handleBlockSelection(pId: PlayerId, cId: string): boolean;
    confirmAttackers(pId: PlayerId): void;
    confirmBlockers(pId: PlayerId): void;

    // Targeting
    finaliseTargeting(pId: PlayerId, targets: string[]): boolean;
    // Processors (Service Registry to avoid circular dependencies)
    processors: ProcessorRegistry;

    resumeResolution(sourceId: string, stackObj: StackObject, parentContext: ResolutionContext): boolean;
}
