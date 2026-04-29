import { ConditionContext, GameState } from "@shared/engine_types";

export interface IConditionHandler {
    /**
     * @param state The current game state
     * @param params Extracted parameters from a colon-separated condition (e.g., ["creature", "power>=4"] for "HAS_PERMANENT:creature,power>=4")
     * @param context The resolution context (source, controller, event)
     */
    matches(state: GameState, params: string[], context: ConditionContext): boolean;
}
