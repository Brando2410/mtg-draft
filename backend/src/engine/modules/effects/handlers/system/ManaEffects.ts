import { PlayerId } from "@shared/engine_types";
import { IEffectHandler } from "../../IEffectHandler";

export const ManaHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    const { ManaProcessor } = require("../../../magic/ManaProcessor");
    const { controllerId } = context;
    const player = state.players[controllerId as PlayerId];
    if (!player) return;

    if (effect.type === "AddMana") {
      const amount = (effect as any).value || (effect as any).manaType || "";
      if (amount.toUpperCase().includes('ANY')) {
        const { ChoiceGenerator } = require("../../ChoiceGenerator");
        state.pendingAction = ChoiceGenerator.createModalChoice(
          state,
          {
            label: "Choose a color to add",
            playerId: controllerId as PlayerId,
            sourceId: context.sourceId || "",
            stackObj: context.stackObject
          },
          [
            { label: "{W}", value: "W", effects: [{ type: "AddMana", manaType: "{W}" }] },
            { label: "{U}", value: "U", effects: [{ type: "AddMana", manaType: "{U}" }] },
            { label: "{B}", value: "B", effects: [{ type: "AddMana", manaType: "{B}" }] },
            { label: "{R}", value: "R", effects: [{ type: "AddMana", manaType: "{R}" }] },
            { label: "{G}", value: "G", effects: [{ type: "AddMana", manaType: "{G}" }] }
          ]
        );
        return;
      }
      const added = ManaProcessor.parseManaCost(amount.startsWith("{") ? amount : `{${amount}}`);
      player.manaPool.W += added.colored.W || 0;
      player.manaPool.U += added.colored.U || 0;
      player.manaPool.B += added.colored.B || 0;
      player.manaPool.R += added.colored.R || 0;
      player.manaPool.G += added.colored.G || 0;
      player.manaPool.C += added.colored.C || 0;
      log(`[MANA] ${player.name} added ${amount}.`);
      return;
    }

    const value = (effect as any).value || "{0}";
    ManaProcessor.deductManaCost(player, value.startsWith("{") ? value : `{${value}}`, state);
    log(`[PAID] ${player.name} paid ${value}.`);
  }
};
