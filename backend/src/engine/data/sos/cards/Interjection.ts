import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const Interjection: CardDefinition = {
    name: "Interjection",
    manaCost: "{W}",
    scryfall_id: "0534cff6-299c-4155-b318-eb7581989e8a",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/0/5/0534cff6-299c-4155-b318-eb7581989e8a.jpg?1775937061",
    colors: [
        "W"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature gets +2/+2 and gains first strike until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    abilitiesToAdd: ["First Strike"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    
