import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const Revitalize: CardDefinition = {
    name: 'Revitalize',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'You gain 3 life.\nDraw a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.GainLife, amount: 3 },
          { type: EffectType.DrawCards, amount: 1 }
        ]
      }
    ]
  };

