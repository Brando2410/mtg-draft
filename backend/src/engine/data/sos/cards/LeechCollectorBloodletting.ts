import { CardDefinition } from '@shared/engine_types';

export const LeechCollectorBloodletting: CardDefinition = {
    "name": "Leech Collector // Bloodletting",
    "manaCost": "{1}{B} // {B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Warlock"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "2",
    "faces": [
        {
            "name": "Leech Collector",
            "manaCost": "{1}{B}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Warlock"
            ],
            "oracleText": "Whenever you gain life for the first time each turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "2"
        },
        {
            "name": "Bloodletting",
            "manaCost": "{B}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Each opponent loses 2 life."
        }
    ]
};
