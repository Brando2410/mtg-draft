import { CardDefinition } from '@shared/engine_types';

export const StudiousFirstYearRampantGrowth: CardDefinition = {
    "name": "Studious First-Year // Rampant Growth",
    "manaCost": "{G} // {1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Bear",
        "Wizard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "1",
    "toughness": "1",
    "faces": [
        {
            "name": "Studious First-Year",
            "manaCost": "{G}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Bear",
                "Wizard"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "1",
            "toughness": "1"
        },
        {
            "name": "Rampant Growth",
            "manaCost": "{1}{G}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle."
        }
    ]
};
