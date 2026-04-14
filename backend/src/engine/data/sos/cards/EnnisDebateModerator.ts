import { CardDefinition } from '@shared/engine_types';

export const EnnisDebateModerator: CardDefinition = {
    "name": "Ennis, Debate Moderator",
    "manaCost": "{1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Cleric"
    ],
    "oracleText": "When Ennis enters, exile up to one other target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.\nAt the beginning of your end step, if one or more cards were put into exile this turn, put a +1/+1 counter on Ennis.",
    "abilities": [],
    "power": "1",
    "toughness": "1"
};
