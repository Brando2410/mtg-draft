import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const Fractalize: CardDefinition = {
    name: "Fractalize",
    manaCost: "{X}{U}",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Until end of turn, target creature becomes a green and blue Fractal with base power and toughness each equal to X plus 1. (It loses all other colors and creature types.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerSet: 'X_PLUS_1',
                    toughnessSet: 'X_PLUS_1',
                    colorSet: ['G', 'U'],
                    subtypesSet: ['Fractal']
                }
            ]
        }
    ]
};
    