import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const GuidingVoice: CardDefinition = {
    name: 'Guiding Voice',
    manaCost: '{W}',
    colors: ['W'],
    types: ['Sorcery'],
    oracleText: 'Put a +1/+1 counter on target creature.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Creature
        },
        effects: [
          { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 },
          { type: EffectType.Learn }
        ]
      }
    ]
  };
