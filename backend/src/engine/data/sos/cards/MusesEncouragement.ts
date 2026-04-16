import { CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const MusesEncouragement: CardDefinition = {
    "name": "Muse's Encouragement",
    "manaCost": "{4}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Create a 3/3 blue and red Elemental creature token with flying.\nSurveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
    "abilities": [
        {
            type: 'Spell',
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: "Elemental",
                        colors: ["U", "R"],
                        types: ["Creature"],
                        subtypes: ["Elemental"],
                        power: "3",
                        toughness: "3",
                        image_url: "https://cards.scryfall.io/png/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.png?1682693891",
                        abilities: [
                            {
                                type: 'Static',
                                keyword: 'Flying'
                            }
                        ]
                    },
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Surveil,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

