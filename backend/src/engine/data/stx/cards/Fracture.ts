import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Fracture: CardDefinition = {
    name: 'Fracture',
    manaCost: '{W}{B}',
    colors: ['W', 'B'],
    types: ['Instant'],
    oracleText: "Destroy target artifact, enchantment, or planeswalker.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.ArtifactEnchantmentOrPlaneswalker,
                count: 1
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};

