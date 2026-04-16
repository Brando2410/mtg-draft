import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const LastGasp: CardDefinition = {
    "name": "Last Gasp",
    "manaCost": "{1}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Target creature gets -3/-3 until end of turn.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: -3,
                    toughnessModifier: -3,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};



