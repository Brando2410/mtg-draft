import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const CramSession: CardDefinition = {
    name: 'Cram Session',
    manaCost: '{1}{B/G}',
    colors: ['B', 'G'],
    types: ['Sorcery'],
    oracleText: 'You gain 2 life.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller },
          { type: EffectType.Learn }
        ]
      }
    ]
  };
