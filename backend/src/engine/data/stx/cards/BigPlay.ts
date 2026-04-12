import { ImplementableCard, EffectType } from '@shared/engine_types';

export const BigPlay: ImplementableCard = {
    name: 'Big Play',
    manaCost: '{1}{G}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    keywords: [],
    colors: ['green'],
    supertypes: [],
    oracleText: 'Target creature gets +2/+2 and gains reach until end of turn. Put a +1/+1 counter on it.',
    abilities: [],
    effects: [
        {
            type: EffectType.ApplyContinuousEffect,
            targetMapping: 'TARGET',
            duration: 'UNTIL_END_OF_TURN',
            powerModifier: 2,
            toughnessModifier: 2,
            abilitiesToAdd: ['Reach']
        },
        {
            type: EffectType.AddCounters,
            targetMapping: 'TARGET',
            amount: 1,
            value: '+1/+1'
        }
    ],
    targetDefinition: {
        type: 'Permanent',
        count: 1,
        restrictions: ['Creature']
    }
} as any;
