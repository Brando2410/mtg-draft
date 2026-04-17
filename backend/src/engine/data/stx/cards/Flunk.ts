import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const Flunk: CardDefinition = {
    name: 'Flunk',
    manaCost: '{1}{B}',
    colors: ['B'],
    types: ['Instant'],
    oracleText: 'Target creature gets -X/-X until end of turn, where X is 7 minus the number of cards in its controller\'s hand.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { count: 1, type: TargetType.Creature },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 'TARGET_HAND_SIZE_7_MINUS',
                toughnessModifier: 'TARGET_HAND_SIZE_7_MINUS'
            }]
        }
    ]
  };
