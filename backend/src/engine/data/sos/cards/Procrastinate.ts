import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const Procrastinate: CardDefinition = {
    name: 'Procrastinate',
    manaCost: '{X}{U}',
    colors: ['U'],
    types: ['Instant'],
    subtypes: [],
    keywords: [],
    oracleText: 'Tap target creature. Put twice X stun counters on it.',
    abilities: [
    {
      type: AbilityType.Spell,
      targetDefinition: {
        type: TargetType.Creature,
      },
      effects: [
        {
          type: CostType.Tap,
          targetMapping: TargetMapping.Target1
        },
        {
          type: EffectType.AddCounters,
          value: 'stun',
          amount: (state: any, source: any) => (source.xValue || 0) * 2,
          targetMapping: TargetMapping.Target1
        }
      ]
    }
  ]
};
    
