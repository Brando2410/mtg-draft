import { ImplementableCard, EffectType } from '@shared/engine_types';

export const DefendTheCampus: ImplementableCard = {
    name: 'Defend the Campus',
    manaCost: '{3}{W}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    keywords: [],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Choose one — Creatures you control get +1/+1 until end of turn. or Destroy target creature with power 4 or greater.',
    abilities: [],
    effects: [
        {
            type: EffectType.Choice,
            label: 'Choose one',
            choices: [
                {
                    label: 'Creatures you control get +1/+1 until end of turn',
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            targetMapping: 'ALL_CREATURES_YOU_CONTROL',
                            duration: 'UNTIL_END_OF_TURN',
                            powerModifier: 1,
                            toughnessModifier: 1
                        }
                    ],
                    costs: []
                },
                {
                    label: 'Destroy target creature with power 4 or greater',
                    effects: [
                        {
                            type: EffectType.Destroy,
                            targetMapping: 'TARGET'
                        }
                    ],
                    targetDefinition: {
                        type: 'Permanent',
                        count: 1,
                        restrictions: ['Creature', { type: 'Power', value: 4, comparison: 'GreaterOrEqual' }]
                    },
                    costs: []
                }
            ]
        }
    ]
} as any;
