import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const GloriousAnthem: CardDefinition = {
    name: "Glorious Anthem",
    manaCost: "{1}{W}{W}",
    oracleText: "Creatures you control get +1/+1.",
    colors: ["W"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.AllCreaturesYouControl,
                powerModifier: 1,
                toughnessModifier: 1,
                layer: 7,
            }]
        }
    ]
};


