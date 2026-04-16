import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

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
                    tokenBlueprint: {
                        name: "Inkling",
                        colors: ["W", "B"],
                        types: ["Creature"],
                        subtypes: ["Inkling"],
                        power: "1",
                        toughness: "1",
                        keywords: ["Flying"],
                        image_url: "https://cards.scryfall.io/png/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.png?1682693898"
                    },
                    targetMapping: TargetMapping.Target1Controller
                }
            ]
        }
    ]
};



