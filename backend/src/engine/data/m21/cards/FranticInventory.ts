import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const FranticInventory: Record<string, ImplementableCard> = {
    "Frantic Inventory": {
        name: "Frantic Inventory",
        manaCost: "{1}{U}",
        oracleText: "Draw a card, then draw cards equal to the number of cards named Frantic Inventory in your graveyard.",
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
