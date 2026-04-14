import { CardDefinition } from '@shared/engine_types';

export const JadziStewardofFateOraclesGift: CardDefinition = {
    "name": "Jadzi, Steward of Fate // Oracle's Gift",
    "manaCost": "{2}{U} // {X}{X}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "4",
    "faces": [
        {
            "name": "Jadzi, Steward of Fate",
            "manaCost": "{2}{U}",
            "colors": [],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Wizard"
            ],
            "oracleText": "Jadzi enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\nWhen Jadzi enters, draw two cards, then discard two cards.",
            "power": "2",
            "toughness": "4"
        },
        {
            "name": "Oracle's Gift",
            "manaCost": "{X}{X}{U}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Create X 0/0 green and blue Fractal creature tokens, then put X +1/+1 counters on each Fractal you control."
        }
    ]
};
