import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

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
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: [{ type: 'Type', value: 'Creature' }]
                },
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        duration: 'UNTIL_END_OF_TURN',
                        // MustBlockThisTurn is an effect property or ability
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
