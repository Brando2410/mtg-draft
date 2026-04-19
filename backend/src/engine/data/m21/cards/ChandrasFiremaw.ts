import { AbilityType, CardDefinition, EffectType, TargetType, TriggerEvent, Zone } from "@shared/engine_types";

export const ChandrasFiremaw: CardDefinition = {
    name: "Chandra's Firemaw",
    manaCost: "{3}{R}{R}",
    scryfall_id: "76cf0b50-155f-4e65-9e48-88b378ad93a1",
    image_url: "https://cards.scryfall.io/normal/front/7/6/76cf0b50-155f-4e65-9e48-88b378ad93a1.jpg?1596250195",
    oracleText: "When Chandra's Firemaw enters the battlefield, you may search your library and/or graveyard for a card named Chandra, Flame's Catalyst, reveal it, and put it into your hand. If you search your library this way, shuffle it.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Hellhound"],
    power: "4",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    optional: true,
                    sourceZones: [Zone.Library, Zone.Graveyard],
                    targetDefinition: {
                        type: TargetType.Card,
                        restrictions: [{ type: 'Name', value: "Chandra, Flame's Catalyst" }],
                        count: 1
                    },
                    zone: Zone.Hand,
                    reveal: true,
                    label: "Search for Chandra, Flame's Catalyst"
                }
            ]
        }
    ]
};


