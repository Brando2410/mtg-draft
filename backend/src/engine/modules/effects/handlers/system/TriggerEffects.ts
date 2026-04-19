import { IEffectHandler } from "../../IEffectHandler";

export const CreateDelayedTriggerHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { TriggerProcessor } = require("../../TriggerProcessor");
        const { sourceId, controllerId, targets } = context;
        
        // Support for capturing data from the current resolution (like MV of countered spell)
        const data = (effect as any).data || {};
        if ((effect as any).captureTargetMV) {
          const { TargetingProcessor } = require("../actions/TargetingProcessor");
          const targetId = targets[0];
          const targetObj =
            TargetingProcessor.findObjectInAnyZone(state, targetId) ||
            state.stack.find((s) => s.id === targetId);
          if (targetObj) {
            data.capturedMV = targetObj.paidManaValue || 0;
          }
        }
        
        return TriggerProcessor.createDelayedTrigger(
          state,
          { ...effect, data },
          sourceId,
          controllerId,
          log,
        );
    }
};


