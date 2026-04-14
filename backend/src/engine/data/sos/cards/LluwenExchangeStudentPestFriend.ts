import { CardDefinition } from '@shared/engine_types';

export const LluwenExchangeStudentPestFriend: CardDefinition = {
    "name": "Lluwen, Exchange Student // Pest Friend",
    "manaCost": "{2}{B}{G} // {B/G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Elf",
        "Druid"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "3",
    "toughness": "4",
    "faces": [
        {
            "name": "Lluwen, Exchange Student",
            "manaCost": "{2}{B}{G}",
            "colors": [],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Elf",
                "Druid"
            ],
            "oracleText": "Lluwen enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\nExile a creature card from your graveyard: Lluwen becomes prepared. Activate only as a sorcery.",
            "power": "3",
            "toughness": "4"
        },
        {
            "name": "Pest Friend",
            "manaCost": "{B/G}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\""
        }
    ]
};
