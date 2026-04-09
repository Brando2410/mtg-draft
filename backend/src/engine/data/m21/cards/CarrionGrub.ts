import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const CarrionGrub: Record<string, ImplementableCard> = {
    "Carrion Grub": {
        name: "Carrion Grub",
        manaCost: "{3}{B}",
        oracleText: "This creature gets +X/+0, where X is the greatest power among creature cards in your graveyard. When this creature enters, mill four cards. (Put the top four cards of your library into your graveyard.)",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "0",
        toughness: "5",
        keywords: [],
        abilities: []
    }
};
