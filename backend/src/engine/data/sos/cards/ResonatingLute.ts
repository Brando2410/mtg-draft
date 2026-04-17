import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
    export const ResonatingLute: CardDefinition = {
    name: "Resonating Lute",
    manaCost: "{2}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Artifact"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Lands you control have \"{T}: Add two mana of any one color. Spend this mana only to cast instant and sorcery spells.\"\n{T}: Draw a card. Activate only if you have seven or more cards in your hand.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.AllLandsYouControl,
                    abilitiesToAdd: [
                        {
                            type: AbilityType.Activated,
                            isManaAbility: true,
                            costs: [{ type: CostType.Tap }],
                            effects: [
                                {
                                    type: EffectType.AddMana,
                                    value: '{ANY}{ANY}',
                                    manaRestrictions: ['InstantOrSorcery']
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            condition: 'HAND_COUNT_GE:7',
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    
