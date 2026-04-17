import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

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
                type: TargetType.Creature,
                restrictions: ['youcontrol']
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 2,
                toughnessModifier: 2,
                abilitiesToAdd: ['Hexproof']
            }]
        }
    ]
  };
