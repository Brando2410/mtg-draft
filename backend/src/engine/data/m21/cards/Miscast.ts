import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Miscast: Record<string, ImplementableCard> = {
    "Miscast": {
        name: "Miscast",
        manaCost: "{U}",
        oracleText: "Counter target instant or sorcery spell unless its controller pays {3}.",
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
