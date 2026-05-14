import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { IEffectHandler } from "../../IEffectHandler";
import { LogCategory } from "../../../../utils/EngineLogger";
import { TriggerAbilityEffect, Zone } from "@shared/engine_types";

export const CreateDelayedTriggerHandler: IEffectHandler<TriggerAbilityEffect> = {
  handle(state, effect, context) {
    const { trigger: TrP } = getProcessors(state);
    const { sourceId, controllerId, targets } = context;

    // Support for capturing data from the current resolution (like MV of countered spell)
    if (effect.captureTargetMV) {
      const targetId = targets[0];
      let targetObj = RuleUtils.findObject(state, targetId);

      // Fallback to LKI if the object is no longer on the stack (e.g. it was just countered/resolved)
      if (!targetObj || !('paidManaValue' in targetObj)) {
        const lki = getProcessors(state).lki.getLki(state, targetId, Zone.Stack);
        if (lki) {
          targetObj = lki;
          getProcessors(state).logger.debug(state, LogCategory.TRIGGER, `[DELAYED-HANDLER] Using LKI for ${targetId}`);
        }
      }

      // Use an IIFE for clean, type-safe lookup
      const mv = ((): number | undefined => {
        if (!targetObj) return undefined;
        // Check for paidManaValue on the object itself (StackObject)
        if ('paidManaValue' in targetObj && targetObj.paidManaValue !== undefined) return targetObj.paidManaValue;
        // Fallback to sourceObject (GameObject)
        if ('sourceObject' in targetObj && targetObj.sourceObject?.paidManaValue !== undefined) return targetObj.sourceObject.paidManaValue;
        return undefined;
      })();

      if (mv !== undefined) {
        effect.capturedMV = mv;
      }
    }


    return TrP.createDelayedTrigger(
      state,
      { ...effect, condition: effect.triggerCondition || effect.condition, targetIds: targets },
      sourceId,
      controllerId
    );
  }
};
