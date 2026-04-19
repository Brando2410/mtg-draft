import { IEffectHandler } from "../../IEffectHandler";
import { ContinuousEffectHandler as LegacyHandler } from "./ContinuousEffectHandler";

export const ContinuousEffectHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { sourceId, controllerId, targets, stackObject, parentContext } = context;
        
        if (effect.targetDefinition && targets.length === 0) {
            // This is effectively resolveInteractiveEffectSelection, but specialized for continuous effects
            // For now, we delegate back to EffectProcessor's public method if needed, or implement it here.
            // But let's check if the legacy handler can handle it if we pass context.
            const { EffectProcessor } = require("../../EffectProcessor");
            return (EffectProcessor as any).resolveInteractiveEffectSelection(
              state,
              effect,
              sourceId,
              controllerId,
              log,
              stackObject,
              parentContext,
            );
        }
        
        return LegacyHandler.handle(state, effect, log, context);
    }
};


