import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const MaleficScythe: Record<string, ImplementableCard> = {
    "Malefic Scythe": {
        name: "Malefic Scythe",
        manaCost: "{1}{B}",
        oracleText: "This Equipment enters with a soul counter on it.\nEquipped creature gets +1/+1 for each soul counter on this Equipment.\nWhenever equipped creature dies, put a soul counter on this Equipment.\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)",
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
