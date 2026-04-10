import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ChandraFlamesCatalyst: Record<string, ImplementableCard> = {
    "Chandra, Flame's Catalyst": {
        name: "Chandra, Flame's Catalyst",
        manaCost: "{4}{R}{R}",
        oracleText: "+1: Chandra deals 3 damage to each opponent. 2: You may cast target red instant or sorcery card from your graveyard. If that spell would be put into your graveyard, exile it instead. 8: Discard your hand, then draw seven cards. Until end of turn, you may cast spells from your hand without paying their mana costs.",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        loyalty: "5",
        abilities: []
    }
};
