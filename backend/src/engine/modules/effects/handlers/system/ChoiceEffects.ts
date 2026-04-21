import { IEffectHandler } from "../../IEffectHandler";
import { ChoiceEffectHandler as LegacyChoiceHandler } from "./ChoiceEffectHandler";
import { ChoiceGenerator } from "../../ChoiceGenerator";
import { Zone, ModalEffect, TargetMapping, GameObject, EffectDefinition, EffectType } from "@shared/engine_types";

export const ChoiceHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    return LegacyChoiceHandler.handleChoice(state, effect as ModalEffect, log, context);
  }
};


export const LearnHandler: IEffectHandler = {
  handle(state, effect, log, context) {
    const { controllerId, sourceId, stackObject, parentContext } = context;
    const player = state.players[controllerId];
    const lessons = (player?.sideboard || []).filter((c: GameObject) =>
      c.definition.subtypes?.some((s: string) => s.toLowerCase() === "lesson"),
    );

    const choices: { label: string; value: string; effects: EffectDefinition[] }[] = [];
    if (lessons.length > 0) {
      choices.push({
        label: "Reveal Lesson",
        value: "REVEAL_LESSON",
        effects: [
          {
            type: EffectType.Choice,
            label: "Choose a Lesson to put into your hand",
            selectionPool: TargetMapping.ControllerSideboard,
            restrictions: ["Lesson"],
            effects: [
              { type: EffectType.MoveToZone, zone: Zone.Hand, revealed: true },
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
          type: EffectType.DiscardCards,
          amount: 1,
        },
        { type: EffectType.DrawCards, amount: 1 },
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


