import { GameState, Targetable, EngineFrame, TargetRestriction } from "@shared/engine_types";

export interface IRestrictionHandler {
    /**
     * @param state The current game state
     * @param targetObj The object or player being validated (GameObject, PlayerState, or StackObject)
     * @param restriction The specific restriction being checked
     * @param context Targeting context (sourceId, controllerId, etc.)
     */
    matches(state: GameState, targetObj: Targetable, restriction: TargetRestriction | string, context: EngineFrame): boolean;
}

