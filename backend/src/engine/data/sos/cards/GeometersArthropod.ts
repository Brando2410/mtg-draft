import { CardDefinition } from '@shared/engine_types';

export const GeometersArthropod: CardDefinition = {
    "name": "Geometer's Arthropod",
    "manaCost": "{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Fractal",
        "Crab"
    ],
    "oracleText": "Whenever you cast a spell with {X} in its mana cost, look at the top X cards of your library. Put one of them into your hand and the rest on the bottom of your library in a random order.",
    "abilities": [],
    "power": "1",
    "toughness": "4"
};
