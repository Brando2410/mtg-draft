import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const BanishingBetrayal: CardDefinition = {
    name: "Banishing Betrayal",
    manaCost: "{1}{U}",


    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Return target nonland permanent to its owner's hand. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.NonlandPermanent,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Surveil,
                    targetMapping: TargetMapping.Controller,
                    amount: 1
                }
            ]
        }
    ],
    scryfall_id: "1ae9d2f3-7a9f-433a-aa1f-14337ae6f9d4",
    image_url: "https://cards.scryfall.io/normal/front/1/a/1ae9d2f3-7a9f-433a-aa1f-14337ae6f9d4.jpg?1775937176",
    rarity: "common"
};

