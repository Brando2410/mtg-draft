import { CardDefinition } from '@shared/engine_types';

export const SchemingSilvertongueSigninBlood: CardDefinition = {
    "name": "Scheming Silvertongue // Sign in Blood",
    "manaCost": "{1}{B} // {B}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Vampire",
        "Warlock"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "1",
    "toughness": "3",
    "faces": [
        {
            "name": "Scheming Silvertongue",
            "manaCost": "{1}{B}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Vampire",
                "Warlock"
            ],
            "oracleText": "Flying, lifelink\nAt the beginning of your second main phase, if you gained 2 or more life this turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "1",
            "toughness": "3"
        },
        {
            "name": "Sign in Blood",
            "manaCost": "{B}{B}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Target player draws two cards and loses 2 life."
        }
    ]
};
