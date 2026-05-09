import { PlayerId, GameObject, StackObject, EngineFrame } from '@shared/engine_types';
import { EngineContext, PlayCardOptions, ActivateAbilityOptions } from './EngineContext';
import { ProcessorRegistry } from '../modules/ProcessorRegistry';

/**
 * NullEngineContext: Standardized No-Op implementation of EngineContext.
 * Used to eliminate defensive null checks when the GameState is not attached 
 * to a full GameEngine (e.g. in standalone validation or test scripts).
 */
export class NullEngineContext implements EngineContext {
    private static _instance: NullEngineContext;

    public static getInstance(): NullEngineContext {
        if (!this._instance) {
            this._instance = new NullEngineContext();
        }
        return this._instance;
    }

    public getPlayerName(id: PlayerId): string { return id; }
    public drawCard(pId: PlayerId): boolean { return false; }
    public playCard(options: PlayCardOptions): boolean { return false; }
    public activateAbility(options: ActivateAbilityOptions): boolean { return false; }
    public tapForMana(pId: PlayerId, cId: string): boolean | void { }
    public resetPriorityToActivePlayer(): void { }
    public checkAutoPass(pId: PlayerId): void { }
    public passPriority(pId: PlayerId): void { }
    public resolveTopOrAdvanceStep(): void { }
    public advanceStep(): void { }
    public checkStateBasedActions(): void { }
    public declareAttacker(pId: PlayerId, cId: string): boolean { return false; }
    public handleBlockSelection(pId: PlayerId, cId: string): boolean { return false; }
    public confirmAttackers(pId: PlayerId): void { }
    public confirmBlockers(pId: PlayerId): void { }
    public finaliseTargeting(pId: PlayerId, targets: string[]): boolean { return false; }
    public resumeResolution(sourceId: string, stackObj: StackObject, parentContext: EngineFrame): boolean { return false; }

    /**
     * Null context uses the fallback processor locator.
     */
    public get processors(): ProcessorRegistry {
        // This will be resolved via the getProcessors utility which has its own fallback
        return null as any;
    }
}

