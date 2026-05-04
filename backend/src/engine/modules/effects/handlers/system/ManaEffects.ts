import { AddManaEffect, EffectType, PlayerId } from "@shared/engine_types";
import { getProcessors } from "../../../ProcessorRegistry";
import { ChoiceGenerator } from "../../ChoiceGenerator";
import { IEffectHandler } from "../../IEffectHandler";
import { LogCategory } from "../../../../utils/EngineLogger";

export const ManaHandler: IEffectHandler = {
  handle(state, effect, context) {
    const { logger, mana: MP } = getProcessors(state);
    const { controllerId } = context;
    const player = state.players[controllerId as PlayerId];
    if (!player) return;

    if (effect.type === EffectType.AddMana || effect.type === EffectType.AddManaChoice) {
      const manaEffect = effect as AddManaEffect;
      const amount = manaEffect.value || manaEffect.manaType || "";
      if (amount.toUpperCase().includes('ANY')) {
        state.pendingAction = ChoiceGenerator.createModalChoice(
          state,
          {
            label: "Choose a color to add",
            playerId: controllerId as PlayerId,
            sourceId: context.sourceId || "",
            stackObj: context.stackObject
          },
          [
            { label: "{W}", value: "W", effects: [{ type: EffectType.AddMana, value: "{W}" } as AddManaEffect] },
            { label: "{U}", value: "U", effects: [{ type: EffectType.AddMana, value: "{U}" } as AddManaEffect] },
            { label: "{B}", value: "B", effects: [{ type: EffectType.AddMana, value: "{B}" } as AddManaEffect] },
            { label: "{R}", value: "R", effects: [{ type: EffectType.AddMana, value: "{R}" } as AddManaEffect] },
            { label: "{G}", value: "G", effects: [{ type: EffectType.AddMana, value: "{G}" } as AddManaEffect] }
          ]
        );
        return;
      }
      const added = MP.parseManaCost(amount.startsWith("{") ? amount : `{${amount}}`);
      player.manaPool.W += added.colored.W || 0;
      player.manaPool.U += added.colored.U || 0;
      player.manaPool.B += added.colored.B || 0;
      player.manaPool.R += added.colored.R || 0;
      player.manaPool.G += added.colored.G || 0;
      player.manaPool.C += added.colored.C || 0;
      logger.info(state, LogCategory.ACTION, `[MANA] ${player.name} added ${amount}.`);
      return;
    }

    const value = (effect as any).value || "{0}";
    MP.deductManaCost(player, value.startsWith("{") ? value : `{${value}}`, state);
    logger.info(state, LogCategory.ACTION, `[PAID] ${player.name} paid ${value}.`);
  }
};
