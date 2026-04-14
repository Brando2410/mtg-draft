import { CardDefinition } from '@shared/engine_types';

export const HonorboundPageForumsFavor: CardDefinition = {
    "name": "Honorbound Page // Forum's Favor",
    "manaCost": "{3}{W} // {W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature",
        "��",
        "Cat",
        "Cleric"
    ],
    "subtypes": [],
    "oracleText": "",
    "abilities": [],
    "power": "3",
    "toughness": "3",
    "faces": [
        {
            "name": "Honorbound Page",
            "manaCost": "{3}{W}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Cat",
                "Cleric"
            ],
            "oracleText": "First strike\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "3"
        },
        {
            "name": "Forum's Favor",
            "manaCost": "{W}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Target creature gets +1/+0 and gains flying until end of turn."
        }
    ]
};
