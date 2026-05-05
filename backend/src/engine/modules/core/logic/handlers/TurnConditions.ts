import { ConditionType, Phase } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IConditionHandler } from "../IConditionHandler";
import { LogCategory } from "../../../../utils/EngineLogger";

export const TurnConditions: Record<string, IConditionHandler> = {
    [ConditionType.IsYourTurn]: {
        matches(state, params, context) {
            return state.activePlayerId === context.controllerId;
        }
    },
    [ConditionType.IsOpponentTurn]: {
        matches(state, params, context) {
            return state.activePlayerId !== context.controllerId;
        }
    },
    [ConditionType.IsOpponentUpkeep]: {
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
    [ConditionType.GainedLifeThisTurn]: {
        matches(state, params, context) {
            return (state.turnState.lifeGainedThisTurn[context.controllerId] || 0) > 0;
        }
    },
    "PLAYER_GAINED_LIFE_THIS_TURN": {
        matches(state, params, context) {
            return (state.turnState.lifeGainedThisTurn[context.controllerId] || 0) > 0;
        }
    },
    [ConditionType.LifeGained2OrMoreThisTurn]: {
        matches(state, params, context) {
            return (state.turnState.lifeGainedThisTurn[context.controllerId] || 0) >= 2;
        }
    },
    [ConditionType.LifeGained3OrMoreThisTurn]: {
        matches(state, params, context) {
            return (state.turnState.lifeGainedThisTurn[context.controllerId] || 0) >= 3;
        }
    },
    [ConditionType.CardsLeftYourGraveyardThisTurn]: {
        matches(state, params, context) {
            return state.turnState.cardLeftGraveyardThisTurn[context.controllerId] || false;
        }
    },
    [ConditionType.CardsExiledThisTurn]: {
        matches(state, params, context) {
            return state.turnState.cardsExiledThisTurn[context.controllerId] || false;
        }
    },
    [ConditionType.CreatureDiedUnderYourControlThisTurn]: {
        matches(state, params, context) {
            return state.turnState.creaturesDiedThisTurn.some(c => c.controllerId === context.controllerId);
        }
    },
    [ConditionType.CreatureDiedThisTurn]: {
        matches(state, params, context) {
            return state.turnState.creaturesDiedThisTurn.length > 0;
        }
    },
    [ConditionType.CreaturesDiedCountGe]: {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            const count = state.turnState.creaturesDiedThisTurn?.length || 0;
            const result = count >= threshold;
            return result;
        }
    },
    [ConditionType.CastInstantSorceryThisTurn]: {
        matches(state, params, context) {
            return state.turnState.instantOrSorceryCastThisTurn[context.controllerId] || false;
        }
    },
    [ConditionType.CastAnotherSpellThisTurn]: {
        matches(state, params, context) {
            return (state.turnState.spellsCastThisTurn[context.controllerId] || 0) > 1;
        }
    },
    [ConditionType.DrawnCardsGe]: {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            return (state.turnState.cardsDrawnThisTurn[context.controllerId] || 0) >= threshold;
        }
    },
    [ConditionType.PutCounterOnSelfThisTurn]: {
        matches(state, params, context) {
            return state.turnState.countersAddedThisTurnIds?.includes(context.sourceId) || false;
        }
    },

    [ConditionType.PermanentReturnedToHandThisTurn]: {
        matches(state, params, context) {
            return state.turnState.permanentReturnedToHandThisTurn || false;
        }
    },
    [ConditionType.ControlsBasriPlaneswalker]: {
        matches(state, params, context) {
            const { targeting: TargetingProcessor } = getProcessors(state);
            const { controllerId, sourceId, stackObject } = context;
            const targetingContext = { sourceId, controllerId, stackObject };
            return state.battlefield.some(o => 
                o.controllerId === controllerId && 
                RuleUtils.isPlaneswalker(o) && 
                o.definition.name.toLowerCase().includes("basri")
            );
        }
    },
    [ConditionType.CastDuringMainPhase]: {
        matches(state, params, context) {
            return state.activePlayerId === context.controllerId && (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
        }
    },
    [ConditionType.NextSpellThisTurn]: {
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
