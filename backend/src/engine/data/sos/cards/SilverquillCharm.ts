import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const SilverquillCharm: CardDefinition = {
    name: "Silverquill Charm",
    manaCost: "{W}{B}",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Put two +1/+1 counters on target creature.\n• Exile target creature with power 2 or less.\n• Each opponent loses 3 life and you gain 3 life.",
    abilities: [
        {
            type: AbilityType.Spell,
            isModal: true,
            modes: [
                {
                    label: "Put two +1/+1 counters on target creature",
                    targetDefinition: { type: 'Permanent', count: 1, restrictions: [
                { type: 'Type', value: 'Creature' }
            ] },
                    effects: [
                        { type: EffectType.AddCounters, amount: 2, counterType: '+1/+1', targetMapping: TargetMapping.Target1 }
                    ]
                },
                {
                    label: "Exile target creature with power 2 or less",
                    targetDefinition: { type: 'Permanent', count: 1, restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Power',
                comparison: 'LessOrEqual',
                value: 2 }
            ] },
                    effects: [
                        { type: CostType.Exile, targetMapping: TargetMapping.Target1 }
                    ]
                },
                {
                    label: "Each opponent loses 3 life and you gain 3 life",
                    effects: [
                        { type: EffectType.LoseLife, amount: 3, targetMapping: TargetMapping.EachOpponent },
                        { type: EffectType.GainLife, amount: 3, targetMapping: TargetMapping.Controller }
                    ]
                }
            ]
        }
    ]
};
    