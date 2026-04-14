import { CardDefinition } from '@shared/engine_types';

export const SpellbookSeekerCarefulStudy: CardDefinition = {
    "name": "Spellbook Seeker // Careful Study",
    "manaCost": "{3}{U} // {U}",
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
    "power": "3",
    "toughness": "3",
    "faces": [
        {
            "name": "Spellbook Seeker",
            "manaCost": "{3}{U}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Bird",
                "Wizard"
            ],
            "oracleText": "Flying\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "3"
        },
        {
            "name": "Careful Study",
            "manaCost": "{U}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Draw two cards, then discard two cards."
        }
    ]
};
