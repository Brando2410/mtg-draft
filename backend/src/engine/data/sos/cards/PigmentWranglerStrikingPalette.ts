import { CardDefinition } from '@shared/engine_types';

export const PigmentWranglerStrikingPalette: CardDefinition = {
    "name": "Pigment Wrangler // Striking Palette",
    "manaCost": "{4}{R} // {R}",
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
    "power": "4",
    "toughness": "4",
    "faces": [
        {
            "name": "Pigment Wrangler",
            "manaCost": "{4}{R}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Orc",
                "Sorcerer"
            ],
            "oracleText": "Flying\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "4",
            "toughness": "4"
        },
        {
            "name": "Striking Palette",
            "manaCost": "{R}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy."
        }
    ]
};
