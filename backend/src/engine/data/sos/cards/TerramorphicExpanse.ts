import { CardDefinition, AbilityType, EffectType, Zone, TargetMapping } from '@shared/engine_types';

export const TerramorphicExpanse: CardDefinition = {
    "name": "Terramorphic Expanse",
    "manaCost": "",
    "colors": [],
    "types": [
        "Land"
    ],
    "subtypes": [],
    "oracleText": "{T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Tap' },
                { type: 'Sacrifice' }
            ],
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    restrictions: ['Basic', 'Land'],
                    destination: Zone.Battlefield,
                    tapped: true,
                    shuffle: true
                }
            ]
        }
    ]
};


