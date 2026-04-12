import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';

export const PopQuiz: ImplementableCard = {
    name: 'Pop Quiz',
    manaCost: '{2}{U}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['blue'],
    supertypes: [],
    oracleText: 'Draw a card. Learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)',
    abilities: [
        {
            id: 'pop_quiz_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                },
                {
                    type: EffectType.Learn,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};
