import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const StandUpforYourself: CardDefinition = {
    "name": "Stand Up for Yourself",
    "manaCost": "{2}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Destroy target creature with power 3 or greater.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                restrictions: [
                    'Creature',
                    { type: 'Power', comparison: 'GreaterOrEqual', value: 3 }
                ]
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
