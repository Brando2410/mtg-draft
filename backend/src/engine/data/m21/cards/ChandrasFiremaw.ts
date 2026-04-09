import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ChandrasFiremaw: Record<string, ImplementableCard> = {
    "Chandra's Firemaw": {
        name: "Chandra's Firemaw",
        manaCost: "{3}{R}{R}",
        oracleText: "Haste\nWhen this creature enters, you may search your library and/or graveyard for a card named Chandra, Flame's Catalyst, reveal it, and put it into your hand. If you search your library this way, shuffle.",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "4",
        toughness: "2",
        keywords: [],
        abilities: []
    }
};
