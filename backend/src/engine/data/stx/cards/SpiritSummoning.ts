import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const SpiritSummoning: CardDefinition = {
    name: 'Spirit Summoning',
    manaCost: '{1}{R/W}{R/W}',
    colors: ['R', 'W'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create a 3/2 red and white Spirit creature token.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Spirit',
              manaCost: '',
              colors: ['R', 'W'],
              types: ['Creature', 'Token'],
              subtypes: ['Spirit'],
              power: "3",
              toughness: "2",
              image_url: 'https://cards.scryfall.io/large/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.jpg?1682693862'
            },
            amount: 1,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  };

