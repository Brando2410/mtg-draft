import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CampusComposerAqueousAria: CardDefinition = {
    "name": "Campus Composer // Aqueous Aria",
    "manaCost": "{3}{U} // {4}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Merfolk",
        "Bard"
    ],
    "oracleText": "",
    "abilities": [],
    "power": "3",
    "toughness": "4",
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
            "keywords": ["Ward {2}"],
            "oracleText": "Ward {2}\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                    effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
                }
            ],
            "power": "3",
            "toughness": "4"
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
                            amount: 1,
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
