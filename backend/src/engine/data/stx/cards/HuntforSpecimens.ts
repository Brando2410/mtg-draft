import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const HuntforSpecimens: CardDefinition = {
    name: 'Hunt for Specimens',
    manaCost: '{1}{B}',

    colors: ['B'],
    types: ['Sorcery'],
    oracleText: 'Create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."\nLearn.',
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
            amount: 1
          },
          { type: EffectType.Learn }
        ]
      }
    ],
    scryfall_id: "8ff0f47f-75cb-42b0-ba4d-78522cad9861",
    image_url: "https://cards.scryfall.io/normal/front/8/f/8ff0f47f-75cb-42b0-ba4d-78522cad9861.jpg?1624591017",
    rarity: "common"
};

