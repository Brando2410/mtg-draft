import { CardDefinition } from '@shared/engine_types';

export const EliteInterceptorRejoinder: CardDefinition = {
    "name": "Elite Interceptor // Rejoinder",
    "manaCost": "{W} // {1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "1",
    "toughness": "2",
    "faces": [
        {
            "name": "Elite Interceptor",
            "manaCost": "{W}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Wizard"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "1",
            "toughness": "2"
        },
        {
            "name": "Rejoinder",
            "manaCost": "{1}{W}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "You may tap or untap target creature.\nDraw a card."
        }
    ]
};
