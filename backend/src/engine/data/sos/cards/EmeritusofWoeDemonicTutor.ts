import { CardDefinition } from '@shared/engine_types';

export const EmeritusofWoeDemonicTutor: CardDefinition = {
    "name": "Emeritus of Woe // Demonic Tutor",
    "manaCost": "{3}{B} // {1}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Vampire",
        "Warlock"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "5",
    "toughness": "4",
    "faces": [
        {
            "name": "Emeritus of Woe",
            "manaCost": "{3}{B}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Vampire",
                "Warlock"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\nAt the beginning of your end step, if two or more creatures died this turn, this creature becomes prepared.",
            "power": "5",
            "toughness": "4"
        },
        {
            "name": "Demonic Tutor",
            "manaCost": "{1}{B}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Search your library for a card, put that card into your hand, then shuffle."
        }
    ]
};
