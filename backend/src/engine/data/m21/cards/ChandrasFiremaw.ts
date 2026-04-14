import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ChandrasFiremaw: Record<string, ImplementableCard> = {
    "Chandra's Firemaw": {
        name: "Chandra's Firemaw",
        manaCost: "{3}{R}{R}",
        oracleText: "When Chandra's Firemaw enters the battlefield, you may search your library and/or graveyard for a card named Chandra, Flame's Catalyst, reveal it, and put it into your hand. If you search your library this way, shuffle it.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Hellhound"],
        power: "4",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "chandras_firemaw_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                    eventMatch: "ON_ETB",
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        optional: true,
                        sourceZones: [Zone.Library, Zone.Graveyard],
                        restrictions: [{ name: "Chandra, Flame's Catalyst" }],
                        destination: Zone.Hand,
                        reveal: true,
                        shuffle: true,
                        label: "Search library and/or graveyard for Chandra, Flame's Catalyst"
                    }
                ]
            }
        ]
    }
};


