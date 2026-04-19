import { IEffectHandler } from "../../IEffectHandler";
import { ControlEffectHandler as LegacyHandler } from "./ControlEffectHandler";
import { PlayerId } from "@shared/engine_types";

export const ControlEffectsHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { ChoiceEffectHandler } = require("../system/ChoiceEffectHandler");
        const { validTargetIds, controllerId } = context as any;
        
        if ((effect as any).choices) {
          const searchingPlayerId =
            ((validTargetIds || []).find(
              (tid: string) => state.players[tid as PlayerId],
            ) as PlayerId) || controllerId;
            
          return ChoiceEffectHandler.handleChoice(
            state,
            effect,
            log,
            { ...context, targets: validTargetIds, controllerId: searchingPlayerId }
          );
        }
        
        return LegacyHandler.handle(state, effect, log, {
            ...context,
            targets: validTargetIds
        });
    }
};


