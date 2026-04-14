import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CampusComposerAqueousAria: CardDefinition = {
    "name": "Campus Composer // Aqueous Aria",
    "manaCost": "{3}{U} // {4}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Merfolk",
        "Bard"
    ],
    "oracleText": "Campus Composer (Creature): Ward {2}\nThis creature enters prepared.\nAqueous Aria (Sorcery): Create a 3/3 blue and red Elemental creature token with flying.",
    "abilities": [],
    "power": "3",
    "toughness": "4",
    "entersPrepared": true,
    "faces": [
        {
            "name": "Campus Composer",
            "manaCost": "{3}{U}",
            "colors": ["U"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Merfolk",
                "Bard"
            ],
            "keywords": ["Ward 2"],
            "oracleText": "Ward {2}\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [],
            "power": "3",
            "toughness": "4",
            "entersPrepared": true
        },
        {
            "name": "Aqueous Aria",
            "manaCost": "{4}{U}",
            "colors": ["U"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Create a 3/3 blue and red Elemental creature token with flying.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.CreateToken,
                            tokenBlueprint: {
                                name: "Elemental",
                                power: "3",
                                toughness: "3",
                                colors: ["U", "R"],
                                types: ["Creature"],
                                subtypes: ["Elemental"],
                                keywords: ["Flying"]
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
