import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

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
            restrictions: [{ type: 'Type', value: 'Land' }, { type: 'Subtype', value: 'Basic' }, { type: 'Subtype', value: 'Forest' }],
            destination: Zone.Hand,
            reveal: true,
            shuffle: true
          },
          { type: EffectType.Learn }
        ]
      }
    ]
  };
