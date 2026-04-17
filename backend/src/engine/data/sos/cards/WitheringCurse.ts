import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping } from '@shared/engine_types';
export const WitheringCurse: CardDefinition = {
    name: "Withering Curse",
    manaCost: "{1}{B}{B}",
    colors: [
        "B"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "All creatures get -2/-2 until end of turn.\nInfusion — If you gained life this turn, destroy all creatures instead.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    effects: [
                        {
                            condition: ConditionType.Infusion,
                            type: EffectType.Destroy,
                            targetMapping: TargetMapping.AllMatchingPermanents,
                            restrictions: [
                { type: 'Type', value: 'Creature' }
            ]
                        },
                        {
                            condition: 'INFUSION',
                            type: EffectType.ApplyContinuousEffect,
                            duration: DurationType.UntilEndOfTurn,
                            powerModifier: -2,
                            toughnessModifier: -2,
                            targetMapping: TargetMapping.AllMatchingPermanents,
                            restrictions: [
                { type: 'Type', value: 'Creature' }
            ]
                        }
                    ]
                }
            ]
        }
    ]
};
