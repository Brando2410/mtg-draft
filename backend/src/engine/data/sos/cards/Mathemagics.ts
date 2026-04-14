import { CardDefinition } from '@shared/engine_types';

export const Mathemagics: CardDefinition = {
    "name": "Mathemagics",
    "manaCost": "{X}{X}{U}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Target player draws 2ˣ cards. (2º = 1, 2¹ = 2, 2² = 4, 2³ = 8, 2⁴ = 16, 2⁵ = 32, and so on.)",
    "abilities": []
};
