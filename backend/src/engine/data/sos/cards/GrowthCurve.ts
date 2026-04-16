import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';
    export const GrowthCurve: CardDefinition = {
    name: "Growth Curve",
    manaCost: "{G}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Put a +1/+1 counter on target creature you control, then double the number of +1/+1 counters on that creature.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: DurationType.Permanent,
                count: 1,
                restrictions: ["Creature", "YouControl"]
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DoubleCounters,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    