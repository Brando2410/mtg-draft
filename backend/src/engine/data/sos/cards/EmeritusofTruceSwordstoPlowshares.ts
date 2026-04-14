import { CardDefinition } from '@shared/engine_types';

export const EmeritusofTruceSwordstoPlowshares: CardDefinition = {
    "name": "Emeritus of Truce // Swords to Plowshares",
    "manaCost": "{1}{W}{W} // {W}",
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
            "name": "Emeritus of Truce",
            "manaCost": "{1}{W}{W}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Cat",
                "Cleric"
            ],
            "oracleText": "When this creature enters, target player creates a 1/1 white and black Inkling creature token with flying. Then if an opponent controls more creatures than you, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "3"
        },
        {
            "name": "Swords to Plowshares",
            "manaCost": "{W}",
            "colors": [],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Exile target creature. Its controller gains life equal to its power."
        }
    ]
};
