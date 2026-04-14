import { CardDefinition } from '@shared/engine_types';

export const EncouragingAviatorJump: CardDefinition = {
    "name": "Encouraging Aviator // Jump",
    "manaCost": "{2}{U} // {U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Bird",
        "Wizard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "faces": [
        {
            "name": "Encouraging Aviator",
            "manaCost": "{2}{U}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Bird",
                "Wizard"
            ],
            "oracleText": "Flying\nWhenever this creature attacks, it becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "3"
        },
        {
            "name": "Jump",
            "manaCost": "{U}",
            "colors": [],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Target creature gains flying until end of turn."
        }
    ]
};
