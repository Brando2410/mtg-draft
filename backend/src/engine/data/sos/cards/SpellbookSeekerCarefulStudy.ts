import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const SpellbookSeekerCarefulStudy: CardDefinition = {
    "name": "Spellbook Seeker // Careful Study",
    "manaCost": "{3}{U} // {U}",
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
    "power": "3",
    "toughness": "3",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Spellbook Seeker",
            "manaCost": "{3}{U}",
            "colors": ["U"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Bird",
                "Wizard"
            ],
            "oracleText": "Flying\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "3",
            "keywords": ["Flying"],
            "abilities": []
        },
        {
            "name": "Careful Study",
            "manaCost": "{U}",
            "colors": ["U"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Draw two cards, then discard two cards.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.DrawCards,
                            amount: 2,
                            targetMapping: TargetMapping.Controller
                        },
                        {
                            type: EffectType.DiscardCards,
                            amount: 2,
                            targetMapping: TargetMapping.Controller
                        }
                    ]
                }
            ]
        }
    ]
};


