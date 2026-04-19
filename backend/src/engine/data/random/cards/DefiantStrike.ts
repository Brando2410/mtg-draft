import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const DefiantStrike: CardDefinition = {
    name: 'Defiant Strike',
    manaCost: '{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'Target creature gets +1/+0 until end of turn.\nDraw a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [{ type: 'Type', value: 'Creature' }]
        },
        effects: [
          { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', powerModifier: 1, targetMapping: TargetMapping.Target1 },
          { type: EffectType.DrawCards, amount: 1 }
        ]
      }
    ]
  };

