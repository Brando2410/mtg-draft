import { GameState, ConditionContext, PlayerId } from "@shared/engine_types";
import { IConditionHandler } from "../IConditionHandler";

export const TurnConditions: Record<string, IConditionHandler> = {
    "IS_YOUR_TURN": {
        matches(state, params, context) {
            return state.activePlayerId === context.controllerId;
        }
    },
    "IS_OPPONENT_TURN": {
        matches(state, params, context) {
            return state.activePlayerId !== context.controllerId;
        }
    },
    "IS_OPPONENT_UPKEEP": {
        matches(state, params, context) {
            return state.activePlayerId !== context.controllerId && state.currentStep === "Upkeep";
        }
    },
    "LIFE_GAINED_THIS_TURN": {
        matches(state, params, context) {
            const amount = state.turnState.lifeGainedThisTurn[context.controllerId] || 0;
            const threshold = params[0] ? parseInt(params[0]) : 1;
            return amount >= threshold;
        }
    },
    "GAINED_LIFE_THIS_TURN": {
        matches(state, params, context) {
            return (state.turnState.lifeGainedThisTurn[context.controllerId] || 0) > 0;
        }
    },
    "PLAYER_GAINED_LIFE_THIS_TURN": {
        matches(state, params, context) {
            return (state.turnState.lifeGainedThisTurn[context.controllerId] || 0) > 0;
        }
    },
    "LIFE_GAINED_2_OR_MORE_THIS_TURN": {
        matches(state, params, context) {
            return (state.turnState.lifeGainedThisTurn[context.controllerId] || 0) >= 2;
        }
    },
    "LIFE_GAINED_3_OR_MORE_THIS_TURN": {
        matches(state, params, context) {
            return (state.turnState.lifeGainedThisTurn[context.controllerId] || 0) >= 3;
        }
    },
    "CARDS_LEFT_YOUR_GRAVEYARD_THIS_TURN": {
        matches(state, params, context) {
            return state.turnState.cardLeftGraveyardThisTurn[context.controllerId] || false;
        }
    },
    "CARDS_EXILED_THIS_TURN": {
        matches(state, params, context) {
            return state.turnState.cardsExiledThisTurn[context.controllerId] || false;
        }
    },
    "CREATURE_DIED_UNDER_YOUR_CONTROL_THIS_TURN": {
        matches(state, params, context) {
            return state.turnState.creaturesDiedThisTurn.some(c => c.controllerId === context.controllerId);
        }
    },
    "CREATURE_DIED_THIS_TURN": {
        matches(state, params, context) {
            return state.turnState.creaturesDiedThisTurn.length > 0;
        }
    },
    "CREATURES_DIED_COUNT_GE": {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            return (state.turnState.creaturesDiedThisTurn.length || 0) >= threshold;
        }
    },
    "CAST_INSTANT_SORCERY_THIS_TURN": {
        matches(state, params, context) {
            return state.turnState.instantOrSorceryCastThisTurn[context.controllerId] || false;
        }
    },
    "CAST_ANOTHER_SPELL_THIS_TURN": {
        matches(state, params, context) {
            return (state.turnState.spellsCastThisTurn[context.controllerId] || 0) > 1;
        }
    },
    "DRAWN_CARDS_GE": {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            return (state.turnState.cardsDrawnThisTurn[context.controllerId] || 0) >= threshold;
        }
    },
    "PUT_COUNTER_ON_SELF_THIS_TURN": {
        matches(state, params, context) {
            return state.turnState.countersAddedThisTurnIds?.includes(context.sourceId) || false;
        }
    },
    "OUR_TURN": {
        matches(state, params, context) {
            return state.activePlayerId === context.controllerId;
        }
    },
    "CAST_DURING_MAIN_PHASE": {
        matches(state, params, context) {
            const { Phase } = require("@shared/engine_types");
            return state.activePlayerId === context.controllerId && (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
        }
    },
    "NEXT_SPELL_THIS_TURN": {
        matches(state, params, context) {
            // This is usually used in Delayed Triggers that trigger on CastSpell.
            // Under existing logic, if we are in this handler, it means the trigger just went off.
            // We want to ensure it's the first spell cast AFTER the trigger was created.
            // However, the simplest implementation for "NextSpellThisTurn" in a one-shot delayed trigger 
            // is just to return true, because the trigger itself only exists once.
            return true;
        }
    }
};
