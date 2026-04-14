import { CardDefinition, AbilityType, EffectType, TargetMapping, ConditionType } from '@shared/engine_types';

export const ResonatingLute: CardDefinition = {
    "name": "Resonating Lute",
    "manaCost": "{2}{U}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Artifact"
    ],
    "subtypes": [],
    "oracleText": "Lands you control have \"{T}: Add two mana of any one color. Spend this mana only to cast instant and sorcery spells.\"\n{T}: Draw a card. Activate only if you have seven or more cards in your hand.",
    "abilities": [
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
                            costs: [{ type: 'Tap' }],
                            effects: [
                                {
                                    type: EffectType.AddMana,
                                    value: '{ANY}{ANY}',
                                    manaRestrictions: ['Instant', 'Sorcery']
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
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


