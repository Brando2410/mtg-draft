import { AbilityType, CardDefinition, CostType, TargetMapping, TargetType } from '@shared/engine_types';
    export const WanderOff: CardDefinition = {
    name: "Wander Off",
    manaCost: "{3}{B}",
    colors: [
        "B"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Exile target creature.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    