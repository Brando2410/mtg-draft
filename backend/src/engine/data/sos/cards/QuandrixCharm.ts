import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const QuandrixCharm: CardDefinition = {
    name: "Quandrix Charm",
    manaCost: "{G}{U}",
    colors: ["G", "U"],
    types: ["Instant"],
    oracleText: "Choose one —\n• Counter target spell unless its controller pays {2}.\n• Destroy target enchantment.\n• Target creature has base power and toughness 5/5 until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 1,
            modes: [
                {
                    label: 'Counter target spell unless its controller pays {2}',
                    targetDefinitions: [{ count: 1, type: TargetType.Spell }],
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Pay {2} to prevent countering?",
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
                    targetDefinitions: [{ count: 1, type: TargetType.Enchantment }],
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Target creature has base power and toughness 5/5 until end of turn',
                    targetDefinitions: [{ count: 1, type: TargetType.Creature }],
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
    ],
    scryfall_id: "318486e0-f255-40f5-8150-dc272eec9d7d",
    image_url: "https://cards.scryfall.io/normal/front/3/1/318486e0-f255-40f5-8150-dc272eec9d7d.jpg?1775938509",
    rarity: "uncommon"
};

