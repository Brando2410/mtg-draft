import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";
import { LogCategory } from "../../../../utils/EngineLogger";
import { TriggerAbilityEffect } from "@shared/engine_types";

export const CreateDelayedTriggerHandler: IEffectHandler<TriggerAbilityEffect> = {
  handle(state, effect, context) {
    const { trigger: TrP } = getProcessors(state);
    const { sourceId, controllerId, targets } = context;
    getProcessors(state).logger.debug(state, LogCategory.TRIGGER, `[DELAYED-HANDLER] context targets: ${targets?.join(', ')}`);

    // Support for capturing data from the current resolution (like MV of countered spell)
    const data = effect.data || {};
    if (effect.captureTargetMV) {
      const targetId = targets[0];
      const targetObj = RuleUtils.findObject(state, targetId);
      if (targetObj && 'paidManaValue' in targetObj && targetObj.paidManaValue !== undefined) {
        data.capturedMV = targetObj.paidManaValue;
      }
    }

    return TrP.createDelayedTrigger(
      state,
      { ...effect, data, targetIds: targets },
      sourceId,
      controllerId
    );
  }
};
