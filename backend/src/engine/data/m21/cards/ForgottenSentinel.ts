import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ForgottenSentinel: Record<string, ImplementableCard> = {
    "Forgotten Sentinel": {
        name: "Forgotten Sentinel",
        manaCost: "{4}",
        oracleText: "This creature enters tapped.",
        colors: [],
        supertypes: [],
        types: ["Artifact", "Creature"],
        subtypes: ["Golem"],
        power: "4",
        toughness: "3",
        keywords: [],
        entersTapped: true,
        abilities: []
    }
};
