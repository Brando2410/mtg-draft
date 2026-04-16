import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';
    export const OraclesRestoration: CardDefinition = {
    name: "Oracle's Restoration",
    manaCost: "{G}",
    colors: [
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature you control gets +1/+1 until end of turn. You draw a card and gain 1 life.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: DurationType.Permanent,
                count: 1,
                restrictions: ['Creature', 'YouControl']
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    