import { CardDefinition } from '@shared/engine_types';

export const GraveResearcherReanimate: CardDefinition = {
    "name": "Grave Researcher // Reanimate",
    "manaCost": "{2}{B} // {B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Troll",
        "Warlock"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "3",
    "toughness": "3",
    "faces": [
        {
            "name": "Grave Researcher",
            "manaCost": "{2}{B}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Troll",
                "Warlock"
            ],
            "oracleText": "At the beginning of your upkeep, surveil 1. Then if there are three or more creature cards in your graveyard, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "3"
        },
        {
            "name": "Reanimate",
            "manaCost": "{B}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Put target creature card from a graveyard onto the battlefield under your control. You lose life equal to that card's mana value."
        }
    ]
};
