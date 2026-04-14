import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const LandscapePainterVibrantIdea: CardDefinition = {
    "name": "Landscape Painter // Vibrant Idea",
    "manaCost": "{1}{U} // {4}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Merfolk",
        "Wizard"
    ],
    "oracleText": "Landscape Painter enters prepared.\nVibrant Idea: Draw two cards.",
    "entersPrepared": true,
    "abilities": [],
    "power": "2",
    "toughness": "1",
    "faces": [
        {
            "name": "Landscape Painter",
            "manaCost": "{1}{U}",
            "colors": ["U"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Merfolk",
                "Wizard"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [],
            "power": "2",
            "toughness": "1"
        },
        {
            "name": "Vibrant Idea",
            "manaCost": "{4}{U}",
            "colors": ["U"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Draw two cards.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }]
                }
            ]
        }
    ]
};
