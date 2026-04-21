import {
    AbilityCost,
    EffectDefinition, GameObject, GameState, PlayerId, ResolutionContext, StackObject
} from '@shared/engine_types';

export interface PlayCardOptions {
    playerId: PlayerId;
    cardId: string;
    targets?: string[];
    bypassPriority?: boolean;
    bypassTargeting?: boolean;
}

export interface ActivateAbilityOptions {
    playerId: PlayerId;
    cardId: string;
    abilityIndex: number;
    targets?: string[];
    choiceIndex?: number;
    bypassPriority?: boolean;
    bypassTargeting?: boolean;
}

export interface FinalizeCastOptions {
    playerId: string;
    cardToPlay: GameObject;
    totalMana: string;
    additionalCosts: AbilityCost[];
    declaredTargets: string[];
    spellEffects: EffectDefinition[];
    targetDefinition: any; // Targeting can still be complex, keeping as any for now or checking if there's a TargetDefinition
    isFirstInstantOrSorcery: boolean;
    isInstantOrSorcery: boolean;
}

export interface FinalizeAbilityOptions {
    playerId: string;
    obj: GameObject;
    ability: any; // Ability is often specific to the card, but could be ParsedAbility
    abilityIndex: number;
    declaredTargets: string[];
    preSelectedChoice?: number;
}

export interface EffectExecutionOptions {
    state: GameState;
    effect: EffectDefinition;
    sourceId: string;
    validTargetIds: string[];
    log: (m: string) => void;
    stackObject?: StackObject;
    parentContext?: ResolutionContext;
    controllerIdOverride?: PlayerId;
    lookingCards?: any[];
}

export interface ResolveEffectsOptions {
    state: GameState;
    effects: EffectDefinition[];
    sourceId: string;
    targets: string[];
    log: (m: string) => void;
    startIndex?: number;
    stackObject?: StackObject;
    parentContext?: ResolutionContext;
    controllerIdOverride?: PlayerId;
    lookingCards?: any[];
}

export interface EngineContext {
    log(m: string): void;
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
    declareAttacker(pId: string, cId: string): boolean;
    handleBlockSelection(pId: string, cId: string): boolean;
    confirmAttackers(pId: string): void;
    confirmBlockers(pId: string): void;

    // Targeting
    finaliseTargeting?(pId: PlayerId, targets: string[]): boolean;
}
