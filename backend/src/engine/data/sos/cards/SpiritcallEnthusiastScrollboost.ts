import { CardDefinition } from '@shared/engine_types';

export const SpiritcallEnthusiastScrollboost: CardDefinition = {
    "name": "Spiritcall Enthusiast // Scrollboost",
    "manaCost": "{2}{W} // {1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Cat",
        "Cleric"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "3",
    "toughness": "3",
    "faces": [
        {
            "name": "Spiritcall Enthusiast",
            "manaCost": "{2}{W}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Cat",
                "Cleric"
            ],
            "oracleText": "Whenever one or more tokens you control enter, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "3"
        },
        {
            "name": "Scrollboost",
            "manaCost": "{1}{W}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "One or two target creatures each get +2/+2 until end of turn."
        }
    ]
};
