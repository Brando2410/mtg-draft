import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const EmeritusofTruceSwordstoPlowshares: CardDefinition = {
    "name": "Emeritus of Truce // Swords to Plowshares",
    "manaCost": "{1}{W}{W} // {W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Cat",
        "Cleric"
    ],
    "oracleText": "ETB creates a 1/1 Inkling for target player and might Prepare // Exile target creature, controller gains life equal to its power.",
    "abilities": [],
    "power": "3",
    "toughness": "3",
    "faces": [
        {
            "name": "Emeritus of Truce",
            "manaCost": "{1}{W}{W}",
            "colors": ["W"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Cat",
                "Cleric"
            ],
            "oracleText": "When this creature enters, target player creates a 1/1 white and black Inkling creature token with flying. Then if an opponent controls more creatures than you, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "power": "3",
            "toughness": "3",
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                    targetDefinition: {
                        type: 'Player',
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.CreateToken,
                            targetMapping: TargetMapping.Target1,
                            tokenBlueprint: {
                                name: 'Inkling',
                                colors: ['W', 'B'],
                                types: ['Creature'],
                                subtypes: ['Inkling'],
                                power: 1,
                                toughness: 1,
                                keywords: ['Flying'],
                                image_url: 'https://cards.scryfall.io/art_crop/front/b/d/bd73bc23-28f0-4fa0-8260-26210f9aa0a0.jpg?1624589254'
                            }
                        },
                        {
                            type: EffectType.ConditionalEffect,
                            condition: 'OPPONENT_CONTROLS_MORE_CREATURES',
                            effects: [
                                {
                                    type: EffectType.Prepare,
                                    targetMapping: TargetMapping.Self
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Swords to Plowshares",
            "manaCost": "{W}",
            "colors": ["W"],
            "types": [
                "Instant"
            ],
            "subtypes": [],
            "oracleText": "Exile target creature. Its controller gains life equal to its power.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: 'Creature',
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.Exile,
                            targetMapping: TargetMapping.Target1
                        },
                        {
                            type: EffectType.GainLife,
                            amount: 'TARGET_1_POWER',
                            targetMapping: 'TARGET_1_CONTROLLER'
                        }
                    ]
                }
            ]
        }
    ]
};


