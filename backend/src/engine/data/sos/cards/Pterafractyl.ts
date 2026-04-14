import { CardDefinition } from '@shared/engine_types';

export const Pterafractyl: CardDefinition = {
    "name": "Pterafractyl",
    "manaCost": "{X}{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Dinosaur",
        "Fractal"
    ],
    "oracleText": "Flying\nThis creature enters with X +1/+1 counters on it.\nWhen this creature enters, you gain 2 life.",
    "abilities": [],
    "power": "1",
    "toughness": "0"
};
