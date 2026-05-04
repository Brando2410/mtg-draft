import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const TraumaticCritique: CardDefinition = {
    name: "Traumatic Critique",
    manaCost: "{X}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Traumatic Critique deals X damage to any target. Draw two cards, then discard a card.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.AnyTarget,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: DynamicAmount.X,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.DiscardCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    
