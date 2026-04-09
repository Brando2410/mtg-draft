import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LifeGoesOn: Record<string, ImplementableCard> = {
    "Life Goes On": {
        name: "Life Goes On",
        manaCost: "{G}",
        oracleText: "You gain 4 life. If a creature died this turn, you gain 8 life instead.",
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
