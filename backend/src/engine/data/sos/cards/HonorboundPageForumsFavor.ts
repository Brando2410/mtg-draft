import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const HonorboundPageForumsFavor: CardDefinition = {
    "name": "Honorbound Page // Forum's Favor",
    "manaCost": "{3}{W} // {W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": ["Cat", "Cleric"],
    "keywords": ["First strike"],
    "oracleText": "First strike\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    "abilities": [],
    "power": "3",
    "toughness": "3",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Honorbound Page",
            "manaCost": "{3}{W}",
            "colors": ["W"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Cat",
                "Cleric"
            ],
            "keywords": ["First strike"],
            "oracleText": "First strike\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [],
            "power": "3",
            "toughness": "3",
            "entersPrepared": true
        },
        {
            "name": "Forum's Favor",
            "manaCost": "{W}",
            "colors": ["W"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Target creature gets +1/+0 and gains flying until end of turn.",
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
                            powerModifier: 1,
                            toughnessModifier: 0,
                            abilitiesToAdd: ["Flying"],
                            duration: 'UntilEndOfTurn',
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};
