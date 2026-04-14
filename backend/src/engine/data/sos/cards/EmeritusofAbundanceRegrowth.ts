import { CardDefinition } from '@shared/engine_types';

export const EmeritusofAbundanceRegrowth: CardDefinition = {
    "name": "Emeritus of Abundance // Regrowth",
    "manaCost": "{2}{G} // {1}{G}",
    "colors": [
        "G"
    ],
    "types": [
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
            "name": "Emeritus of Abundance",
            "manaCost": "{2}{G}",
            "colors": [],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Elf",
                "Druid"
            ],
            "oracleText": "Vigilance\nThis creature enters prepared.\nWhenever this creature attacks, if you control eight or more lands, this creature becomes prepared.",
            "power": "3",
            "toughness": "4"
        },
        {
            "name": "Regrowth",
            "manaCost": "{1}{G}",
            "colors": [],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Return target card from your graveyard to your hand."
        }
    ]
};
