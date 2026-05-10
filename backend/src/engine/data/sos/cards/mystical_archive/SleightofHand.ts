import { AbilityType, CardDefinition, EffectType, Zone } from '@shared/engine_types';

export const SleightofHand: CardDefinition = {
    name: "Sleight of Hand",
    manaCost: "{U}",


    colors: ["U"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    amount: 2,
                    pickCount: 1,
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom'
                }
            ]
        }
    ],
    scryfall_id: "c837c418-2fe9-4ce8-b76d-c37241579a93",
    image_url: "https://cards.scryfall.io/normal/front/c/8/c837c418-2fe9-4ce8-b76d-c37241579a93.jpg?1775936522",
    rarity: "uncommon"
};

