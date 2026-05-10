import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
    export const QuickStudy: CardDefinition = {
    name: "Quick Study",
    manaCost: "{2}{U}",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Draw two cards.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "2d4f0bc7-da7c-4749-a24c-b01f3eb5860c",
    image_url: "https://cards.scryfall.io/normal/front/2/d/2d4f0bc7-da7c-4749-a24c-b01f3eb5860c.jpg?1775937363",
    rarity: "common"
};

