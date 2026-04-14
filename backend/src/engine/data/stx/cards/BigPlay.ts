import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const BigPlay: CardDefinition = {
    name: 'Big Play',
    manaCost: '{1}{G}',
    colors: ['G'],
    types: ['Instant'],
    oracleText: 'Target creature gets +2/+2 until end of turn. Put a +1/+1 counter on it.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Permanent,
                restrictions: [{ type: 'Type', value: 'Creature' }]
            },
            effects: [
                { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', powerModifier: 2, toughnessModifier: 2 },
                { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
  };
