import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const AzusaLostButSeeking: Record<string, ImplementableCard> = {
    "Azusa, Lost but Seeking": {
        name: "Azusa, Lost but Seeking",
        manaCost: "{2}{G}",
        oracleText: "You may play two additional lands on each of your turns.",
        colors: ["green"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human", "Monk"],
        power: "1",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "azusa_extra_lands",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: EffectType.AdditionalLandPlays,
                    amount: 2,
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};
