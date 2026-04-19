import { AbilityType, CardDefinition, EffectType, Zone } from "@shared/engine_types";

export const GloomSower: CardDefinition = {
        name: "Gloom Sower",
        manaCost: "{5}{B}{B}",
    scryfall_id: "a1b4f7ec-ea2e-4d90-98cd-0c92bd9f64c1",
    image_url: "https://cards.scryfall.io/normal/front/a/1/a1b4f7ec-ea2e-4d90-98cd-0c92bd9f64c1.jpg?1594736141",
        oracleText: "Whenever this creature becomes blocked by a creature, that creature's controller loses 2 life and you gain 2 life.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Horror"],
        power: "8",
        toughness: "6",
        keywords: [],
        abilities: [
            {
                id: "gloom_sower_blocked_trigger",
                type: AbilityType.Triggered,
                    eventMatch: "ON_BECAME_BLOCKED",
                activeZone: Zone.Battlefield,
                condition: (state: any, event: any, source: any) => event.sourceId === source.sourceId,
                effects: [
                    {
                        type: EffectType.LoseLife,
                        amount: 2,
                        targetMapping: "TRIGGER_TARGET_CONTROLLER"
                    },
                    {
                        type: EffectType.GainLife,
                        amount: 2,
                        targetMapping: "CONTROLLER"
                    }
                ],
                oracleText: "Whenever Gloom Sower becomes blocked by a creature, that creature's controller loses 2 life and you gain 2 life."
            }
        ]
    };



