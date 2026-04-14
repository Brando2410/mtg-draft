import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const IntroductiontoAnnihilation: CardDefinition = {
    name: 'Introduction to Annihilation',
    manaCost: '{5}',
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Exile target nonland permanent. Its controller draws a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [
                { type: 'Not', restriction: { type: 'Type', value: 'Land' } }
            ]
        },
        effects: [
          { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
          { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Target1Controller }
        ]
      }
    ]
  };
