import { CardDefinition } from '@shared/engine_types';

export const FractalMascot: CardDefinition = {
    "name": "Fractal Mascot",
    "manaCost": "{4}{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Fractal",
        "Elk"
    ],
    "oracleText": "Trample\nWhen this creature enters, tap target creature an opponent controls. Put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
    "abilities": [],
    "power": "6",
    "toughness": "6"
};
