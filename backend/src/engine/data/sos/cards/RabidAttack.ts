import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType, DurationType, TriggerEvent } from '@shared/engine_types';

export const RabidAttack: CardDefinition = {
    "name": "Rabid Attack",
    "manaCost": "{1}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Until end of turn, any number of target creatures you control each get +1/+0 and gain \"When this creature dies, draw a card.\"",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                restrictions: ['YouControl'],
                count: 'AnyNumber' //missing why to express any number
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 0,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.TargetAll,
                    abilitiesToAdd: [
                        {
                            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                            effects: [
                                {
                                    type: EffectType.DrawCards,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};




