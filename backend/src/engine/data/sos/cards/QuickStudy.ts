import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
    export const QuickStudy: CardDefinition = {
    name: "Quick Study",
    manaCost: "{2}{U}",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Draw two cards.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    