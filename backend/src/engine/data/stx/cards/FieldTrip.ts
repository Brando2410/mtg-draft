import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const FieldTrip: CardDefinition = {
  name: 'Field Trip',
  manaCost: '{2}{G}',
  colors: ['G'],
  types: ['Sorcery'],
  oracleText: 'Search your library for a basic Forest card, reveal it, put it into your hand, then shuffle.\nLearn.',
  abilities: [
    {
      type: AbilityType.Spell,
      effects: [
        {
          type: EffectType.SearchLibrary,
          targetDefinition: {
            type: TargetType.Land,
            count: 1,
            restrictions: [
                { type: 'Type', value: 'Basic' },
                { type: 'Type', value: 'Forest' }
            ]
          },
          zone: Zone.Hand,
          reveal: true,
          targetMapping: TargetMapping.Controller
        },
        { type: EffectType.Learn }
      ]
    }
  ]
};

