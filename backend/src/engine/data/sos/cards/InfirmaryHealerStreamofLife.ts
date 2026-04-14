import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const InfirmaryHealerStreamofLife: CardDefinition = {
    "name": "Infirmary Healer // Stream of Life",
    "manaCost": "{1}{G} // {X}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Cat",
        "Cleric"
    ],
    "oracleText": "This creature enters prepared.\n//\nTarget player gains X life.",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Infirmary Healer",
            "manaCost": "{1}{G}",
            "colors": ["G"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Cat",
                "Cleric"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [],
            "power": "2",
            "toughness": "3",
            "entersPrepared": true
        },
        {
            "name": "Stream of Life",
            "manaCost": "{X}{G}",
            "colors": ["G"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Target player gains X life.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: TargetType.Player,
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.GainLife,
                            amount: DynamicAmount.X,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};


