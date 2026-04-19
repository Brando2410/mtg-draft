import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const InklingSummoning: CardDefinition = {
    name: 'Inkling Summoning',
    manaCost: '{1}{W/B}{W/B}',
    scryfall_id: "04a8a5b8-9743-4d1a-89e9-61bdf180b2e0",
    image_url: "https://cards.scryfall.io/normal/front/0/4/04a8a5b8-9743-4d1a-89e9-61bdf180b2e0.jpg?1637082323",
    colors: ['W', 'B'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create a 2/1 white and black Inkling creature token with flying.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Inkling',
              manaCost: '',
              colors: ['W', 'B'],
              types: ['Creature', 'Token'],
              subtypes: ['Inkling'],
              power: "2",
              toughness: "1",
              keywords: ['Flying'],
              image_url: 'https://cards.scryfall.io/large/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.jpg?1682693898'
            },
            amount: 1,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  };

