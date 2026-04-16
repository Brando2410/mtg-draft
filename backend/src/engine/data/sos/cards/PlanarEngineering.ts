import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone, Restriction, ZoneRequirement, TargetType } from '@shared/engine_types';

export const PlanarEngineering: CardDefinition = {
    "name": "Planar Engineering",
    "manaCost": "{3}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Sacrifice two lands. Search your library for four basic land cards, put them onto the battlefield tapped, then shuffle.",
    "abilities": [
        {
            type: AbilityType.Spell,
            costs: [
                { type: "Sacrifice", restrictions: [Restriction.Land], amount: 2 }
            ],
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        type: TargetType.Land,
                        count: 4,
                        restrictions: ['Basic']
                    },
                    zone: Zone.Battlefield,
                    tapped: true,
                    shuffle: true
                }
            ]
        }
    ]
};


