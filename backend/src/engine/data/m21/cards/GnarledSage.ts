import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const GnarledSage: Record<string, ImplementableCard> = {
    "Gnarled Sage": {
        name: "Gnarled Sage",
        manaCost: "{3}{G}{G}",
        oracleText: "Reach (This creature can block creatures with flying.)\nAs long as you've drawn two or more cards this turn, this creature gets +0/+2 and has vigilance. (Attacking doesn't cause it to tap.)",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "4",
        toughness: "4",
        keywords: [],
        abilities: []
    }
};
