import { AbilityType, Zone, CardDefinition, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const GloomSower: CardDefinition = {
        name: "Gloom Sower",
        manaCost: "{5}{B}{B}",
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



