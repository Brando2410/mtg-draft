import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetType, TargetMapping, DurationType } from '@shared/engine_types';

export const SpiritcallEnthusiastScrollboost: CardDefinition = {
    "name": "Spiritcall Enthusiast // Scrollboost",
    "manaCost": "{2}{W} // {1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Cat",
        "Cleric"
    ],
    "power": "3",
    "toughness": "3",
    "faces": [
        {
            "name": "Spiritcall Enthusiast",
            "manaCost": "{2}{W}",
            "colors": ["W"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Cat",
                "Cleric"
            ],
            "oracleText": "Whenever one or more tokens you control enter, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "3",
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefieldOther,
                    condition: 'OWN_TOKEN_ENTERS',
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
            "name": "Scrollboost",
            "manaCost": "{1}{W}",
            "colors": ["W"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "One or two target creatures each get +2/+2 until end of turn.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: TargetType.Creature,
                        count: 1,
                        maxCount: 2
                    },
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            powerModifier: 2,
                            toughnessModifier: 2,
                            duration: { type: DurationType.UntilEndOfTurn },
                            targetMapping: TargetMapping.TargetAll
                        }
                    ]
                }
            ]
        }
    ]
};




