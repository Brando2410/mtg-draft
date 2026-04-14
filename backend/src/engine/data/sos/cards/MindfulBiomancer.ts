import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const MindfulBiomancer: CardDefinition = {
    "name": "Mindful Biomancer",
    "manaCost": "{1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Dryad",
        "Druid"
    ],
    "oracleText": "When this creature enters, you gain 1 life.\n{2}{G}: This creature gets +2/+2 until end of turn. Activate only once each turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{2}{G}' } as any],
            limitPerTurn: 1,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    duration: DurationType.UntilEndOfTurn,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};




