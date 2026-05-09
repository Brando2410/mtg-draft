import { EffectDefinition, GameState, EngineFrame } from "@shared/engine_types";

/**
 * IEffectHandler: Generic interface for MTG effect logic.
 * @template T - The specific EffectDefinition type this handler processes.
 */
export interface IEffectHandler<T extends EffectDefinition = EffectDefinition> {
    /**
     * Executes the specific logic for this effect.
     * @returns boolean - true if resolution is complete, false if it's waiting for user input.
     */
    handle(
        state: GameState, 
        effect: T, 
        context: EngineFrame
    ): void | boolean;
}
