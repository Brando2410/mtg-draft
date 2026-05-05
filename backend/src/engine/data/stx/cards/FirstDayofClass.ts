import { AbilityType, CardDefinition, EffectType, TargetMapping, CounterType, TriggerEvent, DurationType, ConditionType } from '@shared/engine_types';

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
                    type: EffectType.CreateDelayedTrigger,
                    duration: { type: DurationType.UntilEndOfTurn },
                    eventMatch: TriggerEvent.EnterBattlefield,
                    condition: ConditionType.YouControlEnteredObject,
                    effects: [
                        { type: EffectType.AddCounters, counterType: CounterType.P1P1, amount: 1, targetMapping: TargetMapping.TriggerEventSource },
                        { type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.TriggerEventSource, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Haste'] }
                    ]
                },
                { type: EffectType.Learn }
            ]
        }
    ]
};
