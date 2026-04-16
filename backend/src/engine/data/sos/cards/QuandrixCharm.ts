import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const QuandrixCharm: CardDefinition = {
    name: "Quandrix Charm",
    manaCost: "{G}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Counter target spell unless its controller pays {2}.\n• Destroy target enchantment.\n• Target creature has base power and toughness 5/5 until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: CostType.Choice,
                    label: "Choose one",
                    choices: [
                        {
                            label: 'Counter target spell unless its controller pays {2}',
                            targetDefinition: { count: 1, type: TargetType.Spell },
                            effects: [
                                {
                                    type: CostType.Choice,
                                    label: "Pay {2} or counter?",
                                    targetMapping: TargetMapping.Target1Controller,
                                    choices: [
                                        {
                                            label: "Pay {2}",
                                            costs: [{ type: CostType.Mana, value: '{2}' }]
                                        },
                                        {
                                            label: "Don't Pay",
                                            effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            label: 'Destroy target enchantment',
                            targetDefinition: { count: 1, type: DurationType.Permanent, restrictions: ['Enchantment'] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                        },
                        {
                            label: 'Target creature has base power and toughness 5/5 until end of turn',
                            targetDefinition: { count: 1, type: TargetType.Creature },
                            effects: [{
                                type: EffectType.ApplyContinuousEffect,
                                powerSet: 5,
                                toughnessSet: 5,
                                duration: { type: DurationType.UntilEndOfTurn },
                                targetMapping: TargetMapping.Target1
                            }]
                        }
                    ]
                }
            ]
        }
    ]
};
    