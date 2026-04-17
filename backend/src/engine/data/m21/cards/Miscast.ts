import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from "@shared/engine_types";

export const Miscast: CardDefinition = {
    name: "Miscast",
    manaCost: "{U}",
    oracleText: "Counter target instant or sorcery spell unless its controller pays {3}.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Spell,
                restrictions: [
                { type: 'Type', value: 'InstantOrSorcery' }
            ]
            },
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Miscast: Pay {3} to prevent counter?",
                    targetMapping: TargetMapping.Target1Controller,
                    choices: [
                        {
                            label: "Pay {3}",
                            costs: [{ type: CostType.Mana, value: '{3}' }]
                        },
                        {
                            label: "Don't Pay (Spell will be countered)",
                            effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
                        }
                    ]
                }
            ]
        }
    ]
};
