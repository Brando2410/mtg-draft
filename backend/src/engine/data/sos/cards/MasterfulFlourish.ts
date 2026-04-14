import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const MasterfulFlourish: CardDefinition = {
    "name": "Masterful Flourish",
    "manaCost": "{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Target creature you control gets +1/+0 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Permanent', restrictions: ['Creature', 'Yourside'] },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    duration: "UNTIL_END_OF_TURN",
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    indestructible: true,
                    duration: "UNTIL_END_OF_TURN",
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
