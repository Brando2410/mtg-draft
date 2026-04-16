import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';

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
            targetDefinition: [
                { type: 'Player', count: 1, restrictions: ['Opponent'] },
                { type: 'Permanent', count: 1, minCount: 0, restrictions: ['Creature'], optional: true },
                { type: 'Permanent', count: 1, minCount: 0, restrictions: ['Creature'], optional: true }
            ],
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.Target1 },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller },
                { 
                    type: EffectType.ApplyContinuousEffect, 
                    duration: { type: DurationType.UntilEndOfTurn }, 
                    powerModifier: 1, toughnessModifier: 1, 
                    targetMapping: TargetMapping.Target2,
                    condition: 'TARGET_2_EXISTS'
                },
                { 
                    type: EffectType.ApplyContinuousEffect, 
                    duration: { type: DurationType.UntilEndOfTurn }, 
                    powerModifier: -1, toughnessModifier: -1, 
                    targetMapping: TargetMapping.Target3,
                    condition: 'TARGET_3_EXISTS'
                }
            ]
        }
    ]
};



