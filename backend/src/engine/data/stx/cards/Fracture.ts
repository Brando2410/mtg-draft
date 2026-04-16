import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Artifact' }, { type: 'Type', value: 'Enchantment' }, { type: 'Type', value: 'Planeswalker' }] }]
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

