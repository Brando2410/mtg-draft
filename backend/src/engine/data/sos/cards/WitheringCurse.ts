import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const WitheringCurse: CardDefinition = {
    "name": "Withering Curse",
    "manaCost": "{1}{B}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "All creatures get -2/-2 until end of turn.\nInfusion — If you gained life this turn, destroy all creatures instead.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    effects: [
                        {
                            condition: 'INFUSION',
                            type: EffectType.Destroy,
                            targetMapping: TargetMapping.AllMatchingPermanents,
                            restrictions: [{ type: 'Type', value: 'Creature' }]
                        },
                        {
                            condition: '!INFUSION',
                            type: EffectType.ApplyContinuousEffect,
                            duration: 'UNTIL_END_OF_TURN',
                            powerModifier: -2,
                            toughnessModifier: -2,
                            targetMapping: TargetMapping.AllMatchingPermanents,
                            restrictions: [{ type: 'Type', value: 'Creature' }]
                        }
                    ]
                }
            ]
        }
    ]
};



