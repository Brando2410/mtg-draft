import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const WitherbloomCharm: CardDefinition = {
    "name": "Witherbloom Charm",
    "manaCost": "{B}{G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Choose one —\n• You may sacrifice a permanent. If you do, draw two cards.\n• You gain 5 life.\n• Destroy target nonland permanent with mana value 2 or less.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    choices: [
                        {
                            label: "You may sacrifice a permanent. If you do, draw two cards.",
                            effects: [
                                {
                                    type: EffectType.Choice,
                                    label: "Sacrifice a permanent?",
                                    choices: [
                                        {
                                            label: "Yes",
                                            costs: [
                                                {
                                                    type: 'Sacrifice',
                                                    restrictions: [
                                                        'Permanent'
                                                    ],
                                                    targetMapping: 'SELF_PERMANENT'
                                                }
                                            ],
                                            effects: [
                                                {
                                                    type: EffectType.DrawCards,
                                                    amount: 2,
                                                    targetMapping: TargetMapping.Controller
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
                        },
                        {
                            label: "You gain 5 life",
                            effects: [
                                {
                                    type: EffectType.GainLife,
                                    amount: 5,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        },
                        {
                            label: "Destroy target nonland permanent with mana value 2 or less",
                            targetDefinition: {
                                type: TargetType.Permanent,
                                count: 1,
                                restrictions: [
                                    'Nonland',
                                    {
                                        type: 'ManaValue',
                                        comparison: 'LessOrEqual',
                                        value: 2
                                    }
                                ]
                            },
                            effects: [
                                {
                                    type: EffectType.Destroy,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};



