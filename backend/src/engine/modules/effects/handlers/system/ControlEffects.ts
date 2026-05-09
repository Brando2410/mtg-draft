import { PlayerId, EffectType, ModalEffect } from "@shared/engine_types";
import { IEffectHandler } from "../../IEffectHandler";
import { ChoiceEffectHandler } from "../system/ChoiceEffectHandler";
import { ControlEffectHandler as LegacyHandler } from "./ControlEffectHandler";

export const ControlEffectsHandler: IEffectHandler = {
  handle(state, effect, context) {
    const { targets, controllerId } = context;

    if (effect.type === EffectType.Choice) {
      const modal = effect as ModalEffect;
      const searchingPlayerId =
        ((targets || []).find(
          (tid: string) => state.players[tid as PlayerId],
        ) as PlayerId) || controllerId;

      return ChoiceEffectHandler.handleChoice(
        state,
        modal,
        { ...context, targets: targets, controllerId: searchingPlayerId }
      );
    }

    return LegacyHandler.handle(state, effect, context);
  }
};


