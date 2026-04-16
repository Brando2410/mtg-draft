import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const LashofMalice: CardDefinition = {
    name: 'Lash of Malice',
    manaCost: '{B}',
    colors: ['B'],
    types: ['Instant'],
    oracleText: 'Target creature gets +2/-2 until end of turn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
            effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', powerModifier: 2, toughnessModifier: -2 }]
        }
    ]
  };

