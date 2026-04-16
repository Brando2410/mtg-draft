import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TenuredConcocter: CardDefinition = {
    "name": "Tenured Concocter",
    "manaCost": "{4}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Troll",
        "Druid"
    ],
    "oracleText": "Vigilance\nWhenever this creature becomes the target of a spell or ability an opponent controls, you may draw a card.\nInfusion — This creature gets +2/+0 as long as you gained life this turn.",
    "keywords": [
        "Vigilance"
    ],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BecomeTarget,
            condition: (state, event, ability) => event.playerId !== ability.controllerId,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller,
                    optional: true
                }
            ]
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 2,
                    toughnessModifier: 0,
                    condition: ConditionType.GainedLifeThisTurn,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "5"
};





