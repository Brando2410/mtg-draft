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
        const { state, mapping, context, targetOffset = 0 } = ctx;
        const resolvedTargets = context.originalTargets || context.targets || [];

        switch (mapping) {
            case TargetMapping.Target1:
                return resolvedTargets.length > targetOffset ? [resolvedTargets[targetOffset]] : [];

            case TargetMapping.Target2:
                return resolvedTargets.length > (targetOffset + 1) ? [resolvedTargets[targetOffset + 1]] : [];

            case TargetMapping.Target3:
                return resolvedTargets.length > (targetOffset + 2) ? [resolvedTargets[targetOffset + 2]] : [];

            case TargetMapping.Target4:
                return resolvedTargets.length > (targetOffset + 3) ? [resolvedTargets[targetOffset + 3]] : [];

            case TargetMapping.TargetAll:
                return resolvedTargets.filter(Boolean);

            case TargetMapping.Target1Controller: {
                const targetId = resolvedTargets[targetOffset];
                const { stackObject } = context;
                const savedController = stackObject?.targetsControllers?.[targetOffset];
                if (savedController) {
                    return [savedController];
                }
                if (state.players[targetId as PlayerId]) return [targetId];
                const obj = RuleUtils.findObject(state, targetId);
                return obj ? [RuleUtils.getController(obj)] : [];
            }

            case TargetMapping.Target1Owner: {
                const targetId = resolvedTargets[targetOffset];
                if (state.players[targetId as PlayerId]) return [targetId];
                const obj = RuleUtils.findObject(state, targetId);
                return obj ? [obj.ownerId] : [];
            }

            case TargetMapping.SelfAndTarget1: {
                const results = [context.sourceId];
                const t1 = resolvedTargets[targetOffset];
                if (t1) results.push(t1);
                return results;
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
