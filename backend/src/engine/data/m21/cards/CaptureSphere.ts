import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const CaptureSphere: Record<string, ImplementableCard> = {
    "Capture Sphere": {
        name: "Capture Sphere",
        manaCost: "{3}{U}",
        oracleText: "Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: []
    }
};
