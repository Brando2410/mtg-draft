import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const FirstDayofClass: CardDefinition = {
    name: 'First Day of Class',
    manaCost: '{1}{R}',
    scryfall_id: "091eb13d-9318-4b12-9f94-6276b11981d1",
    image_url: "https://cards.scryfall.io/normal/front/0/9/091eb13d-9318-4b12-9f94-6276b11981d1.jpg?1624591842",
    colors: ['R'],
    types: ['Instant'],
    oracleText: 'Whenever a creature enters the battlefield under your control this turn, put a +1/+1 counter on it and it gains haste until end of turn.\nLearn.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    deferredTrigger: {
                    eventMatch: TriggerEvent.EnterBattlefield,
                        condition: 'YouControlEnteredObject',
                        effects: [
                            { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.TriggerEventSource },
                            { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.TriggerEventSource, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Haste'] }
                        ]
                    }
                },
                { type: EffectType.Learn }
            ]
        }
    ]
  };


