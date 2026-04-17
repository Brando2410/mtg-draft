import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const ShatteredAcolyte: CardDefinition = {
    name: "Shattered Acolyte",
    manaCost: "{1}{W}",
    colors: [
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Dwarf",
        "Warlock"
    ],
    keywords: [
        "Lifelink"
    ],
    oracleText: "Lifelink\n{1}, Sacrifice this creature: Destroy target artifact or enchantment.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}' },
                { type: CostType.SacrificeSelf }
            ],
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ],
            targetDefinition: {
                maxTargets: 1,
                restrictions: ["Artifact_or_Enchantment"]
            }
        }
    ],
    power: "2",
    toughness: "2"
};
    
