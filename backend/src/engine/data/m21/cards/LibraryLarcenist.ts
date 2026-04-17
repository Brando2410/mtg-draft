import { AbilityType, EffectType, TargetMapping, CardDefinition } from "@shared/engine_types";

export const LibraryLarcenist: CardDefinition = {

    name: "Library Larcenist",
    manaCost: "{2}{U}",
    scryfall_id: "cb33529b-80bd-4f52-94cc-d8371c53ad75",
    image_url: "https://cards.scryfall.io/normal/front/c/b/cb33529b-80bd-4f52-94cc-d8371c53ad75.jpg?1594735558",
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


