import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";
import { ContinuousEffectHandler as LegacyHandler } from "./ContinuousEffectHandler";

export const ContinuousEffectHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { sourceId, controllerId, targets, stackObject, parentContext } = context;
        
        if (effect.targetDefinition && targets.length === 0) {
            // This is effectively resolveInteractiveEffectSelection, but specialized for continuous effects
            const { effect: EP } = getProcessors(state);
            return (EP as any).resolveInteractiveEffectSelection(
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


