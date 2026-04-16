import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const TragedyFeaster: CardDefinition = {
    name: "Tragedy Feaster",
    manaCost: "{2}{B}{B}",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Demon"
    ],
    keywords: [
        "Trample",
        "Ward—Discard a card"
    ],
    oracleText: "Trample\nWard—Discard a card.\nInfusion — At the beginning of your end step, sacrifice a permanent unless you gained life this turn.",
    abilities: [
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
                            type: CostType.Sacrifice,
                            targetMapping: TargetMapping.Controller
                        }
                    ]
                }
            ]
        }
    ],
    power: "7",
    toughness: "6"
};
    