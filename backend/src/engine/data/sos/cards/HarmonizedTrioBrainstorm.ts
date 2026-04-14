import { CardDefinition } from '@shared/engine_types';

export const HarmonizedTrioBrainstorm: CardDefinition = {
    "name": "Harmonized Trio // Brainstorm",
    "manaCost": "{U} // {U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Merfolk",
        "Bard",
        "Wizard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "1",
    "toughness": "1",
    "faces": [
        {
            "name": "Harmonized Trio",
            "manaCost": "{U}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Merfolk",
                "Bard",
                "Wizard"
            ],
            "oracleText": "{T}, Tap two untapped creatures you control: This creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "1",
            "toughness": "1"
        },
        {
            "name": "Brainstorm",
            "manaCost": "{U}",
            "colors": [],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Draw three cards, then put two cards from your hand on top of your library in any order."
        }
    ]
};
