import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType} from "@shared/engine_types";

export const KaervektheSpiteful: CardDefinition = {
        name: "Kaervek, the Spiteful",
        manaCost: "{2}{B}{B}",
        oracleText: "Other creatures get -1/-1.",
        colors: ["black"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human", "Warlock"],
        power: "3",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "kaervek_static",
                type: AbilityType.Static,
                activeZone: Zone.Battlefield,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: -1,
                    toughnessModifier: -1,
                    targetMapping: 'OTHER_CREATURES'
                }]
            }
        ]
    };

