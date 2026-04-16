import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const DividebyZero: CardDefinition = {
    name: 'Divide by Zero',
    manaCost: '{2}{U}',
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Return target spell or permanent with mana value 1 or greater to its owner\'s hand.\nLearn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Any,
                restrictions: [{ type: 'ManaValue', comparison: 'GreaterOrEqual', value: 1 }]
            },
            effects: [
                { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 },
                { type: EffectType.Learn }
            ]
        }
    ]
  };

