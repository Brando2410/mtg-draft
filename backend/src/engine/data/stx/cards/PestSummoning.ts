import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const PestSummoning: CardDefinition = {
    name: 'Pest Summoning',
    manaCost: '{1}{B/G}{B/G}',
    colors: ['B', 'G'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create two 1/1 black and green Pest creature tokens with "When this creature dies, you gain 1 life."',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Pest',
              manaCost: '',
              colors: ['B', 'G'],
              types: ['Creature', 'Token'],
              subtypes: ['Pest'],
              power: "1",
              toughness: "1",
              image_url: 'https://cards.scryfall.io/large/front/d/0/d0ddbe3e-4a66-494d-9304-7471232549bf.jpg?1682693901',
              oracleText: 'When this creature dies, you gain 1 life.',
              abilities: [{
                  type: AbilityType.Triggered,
                  eventMatch: TriggerEvent.Death,
                  effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
              }]
            },
            amount: 2,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  };
