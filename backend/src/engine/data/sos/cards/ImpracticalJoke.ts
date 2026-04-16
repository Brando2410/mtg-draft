import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ImpracticalJoke: CardDefinition = {
    "name": "Impractical Joke",
    "manaCost": "{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Damage can't be prevented this turn. Impractical Joke deals 3 damage to up to one target creature or planeswalker.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                optional: true,
                restrictions: ["Creature", "Planeswalker"]
            },
            effects: [
                {
                    type: EffectType.DisableDamagePrevention
                },
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};



