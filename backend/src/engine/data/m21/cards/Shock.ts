import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Shock: CardDefinition = {
    name: "Shock",
    manaCost: "{R}",
    oracleText: "Shock deals 2 damage to any target.",
    colors: ["R"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "shock_spell",
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
        }
    ]

};


