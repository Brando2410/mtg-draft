import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const DissectionPractice: CardDefinition = {
    "name": "Dissection Practice",
    "manaCost": "{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Target opponent loses 1 life and you gain 1 life.\nUp to one target creature gets +1/+1 until end of turn.\nUp to one target creature gets -1/-1 until end of turn.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Player', count: 1, restrictions: ['Opponent'] },
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.Target1 },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller },
                { 
                    type: EffectType.Choice, 
                    label: "Choose creature to get +1/+1 (optional)", 
                    targetIdMapping: 'ALL_BATTLEFIELD',
                    restrictions: ['Creature'],
                    optional: true,
                    effects: [
                        { 
                            type: EffectType.ApplyContinuousEffect, 
                            duration: { type: DurationType.UntilEndOfTurn }, 
                            powerModifier: 1, toughnessModifier: 1, 
                            targetMapping: TargetMapping.Target1 
                        }
                    ]
                },
                { 
                    type: EffectType.Choice, 
                    label: "Choose creature to get -1/-1 (optional)", 
                    targetIdMapping: 'ALL_BATTLEFIELD',
                    restrictions: ['Creature'],
                    optional: true,
                    effects: [
                        { 
                            type: EffectType.ApplyContinuousEffect, 
                            duration: { type: DurationType.UntilEndOfTurn }, 
                            powerModifier: -1, toughnessModifier: -1, 
                            targetMapping: TargetMapping.Target1 
                        }
                    ]
                }
            ]
        }
    ]
};
