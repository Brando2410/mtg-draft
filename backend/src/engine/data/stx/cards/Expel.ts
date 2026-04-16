import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const Expel: CardDefinition = {
    name: 'Expel',
    manaCost: '{2}{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'Exile target tapped creature.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Permanent,
                restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Tapped' }]
            },
            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
        }
    ]
  };

