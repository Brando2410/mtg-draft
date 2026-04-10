import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType } from "@shared/engine_types";

export const GarruksGorehorn: Record<string, ImplementableCard> = {
    "Garruk's Gorehorn": {
        name: "Garruk's Gorehorn",
        manaCost: "{3}{G}",
        oracleText: "Garruk's Gorehorn gets +2/+2 as long as you control a Garruk planeswalker.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Beast"],
        power: "5",
        toughness: "4",
        keywords: [],
        abilities: [
            {
                id: "garruks_gorehorn_buff",
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
