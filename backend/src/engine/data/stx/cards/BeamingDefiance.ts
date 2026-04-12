import { ImplementableCard, EffectType } from '@shared/engine_types';

export const BeamingDefiance: ImplementableCard = {
    name: 'Beaming Defiance',
    manaCost: '{1}{W}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    keywords: [],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Target creature you control gets +2/+2 and gains hexproof until end of turn.',
    abilities: [],
    effects: [
        {
            type: EffectType.ApplyContinuousEffect,
            targetMapping: 'TARGET',
            duration: 'UNTIL_END_OF_TURN',
            powerModifier: 2,
            toughnessModifier: 2,
            abilitiesToAdd: ['Hexproof']
        }
    ],
    targetDefinition: {
        type: 'Permanent',
        count: 1,
        restrictions: ['Creature', 'YOU_CONTROL']
    }
} as any;
