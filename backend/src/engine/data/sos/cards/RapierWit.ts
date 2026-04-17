import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const RapierWit: CardDefinition = {
    name: "Rapier Wit",
    manaCost: "{1}{W}",
    colors: [
        "W"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Tap target creature. If it's your turn, put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)\nDraw a card.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: CostType.Tap,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ConditionalEffect,
                    condition: ConditionType.IsYourTurn,
                    effects: [
                        {
                            type: EffectType.AddCounters,
                            counterType: 'stun',
                            amount: 1,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    
