import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const IgneousInspiration: CardDefinition = {
        name: 'Igneous Inspiration',
        manaCost: '{2}{R}',
        colors: ['R'],
        types: ['Sorcery'],
        oracleText: "Igneous Inspiration deals 3 damage to any target. Learn.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.AnyTarget,
                    count: 1
                },
                effects: [
                    { type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.Target1 },
                    { type: EffectType.Learn }
                ]
            }
        ]
    };

