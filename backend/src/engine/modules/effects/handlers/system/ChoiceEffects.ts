import { IEffectHandler } from "../../IEffectHandler";
import { ChoiceEffectHandler as LegacyChoiceHandler } from "./ChoiceEffectHandler";
import { ChoiceGenerator } from "../../ChoiceGenerator";
import { PlayerId, ResolutionContext, Zone, ModalEffect } from "@shared/engine_types";

export const ChoiceHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        return LegacyChoiceHandler.handleChoice(state, effect as ModalEffect, log, context);
    }
};


export const LearnHandler: IEffectHandler = {
    handle(state, effect, log, context) {
        const { controllerId, sourceId, stackObject, parentContext } = context;
        const player = state.players[controllerId];
        const lessons = (player?.sideboard || []).filter((c: any) =>
          c.definition.subtypes?.some((s: string) => s.toLowerCase() === "lesson"),
        );

        const choices = [];
        if (lessons.length > 0) {
          choices.push({
            label: "Reveal Lesson",
            value: "REVEAL_LESSON",
            effects: [
              {
                type: "Choice",
                label: "Choose a Lesson to put into your hand",
                targetIdMapping: "CONTROLLER_SIDEBOARD",
                restrictions: ["Lesson"],
                effects: [
                  { type: "MoveToZone", zone: Zone.Hand, revealed: true },
                ],
              },
            ],
          });
        }

        choices.push({
          label: "Discard and Draw",
          value: "DISCARD_DRAW",
          effects: [
            {
              type: "DiscardCards",
              amount: 1,
              label: "Discard a card (Learn)",
            },
            { type: "DrawCards", amount: 1 },
          ],
        });

        choices.push({
          label: "Decline",
          value: "NONE",
          effects: [],
        });

        state.pendingAction = ChoiceGenerator.createModalChoice(
          state,
          {
            label: "Learn",
            playerId: controllerId,
            sourceId: sourceId,
            stackObj: stackObject,
            parentContext: parentContext,
          },
          choices,
        );
        return;
    }
};


