import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";
import { LogCategory } from "../../../../utils/EngineLogger";

export const CreateDelayedTriggerHandler: IEffectHandler = {
  handle(state, effect, context) {
    const { trigger: TrP } = getProcessors(state);
    const { sourceId, controllerId, targets } = context;
    getProcessors(state).logger.debug(state, LogCategory.TRIGGER, `[DELAYED-HANDLER] context targets: ${targets?.join(', ')}`);

    // Support for capturing data from the current resolution (like MV of countered spell)
    const data = (effect as any).data || {};
    if ((effect as any).captureTargetMV) {
      const targetId = targets[0];
      const targetObj = RuleUtils.findObject(state, targetId);
      if (targetObj && 'paidManaValue' in targetObj) {
        data.capturedMV = (targetObj as any).paidManaValue || 0;
      }
    }

    return TrP.createDelayedTrigger(
      state,
      { ...effect, data, targets },
      sourceId,
      controllerId
    );
  }
};


