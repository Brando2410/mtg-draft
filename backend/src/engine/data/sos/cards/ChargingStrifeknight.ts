import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const ChargingStrifeknight: CardDefinition = {
    name: "Charging Strifeknight",
    manaCost: "{2}{R}",
    scryfall_id: "9940d992-1ba1-40ec-9b93-17d773452c4b",
    image_url: "https://cards.scryfall.io/normal/front/9/9/9940d992-1ba1-40ec-9b93-17d773452c4b.jpg?1775937699",
    colors: [
        "R"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Spirit",
        "Knight"
    ],
    keywords: ["Haste"],
    oracleText: "Haste\n{T}, Discard a card: Draw a card.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Tap }
            ],
            effects: [
                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ],
    power: "3",
    toughness: "3"
};
    
