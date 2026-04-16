import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const CostofBrilliance: CardDefinition = {
    name: "Cost of Brilliance",
    manaCost: "{2}{B}",
    colors: [
        "B"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target player draws two cards and loses 2 life. Put a +1/+1 counter on up to one target creature.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Player', count: 1 },
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 },
                { type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.Target1 },
                {
                    type: CostType.Choice,
                    label: "Put a +1/+1 counter on up to one target creature?",
                    choices: [
                        {
                            label: "Yes",
                            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                            effects: [
                                { type: EffectType.AddCounters, amount: 1, startingCounters: { type: 'p1p1', amount: 1 }, targetMapping: TargetMapping.Target2 }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ]
};
    