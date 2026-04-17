import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ElementalSummoning: CardDefinition = {
    name: 'Elemental Summoning',
    manaCost: '{3}{U/R}{U/R}',
    scryfall_id: "ea51991c-1589-4c62-965b-5ae8d233520b",
    image_url: "https://cards.scryfall.io/normal/front/e/a/ea51991c-1589-4c62-965b-5ae8d233520b.jpg?1637082123",
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
              image_url: 'https://cards.scryfall.io/large/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.jpg?1682693891'
            },
            amount: 1,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  };

