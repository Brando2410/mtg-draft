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
    ],
    scryfall_id: "3a9fb75e-c8e5-417b-83d4-5105af9c66c1",
    image_url: "https://cards.scryfall.io/normal/front/3/a/3a9fb75e-c8e5-417b-83d4-5105af9c66c1.jpg?1631046075",
    rarity: "common"
};

