import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const StudiousFirstYearRampantGrowth: CardDefinition = {
    "name": "Studious First-Year // Rampant Growth",
    "manaCost": "{G} // {1}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Bear",
        "Wizard"
    ],
    "oracleText": "This creature enters prepared.\nRampant Growth: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
    "keywords": ["Prepared"],
    "entersPrepared": true,
    "power": "1",
    "toughness": "1",
    "faces": [
        {
            "name": "Studious First-Year",
            "manaCost": "{G}",
            "colors": ["G"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Bear",
                "Wizard"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "1",
            "toughness": "1",
            "entersPrepared": true
        },
        {
            "name": "Rampant Growth",
            "manaCost": "{1}{G}",
            "colors": ["G"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.SearchLibrary,

                            targetDefinition: {
                                type: TargetType.Land,
                                count: 1,
                                restrictions: ['Basic', 'Land']
                            },


                        },
                        {
                            type: EffectType.ShuffleLibrary, //mabye not necessary if search library handles it
                            targetMapping: TargetMapping.Controller
                        },
                        {
                            type: EffectType.PutOnBattlefield,
                            targetMapping: TargetMapping.Target1,
                            entersTapped: true, //missing from effect definition?
                        },

                    ]
                }
            ]
        }
    ]
};



