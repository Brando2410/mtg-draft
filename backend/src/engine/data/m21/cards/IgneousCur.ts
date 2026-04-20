import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping } from '@shared/engine_types';

export const IgneousCur: CardDefinition = {
    name: "Igneous Cur",
    manaCost: "{1}{R}",
    scryfall_id: "d2bfec5d-3182-415a-afe8-0b5511cfd656",
    image_url: "https://cards.scryfall.io/normal/front/d/2/d2bfec5d-3182-415a-afe8-0b5511cfd656.jpg?1594736708",
    oracleText: "{1}{R}: This creature gets +2/+0 until end of turn.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Elemental", "Dog"],
    power: "1",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{1}{R}' }],
            effects: [{ 
                type: EffectType.ApplyContinuousEffect, 
                powerModifier: 2, 
                duration: { type: DurationType.UntilEndOfTurn }, 
                targetMapping: TargetMapping.Self 
            }]
        }
    ]
};
