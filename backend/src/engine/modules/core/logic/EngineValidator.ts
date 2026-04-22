import { GameState, ActionType } from '@shared/engine_types';

/**
 * EngineValidator - Centralized logic for verifying the operational state of the engine.
 * Used to prevent illegal transitions and ensure the engine suspends correctly.
 */
export class EngineValidator {

    /**
     * Checks if the engine is currently suspended awaiting player interaction.
     * While suspended, the engine should not advance steps or resolve further stack objects.
     */
    public static isSuspended(state: GameState): boolean {
        if (!state.pendingAction) return false;

        // CR 117.1: Certain actions must be resolved before the game can proceed.
        const internalActions: string[] = [
            // List any internal/system actions that DON'T require external pause if necessary.
            // Currently, all ActionTypes require some form of resolution.
        ];

        return !internalActions.includes(state.pendingAction.type);
    }

    /**
     * Checks if a player is currently required to perform a mandatory action.
     */
    public static isPlayerRequiredToAct(state: GameState, playerId: string): boolean {
        if (!state.pendingAction) return false;
        return String(state.pendingAction.playerId) === String(playerId);
    }
}
