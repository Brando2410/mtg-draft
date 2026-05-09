import { ITargetMappingHandler, TargetMappingContext } from "../TargetMappingRegistry";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { PlayerId, TargetMapping } from "@shared/engine_types";

/**
 * Handles Indexed Targets (TARGET_1 through TARGET_8)
 */
export class IndexedTargetHandler implements ITargetMappingHandler {
    resolve(ctx: TargetMappingContext): string[] {
        const { state, mapping, context, targetOffset = 0 } = ctx;
        const resolvedTargets = context.targets || [];
        
        const mStr = mapping.toUpperCase();
        if (mStr.startsWith("TARGET_")) {
            const index = parseInt(mStr.substring(7)) - 1;
            const finalIndex = index + targetOffset;
            return resolvedTargets[finalIndex] ? [resolvedTargets[finalIndex]] : [];
        }

        switch (mStr) {
            case TargetMapping.Target1Owner: {
                const targetId = resolvedTargets[0];
                const obj = RuleUtils.findObject(state, targetId);
                return obj ? [obj.ownerId] : [];
            }

            case TargetMapping.SelfAndTarget1: {
                const offset = targetOffset;
                return resolvedTargets[offset] ? [context.sourceId, resolvedTargets[offset]] : [context.sourceId];
            }

            case TargetMapping.TargetAll:
                return resolvedTargets.filter(Boolean);

            case TargetMapping.Target1Controller: {
                const targetId = resolvedTargets[0];
                const { stackObject } = context;
                if (stackObject?.targetsControllers?.[0]) {
                    return [stackObject.targetsControllers[0]];
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
