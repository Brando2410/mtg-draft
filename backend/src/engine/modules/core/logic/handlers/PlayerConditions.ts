import { GameState, ConditionContext, PlayerId } from "@shared/engine_types";
import { IConditionHandler } from "../IConditionHandler";

export const PlayerConditions: Record<string, IConditionHandler> = {
    "PLAYER_HAS_LIFE_GE": {
        matches(state, params, context) {
            const life = parseInt(params[0]);
            return (state.players[context.controllerId]?.life || 0) >= life;
        }
    },
    "OPPONENT_HAS_LIFE_LE": {
        matches(state, params, context) {
            const oppLife = parseInt(params[0]);
            const opponent = Object.keys(state.players).find(pid => pid !== context.controllerId);
            return opponent ? (state.players[opponent as PlayerId]?.life || 0) <= oppLife : false;
        }
    },
    "PLAYER_LIFE_GE_STARTING_PLUS_7": {
        matches(state, params, context) {
            return (state.players[context.controllerId]?.life || 0) >= 27;
        }
    },
    "GRAVEYARD_COUNT_GE": {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            return (state.players[context.controllerId]?.graveyard.length || 0) >= threshold;
        }
    },
    "HAND_COUNT_GE": {
        matches(state, params, context) {
            const threshold = parseInt(params[0]);
            return (state.players[context.controllerId]?.hand.length || 0) >= threshold;
        }
    },
    "GRAVEYARD_CREATURE_COUNT_GE": {
        matches(state, params, context) {
            const threshold = parseInt(params[0] || "0");
            return (state.players[context.controllerId]?.graveyard.filter(c => 
                (c.definition.types || []).some(t => t.toLowerCase() === "creature")
            ).length || 0) >= threshold;
        }
    },
    "GRAVEYARD_CREATURE_COUNT_GE_3": {
        matches(state, params, context) {
            const creatures = state.players[context.controllerId].graveyard.filter(c =>
                c.definition.types.some(t => t.toLowerCase() === "creature")
            );
            return creatures.length >= 3;
        }
    },
    "HAS_INSTANT_AND_SORCERY_IN_GY": {
        matches(state, params, context) {
            const gy = state.players[context.controllerId]?.graveyard || [];
            const hasInstant = gy.some(c => c.definition.types?.some(t => t.toLowerCase() === "instant"));
            const hasSorcery = gy.some(c => c.definition.types?.some(t => t.toLowerCase() === "sorcery"));
            return hasInstant && hasSorcery;
        }
    },
    "OPPONENT_HAS_MORE_CARDS": {
        matches(state, params, context) {
            const player = state.players[context.controllerId];
            if (!player) return false;
            return Object.values(state.players).some(p => p.id !== context.controllerId && p.hand.length > player.hand.length);
        }
    },
    "OPPONENT_CONTROLS_MORE_CREATURES": {
        matches(state, params, context) {
            const myCreatures = state.battlefield.filter(o => 
                o.controllerId === context.controllerId && 
                o.definition.types.some(t => t.toLowerCase() === "creature")
            ).length;
            const opponentId = Object.keys(state.players).find(id => id !== context.controllerId);
            if (!opponentId) return false;
            const oppCreatures = state.battlefield.filter(o => 
                o.controllerId === opponentId && 
                o.definition.types.some(t => t.toLowerCase() === "creature")
            ).length;
            return oppCreatures > myCreatures;
        }
    },
    "TOP_CARD_IS_GOBLIN": {
        matches(state, params, context) {
            const player = state.players[context.controllerId];
            if (!player || player.library.length === 0) return false;
            const topCard = player.library[player.library.length - 1];
            return topCard.definition.subtypes?.some((s: string) => s.toLowerCase() === "goblin") || false;
        }
    }
};
