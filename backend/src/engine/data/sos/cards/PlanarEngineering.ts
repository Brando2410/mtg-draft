import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

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
            effects: [
                {
                    type: EffectType.Sacrifice,
                    targetMapping: TargetMapping.Controller,
                    amount: 2,
                    restrictions: ['Land']
                },
                {
                    type: EffectType.SearchLibrary,
                    amount: 4,
                    restrictions: ['Basic', 'Land'],
                    destination: Zone.Battlefield,
                    tapped: true,
                    shuffle: true
                }
            ]
        }
    ]
};


