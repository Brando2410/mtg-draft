import { CardDefinition } from '@shared/engine_types';

export const PensiveProfessor: CardDefinition = {
    "name": "Pensive Professor",
    "manaCost": "{1}{U}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nWhenever one or more +1/+1 counters are put on this creature, draw a card.",
    "abilities": [],
    "power": "0",
    "toughness": "2"
};
