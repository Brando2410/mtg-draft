import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const EssenceScatter: CardDefinition = {
    name: "Essence Scatter",
    manaCost: "{1}{U}",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Counter target creature spell.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: EffectType.CounterSpell,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
