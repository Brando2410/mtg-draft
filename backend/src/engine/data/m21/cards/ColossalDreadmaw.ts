import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ColossalDreadmaw: Record<string, ImplementableCard> = {
    "Colossal Dreadmaw": {
        name: "Colossal Dreadmaw",
        manaCost: "{4}{G}{G}",
        oracleText: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dinosaur"],
        power: "6",
        toughness: "6",
        keywords: ["Trample"],
        abilities: []
    }
};
