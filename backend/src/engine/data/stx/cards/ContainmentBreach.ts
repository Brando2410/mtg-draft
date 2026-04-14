import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const ContainmentBreach: CardDefinition = {
    name: 'Containment Breach',
    manaCost: '{2}{G}',
    colors: ['G'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Exile target artifact or enchantment with mana value 2 or less. Create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [
                { type: 'Any', restrictions: [{ type: 'Type', value: 'Artifact' }, { type: 'Type', value: 'Enchantment' }] },
                { type: 'Attribute', attribute: 'ManaValue', value: 2, comparison: 'LE' }
            ]
        },
        effects: [
          { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
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
          }
        ]
      }
    ]
  };
