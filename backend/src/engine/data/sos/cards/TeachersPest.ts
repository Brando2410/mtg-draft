import { CardDefinition } from '@shared/engine_types';

export const TeachersPest: CardDefinition = {
    "name": "Teacher's Pest",
    "manaCost": "{B}{G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Skeleton",
        "Pest"
    ],
    "oracleText": "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever this creature attacks, you gain 1 life.\n{B}{G}: Return this card from your graveyard to the battlefield tapped.",
    "abilities": [],
    "power": "1",
    "toughness": "1"
};
