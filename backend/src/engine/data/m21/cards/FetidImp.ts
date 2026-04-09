import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const FetidImp: Record<string, ImplementableCard> = {
    "Fetid Imp": {
        name: "Fetid Imp",
        manaCost: "{1}{B}",
        oracleText: "Flying\n{B}: This creature gains deathtouch until end of turn. (Any amount of damage it deals to a creature is enough to destroy it.)",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "1",
        toughness: "2",
        keywords: [],
        abilities: []
    }
};
