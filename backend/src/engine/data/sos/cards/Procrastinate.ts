import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const Procrastinate: CardDefinition = {
  name: 'Procrastinate',
  manaCost: '{X}{U}',
  colors: ['U'],
  types: ['Instant'],
  oracleText: 'Tap target creature. Put twice X stun counters on it.',
  abilities: [
    {
      type: AbilityType.Spell,
      targetDefinition: {
        type: TargetType.Creature,
      },
      effects: [
        {
          type: EffectType.Tap,
          targetMapping: TargetMapping.Target1
        },
        {
          type: EffectType.AddCounters,
          value: 'stun',
          amount: (state, source) => (source.xValue || 0) * 2,
          targetMapping: TargetMapping.Target1
        }
      ]
    }
  ]
};


