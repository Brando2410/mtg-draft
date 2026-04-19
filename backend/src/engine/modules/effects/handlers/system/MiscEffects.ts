import { IEffectHandler } from "../../IEffectHandler";
import { Zone, PlayerId } from "@shared/engine_types";

export const ExchangeHandAndGraveyardHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { ActionProcessor } = require("../../../actions/ActionProcessor");
        const { targets } = context;
        const targetPlayerId = targets[0] as PlayerId;
        const player = state.players[targetPlayerId];
        if (!player) return;
        
        const oldHand = [...player.hand];
        const oldGrave = [...player.graveyard];

        player.hand = [];
        player.graveyard = [];

        oldHand.forEach((c) =>
          ActionProcessor.moveCard(state, c, Zone.Graveyard, player.id, log),
        );
        oldGrave.forEach((c) =>
          ActionProcessor.moveCard(state, c, Zone.Hand, player.id, log),
        );
        log(`[EXCHANGE] ${player.name} exchanged hand and graveyard.`);
    }
};

export const DisableDamagePreventionHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        state.turnState.damagePreventionDisabled = true;
        log(`[SYSTEM] Damage can't be prevented this turn.`);
    }
};

export const PendingActionHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        state.pendingAction = (effect as any).action;
    }
};


