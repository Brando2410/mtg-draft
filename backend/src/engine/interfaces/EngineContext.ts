import { PlayerId } from '@shared/engine_types';

export interface EngineContext {
    log(m: string): void;
    getPlayerName(id: PlayerId): string;

    // Core actions
    drawCard(pId: PlayerId): boolean;
    playCard(pId: PlayerId, cId: string, targets: string[], bypass: boolean): boolean;
    activateAbility(pId: PlayerId, cId: string, idx: number, targets?: string[], bypass?: boolean, cIdx?: number): boolean;
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
