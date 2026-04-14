import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const WanderOff: CardDefinition = {
    "name": "Wander Off",
    "manaCost": "{3}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Exile target creature.",
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
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
