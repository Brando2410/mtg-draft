import { CardDefinition } from '@shared/engine_types';

export const RubbleRouser: CardDefinition = {
    "name": "Rubble Rouser",
    "manaCost": "{2}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Dwarf",
        "Sorcerer"
    ],
    "oracleText": "When this creature enters, you may discard a card. If you do, draw a card.\n{T}, Exile a card from your graveyard: Add {R}. When you do, this creature deals 1 damage to each opponent.",
    "abilities": [],
    "power": "1",
    "toughness": "4"
};
