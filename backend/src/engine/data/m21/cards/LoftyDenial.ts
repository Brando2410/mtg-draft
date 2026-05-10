import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from "@shared/engine_types";

export const LoftyDenial: CardDefinition = {
    name: "Lofty Denial",
    manaCost: "{1}{U}",

    oracleText: "Counter target spell unless its controller pays {1}. If you control a creature with flying, counter that spell unless its controller pays {4} instead.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Spell }],
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Pay or counter?",
                    targetMapping: TargetMapping.Target1Controller,
                    choices: [
                        {
                            label: "Pay {4}",
                            condition: 'YOU_CONTROL_CREATURE_WITH_FLYING',
                            costs: [{ type: CostType.Mana, value: '{4}' }]
                        },
                        {
                            label: "Pay {1}",
                            condition: 'NOT_YOU_CONTROL_CREATURE_WITH_FLYING',
                            costs: [{ type: CostType.Mana, value: '{1}' }]
                        },
                        {
                            label: "Don't Pay",
                            effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "64832674-beb1-446e-b2f7-8a5e271139a5",
    image_url: "https://cards.scryfall.io/normal/front/6/4/64832674-beb1-446e-b2f7-8a5e271139a5.jpg?1616182218",
    rarity: "common"
};

