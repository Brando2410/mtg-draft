import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const IndulgingPatrician: Record<string, ImplementableCard> = {
    "Indulging Patrician": {
        name: "Indulging Patrician",
        manaCost: "{1}{W}{B}",
        oracleText: "Flying\nLifelink (Damage dealt by this creature also causes you to gain that much life.)\nAt the beginning of your end step, if you gained 3 or more life this turn, each opponent loses 3 life.",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "1",
        toughness: "4",
        keywords: [],
        abilities: []
    }
};
