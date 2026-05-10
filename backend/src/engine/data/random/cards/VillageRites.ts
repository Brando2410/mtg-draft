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
    ],
    scryfall_id: "42ed35e9-51cd-468a-86a9-9412553cf50d",
    image_url: "https://cards.scryfall.io/normal/front/4/2/42ed35e9-51cd-468a-86a9-9412553cf50d.jpg?1736468066",
    rarity: "common"
};

