import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from "@shared/engine_types";

export const Cancel: CardDefinition = {
    name: "Cancel",
    manaCost: "{1}{U}{U}",
    oracleText: "Counter target spell.",
    colors: ["U"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Spell, count: 1 },
            effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
