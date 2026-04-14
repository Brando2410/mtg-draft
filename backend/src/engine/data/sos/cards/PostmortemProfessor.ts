import { CardDefinition } from '@shared/engine_types';

export const PostmortemProfessor: CardDefinition = {
    "name": "Postmortem Professor",
    "manaCost": "{1}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Zombie",
        "Warlock"
    ],
    "oracleText": "This creature can't block.\nWhenever this creature attacks, each opponent loses 1 life and you gain 1 life.\n{1}{B}, Exile an instant or sorcery card from your graveyard: Return this card from your graveyard to the battlefield.",
    "abilities": [],
    "power": "2",
    "toughness": "2"
};
