import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ConcordiaPegasus: Record<string, ImplementableCard> = {
    "Concordia Pegasus": {
        name: "Concordia Pegasus",
        manaCost: "{1}{W}",
        oracleText: "Flying",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Pegasus"],
        power: "1",
        toughness: "3",
        keywords: ["Flying"],
        abilities: []
    }
};
