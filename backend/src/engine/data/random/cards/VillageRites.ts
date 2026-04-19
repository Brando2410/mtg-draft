import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const VillageRites: CardDefinition = {
    name: 'Village Rites',
    manaCost: '{B}',
    colors: ['B'],
    types: ['Instant'],
    oracleText: 'As an additional cost to cast this spell, sacrifice a creature.\nDraw two cards.',
    abilities: [
      {
        type: AbilityType.Spell,
        additionalCosts: [
            {
                type: 'Sacrifice',
                restriction: { type: 'Type', value: 'Creature' }
            }
        ],
        effects: [{ type: EffectType.DrawCards, amount: 2 }]
      }
    ]
  };

