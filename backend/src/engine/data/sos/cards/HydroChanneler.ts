import { CardDefinition } from '@shared/engine_types';

export const HydroChanneler: CardDefinition = {
    "name": "Hydro-Channeler",
    "manaCost": "{1}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Merfolk",
        "Wizard"
    ],
    "oracleText": "{T}: Add {U}. Spend this mana only to cast an instant or sorcery spell.\n{1}, {T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.",
    "abilities": [],
    "power": "1",
    "toughness": "3"
};
