import { CardDefinition } from '@shared/engine_types';

export const QuillBladeLaureateTwofoldIntent: CardDefinition = {
    "name": "Quill-Blade Laureate // Twofold Intent",
    "manaCost": "{1}{W} // {1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Cleric"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "1",
    "toughness": "1",
    "faces": [
        {
            "name": "Quill-Blade Laureate",
            "manaCost": "{1}{W}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Cleric"
            ],
            "oracleText": "Double strike\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "1",
            "toughness": "1"
        },
        {
            "name": "Twofold Intent",
            "manaCost": "{1}{W}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Target creature gets +1/+0 and gains double strike until end of turn."
        }
    ]
};
