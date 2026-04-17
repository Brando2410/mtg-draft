import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const WitherbloomCharm: CardDefinition = {
    name: "Witherbloom Charm",
    manaCost: "{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• You may sacrifice a permanent. If you do, draw two cards.\n• You gain 5 life.\n• Destroy target nonland permanent with mana value 2 or less.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: CostType.Choice,
                    choices: [
                        {
                            label: "You may sacrifice a permanent. If you do, draw two cards.",
                            effects: [
                                {
                                    type: CostType.Choice,
                                    label: "Sacrifice a permanent?",
                                    choices: [
                                        {
                                            label: "Yes",
                                            costs: [
                                                {
                                                    type: CostType.Sacrifice,
                                                    restrictions: [
                { type: 'Type', value: 'Permanent' }
            ],
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
                                type: TargetType.NonlandPermanent,
                                count: 1,
                                restrictions: [
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
