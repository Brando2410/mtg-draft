import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

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
    ]
  };

