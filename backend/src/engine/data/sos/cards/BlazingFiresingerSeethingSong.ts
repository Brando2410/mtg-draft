import { CardDefinition } from '@shared/engine_types';

export const BlazingFiresingerSeethingSong: CardDefinition = {
    "name": "Blazing Firesinger // Seething Song",
    "manaCost": "{2}{R} // {2}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Dwarf",
        "Bard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "faces": [
        {
            "name": "Blazing Firesinger",
            "manaCost": "{2}{R}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Dwarf",
                "Bard"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "3"
        },
        {
            "name": "Seething Song",
            "manaCost": "{2}{R}",
            "colors": [],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Add {R}{R}{R}{R}{R}."
        }
    ]
};
