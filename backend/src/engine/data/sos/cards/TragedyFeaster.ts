import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, ConditionType } from '@shared/engine_types';

export const TragedyFeaster: CardDefinition = {
    "name": "Tragedy Feaster",
    "manaCost": "{2}{B}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Demon"
    ],
    "oracleText": "Trample\nWard—Discard a card.\nInfusion — At the beginning of your end step, sacrifice a permanent unless you gained life this turn.",
    "keywords": [
        "Trample",
        "Ward—Discard a card"
    ],
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    condition: ConditionType.GainedLifeThisTurn,
                    effects: [],
                    onFailureEffects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.Controller
                        }
                    ]
                }
            ]
        }
    ],
    "power": "7",
    "toughness": "6"
};
