import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Restriction} from "@shared/engine_types";

export const FuroroftheBitten: CardDefinition = {
        name: "Furor of the Bitten",
        manaCost: "{R}",
    scryfall_id: "cb0e6279-8a66-4124-9def-fa0c83c26db9",
    image_url: "https://cards.scryfall.io/normal/front/c/b/cb0e6279-8a66-4124-9def-fa0c83c26db9.jpg?1594736626",
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
                activeZone: Zone.Hand,
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 1
                },
                oracleText: "Enchant creature"
            },
            {
                id: "furor_of_the_bitten_stat_buff",
                type: AbilityType.Static,
                activeZone: Zone.Battlefield,
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
    };

