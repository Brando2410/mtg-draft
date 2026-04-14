import { CardDefinition } from '@shared/engine_types';

export const InfirmaryHealerStreamofLife: CardDefinition = {
    "name": "Infirmary Healer // Stream of Life",
    "manaCost": "{1}{G} // {X}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Cat",
        "Cleric"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "2",
    "toughness": "3",
    "faces": [
        {
            "name": "Infirmary Healer",
            "manaCost": "{1}{G}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Cat",
                "Cleric"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "2",
            "toughness": "3"
        },
        {
            "name": "Stream of Life",
            "manaCost": "{X}{G}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Target player gains X life."
        }
    ]
};
