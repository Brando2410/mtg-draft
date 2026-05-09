import { GameState, PlayerId, TargetMapping } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { ITargetMappingHandler, TargetMappingContext } from "../TargetMappingRegistry";

/**
 * IndexedTargetHandler: Resolves mappings that depend on the specific index of
 * a previously declared target (e.g. TARGET_1, TARGET_2, TARGET_1_CONTROLLER).
 * 
 * Standardizes the derivation of players and objects from the stackObject's 
 * resolvedTargets array.
 */
export class IndexedTargetHandler implements ITargetMappingHandler {
    resolve(ctx: TargetMappingContext): string[] {
        const { state, mapping, context } = ctx;
        const resolvedTargets = context.targets || [];

        switch (mapping) {
            case TargetMapping.Target1:
                return resolvedTargets.length > 0 ? [resolvedTargets[0]] : [];

            case TargetMapping.Target2:
                return resolvedTargets.length > 1 ? [resolvedTargets[1]] : [];

            case TargetMapping.Target3:
                return resolvedTargets.length > 2 ? [resolvedTargets[2]] : [];

            case TargetMapping.Target4:
                return resolvedTargets.length > 3 ? [resolvedTargets[3]] : [];

            case TargetMapping.TargetAll:
                return resolvedTargets.filter(Boolean);

            case TargetMapping.Target1Controller: {
                const targetId = resolvedTargets[0];
                const { stackObject } = context;
                const savedController = stackObject?.targetsControllers?.[0];
                if (savedController) {
                    return [savedController];
                }
                if (state.players[targetId as PlayerId]) return [targetId];
                const obj = RuleUtils.findObject(state, targetId);
                return obj ? [RuleUtils.getController(obj)] : [];
            }

            case TargetMapping.SelectedCard:
            case TargetMapping.SelectedCards:
            case TargetMapping.AnyTarget:
                return resolvedTargets;

            default:
                return [];
        }
    }
}
