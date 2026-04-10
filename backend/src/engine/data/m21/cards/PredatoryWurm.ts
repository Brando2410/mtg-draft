import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType } from "@shared/engine_types";

export const PredatoryWurm: Record<string, ImplementableCard> = {
    "Predatory Wurm": {
        name: "Predatory Wurm",
        manaCost: "{3}{G}",
        oracleText: "Vigilance\nPredatory Wurm gets +2/+2 as long as you control a Garruk planeswalker.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Wurm"],
        power: "4",
        toughness: "4",
        keywords: ["Vigilance"],
        abilities: [
            {
                id: "predatory_wurm_buff",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                condition: 'HAS_PERMANENT:Planeswalker,Garruk',
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    targetMapping: 'SELF'
                }]
            }
        ]
    }
};
