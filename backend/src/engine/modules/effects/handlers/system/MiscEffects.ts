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

export const NecromentiaHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { sourceId, controllerId, targets, stackObject } = context;
        const targetOpponentId = targets[0] as PlayerId;
        const targetOpponent = state.players[targetOpponentId];
        if (!targetOpponent) return;

        const { ChoiceGenerator } = require("../../ChoiceGenerator");
        const { ActionType, Zone } = require("@shared/engine_types");

        if (!stackObject?.data?.chosenName) {
            state.pendingAction = ChoiceGenerator.createCardChoice(
                state,
                state.players[controllerId].library,
                {
                    label: "Name a nonbasic card",
                    playerId: controllerId,
                    sourceId: sourceId,
                    restrictions: ["NonbasicLand"],
                    optional: false,
                    actionType: ActionType.ResolutionChoice,
                    onSelected: (c: any) => {
                        if (stackObject?.data)
                            stackObject.data.chosenName = c.definition.name;
                        return [{ type: "Necromentia", targetMapping: "TARGET_1" }];
                    },
                    stackObj: stackObject,
                    parentContext: context,
                },
            );
            return;
        }

        const chosenName = stackObject?.data?.chosenName;
        if (!chosenName) return;
        
        const { ActionProcessor } = require("../../../actions/ActionProcessor");
        const { TriggerProcessor } = require("../../triggers/TriggerProcessor");
        
        const zones = [Zone.Graveyard, Zone.Hand, Zone.Library];
        let exiledCount = 0;

        zones.forEach((zone) => {
            let pool =
                zone === Zone.Graveyard
                    ? targetOpponent.graveyard
                    : zone === Zone.Hand
                        ? targetOpponent.hand
                        : targetOpponent.library;
            const toExile = pool.filter(
                (c: any) => c.definition.name.toLowerCase() === chosenName.toLowerCase(),
            );
            if (zone === Zone.Hand) exiledCount = toExile.length;

            toExile.forEach((c: any) => {
                const from = c.zone as Zone;
                ActionProcessor.moveCard(state, c, Zone.Exile, c.ownerId, log);
                TriggerProcessor.onEvent(
                    state,
                    { type: "ON_EXILE", targetId: c.id, sourceId, sourceZone: from },
                    log,
                );
            });
        });

        if (exiledCount > 0) {
            const { PermanentHandler } = require("../permanent/PermanentHandler");
            PermanentHandler.handleCreateToken(
                state,
                {
                    name: "Zombie",
                    power: "2",
                    toughness: "2",
                    colors: ["B"],
                    types: ["Creature"],
                    subtypes: ["Zombie"],
                    image_url: "https://cards.scryfall.io/large/front/d/e/ded254ec-1d94-4458-944c-329a4305ee4c.jpg",
                    amount: exiledCount
                } as any,
                log,
                { ...context, targets: [targetOpponentId] }
            );
        }
    }
};


