import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from "@shared/engine_types";

export const Dub: CardDefinition = {
    name: "Dub",
    manaCost: "{2}{W}",
    scryfall_id: "c3de35fd-425d-46b8-bc7d-c2f05d86858d",
    image_url: "https://cards.scryfall.io/normal/front/c/3/c3de35fd-425d-46b8-bc7d-c2f05d86858d.jpg?1594734896",
    oracleText: "Enchant creature\nEnchanted creature gets +2/+2, has first strike, and is a Knight in addition to its other types. (It deals combat damage before creatures without first strike.)",
    colors: ["W"],
    types: ["Enchantment"],
    subtypes: ["Aura"],
    keywords: ["Enchant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, count: 1 }
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 4,
                    subtypesToAdd: ['Knight'],
                    targetMapping: TargetMapping.EnchantedCreature
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    abilitiesToAdd: ['First Strike'],
                    targetMapping: TargetMapping.EnchantedCreature
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    targetMapping: TargetMapping.EnchantedCreature
                }
            ]
        }
    ]
};
