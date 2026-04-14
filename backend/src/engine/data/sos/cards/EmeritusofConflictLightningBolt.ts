import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const EmeritusofConflictLightningBolt: CardDefinition = {
    "name": "Emeritus of Conflict // Lightning Bolt",
    "manaCost": "{1}{R} // {R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "First strike; Prepare on 3rd spell cast // deals 3 damage to any target.",
    "abilities": [],
    "power": "2",
    "toughness": "2",
    "faces": [
        {
            "name": "Emeritus of Conflict",
            "manaCost": "{1}{R}",
            "colors": ["R"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Wizard"
            ],
            "oracleText": "First strike\nWhenever you cast your third spell each turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "2",
            "keywords": ["First strike"],
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.ThirdSpellCast,
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
            "name": "Lightning Bolt",
            "manaCost": "{R}",
            "colors": ["R"],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Lightning Bolt deals 3 damage to any target.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: 'AnyTarget',
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.DealDamage,
                            amount: 3,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};


