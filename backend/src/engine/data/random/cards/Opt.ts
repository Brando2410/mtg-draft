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
    ],
    scryfall_id: "bbc99a51-1501-4525-a3cc-f48249b64bed",
    image_url: "https://cards.scryfall.io/normal/front/b/b/bbc99a51-1501-4525-a3cc-f48249b64bed.jpg?1743206354",
    rarity: "common"
};

