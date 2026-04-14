import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const Interjection: CardDefinition = {
    "name": "Interjection",
    "manaCost": "{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Target creature gets +2/+2 and gains first strike until end of turn.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ["Creature"]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    abilitiesToAdd: ["First Strike"],
                    duration: "UNTIL_END_OF_TURN",
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
