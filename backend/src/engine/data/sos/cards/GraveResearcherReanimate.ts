import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetType, TargetMapping } from '@shared/engine_types';

export const GraveResearcherReanimate: CardDefinition = {
    "name": "Grave Researcher // Reanimate",
    "manaCost": "{2}{B} // {B}",
    "colors": [
        "B"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Troll",
        "Warlock"
    ],
    "oracleText": "At the beginning of your upkeep, surveil 1. Then if there are three or more creature cards in your graveyard, this creature becomes prepared.\n//\nPut target creature card from a graveyard onto the battlefield under your control. You lose life equal to that card's mana value.",
    "power": "3",
    "toughness": "3",
    "faces": [
        {
            "name": "Grave Researcher",
            "manaCost": "{2}{B}",
            "colors": ["B"],
            "types": [
                "Creature"
            ],
            "subtypes": [
                "Troll",
                "Warlock"
            ],
            "oracleText": "At the beginning of your upkeep, surveil 1. Then if there are three or more creature cards in your graveyard, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Upkeep,
                    effects: [
                        { type: EffectType.Surveil, amount: 1, targetMapping: TargetMapping.Controller },
                        {
                            type: EffectType.ConditionalEffect,
                            condition: 'GRAVEYARD_CREATURE_COUNT_GE' as any,
                            restrictions: ['3'],
                            effects: [{ type: 'Prepare' as any, targetMapping: TargetMapping.Self }]
                        }
                    ]
                }
            ],
            "power": "3",
            "toughness": "3"
        },
        {
            "name": "Reanimate",
            "manaCost": "{B}",
            "colors": ["B"],
            "types": [
                "Sorcery"
            ],
            "subtypes": [],
            "oracleText": "Put target creature card from a graveyard onto the battlefield under your control. You lose life equal to that card's mana value.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        restrictions: ['Creature']
                    },
                    effects: [
                        {
                            type: 'PutOnBattlefield' as any,
                            targetMapping: TargetMapping.Target1
                        },
                        {
                            type: EffectType.LoseLife,
                            targetMapping: TargetMapping.Controller,
                            amount: 'TARGET_1_MANA_VALUE' as any
                        }
                    ]
                }
            ]
        }
    ]
};
