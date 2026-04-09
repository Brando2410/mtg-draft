import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ChromaticOrrery: Record<string, ImplementableCard> = {
    "Chromatic Orrery": {
        name: "Chromatic Orrery",
        manaCost: "{7}",
        oracleText: "You may spend mana as though it were mana of any color.{T}: Add {C}{C}{C}{C}{C}.{5}, {T}: Draw a card for each color among permanents you control.",
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
