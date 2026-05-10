import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const ElementalSummoning: CardDefinition = {
    name: 'Elemental Summoning',
    manaCost: '{3}{U/R}{U/R}',

    colors: ['U', 'R'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create a 4/4 blue and red Elemental creature token.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Elemental',
              manaCost: '',
              colors: ['U', 'R'],
              types: ['Creature', 'Token'],
              subtypes: ['Elemental'],
              power: "4",
              toughness: "4",

            },
            amount: 1,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ],
    scryfall_id: "ea51991c-1589-4c62-965b-5ae8d233520b",
    image_url: "https://cards.scryfall.io/normal/front/e/a/ea51991c-1589-4c62-965b-5ae8d233520b.jpg?1637082123",
    rarity: "common"
};

