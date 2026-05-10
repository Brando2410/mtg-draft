import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping } from '@shared/engine_types';
export const UlnaAlleyShopkeep: CardDefinition = {
    name: "Ulna Alley Shopkeep",
    manaCost: "{2}{B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Goblin", "Warlock"],
    power: "2",
    toughness: "3",
    keywords: ["Menace"],
    oracleText: "Menace (This creature can't be blocked except by two or more creatures.)\nInfusion — This creature gets +2/+0 as long as you gained life this turn.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 2,
                    toughnessModifier: 0,
                    condition: ConditionType.GainedLifeThisTurn,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "c25e1ae5-f17c-4eee-98f1-5681981af31c",
    image_url: "https://cards.scryfall.io/normal/front/c/2/c25e1ae5-f17c-4eee-98f1-5681981af31c.jpg?1775937633",
    rarity: "common"
};

