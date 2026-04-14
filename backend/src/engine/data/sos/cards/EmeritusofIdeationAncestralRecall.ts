import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const EmeritusofIdeationAncestralRecall: CardDefinition = {
    "name": "Emeritus of Ideation // Ancestral Recall",
    "manaCost": "{3}{U}{U} // {U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "Flying, ward {2}; Prepare on attack by exiling 8 cards from graveyard // Target player draws three cards.",
    "abilities": [],
    "power": "5",
    "toughness": "5",
    "faces": [
        {
            "name": "Emeritus of Ideation",
            "manaCost": "{3}{U}{U}",
            "colors": ["U"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Human",
                "Wizard"
            ],
            "oracleText": "Flying, ward {2}\nThis creature enters prepared.\nWhenever this creature attacks, you may exile eight cards from your graveyard. If you do, this creature becomes prepared.",
            "power": "5",
            "toughness": "5",
            "keywords": ["Flying", "Ward {2}"],
            "entersPrepared": true,
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Exile eight cards from your graveyard?",
                            choices: [
                                {
                                    label: "Exile 8 cards",
                                    condition: 'GRAVEYARD_COUNT_GE:8',
                                    effects: [
                                        {
                                            type: EffectType.Choice,
                                            label: "Select 8 cards to exile",
                                            targetIdMapping: 'CONTROLLER_GRAVEYARD',
                                            minChoices: 8,
                                            maxChoices: 8,
                                            effects: [
                                                { type: EffectType.Exile }
                                            ]
                                        },
                                        {
                                            type: EffectType.Prepare,
                                            targetMapping: TargetMapping.Self
                                        }
                                    ]
                                },
                                {
                                    label: "Decline",
                                    effects: []
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Ancestral Recall",
            "manaCost": "{U}",
            "colors": ["U"],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Target player draws three cards.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: 'Player',
                        count: 1
                    },
                    effects: [
                        {
                            type: 'DrawCards',
                            amount: 3,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};


