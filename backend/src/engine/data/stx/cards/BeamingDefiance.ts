import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BeamingDefiance: CardDefinition = {
    name: 'Beaming Defiance',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'Target creature you control gets +2/+2 and gains hexproof until end of turn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Permanent,
                restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: 'UNTIL_END_OF_TURN',
                powerModifier: 2,
                toughnessModifier: 2,
                abilitiesToAdd: ['Hexproof']
            }]
        }
    ]
  };

