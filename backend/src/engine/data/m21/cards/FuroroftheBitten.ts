import { AbilityType, CardDefinition, EffectType, RestrictionType, TargetMapping, TargetType } from "@shared/engine_types";

export const FuroroftheBitten: CardDefinition = {
    name: "Furor of the Bitten",
    manaCost: "{R}",
    scryfall_id: "cb0e6279-8a66-4124-9def-fa0c83c26db9",
    image_url: "https://cards.scryfall.io/normal/front/c/b/cb0e6279-8a66-4124-9def-fa0c83c26db9.jpg?1594736626",
    oracleText: "Enchant creature\nEnchanted creature gets +2/+2 and attacks each combat if able.",
    colors: ["R"],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: ["Enchant"],
    auraRestriction: { type: TargetType.Creature, count: 1 },
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    layer: 7,
                    targetMapping: TargetMapping.EnchantedCreature
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    targetMapping: TargetMapping.EnchantedCreature,
                    restrictionsToAdd: [{ type: RestrictionType.MustAttack }]
                }
            ]
        }
    ]
};
