import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

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
    ],
    scryfall_id: "6267e19a-a777-4767-8433-86b6624362b6",
    image_url: "https://cards.scryfall.io/normal/front/6/2/6267e19a-a777-4767-8433-86b6624362b6.jpg?1637082369",
    rarity: "common"
};

