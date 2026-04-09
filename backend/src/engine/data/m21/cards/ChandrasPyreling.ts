import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ChandrasPyreling: Record<string, ImplementableCard> = {
    "Chandra's Pyreling": {
        name: "Chandra's Pyreling",
        manaCost: "{1}{R}",
        oracleText: "Whenever a source you control deals noncombat damage to an opponent, this creature gets +1/+0 and gains double strike until end of turn. (It deals both first-strike and regular combat damage.)",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "1",
        toughness: "3",
        keywords: [],
        abilities: []
    }
};
