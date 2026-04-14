import { CardDefinition } from '@shared/engine_types';

export const MaelstromArtisanRocketVolley: CardDefinition = {
    "name": "Maelstrom Artisan // Rocket Volley",
    "manaCost": "{1}{R}{R} // {1}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Minotaur",
        "Sorcerer"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "3",
    "toughness": "2",
    "faces": [
        {
            "name": "Maelstrom Artisan",
            "manaCost": "{1}{R}{R}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Minotaur",
                "Sorcerer"
            ],
            "oracleText": "Haste\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "2"
        },
        {
            "name": "Rocket Volley",
            "manaCost": "{1}{R}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Destroy target nonbasic land."
        }
    ]
};
