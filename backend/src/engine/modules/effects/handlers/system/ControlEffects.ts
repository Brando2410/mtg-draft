import { IEffectHandler } from "../../IEffectHandler";
import { ControlEffectHandler as LegacyHandler } from "./ControlEffectHandler";
import { PlayerId } from "@shared/engine_types";

export const ControlEffectsHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { ChoiceEffectHandler } = require("../system/ChoiceEffectHandler");
        const { targets, controllerId } = context;
        
        if ((effect as any).choices) {
          const searchingPlayerId =
            ((targets || []).find(
              (tid: string) => state.players[tid as PlayerId],
            ) as PlayerId) || controllerId;
            
          return ChoiceEffectHandler.handleChoice(
            state,
            effect,
            log,
            { ...context, targets: targets, controllerId: searchingPlayerId }
          );
        }
        
        return LegacyHandler.handle(state, effect, log, context);
    }
};


