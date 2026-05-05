import { ITargetMappingHandler, TargetMappingContext } from "../TargetMappingRegistry";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { TargetMapping } from "@shared/engine_types";

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
            
            case TargetMapping.Opponent: {
                const opponentId = RuleUtils.getOpponentId(state, controllerId);
                return opponentId ? [opponentId] : [];
            }
            
            case TargetMapping.TargetOpponent:
            case TargetMapping.TargetPlayer: {
                // Usually target1 if it's a player
                const targetId = context.targets?.[0];
                if (targetId && RuleUtils.isPlayer(RuleUtils.findObject(state, targetId))) return [targetId];
                return [];
            }

            case TargetMapping.ControllerHand:
                return state.players[controllerId]?.hand.map(o => o.id) || [];
            
            case TargetMapping.ControllerGraveyard:
                return state.players[controllerId]?.graveyard.map(o => o.id) || [];
            
            case TargetMapping.OpponentHand: {
                const opponentId = RuleUtils.getOpponentId(state, controllerId);
                return opponentId ? state.players[opponentId].hand.map(o => o.id) : [];
            }

            default:
                return [];
        }
    }
}
