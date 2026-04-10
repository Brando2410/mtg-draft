import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const CaptureSphere: Record<string, ImplementableCard> = {
    "Capture Sphere": {
        name: "Capture Sphere",
        manaCost: "{3}{U}",
        oracleText: "Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.",
        colors: ["blue"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: ["Aura"],
        power: "",
        toughness: "",
        keywords: ["Flash", "Enchant"],
        abilities: [
            {
                id: "capture_sphere_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: ["creature"]
                },
                oracleText: "Flash, Enchant creature"
            },
            {
                id: "capture_sphere_etb",
                type: AbilityType.Triggered,
                triggerEvent: "ON_ETB",
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.Tapped,
                        targetMapping: "ENCHANTED_PERMANENT"
                    }
                ],
                oracleText: "When Capture Sphere enters the battlefield, tap enchanted creature."
            },
            {
                id: "capture_sphere_static",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 6,
                        abilitiesToAdd: ["CannotUntap"],
                        targetMapping: "ENCHANTED_PERMANENT"
                    }
                ],
                oracleText: "Enchanted creature doesn't untap during its controller's untap step."
            }
        ]
    }
};
