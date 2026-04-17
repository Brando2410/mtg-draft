import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

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
                type: TargetType.Creature,
                restrictions: ['tapped']
            },
            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
