import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const FirstDayOfClass: ImplementableCard = {
    name: 'First Day of Class',
    manaCost: '{1}{R}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['red'],
    supertypes: [],
    oracleText: 'Learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)\nWhenever a creature enters the battlefield under your control this turn, put a +1/+1 counter on it and it gains haste until end of turn.',
    abilities: [
        {
            id: 'first_day_of_class_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.Learn,
                    targetMapping: 'CONTROLLER'
                },
                {
                    type: EffectType.AddTriggeredAbility,
                    eventMatch: TriggerEvent.EnterBattlefieldOther,
                    condition: 'EVENT_OBJECT_MATCHES',
                    restrictions: ['Creature', 'youcontrol'],
                    duration: 'UNTIL_END_OF_TURN',
                    effects: [
                        {
                            type: EffectType.AddCounters,
                            amount: 1,
                            targetMapping: 'EVENT_TARGET'
                        },
                        {
                            type: EffectType.ApplyContinuousEffect,
                            duration: 'UNTIL_END_OF_TURN',
                            abilitiesToAdd: ['Haste'],
                            targetMapping: 'EVENT_TARGET'
                        }
                    ]
                }
            ]
        }
    ]
};
