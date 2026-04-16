import { AbilityType, CardDefinition, EffectType, TargetType, TargetMapping } from "@shared/engine_types";

export const InvigoratingSurge: CardDefinition = {
    name: "Invigorating Surge",
    manaCost: "{2}{G}",
    oracleText: "Put a +1/+1 counter on target creature you control, then double the number of +1/+1 counters on that creature.",
    colors: ["G"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                restrictions: ["youcontrol"]
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: "+1/+1",
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DoubleCounters,
                    counterType: "+1/+1",
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
