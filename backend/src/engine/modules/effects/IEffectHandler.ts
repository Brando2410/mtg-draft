import { EffectDefinition, GameState, ResolutionContext } from "@shared/engine_types";

export interface IEffectHandler {
    /**
     * Executes the specific logic for this effect.
     * @returns boolean - true if resolution is complete, false if it's waiting for user input.
     */
    handle(
        state: GameState, 
        effect: EffectDefinition, 
        log: (m: string) => void, 
        context: ResolutionContext
    ): void | boolean;
}
