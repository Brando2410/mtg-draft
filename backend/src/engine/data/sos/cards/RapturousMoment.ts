import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
export const RapturousMoment: CardDefinition = {
    name: "Rapturous Moment",
    manaCost: "{4}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Draw three cards, then discard two cards. Add {U}{U}{R}{R}{R}.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 3,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.DiscardCards,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.AddMana,
                    manaType: "{U}{U}{R}{R}{R}"
                }
            ]
        }
    ]
};
