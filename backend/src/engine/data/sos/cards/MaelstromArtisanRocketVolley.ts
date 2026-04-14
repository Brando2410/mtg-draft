import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const MaelstromArtisanRocketVolley: CardDefinition = {
    "name": "Maelstrom Artisan // Rocket Volley",
    "manaCost": "{1}{R}{R} // {1}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Minotaur",
        "Sorcerer"
    ],
    "oracleText": "Haste\nMaelstrom Artisan enters prepared.\nRocket Volley: Destroy target nonbasic land.",
    "entersPrepared": true,
    "keywords": ["Haste"],
    "abilities": [],
    "power": "3",
    "toughness": "2",
    "faces": [
        {
            "name": "Maelstrom Artisan",
            "manaCost": "{1}{R}{R}",
            "colors": ["R"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Minotaur",
                "Sorcerer"
            ],
            "oracleText": "Haste\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "keywords": ["Haste"],
            "abilities": [],
            "power": "3",
            "toughness": "2"
        },
        {
            "name": "Rocket Volley",
            "manaCost": "{1}{R}",
            "colors": ["R"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Destroy target nonbasic land.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: TargetType.Permanent,
                        count: 1,
                        restrictions: ["Land", "Nonbasic"]
                    },
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                }
            ]
        }
    ]
};


