import { CardDefinition } from '@shared/engine_types';

export const GoblinGlasswrightCraftwithPride: CardDefinition = {
    "name": "Goblin Glasswright // Craft with Pride",
    "manaCost": "{1}{R} // {R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Goblin",
        "Sorcerer"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "2",
    "faces": [
        {
            "name": "Goblin Glasswright",
            "manaCost": "{1}{R}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Goblin",
                "Sorcerer"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "2"
        },
        {
            "name": "Craft with Pride",
            "manaCost": "{R}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")"
        }
    ]
};
