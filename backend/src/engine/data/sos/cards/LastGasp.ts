import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

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
                type: TargetType.Permanent,
                count: 1,
                restrictions: [{ type: 'Type', value: 'Creature' }]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: -3,
                    toughnessModifier: -3,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};


