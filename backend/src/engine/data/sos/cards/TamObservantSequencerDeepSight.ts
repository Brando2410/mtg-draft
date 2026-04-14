import { CardDefinition } from '@shared/engine_types';

export const TamObservantSequencerDeepSight: CardDefinition = {
    "name": "Tam, Observant Sequencer // Deep Sight",
    "manaCost": "{2}{G}{U} // {G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Gorgon",
        "Wizard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "4",
    "toughness": "3",
    "faces": [
        {
            "name": "Tam, Observant Sequencer",
            "manaCost": "{2}{G}{U}",
            "colors": [],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Gorgon",
                "Wizard"
            ],
            "oracleText": "Landfall — Whenever a land you control enters, Tam becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "4",
            "toughness": "3"
        },
        {
            "name": "Deep Sight",
            "manaCost": "{G}{U}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "You draw a card and gain 1 life."
        }
    ]
};
