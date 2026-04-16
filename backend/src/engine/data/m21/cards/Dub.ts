import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType} from "@shared/engine_types";

export const Dub: CardDefinition = {
        name: "Dub",
        manaCost: "{2}{W}",
        oracleText: "Enchant creature\nEnchanted creature gets +2/+2, has first strike, and is a Knight in addition to its other types. (It deals combat damage before creatures without first strike.)",
        colors: ["white"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: ["Aura"],
        power: "",
        toughness: "",
        keywords: ["Enchant"],
        abilities: [
            {
                id: "dub_spell",
                type: AbilityType.Spell,
                activeZone: Zone.Hand,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] }
            },
            {
                id: "dub_static",
                type: AbilityType.Static,
                activeZone: Zone.Battlefield,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 4,
                        subtypesToAdd: ['Knight'],
                        targetMapping: 'ENCHANTED_PERMANENT'
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 6,
                        abilitiesToAdd: ['First Strike'],
                        targetMapping: 'ENCHANTED_PERMANENT'
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 7,
                        powerModifier: 2,
                        toughnessModifier: 2,
                        targetMapping: 'ENCHANTED_PERMANENT'
                    }
                ]
            }
        ]
    };

