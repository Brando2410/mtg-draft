import { CardDefinition, AbilityType, Zone, EffectType, TriggerEvent, TargetType, TargetMapping } from "@shared/engine_types";

export const GarruksWarsteed: CardDefinition = {
    name: "Garruk's Warsteed",
    manaCost: "{3}{G}{G}",
    scryfall_id: "d6099863-8d3d-44bf-8d3b-dc3602119617",
    image_url: "https://cards.scryfall.io/normal/front/d/6/d6099863-8d3d-44bf-8d3b-dc3602119617.jpg?1596250201",
    oracleText: "Vigilance\nWhen Garruk's Warsteed enters the battlefield, you may search your library and/or graveyard for a card named Garruk, Savage Herald, reveal it, and put it into your hand. If you search your library this way, shuffle.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Rhino"],
    power: "3",
    toughness: "5",
    keywords: ["Vigilance"],
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
                        restrictions: [{ type: 'Name', value: "Garruk, Savage Herald" }],
                        count: 1
                    },
                    zone: Zone.Hand,
                    reveal: true,
                    label: "Search for Garruk, Savage Herald"
                }
            ]
        }
    ]
};


