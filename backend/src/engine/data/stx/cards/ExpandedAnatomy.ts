import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const ExpandedAnatomy: CardDefinition = {
    name: 'Expanded Anatomy',
    manaCost: '{3}',
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Put two +1/+1 counters on target creature. It gains vigilance until end of turn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'P1P1',
                    amount: 2,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Vigilance'],
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};

