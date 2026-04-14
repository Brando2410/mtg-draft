import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const EncouragingAviatorJump: CardDefinition = {
    "name": "Encouraging Aviator // Jump",
    "manaCost": "{2}{U} // {U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Bird",
        "Wizard"
    ],
    "oracleText": "Flying; Attack: Prepare // Target creature gains flying until end of turn.",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "faces": [
        {
            "name": "Encouraging Aviator",
            "manaCost": "{2}{U}",
            "colors": ["U"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Bird",
                "Wizard"
            ],
            "oracleText": "Flying\nWhenever this creature attacks, it becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "3",
            "keywords": ["Flying"],
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                    effects: [
                        {
                            type: EffectType.Prepare,
                            targetMapping: TargetMapping.Self
                        }
                    ]
                }
            ]
        },
        {
            "name": "Jump",
            "manaCost": "{U}",
            "colors": ["U"],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Target creature gains flying until end of turn.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: 'Creature',
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            targetMapping: TargetMapping.Target1,
                            duration: 'UNTIL_END_OF_TURN',
                            abilitiesToAdd: ['Flying']
                        }
                    ]
                }
            ]
        }
    ]
};


