import { ITargetMappingHandler, TargetMappingContext } from "../TargetMappingRegistry";

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

        return [];
    }
}
