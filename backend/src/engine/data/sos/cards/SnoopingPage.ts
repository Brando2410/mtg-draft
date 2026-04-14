import { CardDefinition } from '@shared/engine_types';

export const SnoopingPage: CardDefinition = {
    "name": "Snooping Page",
    "manaCost": "{1}{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Cleric"
    ],
    "oracleText": "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature can't be blocked this turn.\nWhenever this creature deals combat damage to a player, you draw a card and lose 1 life.",
    "abilities": [],
    "power": "2",
    "toughness": "3"
};
