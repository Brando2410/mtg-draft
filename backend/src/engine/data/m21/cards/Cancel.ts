import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Cancel: Record<string, ImplementableCard> = {
    "Cancel": {
        name: "Cancel",
        manaCost: "{1}{U}{U}",
        oracleText: "Counter target spell.",
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
