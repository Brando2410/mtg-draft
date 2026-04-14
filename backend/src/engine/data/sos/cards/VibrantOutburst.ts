import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const VibrantOutburst: CardDefinition = {
    "name": "Vibrant Outburst",
    "manaCost": "{U}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Vibrant Outburst deals 3 damage to any target. Tap up to one target creature.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: [
                {
                    type: TargetType.AnyTarget,
                    count: 1,
                    label: 'Deal 3 damage to'
                },
                {
                    type: TargetType.Creature,
                    count: 1,
                    minCount: 0,
                    label: 'Tap target creature (optional)'
                }
            ],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Tap,
                    targetMapping: TargetMapping.Target2
                }
            ]
        }
    ]
};


