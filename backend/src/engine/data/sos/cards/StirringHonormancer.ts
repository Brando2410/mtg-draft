import { CardDefinition } from '@shared/engine_types';

export const StirringHonormancer: CardDefinition = {
    "name": "Stirring Honormancer",
    "manaCost": "{2}{W}{W/B}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Rhino",
        "Bard"
    ],
    "oracleText": "When this creature enters, look at the top X cards of your library, where X is the number of creatures you control. Put one of those cards into your hand and the rest into your graveyard.",
    "abilities": [],
    "power": "4",
    "toughness": "5"
};
