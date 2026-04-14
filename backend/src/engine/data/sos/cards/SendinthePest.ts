import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, ConditionType } from '@shared/engine_types';

export const SendinthePest: CardDefinition = {
    "name": "Send in the Pest",
    "manaCost": "{1}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Each opponent discards a card. You create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: "Pest",
                        types: ["Creature"],
                        subtypes: ["Pest"],
                        colors: ["B", "G"],
                        power: "1",
                        toughness: "1",
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                                condition: "SelfAttacks",
                                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                            }
                        ]
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};




