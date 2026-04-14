import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const StrifeScholarAwakentheAges: CardDefinition = {
    "name": "Strife Scholar // Awaken the Ages",
    "manaCost": "{2}{R} // {5}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Orc",
        "Sorcerer"
    ],
    "oracleText": "Ward—Pay 2 life. This creature enters prepared.\nAwaken the Ages: Create two 2/2 red and white Spirit creature tokens.",
    "keywords": ["Ward", "Prepared"],
    "entersPrepared": true,
    "abilities": [],
    "power": "3",
    "toughness": "2",
    "faces": [
        {
            "name": "Strife Scholar",
            "manaCost": "{2}{R}",
            "colors": ["R"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Orc",
                "Sorcerer"
            ],
            "oracleText": "Ward—Pay 2 life.\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "2",
            "entersPrepared": true,
            "keywords": ["Ward-Pay 2 life", "Prepared"],
            "abilities": [
            ],
        },
        {
            "name": "Awaken the Ages",
            "manaCost": "{5}{R}",
            "colors": ["R"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Create two 2/2 red and white Spirit creature tokens.",
            "abilities": [{
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        amount: 2,
                        tokenBlueprint: {
                            name: "Spirit",
                            colors: ["R", "W"],
                            types: ["Creature"],
                            subtypes: ["Spirit"],
                            power: "2",
                            toughness: "2"
                        },
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }]
        }
    ]
};



