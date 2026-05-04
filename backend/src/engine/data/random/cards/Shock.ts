import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Shock: CardDefinition = {
    name: 'Shock',
    manaCost: '{R}',
    colors: ['R'],
    types: ['Instant'],
    oracleText: 'Shock deals 2 damage to any target.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinitions: [{
            count: 1,
            type: TargetType.AnyTarget
        }],
        effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
      }
    ]
  };

