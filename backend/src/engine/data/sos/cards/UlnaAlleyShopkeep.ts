import { TargetMapping, AbilityType, CardDefinition, ConditionType, EffectType, TargetType } from '@shared/engine_types';
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
    ]
};