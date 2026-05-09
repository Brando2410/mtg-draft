import { ITargetMappingHandler, TargetMappingContext } from "../TargetMappingRegistry";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { PlayerId, TargetMapping } from "@shared/engine_types";

/**
 * Handles player-related mappings (CONTROLLER, OPPONENT, TARGET_OPPONENT, etc.)
 */
export class PlayerMappingHandler implements ITargetMappingHandler {
    resolve(ctx: TargetMappingContext): string[] {
        const { state, mapping, context } = ctx;
        const controllerId = context.controllerId || "";

        const m = mapping.toUpperCase();
        switch (m) {
            case TargetMapping.Controller:
                return [controllerId];
            case TargetMapping.Opponent:
            case TargetMapping.EachOpponent:
            case TargetMapping.Opponents:
                return Object.keys(state.players).filter((pid) => pid !== controllerId);
            
            case TargetMapping.Opponent1:
            case TargetMapping.TargetOpponent:
            case TargetMapping.TargetPlayer: {
                const targetId = context.targets?.[0];
                if (targetId && state.players[targetId as PlayerId]) return [targetId];
                const opponentId = RuleUtils.getOpponentId(state, controllerId);
                return opponentId ? [opponentId] : [];
            }

            case TargetMapping.EachPlayer:
            case TargetMapping.AllPlayers:
                return Object.keys(state.players);

            case TargetMapping.ControllerHand:
                return state.players[controllerId]?.hand.map(o => o.id) || [];
            
            case TargetMapping.ControllerGraveyard:
                return state.players[controllerId]?.graveyard.map(o => o.id) || [];
            
            case TargetMapping.ControllerGraveyardAndLibrary: {
                const pc = state.players[controllerId];
                return pc ? [...pc.graveyard.map((c) => c.id), ...pc.library.map((c) => c.id)] : [];
            }

            case TargetMapping.OpponentHand: {
                const opponentId = RuleUtils.getOpponentId(state, controllerId);
                return opponentId ? state.players[opponentId].hand.map(o => o.id) : [];
            }

            default:
                return [];
        }
    }
}
