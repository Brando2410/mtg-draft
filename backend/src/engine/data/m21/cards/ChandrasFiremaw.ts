import { CardDefinition, AbilityType, Zone, EffectType, TriggerEvent, TargetType, TargetMapping } from "@shared/engine_types";

export const ChandrasFiremaw: CardDefinition = {
    name: "Chandra's Firemaw",
    manaCost: "{3}{R}{R}",
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


