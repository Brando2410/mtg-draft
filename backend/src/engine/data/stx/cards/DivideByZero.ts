import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';

export const DivideByZero: ImplementableCard = {
    name: 'Divide by Zero',
    manaCost: '{2}{U}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['blue'],
    supertypes: [],
    oracleText: "Return target spell or permanent with mana value 4 or less to its owner's hand. Learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
    abilities: [
        {
            id: 'divide_by_zero_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1,
                restrictions: [
                    { type: 'AnyOf', values: ['Spell', 'Permanent'] },
                    { type: 'ManaValue', value: 4, comparison: 'LessOrEqual' }
                ]
            },
            effects: [
                {
                    type: EffectType.ReturnToHand,
                    targetMapping: 'TARGET_1'
                },
                {
                    type: EffectType.Learn,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};
