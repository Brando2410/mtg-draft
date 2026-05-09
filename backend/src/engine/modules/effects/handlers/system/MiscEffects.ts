import { ActionType, PlayerId, Zone, PendingActionEffect, EffectType } from "@shared/engine_types";
import { LogCategory } from "../../../../utils/EngineLogger";
import { getProcessors } from "../../../ProcessorRegistry";
import { ChoiceGenerator } from "../../ChoiceGenerator";
import { IEffectHandler } from "../../IEffectHandler";
import { PermanentHandler } from "../permanent/PermanentHandler";

export const ExchangeHandAndGraveyardHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { logger, action: AP } = getProcessors(state);
        const { targets } = context;
        const targetPlayerId = targets[0] as PlayerId;
        const player = state.players[targetPlayerId];
        if (!player) return;

        const oldHand = [...player.hand];
        const oldGrave = [...player.graveyard];

        player.hand = [];
        player.graveyard = [];

        oldHand.forEach((c) =>
            AP.moveCard(state, c, Zone.Graveyard, player.id),
        );
        oldGrave.forEach((c) =>
            AP.moveCard(state, c, Zone.Hand, player.id),
        );
        logger.info(state, LogCategory.ACTION, `[EXCHANGE] ${player.name} exchanged hand and graveyard.`);
    }
};

export const DisableDamagePreventionHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { logger } = getProcessors(state);
        state.turnState.damagePreventionDisabled = true;
        logger.info(state, LogCategory.ACTION, `[SYSTEM] Damage can't be prevented this turn.`);
    }
};

export const PendingActionHandler: IEffectHandler<PendingActionEffect> = {
    handle(state, effect, context) {
        state.pendingAction = effect.action;
    }
};

export const NecromentiaHandler: IEffectHandler = {
    handle(state, effect, context) {
        const { sourceId, controllerId, targets, stackObject } = context;
        const targetOpponentId = targets[0] as PlayerId;
        const targetOpponent = state.players[targetOpponentId];
        if (!targetOpponent) return;

        const { logger, action: AP, trigger: TrP } = getProcessors(state);
        const chosenName = stackObject?.chosenName;

        if (!chosenName) {
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
                    onSelected: (c) => {
                        if (stackObject) {
                            stackObject.chosenName = c.definition.name;
                        }
                        return [{ type: "Necromentia", targetMapping: "TARGET_1" }];
                    },
                    stackObj: stackObject,
                    parentContext: context,
                },
            );
            return;
        }

        if (!chosenName) return;

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
                (c) => c.definition.name.toLowerCase() === chosenName.toLowerCase(),
            );
            if (zone === Zone.Hand) exiledCount = toExile.length;

            toExile.forEach((c) => {
                const from = c.zone as Zone;
                AP.moveCard(state, c, Zone.Exile, c.ownerId);
                TrP.onEvent(
                    state,
                    {
                        type: "ON_EXILE",
                        payload: {
                            sourceId,
                            targetIds: [c.id],
                            sourceZone: from
                        }
                    }
                );
            });
        });

        if (exiledCount > 0) {
            PermanentHandler.handleCreateToken(
                state,
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: "Zombie",
                        power: "2",
                        toughness: "2",
                        colors: ["B"],
                        types: ["Creature"],
                        subtypes: ["Zombie"],
                        image_url: "https://cards.scryfall.io/large/front/d/e/ded254ec-1d94-4458-944c-329a4305ee4c.jpg",
                    },
                    amount: exiledCount
                },
                { ...context, targets: [targetOpponentId] }
            );
        }
    }
};


