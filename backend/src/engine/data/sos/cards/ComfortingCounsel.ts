import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ComfortingCounsel: CardDefinition = {
    "name": "Comforting Counsel",
    "manaCost": "{1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Enchantment"
    ],
    "subtypes": [],
    "oracleText": "Whenever you gain life, put a growth counter on this enchantment.\nAs long as there are five or more growth counters on this enchantment, creatures you control get +3/+3.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
            condition: 'PLAYER_IS_CONTROLLER',
            effects: [
                { type: EffectType.AddCounters, amount: 1, startingCounters: { type: 'growth', amount: 1 }, targetMapping: TargetMapping.Self }
            ]
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    powerModifier: 3,
                    toughnessModifier: 3,
                    condition: 'COUNTER_GE:growth,5',
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ]
};




