import { IEffectHandler } from "../../IEffectHandler";
import { PlayerId } from "@shared/engine_types";

export const ManaHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { ManaProcessor } = require("../../../magic/ManaProcessor");
        const { controllerId } = context;
        const player = state.players[controllerId as PlayerId];
        if (!player) return;

        if (effect.type === "AddMana") {
            const amount = (effect as any).value || "";
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
        const requirements = ManaProcessor.parseManaCost(
          value.startsWith("{") ? value : `{${value}}`,
        );
        player.manaPool.W = Math.max(0, player.manaPool.W - (requirements.colored.W || 0));
        player.manaPool.U = Math.max(0, player.manaPool.U - (requirements.colored.U || 0));
        player.manaPool.B = Math.max(0, player.manaPool.B - (requirements.colored.B || 0));
        player.manaPool.R = Math.max(0, player.manaPool.R - (requirements.colored.R || 0));
        player.manaPool.G = Math.max(0, player.manaPool.G - (requirements.colored.G || 0));
        player.manaPool.C = Math.max(0, player.manaPool.C - (requirements.colored.C || 0));

        let generic = requirements.generic;
        const colors: ("W" | "U" | "B" | "R" | "G" | "C")[] = ["C", "W", "U", "B", "R", "G"];
        for (const c of colors) {
          const toSub = Math.min(player.manaPool[c], generic);
          player.manaPool[c] -= toSub;
          generic -= toSub;
        }
        log(`[PAID/LOST] ${player.name} paid/lost ${value}.`);
    }
};


