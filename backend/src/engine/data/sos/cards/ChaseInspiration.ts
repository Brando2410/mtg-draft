import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const ChaseInspiration: CardDefinition = {
    "name": "Chase Inspiration",
    "manaCost": "{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Target creature you control gets +0/+3 and gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    toughnessModifier: 3,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Abilities',
                    abilitiesToAdd: ['Hexproof'],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
