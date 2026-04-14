import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const QuillBladeLaureateTwofoldIntent: CardDefinition = {
    "name": "Quill-Blade Laureate // Twofold Intent",
    "manaCost": "{1}{W} // {1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Cleric"
    ],
    "oracleText": "Double strike\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    "power": "1",
    "toughness": "1",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Quill-Blade Laureate",
            "manaCost": "{1}{W}",
            "colors": ["W"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Cleric"
            ],
            "oracleText": "Double strike\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "1",
            "toughness": "1",
            "keywords": ["Double strike"],
            "abilities": []
        },
        {
            "name": "Twofold Intent",
            "manaCost": "{1}{W}",
            "colors": ["W"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Target creature gets +1/+0 and gains double strike until end of turn.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: TargetType.Creature,
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            powerModifier: 1,
                            toughnessModifier: 0,
                            abilitiesToAdd: ["Double strike"],
                            duration: { type: DurationType.UntilEndOfTurn },
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};


