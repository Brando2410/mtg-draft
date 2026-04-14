import { CardDefinition } from '@shared/engine_types';

export const ScoldingAdministrator: CardDefinition = {
    "name": "Scolding Administrator",
    "manaCost": "{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Dwarf",
        "Cleric"
    ],
    "oracleText": "Menace (This creature can't be blocked except by two or more creatures.)\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.\nWhen this creature dies, if it had counters on it, put those counters on up to one target creature.",
    "abilities": [],
    "power": "2",
    "toughness": "2"
};
