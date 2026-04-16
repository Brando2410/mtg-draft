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
            targetDefinition: {
                type: TargetType.Spell
            },
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Lofty Denial: Pay or counter spell?",
                    targetMapping: TargetMapping.Target1Controller,
                    choices: [
                        {
                            label: "Pay {4}",
                            condition: "HAS_PERMANENT:creature,flying",
                            costs: [{ type: CostType.Mana, value: '{4}' }]
                        },
                        {
                            label: "Pay {1}",
                            condition: "NOT_HAS_PERMANENT:creature,flying",
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
    ]
};
