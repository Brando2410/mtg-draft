import { CardDefinition } from '@shared/engine_types';

export const PursuethePast: CardDefinition = {
    "name": "Pursue the Past",
    "manaCost": "{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "keywords": [
        "Flashback"
    ],
    "flashbackCost": "{2}{R}{W}",
    "oracleText": "You gain 2 life. You may discard a card. If you do, draw two cards.\nFlashback {2}{R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    "abilities": []
};
