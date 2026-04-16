import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const UnsubtleMockery: CardDefinition = {
    "name": "Unsubtle Mockery",
    "manaCost": "{2}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Unsubtle Mockery deals 4 damage to target creature. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 4,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Surveil,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};



