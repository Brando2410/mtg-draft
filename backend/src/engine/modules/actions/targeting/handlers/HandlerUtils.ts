import { GameObject, GameState, PlayerState, StackObject } from "@shared/engine_types";
import { EngineFrame } from "@shared/types/effects";
import { Targetable } from "@shared/engine_types";
import { IRestrictionHandler } from "../IRestrictionHandler";

/**
 * Type Guard for GameObject.
 */
export function isGameObject(obj: Targetable): obj is GameObject {
    return obj !== null && typeof obj === 'object' && 'zone' in obj && 'definition' in obj && !('sourceId' in obj);
}

/**
 * Type Guard for PlayerState.
 */
export function isPlayerState(obj: Targetable): obj is PlayerState {
    return obj !== null && typeof obj === 'object' && 'manaPool' in obj && 'life' in obj;
}

/**
 * Type Guard for StackObject.
 */
export function isStackObject(obj: Targetable): obj is StackObject {
    return obj !== null && typeof obj === 'object' && 'type' in obj && 'sourceId' in obj;
}

/**
 * Wrapper for GameObject-only restrictions.
 * Automatically returns false if the target is not a GameObject.
 */
export function gameObjectRestriction(
    evaluator: (state: GameState, obj: GameObject, restriction: string, context: EngineFrame) => boolean
): IRestrictionHandler {
    return {
        matches(state: GameState, targetObj: Targetable, restriction: string, context: EngineFrame) {
            if (!isGameObject(targetObj)) return false;
            return evaluator(state, targetObj, restriction, context);
        }
    };
}

/**
 * Wrapper for Player-only restrictions.
 * Automatically returns false if the target is not a PlayerState.
 */
export function playerRestriction(
    evaluator: (state: GameState, player: PlayerState, restriction: string, context: EngineFrame) => boolean
): IRestrictionHandler {
    return {
        matches(state: GameState, targetObj: Targetable, restriction: string, context: EngineFrame) {
            if (!isPlayerState(targetObj)) return false;
            return evaluator(state, targetObj, restriction, context);
        }
    };
}

/**
 * Wrapper for StackObject-only restrictions.
 */
export function stackObjectRestriction(
    evaluator: (state: GameState, obj: StackObject, restriction: string, context: EngineFrame) => boolean
): IRestrictionHandler {
    return {
        matches(state: GameState, targetObj: Targetable, restriction: string, context: EngineFrame) {
            if (!isStackObject(targetObj)) return false;
            return evaluator(state, targetObj, restriction, context);
        }
    };
}


