import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const EnthusiasticStudy: CardDefinition = {
    name: 'Enthusiastic Study',
    manaCost: '{1}{R}',
    colors: ['R'],
    types: ['Instant'],
    oracleText: "Target creature gets +3/+1 and gains trample until end of turn. Learn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 3,
                    toughnessModifier: 1,
                    abilitiesToAdd: ['Trample'],
                    targetMapping: TargetMapping.Target1
                },
                { type: EffectType.Learn }
            ]
        }
    ]
};

