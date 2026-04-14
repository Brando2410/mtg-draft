import { CardDefinition } from '@shared/engine_types';

export const KirolHistoryBuffPackaPunch: CardDefinition = {
    "name": "Kirol, History Buff // Pack a Punch",
    "manaCost": "{R}{W} // {1}{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Vampire",
        "Cleric"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "faces": [
        {
            "name": "Kirol, History Buff",
            "manaCost": "{R}{W}",
            "colors": [],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Vampire",
                "Cleric"
            ],
            "oracleText": "Whenever one or more cards leave your graveyard, Kirol becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "3"
        },
        {
            "name": "Pack a Punch",
            "manaCost": "{1}{R}{W}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Mill a card. Put two +1/+1 counters on target creature. It gains trample until end of turn."
        }
    ]
};
