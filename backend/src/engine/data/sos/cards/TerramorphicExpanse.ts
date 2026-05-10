import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const TerramorphicExpanse: CardDefinition = {
    name: "Terramorphic Expanse",
    manaCost: "",
    colors: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    oracleText: "{T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    abilities: [
        {
            type: AbilityType.Activated,
            id: "{T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
            costs: [
                { type: CostType.Tap },
                { type: CostType.SacrificeSelf }
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
                    tapped: true
                }
            ]
        }
    ],
    scryfall_id: "9a4c5629-fadd-42b9-850f-9f8586a2ca50",
    image_url: "https://cards.scryfall.io/normal/front/9/a/9a4c5629-fadd-42b9-850f-9f8586a2ca50.jpg?1775938853",
    rarity: "common"
};

