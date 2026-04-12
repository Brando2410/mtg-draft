import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const FractalSummoning: ImplementableCard = {
    name: 'Fractal Summoning',
    manaCost: '{X}{G/U}{G/U}',
    type_line: 'Sorcery — Lesson',
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['green', 'blue'],
    supertypes: [],
    oracleText: 'Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.',
    abilities: [
        {
            id: 'fractal_summoning_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    targetMapping: 'CONTROLLER',
                    tokenBlueprint: {
                        name: 'Fractal',
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        colors: ['G', 'U'],
                        power: '0',
                        toughness: '0'
                    },
                    startingCounters: {
                        type: '+1/+1',
                        amount: 'X'
                    }
                }
            ]
        }
    ]
};
