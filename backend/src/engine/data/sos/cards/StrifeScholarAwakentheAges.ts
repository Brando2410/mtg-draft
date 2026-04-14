import { CardDefinition } from '@shared/engine_types';

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
    "oracleText": "",
    "abilities": [],
    "power": "3",
    "toughness": "2",
    "faces": [
        {
            "name": "Strife Scholar",
            "manaCost": "{2}{R}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Orc",
                "Sorcerer"
            ],
            "oracleText": "Ward—Pay 2 life.\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "2"
        },
        {
            "name": "Awaken the Ages",
            "manaCost": "{5}{R}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Create two 2/2 red and white Spirit creature tokens."
        }
    ]
};
