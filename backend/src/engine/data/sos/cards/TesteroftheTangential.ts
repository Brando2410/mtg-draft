import { CardDefinition } from '@shared/engine_types';

export const TesteroftheTangential: CardDefinition = {
    "name": "Tester of the Tangential",
    "manaCost": "{1}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Djinn",
        "Wizard"
    ],
    "oracleText": "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nAt the beginning of combat on your turn, you may pay {X}. When you do, move X +1/+1 counters from this creature onto another target creature.",
    "abilities": [],
    "power": "1",
    "toughness": "1"
};
