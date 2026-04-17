import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const EssenceInfusion: CardDefinition = {
    name: 'Essence Infusion',
    manaCost: '{1}{B}',
    colors: ['B'],
    types: ['Sorcery'],
    oracleText: 'Put two +1/+1 counters on target creature. It gains lifelink until end of turn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { count: 1, type: TargetType.Creature },
            effects: [
                { type: EffectType.AddCounters, counterType: 'P1P1', amount: 2, targetMapping: TargetMapping.Target1 },
                { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Lifelink'] }
            ]
        }
    ]
  };
