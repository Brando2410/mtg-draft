import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const EmeritusofWoeDemonicTutor: CardDefinition = {
    "name": "Emeritus of Woe // Demonic Tutor",
    "manaCost": "{3}{B} // {1}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Vampire",
        "Warlock"
    ],
    "oracleText": "Enters prepared; End step prepare if 2+ creatures died // Search library for a card and put it into hand.",
    "abilities": [],
    "power": "5",
    "toughness": "4",
    "faces": [
        {
            "name": "Emeritus of Woe",
            "manaCost": "{3}{B}",
            "colors": ["B"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Vampire",
                "Warlock"
            ],
            "oracleText": "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\nAt the beginning of your end step, if two or more creatures died this turn, this creature becomes prepared.",
            "power": "5",
            "toughness": "4",
            "entersPrepared": true,
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EndStep,
                    condition: 'CREATURES_DIED_COUNT_GE:2 && OUR_TURN',
                    effects: [
                        {
                            type: EffectType.Prepare,
                            targetMapping: TargetMapping.Self
                        }
                    ]
                }
            ]
        },
        {
            "name": "Demonic Tutor",
            "manaCost": "{1}{B}",
            "colors": ["B"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Search your library for a card, put that card into your hand, then shuffle.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.MoveToZone,
                            selectionType: 'Search',
                            sourceZones: [Zone.Library],
                            destination: Zone.Hand,
                            reveal: true,
                            shuffle: true,
                            amount: 1
                        }
                    ]
                }
            ]
        }
    ]
};


