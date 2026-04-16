import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const EnvironmentalSciences: CardDefinition = {
  name: 'Environmental Sciences',
  manaCost: '{2}',
  colors: [],
  types: ['Sorcery'],
  subtypes: ['Lesson'],
  oracleText: 'Search your library for a basic land card, reveal it, put it into your hand, then shuffle. You gain 2 life.',
  abilities: [
    {
      type: AbilityType.Spell,
      effects: [
        {
          type: EffectType.SearchLibrary,
          restrictions: ['Basic', 'Land'],
          destination: Zone.Hand,
          reveal: true,
          shuffle: true
        },
        { type: EffectType.GainLife, amount: 2 }
      ]
    }
  ]
};
