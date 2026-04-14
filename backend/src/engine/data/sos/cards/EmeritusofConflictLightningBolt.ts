import { CardDefinition } from '@shared/engine_types';

export const EmeritusofConflictLightningBolt: CardDefinition = {
    "name": "Emeritus of Conflict // Lightning Bolt",
    "manaCost": "{1}{R} // {R}",
    "colors": [
        "R"
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
    "power": "2",
    "toughness": "2",
    "faces": [
        {
            "name": "Emeritus of Conflict",
            "manaCost": "{1}{R}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Wizard"
            ],
            "oracleText": "First strike\nWhenever you cast your third spell each turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "2"
        },
        {
            "name": "Lightning Bolt",
            "manaCost": "{R}",
            "colors": [],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Lightning Bolt deals 3 damage to any target."
        }
    ]
};
