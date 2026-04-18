import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const Mathemagics: CardDefinition = {
    name: "Mathemagics",
    manaCost: "{X}{X}{U}{U}",
    scryfall_id: "cd3cc172-5609-4bc8-9d84-50680fed6df9",
    rarity: "mythic",
    image_url: "https://cards.scryfall.io/normal/front/c/d/cd3cc172-5609-4bc8-9d84-50680fed6df9.jpg?1775937314",
    colors: [
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target player draws 2ˣ cards. (2º = 1, 2¹ = 2, 2² = 4, 2³ = 8, 2⁴ = 16, 2⁵ = 32, and so on.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Player },
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 'X_POWER_OF_2',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    
