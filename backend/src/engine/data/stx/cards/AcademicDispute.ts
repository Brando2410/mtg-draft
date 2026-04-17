import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const AcademicDispute: CardDefinition = {
    name: 'Academic Dispute',
    manaCost: '{R}',
    colors: ['R'],
    types: ['Instant'],
    oracleText: "Target creature blocks this turn if able. Target creature gets +1/+0 and gains reach until end of turn. Learn.",
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
                    duration: { type: DurationType.UntilEndOfTurn },
                    effects: [{ type: 'MustBlockThisTurn' }],
                    powerModifier: 1,
                    abilitiesToAdd: ['Reach'],
                    targetMapping: TargetMapping.Target1
                },
                { type: EffectType.Learn }
            ]
        }
    ]
};

