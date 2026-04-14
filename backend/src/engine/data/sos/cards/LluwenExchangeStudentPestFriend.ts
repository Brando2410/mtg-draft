import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const LluwenExchangeStudentPestFriend: CardDefinition = {
    "name": "Lluwen, Exchange Student // Pest Friend",
    "manaCost": "{2}{B}{G} // {B/G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Legendary",
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Elf",
        "Druid"
    ],
    "oracleText": "Lluwen enters prepared.\nExile a creature card from your graveyard: Lluwen becomes prepared. Activate only as a sorcery.\nPest Friend: Create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"",
    "abilities": [],
    "power": "3",
    "toughness": "4",
    "faces": [
        {
            "name": "Lluwen, Exchange Student",
            "manaCost": "{2}{B}{G}",
            "colors": ["B", "G"],
            "types": [
                "Legendary",
                "Creature"
            ],
            "subtypes": [
                "Elf",
                "Druid"
            ],
            "oracleText": "Lluwen enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\nExile a creature card from your graveyard: Lluwen becomes prepared. Activate only as a sorcery.",
            "entersPrepared": true,
            "abilities": [
                {
                    type: AbilityType.Activated,
                    limit: 'SORCERY',
                    costs: [
                        {
                            type: 'ExileFromGraveyard',
                            amount: 1,
                            restrictions: ['Creature']
                        }
                    ],
                    effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
                }
            ],
            "power": "3",
            "toughness": "4"
        },
        {
            "name": "Pest Friend",
            "manaCost": "{B/G}",
            "colors": ["B", "G"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    effects: [
                        {
                            type: EffectType.CreateToken,
                            tokenBlueprint: "Pest",
                            amount: 1,
                            targetMapping: TargetMapping.Controller,
                            abilities: [
                                {
                                    type: AbilityType.Triggered,
                    eventMatch: 'ON_ATTACK',
                                    effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};




