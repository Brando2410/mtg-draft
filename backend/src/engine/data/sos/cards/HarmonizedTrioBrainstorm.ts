import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone, TargetType } from '@shared/engine_types';

export const HarmonizedTrioBrainstorm: CardDefinition = {
    "name": "Harmonized Trio // Brainstorm",
    "manaCost": "{U} // {U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Merfolk",
        "Bard",
        "Wizard"
    ],
    "oracleText": "{T}, Tap two untapped creatures you control: This creature becomes prepared.\n//\nDraw three cards, then put two cards from your hand on top of your library in any order.",
    "abilities": [],
    "power": "1",
    "toughness": "1",
    "faces": [
        {
            "name": "Harmonized Trio",
            "manaCost": "{U}",
            "colors": ["U"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Merfolk",
                "Bard",
                "Wizard"
            ],
            "oracleText": "{T}, Tap two untapped creatures you control: This creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [
                {
                    type: AbilityType.Activated,
                    costs: [
                        { type: 'TapSelection', value: 2, restrictions: ['Creature', 'Untapped'] },
                        { type: 'Tap' }
                    ],
                    effects: [
                        {
                            type: 'Prepare' as any,
                            targetMapping: TargetMapping.Self
                        }
                    ]
                }
            ],
            "power": "1",
            "toughness": "1"
        },
        {
            "name": "Brainstorm",
            "manaCost": "{U}",
            "colors": ["U"],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Draw three cards, then put two cards from your hand on top of your library in any order.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.DrawCards,
                            amount: 3,
                            targetMapping: TargetMapping.Controller
                        },
                        {
                            type: 'Choice' as any,
                            label: "Put two cards from hand on top of library",
                            effects: [
                                {
                                    type: EffectType.MoveToZone,
                                    zone: Zone.Library,
                                    libraryPosition: 'top',
                                    selectionType: 'Target',
                                    targetDefinition: {
                                        type: TargetType.CardInHand,
                                        count: 2,
                                        restrictions: ['YouControl']
                                    },
                                    targetMapping: TargetMapping.Target1
                                }
                            ],
                            targetMapping: TargetMapping.Controller
                        }
                    ]
                }
            ]
        }
    ]
};
