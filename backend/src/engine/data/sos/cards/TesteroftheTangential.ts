import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const TesteroftheTangential: CardDefinition = {
    name: "Tester of the Tangential",
    manaCost: "{1}{U}",
    colors: [
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Djinn",
        "Wizard"
    ],
    keywords: ["Increment"],
    oracleText: "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nAt the beginning of combat on your turn, you may pay {X}. When you do, move X +1/+1 counters from this creature onto another target creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: CostType.Choice,
                    label: "Pay {X} to move +1/+1 counters?",
                    choices: [
                        {
                            label: "Yes",
                            costs: [
                                {
                                    type: CostType.Mana,
                                    value: '{X}'
                                }
                            ],
                            effects: [
                                {
                                    type: CostType.Choice,
                                    label: "Choose target creature to receive counters",
                                    targetDefinition: {
                                        type: DurationType.Permanent,
                                        restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Identity', value: 'Another' }
            ],
                                        count: 1
                                    },
                                    effects: [
                                        {
                                            type: EffectType.MoveCounters,
                                            counterType: '+1/+1',
                                            amount: DynamicAmount.X,
                                            targetMapping: TargetMapping.Target1
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            label: "No",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ],
    power: "1",
    toughness: "1"
};
    