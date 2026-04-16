import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const FirstDayofClass: CardDefinition = {
    name: 'First Day of Class',
    manaCost: '{1}{R}',
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


