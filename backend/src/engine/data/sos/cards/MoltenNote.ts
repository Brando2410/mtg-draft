import { CardDefinition } from '@shared/engine_types';

export const MoltenNote: CardDefinition = {
    "name": "Molten Note",
    "manaCost": "{X}{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Molten Note deals damage to target creature equal to the amount of mana spent to cast this spell. Untap all creatures you control.\nFlashback {6}{R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    "abilities": []
};
