import { CardDefinition } from '@shared/engine_types';

export const JoinedResearchersSecretRendezvous: CardDefinition = {
    "name": "Joined Researchers // Secret Rendezvous",
    "manaCost": "{1}{W} // {1}{W}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Cleric",
        "Wizard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "2",
    "faces": [
        {
            "name": "Joined Researchers",
            "manaCost": "{1}{W}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Cleric",
                "Wizard"
            ],
            "oracleText": "First strike\nAt the beginning of each end step, if an opponent has more cards in hand than you, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "2"
        },
        {
            "name": "Secret Rendezvous",
            "manaCost": "{1}{W}{W}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "You and target opponent each draw three cards."
        }
    ]
};
