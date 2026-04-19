import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const PopQuiz: CardDefinition = {
    name: 'Pop Quiz',
    manaCost: '{2}{U}',
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Draw a card.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.DrawCards, amount: 1 },
          { type: EffectType.Learn }
        ]
      }
    ]
  };

