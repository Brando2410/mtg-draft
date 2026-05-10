import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const GloomSower: CardDefinition = {
    name: "Gloom Sower",
    manaCost: "{5}{B}{B}",

    oracleText: "Whenever this creature becomes blocked by a creature, that creature's controller loses 2 life and you gain 2 life.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Horror"],
    power: "8",
    toughness: "6",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BecameBlocked,
            condition: ConditionType.EventObjectIsTriggerSource,
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: 2,
                    targetMapping: TargetMapping.EachOpponent //not totaly correct
                },
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "a1b4f7ec-ea2e-4d90-98cd-0c92bd9f64c1",
    image_url: "https://cards.scryfall.io/normal/front/a/1/a1b4f7ec-ea2e-4d90-98cd-0c92bd9f64c1.jpg?1594736141",
    rarity: "common"
};

