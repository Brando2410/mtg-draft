import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const DefiantStrike: CardDefinition = {
  name: 'Defiant Strike',
  manaCost: '{W}',
  colors: ['W'],
  types: ['Instant'],
  oracleText: 'Target creature gets +1/+0 until end of turn.\nDraw a card.',
  abilities: [
    {
      type: AbilityType.Spell,
      targetDefinitions: [{
        count: 1,
        type: TargetType.Creature,
        restrictions: [Restriction.Creature]
      }],
      effects: [
        { type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, powerModifier: 1, targetMapping: TargetMapping.Target1 },
        { type: EffectType.DrawCards, amount: 1 }
      ]
    }
  ]
};

