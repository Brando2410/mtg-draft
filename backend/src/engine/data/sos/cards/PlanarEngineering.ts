import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetType, Zone } from '@shared/engine_types';
    export const PlanarEngineering: CardDefinition = {
    name: "Planar Engineering",
    manaCost: "{3}{G}",
    colors: [
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Sacrifice two lands. Search your library for four basic land cards, put them onto the battlefield tapped, then shuffle.",
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [
                { type: CostType.Sacrifice, restrictions: [Restriction.Land], amount: 2 }
            ],
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        type: TargetType.Land,
                        count: 4,
                        restrictions: [
                { type: 'Type', value: 'Basic' }
            ]
                    },
                    zone: Zone.Battlefield,
                    tapped: true,
                    shuffle: true
                }
            ]
        }
    ]
};
    