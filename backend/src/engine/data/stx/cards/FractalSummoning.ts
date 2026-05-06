import { AbilityType, CardDefinition, CounterType, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';

export const FractalSummoning: CardDefinition = {
  name: 'Fractal Summoning',
  manaCost: '{X}{G/U}',
  scryfall_id: "cc3f1f7e-eb19-49c1-a1ee-93b85ac8815c",
  image_url: "https://cards.scryfall.io/normal/front/c/c/cc3f1f7e-eb19-49c1-a1ee-93b85ac8815c.jpg?1637082130",
  colors: ['G', 'U'],
  types: ['Sorcery'],
  subtypes: ['Lesson'],
  oracleText: 'Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.',
  abilities: [
    {
      type: AbilityType.Spell,
      effects: [
        {
          type: EffectType.CreateToken,
          tokenBlueprint: {
            name: 'Fractal',
            manaCost: '',
            colors: ['G', 'U'],
            types: ['Creature', 'Token'],
            subtypes: ['Fractal'],
            power: "0",
            toughness: "0",
            image_url: 'https://cards.scryfall.io/large/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.jpg?1682693894'
          },
          amount: 1,
          startingCounters: { counterType: CounterType.P1P1, amount: DynamicAmount.X },

          targetMapping: TargetMapping.Controller
        }
      ]
    }
  ]
};

