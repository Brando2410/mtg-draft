import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const IntroductiontoProphecy: CardDefinition = {
    name: 'Introduction to Prophecy',
    manaCost: '{3}',
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Scry 2, then draw a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.Scry, amount: 2 },
          { type: EffectType.DrawCards, amount: 1 }
        ]
      }
    ]
  };
