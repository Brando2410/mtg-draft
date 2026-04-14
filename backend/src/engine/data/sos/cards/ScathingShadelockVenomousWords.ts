import { CardDefinition } from '@shared/engine_types';

export const ScathingShadelockVenomousWords: CardDefinition = {
    "name": "Scathing Shadelock // Venomous Words",
    "manaCost": "{4}{B} // {B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Snake",
        "Warlock"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "4",
    "toughness": "6",
    "faces": [
        {
            "name": "Scathing Shadelock",
            "manaCost": "{4}{B}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Snake",
                "Warlock"
            ],
            "oracleText": "At the beginning of your first main phase, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "4",
            "toughness": "6"
        },
        {
            "name": "Venomous Words",
            "manaCost": "{B}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Target creature you control gets +2/+0 and gains deathtouch until end of turn."
        }
    ]
};
