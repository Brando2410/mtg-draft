import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const PigmentWranglerStrikingPalette: CardDefinition = {
    "name": "Pigment Wrangler // Striking Palette",
    "manaCost": "{4}{R} // {R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Orc",
        "Sorcerer"
    ],
    "oracleText": "",
    "entersPrepared": true,
    "abilities": [],
    "power": "4",
    "toughness": "4",
    "faces": [
        {
            "name": "Pigment Wrangler",
            "manaCost": "{4}{R}",
            "colors": ["R"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Orc",
                "Sorcerer"
            ],
            "oracleText": "Flying\nThis creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "keywords": ["Flying"],
            "entersPrepared": true,
            "power": "4",
            "toughness": "4"
        },
        {
            "name": "Striking Palette",
            "manaCost": "{R}",
            "colors": ["R"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.CreateDelayedTrigger,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
                            duration: 'UNTIL_END_OF_TURN',
                            firesOnce: true,
                            effects: [
                                {
                                    type: EffectType.CopySpellOnStack,
                                    chooseNewTargets: true,
                                    targetMapping: TargetMapping.TriggerEventSource
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};



