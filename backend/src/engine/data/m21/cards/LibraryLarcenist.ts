import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LibraryLarcenist: Record<string, ImplementableCard> = {
    "Library Larcenist": {
        name: "Library Larcenist",
        manaCost: "{2}{U}",
        oracleText: "Whenever Library Larcenist attacks or blocks, draw a card.",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Merfolk", "Rogue"],
        power: "1",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "library_larcenist_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                    eventMatch: ["ON_ATTACK", "ON_BLOCK"],
                condition: (state: any, event: any, source: any) => {
                    return event.sourceId === source.sourceId;
                },
                effects: [{
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: "CONTROLLER"
                }],
                oracleText: "Whenever Library Larcenist attacks or blocks, draw a card."
            }
        ]
    }
};


