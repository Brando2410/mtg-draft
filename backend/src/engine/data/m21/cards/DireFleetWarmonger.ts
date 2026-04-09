import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const DireFleetWarmonger: Record<string, ImplementableCard> = {
    "Dire Fleet Warmonger": {
        name: "Dire Fleet Warmonger",
        manaCost: "{1}{B}{R}",
        oracleText: "At the beginning of combat on your turn, you may sacrifice another creature. If you do, this creature gets +2/+2 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "3",
        toughness: "3",
        keywords: [],
        abilities: []
    }
};
