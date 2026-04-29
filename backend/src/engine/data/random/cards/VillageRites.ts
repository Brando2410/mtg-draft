import { AbilityType, CardDefinition, CostType, EffectType, Restriction } from '@shared/engine_types';

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
                type: CostType.Sacrifice,
                restrictions: [Restriction.Creature]
            }
        ],
        effects: [{ type: EffectType.DrawCards, amount: 2 }]
      }
    ]
};
