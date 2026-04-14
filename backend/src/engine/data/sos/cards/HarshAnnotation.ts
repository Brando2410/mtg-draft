import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const HarshAnnotation: CardDefinition = {
    "name": "Harsh Annotation",
    "manaCost": "{1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Destroy target creature. Its controller creates a 1/1 white and black Inkling creature token with flying.",
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
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    blueprint: {
                        name: "Inkling",
                        colors: ["W", "B"],
                        types: ["Creature"],
                        subtypes: ["Inkling"],
                        power: "1",
                        toughness: "1",
                        keywords: ["Flying"]
                    },
                    targetMapping: TargetMapping.Target1Controller
                }
            ]
        }
    ]
};


