import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";

export const CreateDelayedTriggerHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { trigger: TrP, targeting: TP } = getProcessors(state);
        const { sourceId, controllerId, targets } = context;
        
        // Support for capturing data from the current resolution (like MV of countered spell)
        const data = (effect as any).data || {};
        if ((effect as any).captureTargetMV) {
          const targetId = targets[0];
          const targetObj =
            TP.findObjectInAnyZone(state, targetId) ||
            state.stack.find((s) => s.id === targetId);
          if (targetObj && 'paidManaValue' in targetObj) {
            data.capturedMV = (targetObj as any).paidManaValue || 0;
          }
        }
        
        return TrP.createDelayedTrigger(
          state,
          { ...effect, data },
          sourceId,
          controllerId,
          log,
        );
    }
};


