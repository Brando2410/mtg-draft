import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const GarruksWarsteed: Record<string, ImplementableCard> = {
    "Garruk's Warsteed": {
        name: "Garruk's Warsteed",
        manaCost: "{3}{G}{G}",
        oracleText: "Vigilance\nWhen this creature enters, you may search your library and/or graveyard for a card named Garruk, Savage Herald, reveal it, and put it into your hand. If you search your library this way, shuffle.",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "3",
        toughness: "5",
        keywords: [],
        abilities: []
    }
};
