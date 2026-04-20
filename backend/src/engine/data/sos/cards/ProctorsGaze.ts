import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const ProctorsGaze: CardDefinition = {
    name: "Proctor's Gaze",
    manaCost: "{2}{G}{U}",
    scryfall_id: "b127d543-0a90-4af6-9410-94d5cd30389e",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/b/1/b127d543-0a90-4af6-9410-94d5cd30389e.jpg?1775938479",
    colors: ["G", "U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Return up to one target nonland permanent to its owner's hand. Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.NonlandPermanent,
                count: 1,
                minCount: 0
            },
            effects: [
                {
                    type: EffectType.ReturnToHand,
                    targetMapping: TargetMapping.Target1,

                },
                {
                    type: EffectType.SearchLibrary,
                    targetMapping: TargetMapping.Controller,
                    targetDefinition: {
                        type: TargetType.Land,
                        count: 1,
                        restrictions: [Restriction.Basic]
                    },
                    zone: Zone.Battlefield,
                    tapped: true
                }
            ]
        }
    ]
};
