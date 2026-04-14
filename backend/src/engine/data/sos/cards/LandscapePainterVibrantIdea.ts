import { CardDefinition } from '@shared/engine_types';

export const LandscapePainterVibrantIdea: CardDefinition = {
    "name": "Landscape Painter // Vibrant Idea",
    "manaCost": "{1}{U} // {4}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Merfolk",
        "Wizard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "1",
    "faces": [
        {
            "name": "Landscape Painter",
            "manaCost": "{1}{U}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Merfolk",
                "Wizard"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "1"
        },
        {
            "name": "Vibrant Idea",
            "manaCost": "{4}{U}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Draw two cards."
        }
    ]
};
