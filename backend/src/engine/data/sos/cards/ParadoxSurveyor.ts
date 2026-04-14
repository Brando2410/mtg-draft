import { CardDefinition } from '@shared/engine_types';

export const ParadoxSurveyor: CardDefinition = {
    "name": "Paradox Surveyor",
    "manaCost": "{G}{G/U}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Elf",
        "Druid"
    ],
    "oracleText": "Reach\nWhen this creature enters, look at the top five cards of your library. You may reveal a land card or a card with {X} in its mana cost from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    "abilities": [],
    "power": "3",
    "toughness": "3"
};
