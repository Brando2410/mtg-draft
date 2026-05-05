import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ChandrasFiremaw: CardDefinition = {
    name: "Chandra's Firemaw",
    manaCost: "{3}{R}{R}",
    scryfall_id: "8a49c952-32b0-466d-922b-ec1d39360d00",
    image_url: "https://cards.scryfall.io/normal/front/8/a/8a49c952-32b0-466d-922b-ec1d39360d00.jpg?1596250262",
    oracleText: "Flying\nWhen Chandra's Firemaw enters the battlefield, you may search your library and/or graveyard for a card named Chandra, Flame's Catalyst, reveal it, and put it into your hand. If you search your library this way, shuffle.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Hellion"],
    power: "4",
    toughness: "2",
    keywords: ["Flying"],
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
                        restrictions: [{ type: Restriction.Name, value: "Chandra, Flame's Catalyst" }]
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
