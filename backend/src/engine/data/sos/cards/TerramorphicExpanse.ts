import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
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
            costs: [
                { type: CostType.Tap },
                { type: CostType.Sacrifice, targetMapping: TargetMapping.Self }
            ],
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        type: TargetType.Land,
                        count: 1,
                        restrictions: ["Basic"]
                    },
                    zone: Zone.Battlefield,
                    tapped: true,
                }
            ]
        }
    ]
};

