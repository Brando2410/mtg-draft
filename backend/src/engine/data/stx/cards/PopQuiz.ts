import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const PopQuiz: CardDefinition = {
    name: 'Pop Quiz',
    manaCost: '{2}{U}',
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Draw a card.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.DrawCards, amount: 1 },
          { type: EffectType.Learn }
        ]
      }
    ],
    scryfall_id: "d16892d8-9d10-45de-ab79-0e645c4b5588",
    image_url: "https://cards.scryfall.io/normal/front/d/1/d16892d8-9d10-45de-ab79-0e645c4b5588.jpg?1624661941",
    rarity: "common"
};

