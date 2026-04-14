import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, Restriction } from "@shared/engine_types";

export const FuroroftheBitten: Record<string, ImplementableCard> = {
    "Furor of the Bitten": {
        name: "Furor of the Bitten",
        manaCost: "{R}",
        oracleText: "Enchant creature\nEnchanted creature gets +2/+2 and attacks each combat if able.",
        colors: ["red"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: ["Aura"],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "furor_of_the_bitten_aura",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 1
                },
                oracleText: "Enchant creature"
            },
            {
                id: "furor_of_the_bitten_stat_buff",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 2,
                        toughnessModifier: 2,
                        layer: 7,
                        targetMapping: "ENCHANTED_CREATURE"
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 6,
                        targetMapping: "ENCHANTED_CREATURE",
                        restrictions: [{ type: 'MustAttack' }]
                    }
                ],
                oracleText: "Enchanted creature gets +2/+2 and attacks each combat if able."
            }
        ]
    }
};
