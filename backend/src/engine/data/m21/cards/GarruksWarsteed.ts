import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
                    targetDefinitions: [{
                        type: TargetType.Card,
                        count: 1,
                        minCount: 0,
                        restrictions: [{ type: Restriction.Name, value: 'Garruk, Savage Herald' }]
                    }],
                    sourceZones: [Zone.Library, Zone.Graveyard],
                    zone: Zone.Hand,
                    reveal: true,
                    optional: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
