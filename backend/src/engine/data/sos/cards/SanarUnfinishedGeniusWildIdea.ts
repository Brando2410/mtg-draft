import { CardDefinition } from '@shared/engine_types';

export const SanarUnfinishedGeniusWildIdea: CardDefinition = {
    "name": "Sanar, Unfinished Genius // Wild Idea",
    "manaCost": "{U}{R} // {3}{U}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Goblin",
        "Sorcerer"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "0",
    "toughness": "4",
    "faces": [
        {
            "name": "Sanar, Unfinished Genius",
            "manaCost": "{U}{R}",
            "colors": [],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Goblin",
                "Sorcerer"
            ],
            "oracleText": "Sanar enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\n{T}: Create a Treasure token. Activate only if you've cast an instant or sorcery spell this turn.",
            "power": "0",
            "toughness": "4"
        },
        {
            "name": "Wild Idea",
            "manaCost": "{3}{U}{R}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle."
        }
    ]
};
