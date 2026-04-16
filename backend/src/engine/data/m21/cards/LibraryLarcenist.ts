import { AbilityType, Zone, EffectType, TargetMapping, CardDefinition } from "@shared/engine_types";

export const LibraryLarcenist: CardDefinition = {

    name: "Library Larcenist",
    manaCost: "{2}{U}",
    oracleText: "Whenever Library Larcenist attacks or blocks, draw a card.",
    colors: ["U"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Merfolk", "Rogue"],
    power: "1",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            activeZone: Zone.Battlefield,
            eventMatch: ["ON_ATTACK", "ON_BLOCK"],
            condition: (state: any, event: any, source: any) => {
                return event.sourceId === source.sourceId;
            },
            effects: [{
                type: EffectType.DrawCards,
                amount: 1,
                targetMapping: TargetMapping.Controller
            }],
        }
    ]
};


