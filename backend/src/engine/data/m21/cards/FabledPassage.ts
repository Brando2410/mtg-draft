import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetType, Zone } from "@shared/engine_types";

export const FabledPassage: CardDefinition = {
    name: "Fabled Passage",
    manaCost: "",

    oracleText: "{T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. Then if you control four or more lands, untap that land.",
    colors: [],
    types: ["Land"],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Tap },
                { type: CostType.Sacrifice }
            ],
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinitions: [{
                        type: TargetType.Land,
                        count: 1,
                        restrictions: [Restriction.Basic]
                    }],
                    zone: Zone.Battlefield,
                    tapped: true,
                    effects: [{
                        type: EffectType.Untap,
                        condition: 'LAND_COUNT_GE:4'
                    }]
                }
            ]
        }
    ],
    scryfall_id: "d313d051-7295-4884-8cbf-f2f835fd45f4",
    image_url: "https://cards.scryfall.io/normal/front/d/3/d313d051-7295-4884-8cbf-f2f835fd45f4.jpg?1594737636",
    rarity: "rare"
};

