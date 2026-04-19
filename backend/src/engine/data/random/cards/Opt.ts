import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const Opt: CardDefinition = {
    name: 'Opt',
    manaCost: '{U}',
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Scry 1.\nDraw a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.Scry, amount: 1 },
          { type: EffectType.DrawCards, amount: 1 }
        ]
      }
    ]
  };

