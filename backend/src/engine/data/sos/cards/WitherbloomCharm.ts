import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const WitherbloomCharm: CardDefinition = {
    name: "Witherbloom Charm",
    manaCost: "{B}{G}",
    scryfall_id: "71f760e9-b541-477a-b911-45186b520ae1", // placeholder
    colors: ["B", "G"],
    types: ["Instant"],
    oracleText: "Choose one —\n• You may sacrifice a permanent. If you do, draw two cards.\n• You gain 5 life.\n• Destroy target nonland permanent with mana value 2 or less.",
    abilities: [
        {
            type: AbilityType.Spell,
            modes: [
                {
                    label: "You may sacrifice a permanent. If you do, draw two cards.",
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Sacrifice a permanent?",
                            choices: [
                                {
                                    label: "Yes",
                                    costs: [{ type: CostType.Sacrifice, restrictions: [Restriction.Permanent] }],
                                    effects: [
                                        {
                                            type: EffectType.DrawCards,
                                            amount: 2,
                                            targetMapping: TargetMapping.Controller
                                        }
                                    ]
                                },
                                { label: "No", effects: [] }
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
                        restrictions: [Restriction.ManaValue2OrLess]
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
};
