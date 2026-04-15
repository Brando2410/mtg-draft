import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone, Restriction, ZoneRequirement } from '@shared/engine_types';

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
                    amount: 4,
                    restrictions: [Restriction.Basic, Restriction.Land],
                    destination: Zone.Battlefield,
                    tapped: true,
                    shuffle: true
                }
            ]
        }
    ]
};


