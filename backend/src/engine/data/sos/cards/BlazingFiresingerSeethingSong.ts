import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const BlazingFiresingerSeethingSong: CardDefinition = {
    "name": "Blazing Firesinger // Seething Song",
    "manaCost": "{2}{R} // {2}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature",
        "Instant"
    ],
    "subtypes": [
        "Dwarf",
        "Bard"
    ],
    "oracleText": "Blazing Firesinger (Creature): This creature enters prepared.\nSeething Song (Instant): Add {R}{R}{R}{R}{R}.",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Blazing Firesinger",
            "manaCost": "{2}{R}",
            "colors": ["R"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Dwarf",
                "Bard"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "3",
            "entersPrepared": true,
            "abilities": []
        },
        {
            "name": "Seething Song",
            "manaCost": "{2}{R}",
            "colors": ["R"],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Add {R}{R}{R}{R}{R}.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.AddMana,
                            manaType: 'R',
                            amount: 5
                        }
                    ]
                }
            ]
        }
    ]
};
