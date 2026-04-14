import { CardDefinition } from '@shared/engine_types';

export const EmeritusofIdeationAncestralRecall: CardDefinition = {
    "name": "Emeritus of Ideation // Ancestral Recall",
    "manaCost": "{3}{U}{U} // {U}",
    "colors": [
        "U"
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
    "power": "5",
    "toughness": "5",
    "faces": [
        {
            "name": "Emeritus of Ideation",
            "manaCost": "{3}{U}{U}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Wizard"
            ],
            "oracleText": "Flying, ward {2}\nThis creature enters prepared.\nWhenever this creature attacks, you may exile eight cards from your graveyard. If you do, this creature becomes prepared.",
            "power": "5",
            "toughness": "5"
        },
        {
            "name": "Ancestral Recall",
            "manaCost": "{U}",
            "colors": [],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Target player draws three cards."
        }
    ]
};
