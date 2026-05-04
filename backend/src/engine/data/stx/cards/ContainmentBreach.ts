import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const ContainmentBreach: CardDefinition = {
  name: 'Containment Breach',
  manaCost: '{2}{G}',
    scryfall_id: "0dcca120-b72e-4007-98e1-cb22e7b9a705",
    image_url: "https://cards.scryfall.io/normal/front/0/d/0dcca120-b72e-4007-98e1-cb22e7b9a705.jpg?1771241735",
  colors: ['G'],
  types: ['Sorcery'],
  subtypes: ['Lesson'],
  oracleText: 'Exile target artifact or enchantment with mana value 2 or less. Create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."',
  abilities: [
    {
      type: AbilityType.Spell,
      targetDefinitions: [{
        count: 1,
        type: TargetType.ArtifactOrEnchantment,
        restrictions: [Restriction.ManaValue2OrLess]
      }],
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
